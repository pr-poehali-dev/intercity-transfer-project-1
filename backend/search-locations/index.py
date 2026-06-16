import json
import os
import urllib.request


def handler(event: dict, context) -> dict:
    """Поиск населённых пунктов России через DaData."""
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
    query = body.get('query', '').strip()

    if not query or len(query) < 2:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'suggestions': []})
        }

    api_key = os.environ.get('DADATA_API_KEY', '')
    if not api_key:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'suggestions': [], 'error': 'API key not configured'})
        }

    def dadata_request(payload_dict):
        payload = json.dumps(payload_dict).encode('utf-8')
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
        with urllib.request.urlopen(req, timeout=6) as resp:
            return json.loads(resp.read())

    # Ищем по всем уровням адреса: города, посёлки, сёла, деревни, хутора,
    # станицы, а также улицы и дома (to_bound = house).
    try:
        data = dadata_request({
            'query': query,
            'count': 20,
            'from_bound': {'value': 'city'},
            'to_bound': {'value': 'house'},
            'restrict_value': True,
            'locations': [{'country': 'Россия'}],
        })
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'suggestions': [], 'error': str(e)})
        }

    suggestions = []
    seen = set()

    def add_item(item):
        d = item.get('data', {})
        # Базовый населённый пункт
        settlement = (
            d.get('settlement_with_type')
            or d.get('city_with_type')
            or d.get('settlement')
            or d.get('city')
            or d.get('city_district_with_type')
            or d.get('city_district')
        )
        if not settlement:
            return
        region = d.get('region_with_type') or d.get('region', '')
        area = d.get('area_with_type') or ''
        street = d.get('street_with_type') or d.get('street') or ''
        house = d.get('house', '')
        house_type = d.get('house_type') or 'д'
        # Название в списке: нас. пункт + улица + дом, если они есть
        name = settlement
        if street:
            name = f'{settlement}, {street}'
            if house:
                name = f'{name}, {house_type} {house}'
        # Нормализуем ключ: ё→е и нижний регистр
        def norm(s):
            return (s or '').lower().replace('ё', 'е').strip()
        key = (norm(name), norm(region), norm(area))
        if key in seen:
            return
        seen.add(key)
        # Уточняем регионом и районом, чтобы различать одноимённые сёла
        sub = ', '.join(p for p in (region, area) if p)
        suggestions.append({
            'name': name,
            'region': sub or region,
            'full': item.get('value', ''),
        })

    for item in data.get('suggestions', []):
        add_item(item)

    # Если по городам/сёлам ничего не нашли — ищем шире (включая улицы),
    # это вытягивает мелкие деревни и хутора, которых нет на уровне settlement
    if not suggestions:
        try:
            data2 = dadata_request({
                'query': query,
                'count': 20,
                'from_bound': {'value': 'settlement'},
                'to_bound': {'value': 'house'},
                'locations': [{'country': 'Россия'}],
            })
            for item in data2.get('suggestions', []):
                add_item(item)
        except Exception:
            pass

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'suggestions': suggestions})
    }