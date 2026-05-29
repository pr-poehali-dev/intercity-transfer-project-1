import json
import os
import urllib.request
import urllib.parse


def geocode(query: str, api_key: str):
    """Получить координаты населённого пункта через DaData"""
    payload = json.dumps({
        'query': query,
        'count': 1,
        'from_bound': {'value': 'city'},
        'to_bound': {'value': 'settlement'},
        'locations': [{'country': '*'}],
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
        data=payload,
        method='POST',
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Token {api_key}',
        }
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read())

    items = data.get('suggestions', [])
    if not items:
        return None
    d = items[0].get('data', {})
    lat = d.get('geo_lat')
    lon = d.get('geo_lon')
    if not lat or not lon:
        return None
    return float(lat), float(lon)


def road_distance(from_coords, to_coords):
    """Расстояние по дорогам в км через OSRM"""
    flat, flon = from_coords
    tlat, tlon = to_coords
    url = (
        f'https://router.project-osrm.org/route/v1/driving/'
        f'{flon},{flat};{tlon},{tlat}?overview=false'
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'transfer-app'})
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read())
    routes = data.get('routes', [])
    if not routes:
        return None
    meters = routes[0].get('distance', 0)
    return round(meters / 1000)


def handler(event: dict, context) -> dict:
    """Расчёт расстояния по дорогам между двумя населёнными пунктами России"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    from_city = body.get('from', '').strip()
    to_city = body.get('to', '').strip()

    if not from_city or not to_city:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'from and to are required'})
        }

    api_key = os.environ.get('DADATA_API_KEY', '')
    if not api_key:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'distance': None, 'error': 'API key not configured'})
        }

    try:
        from_coords = geocode(from_city, api_key)
        to_coords = geocode(to_city, api_key)
        if not from_coords or not to_coords:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'distance': None, 'error': 'Координаты не найдены'})
            }
        dist = road_distance(from_coords, to_coords)
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'distance': None, 'error': str(e)})
        }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'distance': dist})
    }
