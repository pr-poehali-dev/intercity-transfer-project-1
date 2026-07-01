import json
import os
import urllib.request
import urllib.error
import time
from concurrent.futures import ThreadPoolExecutor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}


def geocode(query: str, api_key: str):
    """Координаты населённого пункта через DaData. Возвращает (lat, lon) или None."""
    payload = json.dumps({
        'query': query,
        'count': 1,
        'from_bound': {'value': 'city'},
        'to_bound': {'value': 'settlement'},
        'locations': [{'country': 'Россия'}],
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
        data=payload, method='POST',
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Token {api_key}',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"geocode error '{query}': {e}")
        return None
    for item in data.get('suggestions', []):
        d = item.get('data', {})
        lat, lon = d.get('geo_lat'), d.get('geo_lon')
        if lat and lon:
            return (float(lat), float(lon))
    return None


def route_geometry(coords, gh_key: str):
    """Геометрия маршрута по дорогам через GraphHopper.
    coords — список (lat, lon). Возвращает список [lat, lon] точек линии."""
    points_params = ''.join(f'&point={lat},{lon}' for lat, lon in coords)
    url = (
        f'https://graphhopper.com/api/1/route?'
        f'profile=car&locale=ru&calc_points=true&points_encoded=false'
        f'{points_params}&key={gh_key}'
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'transfer-app'})
    last_err = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read())
            paths = data.get('paths', [])
            if not paths:
                return None, None
            coordinates = paths[0].get('points', {}).get('coordinates', [])
            line = [[c[1], c[0]] for c in coordinates]
            distance_km = round(paths[0].get('distance', 0) / 1000)
            return line, distance_km
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            last_err = e
            time.sleep(0.5 * (attempt + 1))
    print(f"GH route error: {last_err}")
    return None, None


def handler(event: dict, context) -> dict:
    """Построение геометрии маршрута по дорогам для отображения на карте.
    Принимает список городов points, геокодит их и возвращает линию маршрута."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    raw_points = body.get('points') or []
    cities = [str(p).strip() for p in raw_points if str(p).strip()]

    if len(cities) < 2:
        return {
            'statusCode': 400,
            'headers': CORS,
            'body': json.dumps({'error': 'need at least 2 points'})
        }

    dadata_key = os.environ.get('DADATA_API_KEY', '')
    gh_key = os.environ.get('GRAPHHOPPER_API_KEY', '')
    if not dadata_key or not gh_key:
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'error': 'API keys not configured'})
        }

    with ThreadPoolExecutor(max_workers=len(cities)) as ex:
        coords = list(ex.map(lambda c: geocode(c, dadata_key), cities))

    valid = [(cities[i], coords[i]) for i in range(len(cities)) if coords[i]]
    if len(valid) < 2:
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'error': 'coordinates not found', 'line': None})
        }

    only_coords = [c for _, c in valid]
    line, distance_km = route_geometry(only_coords, gh_key)

    markers = [{'name': name, 'lat': c[0], 'lon': c[1]} for name, c in valid]

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({
            'line': line,
            'markers': markers,
            'distance': distance_km,
        })
    }
