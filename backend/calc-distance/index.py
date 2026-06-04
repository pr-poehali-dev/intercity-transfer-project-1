import json
import os
import urllib.request
import psycopg2


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


def road_distance(from_coords, to_coords, gh_key: str):
    """Расстояние по дорогам в км через GraphHopper"""
    flat, flon = from_coords
    tlat, tlon = to_coords
    url = (
        f'https://graphhopper.com/api/1/route'
        f'?point={flat},{flon}&point={tlat},{tlon}'
        f'&vehicle=car&locale=ru&calc_points=false'
        f'&key={gh_key}'
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'transfer-app'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
    paths = data.get('paths', [])
    if not paths:
        return None
    meters = paths[0].get('distance', 0)
    return round(meters / 1000)


def get_cached(conn, from_city: str, to_city: str):
    """Получить расстояние из кеша (проверяем оба направления)"""
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT distance_km FROM {schema}.distance_cache "
            f"WHERE (from_city = %s AND to_city = %s) OR (from_city = %s AND to_city = %s) LIMIT 1",
            (from_city, to_city, to_city, from_city)
        )
        row = cur.fetchone()
    return row[0] if row else None


def save_cache(conn, from_city: str, to_city: str, dist: int):
    """Сохранить расстояние в кеш"""
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO {schema}.distance_cache (from_city, to_city, distance_km) "
            f"VALUES (%s, %s, %s) ON CONFLICT (from_city, to_city) DO NOTHING",
            (from_city, to_city, dist)
        )
    conn.commit()


def handler(event: dict, context) -> dict:
    """Расчёт расстояния по дорогам через GraphHopper с кешированием в PostgreSQL"""
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

    dadata_key = os.environ.get('DADATA_API_KEY', '')
    gh_key = os.environ.get('GRAPHHOPPER_API_KEY', '')
    dsn = os.environ.get('DATABASE_URL', '')

    try:
        conn = psycopg2.connect(dsn)
        cached = get_cached(conn, from_city, to_city)
        if cached is not None:
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'distance': cached, 'cached': True})
            }
    except Exception:
        conn = None

    if not dadata_key or not gh_key:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'distance': None, 'error': 'API keys not configured'})
        }

    try:
        from_coords = geocode(from_city, dadata_key)
        to_coords = geocode(to_city, dadata_key)
        if not from_coords or not to_coords:
            if conn:
                conn.close()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'distance': None, 'error': 'Координаты не найдены'})
            }
        dist = road_distance(from_coords, to_coords, gh_key)
    except Exception as e:
        if conn:
            conn.close()
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'distance': None, 'error': str(e)})
        }

    if dist and conn:
        try:
            save_cache(conn, from_city, to_city, dist)
        except Exception:
            pass
        conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'distance': dist})
    }