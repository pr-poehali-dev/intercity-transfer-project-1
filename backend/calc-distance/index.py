import json
import os
import urllib.request
import urllib.error
import time
from concurrent.futures import ThreadPoolExecutor
import psycopg2


def geocode(query: str, api_key: str):
    """Получить координаты населённого пункта через DaData"""
    payload = json.dumps({
        'query': query,
        'count': 1,
        'from_bound': {'value': 'city'},
        'to_bound': {'value': 'house'},
        'locations': [{'country': 'Россия'}],
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
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read())

    items = data.get('suggestions', [])
    if not items:
        return None
    d = items[0].get('data', {})
    lat = d.get('geo_lat')
    lon = d.get('geo_lon')
    if not lat or not lon:
        return None
    print(f"geocode '{query}' -> {items[0].get('value')} ({lat},{lon})")
    return float(lat), float(lon)


def road_distance(from_coords, to_coords, gh_key: str):
    """Расстояние по дорогам в км через GraphHopper"""
    flat, flon = from_coords
    tlat, tlon = to_coords
    url = (
        f'https://graphhopper.com/api/1/route'
        f'?point={flat},{flon}&point={tlat},{tlon}'
        f'&profile=car&locale=ru&calc_points=false'
        f'&key={gh_key}'
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'transfer-app'})
    last_err = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read())
            paths = data.get('paths', [])
            if not paths:
                return None
            meters = paths[0].get('distance', 0)
            km = round(meters / 1000)
            print(f"GH route {flat},{flon} -> {tlat},{tlon} = {km} km")
            return km
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            last_err = e
            time.sleep(0.5 * (attempt + 1))
    raise last_err


def get_cached(conn, from_city: str, to_city: str):
    """Получить расстояние из кеша (проверяем оба направления)"""
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT distance_km FROM {schema}.distance_cache "
            f"WHERE ((from_city = %s AND to_city = %s) OR (from_city = %s AND to_city = %s)) "
            f"AND distance_km > 0 LIMIT 1",
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
            f"VALUES (%s, %s, %s) ON CONFLICT (from_city, to_city) DO UPDATE "
            f"SET distance_km = EXCLUDED.distance_km",
            (from_city, to_city, dist)
        )
    conn.commit()


def segment_distance(from_city, to_city, dadata_key, gh_key, dsn):
    """Расстояние одного отрезка: кэш -> геокод -> GraphHopper -> сохранить кэш"""
    try:
        conn = psycopg2.connect(dsn)
    except Exception:
        conn = None
    if conn:
        cached = get_cached(conn, from_city, to_city)
        if cached is not None:
            conn.close()
            return cached
    with ThreadPoolExecutor(max_workers=2) as ex:
        f_from = ex.submit(geocode, from_city, dadata_key)
        f_to = ex.submit(geocode, to_city, dadata_key)
        from_coords = f_from.result()
        to_coords = f_to.result()
    if not from_coords or not to_coords:
        if conn:
            conn.close()
        raise ValueError(f'Координаты не найдены: {from_city} / {to_city}')
    dist = road_distance(from_coords, to_coords, gh_key)
    if dist and conn:
        try:
            save_cache(conn, from_city, to_city, dist)
        except Exception:
            pass
    if conn:
        conn.close()
    return dist


def calc_multi(cities, dadata_key, gh_key, dsn):
    """Сумма расстояний по цепочке городов. Все отрезки считаются параллельно."""
    if not dadata_key or not gh_key:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'distance': None, 'error': 'API keys not configured'})
        }
    segments = [(cities[i], cities[i + 1]) for i in range(len(cities) - 1)]
    try:
        with ThreadPoolExecutor(max_workers=len(segments)) as ex:
            results = list(ex.map(
                lambda s: segment_distance(s[0], s[1], dadata_key, gh_key, dsn),
                segments
            ))
        total = sum(r for r in results if r)
    except Exception as e:
        print(f"calc-distance multi error for {cities}: {type(e).__name__}: {e}")
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'distance': None, 'error': str(e)})
        }
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'distance': total, 'segments': results})
    }


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
    points = body.get('points')

    dadata_key = os.environ.get('DADATA_API_KEY', '')
    gh_key = os.environ.get('GRAPHHOPPER_API_KEY', '')
    dsn = os.environ.get('DATABASE_URL', '')

    if isinstance(points, list):
        cities = [str(p).strip() for p in points if str(p).strip()]
        if len(cities) < 2:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'need at least 2 points'})
            }
        return calc_multi(cities, dadata_key, gh_key, dsn)

    if not from_city or not to_city:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'from and to are required'})
        }

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
        with ThreadPoolExecutor(max_workers=2) as ex:
            f_from = ex.submit(geocode, from_city, dadata_key)
            f_to = ex.submit(geocode, to_city, dadata_key)
            from_coords = f_from.result()
            to_coords = f_to.result()
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
        print(f"calc-distance error for {from_city} -> {to_city}: {type(e).__name__}: {e}")
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