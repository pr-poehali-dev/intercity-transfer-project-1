import json
import os
import urllib.request
import urllib.error
import time
import math
from concurrent.futures import ThreadPoolExecutor
from airports import airport_coords


def region_key(region: str) -> str:
    """Нормализует название региона до ядра без типа: 'Орловская обл' -> 'орловск'."""
    if not region:
        return ''
    low = region.lower().replace('ё', 'е')
    for t in ('область', 'обл.', 'обл', 'край', 'республика', 'респ.', 'респ',
              'автономный округ', 'ао', 'округ', 'г.', 'г '):
        low = low.replace(t, ' ')
    low = low.strip(' .,-')
    # отбрасываем окончание прилагательного, чтобы 'орловская' матчилось с 'орловск'
    return low[:6] if len(low) >= 6 else low


def clean_name(s: str) -> str:
    """Чистое имя нас. пункта без типа (деревня/село/г и т.п.) в нижнем регистре, ё→е."""
    import re
    s = (s or '').lower().replace('ё', 'е')
    # убираем содержимое скобок (поселок Красный Октябрь) и сами скобки
    s = re.sub(r'\([^)]*\)', ' ', s)
    for t in ('территория', 'тер.', 'тер ', 'снт', 'сот',
              'деревня', 'село', 'посёлок', 'поселок', 'пгт', 'станица',
              'ст-ца', 'ст-ца.', 'ст-ца ', 'ст.', 'ст ', 'хутор', 'х.', 'х ',
              'пос.', 'пос ', 'рп ', 'рп.', 'мкр', 'город', 'рабочий',
              'г.', 'д.', 'с.', 'п.', 'г ', 'д ', 'с ', 'п '):
        s = s.replace(t, ' ')
    return ' '.join(s.split()).strip(' .,-')


def names_match(query_name: str, found_name: str) -> bool:
    """Проверяет, что найденное название ТОЧНО совпадает с запрошенным,
    чтобы DaData не подменил 'Какашкино' на похожее 'Канашкино'.
    Опечатки/замены букв НЕ допускаются."""
    a = clean_name(query_name)
    b = clean_name(found_name)
    if not a or not b:
        return True
    if a == b:
        return True
    # Разрешаем только дополнения через дефис/пробел/номер:
    # 'богородское' ⊂ 'богородское-2', но 'канашкино' ⊄ 'какашкино'.
    longer, shorter = (a, b) if len(a) >= len(b) else (b, a)
    if longer.startswith(shorter):
        tail = longer[len(shorter):].lstrip(' -')
        # хвост должен быть номером/коротким уточнением, а не другим словом
        if tail == '' or tail.isdigit() or len(tail) <= 2:
            return True
    # Запрос — одно цельное слово (микрорайон/посёлок), а найденный пункт
    # содержит его как отдельное слово: 'лоо' ⊂ 'горное лоо', 'вардане' ⊂
    # 'вардане-верино'. Так находятся курортные посёлки Сочи, которых нет
    # в DaData отдельной точкой. Требуем длину ≥3, чтобы избежать ложных.
    q_words = a.replace('-', ' ').split()
    f_words = b.replace('-', ' ').split()
    if len(q_words) == 1 and len(q_words[0]) >= 3 and q_words[0] in f_words:
        return True
    return False


def _dadata_suggest(query: str, api_key: str, count: int, to_bound: str):
    """Сырой запрос к DaData с заданной верхней границей (settlement/house)."""
    payload = json.dumps({
        'query': query,
        'count': count,
        'from_bound': {'value': 'region'},
        'to_bound': {'value': to_bound},
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
        return json.loads(resp.read())


def geocode_candidates(query: str, api_key: str, count: int = 10):
    """Возвращает список кандидатов от DaData:
    [(lat, lon, label, region_value, settlement_name, area_value), ...]."""
    data = _dadata_suggest(query, api_key, count, 'settlement')
    items = data.get('suggestions', [])
    # Если на уровне населённого пункта ничего нет (часто бывает с пгт,
    # курортными посёлками), расширяем поиск до уровня дома — он
    # вытягивает мелкие и нестандартные пункты.
    if not items:
        try:
            items = _dadata_suggest(query, api_key, count, 'house').get('suggestions', [])
        except Exception:
            items = []

    out = []
    for item in items:
        d = item.get('data', {})
        lat = d.get('geo_lat')
        lon = d.get('geo_lon')
        if not lat or not lon:
            continue
        label = item.get('value') or query
        found_region = d.get('region_with_type') or d.get('region') or ''
        found_name = (d.get('settlement') or d.get('city')
                      or d.get('city_district') or label)
        found_area = d.get('area_with_type') or d.get('area') or ''
        out.append((float(lat), float(lon), label, found_region, found_name, found_area))
    print(f"geocode '{query}' -> {len(out)} cand: {[c[2] for c in out[:5]]}")
    return out


def geocode(query: str, api_key: str, locations=None):
    """Первый кандидат (совместимость со старым кодом)."""
    cands = geocode_candidates(query, api_key, count=1)
    return cands[0] if cands else None


def parse_region(query: str):
    """Достаёт название региона из строки адреса."""
    parts = [p.strip() for p in query.split(',') if p.strip()]
    for p in parts[1:]:
        low = p.lower()
        if any(k in low for k in ('обл', 'край', 'респ', 'область', 'ао', 'округ', 'г.')):
            return p
    return None


def parse_area(query: str):
    """Достаёт название района из строки адреса ('Ленинский р-н')."""
    parts = [p.strip() for p in query.split(',') if p.strip()]
    for p in parts[1:]:
        low = p.lower()
        if any(k in low for k in ('р-н', 'район', 'муницип')):
            return p
    return None


def area_key(area: str) -> str:
    """Нормализует район до ядра без типа: 'Ленинский р-н' -> 'ленинск'."""
    if not area:
        return ''
    low = area.lower().replace('ё', 'е')
    for t in ('муниципальный район', 'муниципальный округ', 'городской округ',
              'муницип.', 'район', 'р-н', 'р-он', 'округ', 'г.о.'):
        low = low.replace(t, ' ')
    low = low.strip(' .,-')
    return low[:6] if len(low) >= 6 else low


def geocode_terminal(query: str, api_key: str):
    """Геокод аэропорта/вокзала/автовокзала: ищем сам объект,
    а не населённый пункт, поэтому не задаём границы settlement."""
    payload = json.dumps({
        'query': query,
        'count': 5,
        'locations': [{'country': 'Россия'}],
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
        data=payload, method='POST',
        headers={'Content-Type': 'application/json', 'Accept': 'application/json',
                 'Authorization': f'Token {api_key}'}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"geocode_terminal error '{query}': {e}")
        return None
    for item in data.get('suggestions', []):
        d = item.get('data', {})
        lat, lon = d.get('geo_lat'), d.get('geo_lon')
        if lat and lon:
            label = item.get('value') or query
            print(f"geocode_terminal '{query}' -> {label} ({lat},{lon})")
            return float(lat), float(lon), label
    return None


def geocode_safe(query: str, api_key: str):
    """Геокод с жёсткой привязкой к региону, чтобы не попасть
    в одноимённый населённый пункт в другой области.
    Возвращает (lat, lon, label) либо None."""
    # Аэропорт по IATA-коду из справочника — самый точный путь
    ap = airport_coords(query)
    if ap:
        print(f"airport '{query}' -> ({ap[0]},{ap[1]})")
        return ap

    # Аэропорты/вокзалы/автовокзалы без кода ищем как объект,
    # а не как населённый пункт
    low_q = query.lower()
    if (low_q.startswith('аэропорт') or low_q.startswith('вокзал')
            or low_q.startswith('жд ') or low_q.startswith('автовокзал')
            or low_q.startswith('автостанция') or low_q.startswith('ж/д')):
        res = geocode_terminal(query, api_key)
        if res:
            return res

    # Точный адрес (есть улица/дом) — геокодируем строку целиком,
    # это самый детальный уровень и не требует проверки названия пункта.
    street_markers = (' ул ', ' ул.', 'улица', ' пер ', ' пер.', 'переулок',
                      ' пр-кт', ' проспект', ' пр-д', ' проезд', ' ш ', ' шоссе',
                      ' б-р', ' бульвар', ' наб', ' тупик', ' аллея', ' кв-л')
    house_markers = (' д ', ' д.', ' дом ', ' стр ', ' стр.', ' корп', ' влд ', ' владение')
    qpad = f' {low_q} '
    if any(m in qpad for m in street_markers) or any(m in qpad for m in house_markers):
        cands = geocode_candidates(query, api_key, count=5)
        if cands:
            print(f"geocode address '{query}' -> {cands[0][2]}")
            return cands[0][:3]

    parts = [p.strip() for p in query.split(',') if p.strip()]
    name = parts[0] if parts else query
    region = parse_region(query)
    want = region_key(region) if region else ''
    area = parse_area(query)
    want_area = area_key(area) if area else ''

    def region_ok(res):
        if not want:
            return True
        return region_key(res[3]) == want

    def area_ok(res):
        """Район найденной точки совпадает с запрошенным.
        Различает одноимённые сёла (Курортное в Ленинском и Белогорском р-нах)."""
        if not want_area:
            return True
        found_area = res[5] if len(res) > 5 else ''
        return area_key(found_area) == want_area

    def name_ok(res):
        """Название найденной точки должно совпадать с запрошенным
        (защита от подмены Какашкино -> Канашкино)."""
        found_name = res[4] if len(res) > 4 else res[2]
        return names_match(name, found_name)

    # Собираем кандидатов из нескольких запросов (с регионом/районом в тексте и без).
    queries = []
    if region and area:
        queries.append(f"{name}, {region}, {area}")
    if region:
        queries.append(f"{name}, {region}")
        queries.append(query)
    queries.append(name)
    queries.append(query)

    seen = set()
    all_cands = []
    for q in queries:
        if q in seen:
            continue
        seen.add(q)
        try:
            all_cands.extend(geocode_candidates(q, api_key, count=10))
        except Exception as e:
            print(f"geocode_candidates error for '{q}': {e}")

    # 1) Идеально: совпал регион, район И название
    for c in all_cands:
        if region_ok(c) and area_ok(c) and name_ok(c):
            return c[:3]

    # 1b) Если указан район, но точного совпадения названия нет —
    # берём кандидата с совпавшими регионом и районом (СНТ/территории).
    if want_area:
        ra_cands = [c for c in all_cands if region_ok(c) and area_ok(c)]
        if ra_cands:
            print(f"geocode: '{query}' — берём по совпадению района: {ra_cands[0][2]}")
            return ra_cands[0][:3]
        print(f"geocode WARN: '{query}' — нет точки с нужным районом '{area}'. "
              f"Кандидаты: {[(c[2], c[3], c[5] if len(c) > 5 else '') for c in all_cands[:6]]}")
        return None

    # 2) Если регион известен — проверим кандидатов только по региону
    if want:
        region_cands = [c for c in all_cands if region_ok(c)]
        # СНТ/территории/переулки: название в DaData не совпадёт с запросом,
        # но если кандидат в нужном регионе единственный — доверяем ему.
        if len(region_cands) == 1:
            print(f"geocode: '{query}' — единственный кандидат в регионе, берём: {region_cands[0][2]}")
            return region_cands[0][:3]
        print(f"geocode WARN: '{query}' — нет точки с совпадающим регионом "
              f"и названием. Кандидаты: {[(c[2], c[3]) for c in all_cands[:6]]}")
        return None

    # 3) Региона не было — берём первого с совпадающим названием
    for c in all_cands:
        if name_ok(c):
            print(f"geocode: '{query}' — без региона, берём по названию: {c[2]}")
            return c[:3]
    # 3b) Название тоже не совпало (DaData вернул только похожие/territory),
    # но кандидаты есть — берём самый первый (DaData ранжирует по релевантности).
    if all_cands:
        print(f"geocode: '{query}' — точного названия нет, берём первого: {all_cands[0][2]}")
        return all_cands[0][:3]
    print(f"geocode WARN: '{query}' — кандидатов нет вовсе")
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


def same_region(from_city: str, to_city: str) -> bool:
    """Оба адреса указывают на один и тот же регион."""
    rf = region_key(parse_region(from_city) or '')
    rt = region_key(parse_region(to_city) or '')
    return bool(rf) and rf == rt


def region_sanity_ok(road_km: int, from_city: str, to_city: str) -> bool:
    """Если оба пункта в одном регионе, расстояние не может быть огромным.
    Самые протяжённые области РФ дают по дорогам не более ~700 км между
    своими населёнными пунктами. Большее значение — признак того, что
    геокодер взял одноимённый пункт из другого региона."""
    if not same_region(from_city, to_city):
        return True
    LIMIT_KM = 700
    if road_km > LIMIT_KM:
        print(f"REGION SANITY FAIL: {from_city} -> {to_city} = {road_km} km "
              f"(оба в одном регионе, лимит {LIMIT_KM} км)")
        return False
    return True


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


def norm_yo(s: str) -> str:
    """Нормализует букву ё→е, чтобы 'Орёл' и 'Орел' использовали один ключ кеша."""
    return (s or '').replace('ё', 'е').replace('Ё', 'Е')


def short_city(name: str) -> str:
    """Чистое название города без региона (часть до первой запятой)"""
    return norm_yo(name.split(',')[0].strip())


def segment_distance(from_city, to_city, dadata_key, gh_key, dsn):
    """Расстояние одного отрезка: геокод -> GraphHopper (без кэша)."""
    with ThreadPoolExecutor(max_workers=2) as ex:
        f_from = ex.submit(geocode_safe, from_city, dadata_key)
        f_to = ex.submit(geocode_safe, to_city, dadata_key)
        from_res = f_from.result()
        to_res = f_to.result()
    if not from_res or not to_res:
        raise ValueError(f'Координаты не найдены: {from_city} / {to_city}')
    from_coords = from_res[:2]
    to_coords = to_res[:2]
    dist = road_distance(from_coords, to_coords, gh_key)
    if dist and not region_sanity_ok(dist, from_city, to_city):
        # Оба пункта в одном регионе, но расстояние огромное — данные ошибочны
        dist = None
    if dist and not is_sane_distance(dist, from_coords, to_coords):
        print(f"INSANE distance: {from_city} -> {to_city} = {dist} km")
        dist = None
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
    """Расчёт расстояния по дорогам через GraphHopper (без кэша, всегда актуально)."""
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
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'distance': None, 'error': str(e)})
        }

    if dist and not region_sanity_ok(dist, from_city, to_city):
        # Оба пункта в одном регионе, но расстояние огромное — данные ошибочны
        dist = None

    if dist and not is_sane_distance(dist, from_coords, to_coords):
        print(f"INSANE distance: {from_city} -> {to_city} = {dist} km")
        dist = None

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'distance': dist,
            'from_label': from_label,
            'to_label': to_label,
        })
    }