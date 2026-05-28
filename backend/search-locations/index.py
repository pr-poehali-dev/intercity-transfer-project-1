import json
import os
import urllib.request


def handler(event: dict, context) -> dict:
    """Поиск населённых пунктов России через DaData"""
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

    payload = json.dumps({
        'query': query,
        'count': 15,
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

    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'suggestions': [], 'error': str(e)})
        }

    suggestions = []
    for item in data.get('suggestions', []):
        d = item.get('data', {})
        city = d.get('city') or d.get('settlement') or d.get('city_district')
        if not city:
            continue
        region = d.get('region_with_type') or d.get('region', '')
        full = item.get('value', '')
        suggestions.append({
            'name': city,
            'region': region,
            'full': full,
        })

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'suggestions': suggestions})
    }
