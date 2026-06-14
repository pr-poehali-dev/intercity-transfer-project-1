import json
import os
import urllib.request
import urllib.error
import time
import math
from concurrent.futures import ThreadPoolExecutor
import psycopg2


def region_key(region: str) -> str:
    """Нормализует название региона до ядра без типа: 'Орловская обл' -> 'орловск'."""
    if not region:
        return ''
    low = region.lower()
    for t in ('область', 'обл.', 'обл', 'край', 'республика', 'респ.', 'респ',
              'автономный округ', 'ао', 'округ', 'г.', 'г '):
        low = low.replace(t, ' ')
    low = low.strip(' .,-')
    # отбрасываем окончание прилагательного, чтобы 'орловская' матчилось с 'орловск'
    return low[:6] if len(low) >= 6 else low


def geocode(query: str, api_key: str, locations=None):
    """Получить координаты населённого пункта через DaData.
    Возвращает (lat, lon, label, region_value) либо None."""
    payload = json.dumps({
        'query': query,
        'count': 1,
        'from_bound': {'value': 'region'},
        'to_bound': {'value': 'settlement'},
        'locations': locations or [{'country': 'Россия'}],
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
    label = items[0].get('value') or query
    found_region = d.get('region_with_type') or d.get('region') or ''
    print(f"geocode '{query}' (loc={locations}) -> {label} ({lat},{lon}) reg={found_region}")
    return float(lat), float(lon), label, found_region


def parse_region(query: str):
    """Достаёт название региона из строки адреса."""
    parts = [p.strip() for p in query.split(',') if p.strip()]
    for p in parts[1:]:
        low = p.lower()
        if any(k in low for k in ('обл', 'край', 'респ', 'область', 'ао', 'округ', 'г.')):
            return p
    return None


def geocode_safe(query: str, api_key: str):
    """Геокод с жёсткой привязкой к региону, чтобы не попасть
    в одноимённый населённый пункт в другой области.
    Возвращает (lat, lon, label) либо None."""
    parts = [p.strip() for p in query.split(',') if p.strip()]
    name = parts[0] if parts else query
    region = parse_region(query)
    want = region_key(region) if region else ''

    def matches(res):
        """Проверяет, что найденная точка в нужном регионе."""
        if not res:
            return False
        if not want:
            return True
        return region_key(res[3]) == want

    candidates = []

    # ШАГ 1: жёсткий фильтр по региону
    if region:
        for q in (f"{name}, {region}", name, query):
            res = geocode(q, api_key, locations=[{'region': region}])
            if res and matches(res):
                return res[:3]
            if res:
                candidates.append(res)

    # ШАГ 2: поиск по всей России, но ТОЛЬКО если совпадает регион
    res = geocode(query, api_key)
    if res and matches(res):
        return res[:3]
    if res:
        candidates.append(res)

    res = geocode(name, api_key)
    if res and matches(res):
        return res[:3]
    if res:
        candidates.append(res)

    # ШАГ 3: регион указан, но точного совпадения нет —
    # лучше ничего не вернуть, чем взять чужой нас. пункт
    if want:
        print(f"geocode WARN: '{query}' — нет точки в регионе '{region}', "
              f"кандидаты: {[c[2] for c in candidates]}")
        return None

    # региона не было (крупный город) — берём первый кандидат
    if candidates:
        return candidates[0][:3]
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
        from_res = f_from.result()
        to_res = f_to.result()
    if not from_res or not to_res:
        if conn:
            conn.close()
        raise ValueError(f'Координаты не найдены: {from_city} / {to_city}')
    from_coords = from_res[:2]
    to_coords = to_res[:2]
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


def geocode_label(query: str, api_key: str):
    """Возвращает подпись найденной точки (название с областью) или исходную строку."""
    try:
        res = geocode_safe(query, api_key)
        if res and len(res) > 2:
            return res[2]
    except Exception:
        pass
    return short_city(query)


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
        with ThreadPoolExecutor(max_workers=len(cities)) as ex:
            labels = list(ex.map(lambda c: geocode_label(c, dadata_key), cities))
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
        'body': json.dumps({'distance': total, 'segments': results, 'labels': labels})
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
            from_res = f_from.result()
            to_res = f_to.result()
        if not from_res or not to_res:
            if conn:
                conn.close()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'distance': None, 'error': 'Координаты не найдены'})
            }
        from_coords = from_res[:2]
        to_coords = to_res[:2]
        from_label = from_res[2] if len(from_res) > 2 else from_city
        to_label = to_res[2] if len(to_res) > 2 else to_city
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
        'body': json.dumps({
            'distance': dist,
            'from_label': from_label,
            'to_label': to_label,
        })
    }