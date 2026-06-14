import json
import os
import urllib.request
import urllib.error
import time
import math
from concurrent.futures import ThreadPoolExecutor
import psycopg2


def geocode(query: str, api_key: str):
    """Получить координаты населённого пункта через DaData"""
    payload = json.dumps({
        'query': query,
        'count': 1,
        'from_bound': {'value': 'region'},
        'to_bound': {'value': 'settlement'},
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


def geocode_safe(query: str, api_key: str):
    """Геокод с фоллбэками. ВАЖНО: сохраняем регион, чтобы не попасть
    в одноимённый населённый пункт в другой области."""
    coords = geocode(query, api_key)
    if coords:
        return coords

    parts = [p.strip() for p in query.split(',') if p.strip()]
    if not parts:
        return None
    name = parts[0]
    # Регион — часть со словами обл/край/респ/область/АО и т.п.
    region = None
    for p in parts[1:]:
        low = p.lower()
        if any(k in low for k in ('обл', 'край', 'респ', 'область', 'ао', 'округ')):
            region = p
            break

    # 1) название + регion (без района и типа)
    if region:
        q2 = f"{name}, {region}"
        if q2 != query:
            print(f"geocode fallback: '{query}' -> '{q2}'")
            coords = geocode(q2, api_key)
            if coords:
                return coords

    # 2) только название (последний шанс)
    if name != query:
        print(f"geocode fallback: '{query}' -> '{name}'")
        return geocode(name, api_key)
    return None


def haversine_km(c1, c2) -> float:
    """Расстояние по прямой между двумя точками (км)"""
    lat1, lon1 = math.radians(c1[0]), math.radians(c1[1])
    lat2, lon2 = math.radians(c2[0]), math.radians(c2[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(a))


def is_sane_distance(road_km: int, from_coords, to_coords) -> bool:
    """Проверяет адекватность дорожного расстояния.
    Дорожное расстояние должно быть >= прямой и не более чем в 4 раза больше неё."""
    straight = haversine_km(from_coords, to_coords)
    if straight < 1:
        return road_km < 50
    ratio = road_km / straight
    ok = 0.9 <= ratio <= 4.0
    if not ok:
        print(f"SANITY FAIL: road={road_km} km, straight={straight:.0f} km, ratio={ratio:.2f}")
    return ok


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


def short_city(name: str) -> str:
    """Чистое название города без региона (часть до первой запятой)"""
    return name.split(',')[0].strip()


def get_cached(conn, from_city: str, to_city: str):
    """Получить расстояние из кеша (проверяем оба направления и короткие названия)"""
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    f_short = short_city(from_city)
    t_short = short_city(to_city)
    variants = {
        (from_city, to_city), (to_city, from_city),
        (f_short, t_short), (t_short, f_short),
    }
    with conn.cursor() as cur:
        for a, b in variants:
            cur.execute(
                f"SELECT distance_km FROM {schema}.distance_cache "
                f"WHERE from_city = %s AND to_city = %s AND distance_km > 0 LIMIT 1",
                (a, b)
            )
            row = cur.fetchone()
            if row:
                return row[0]
    return None


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
        f_from = ex.submit(geocode_safe, from_city, dadata_key)
        f_to = ex.submit(geocode_safe, to_city, dadata_key)
        from_coords = f_from.result()
        to_coords = f_to.result()
    if not from_coords or not to_coords:
        if conn:
            conn.close()
        raise ValueError(f'Координаты не найдены: {from_city} / {to_city}')
    dist = road_distance(from_coords, to_coords, gh_key)
    if dist and conn:
        if is_sane_distance(dist, from_coords, to_coords):
            try:
                save_cache(conn, from_city, to_city, dist)
            except Exception:
                pass
        else:
            print(f"SKIP CACHE (insane): {from_city} -> {to_city} = {dist} km")
            dist = None
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
    """Расчёт расстояния по дорогам через GraphHopper с кешированием в БД."""
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
            f_from = ex.submit(geocode_safe, from_city, dadata_key)
            f_to = ex.submit(geocode_safe, to_city, dadata_key)
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
        if is_sane_distance(dist, from_coords, to_coords):
            try:
                save_cache(conn, from_city, to_city, dist)
            except Exception:
                pass
        else:
            print(f"SKIP CACHE (insane): {from_city} -> {to_city} = {dist} km")
            dist = None
        conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'distance': dist})
    }