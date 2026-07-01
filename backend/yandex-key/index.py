import json
import os


def handler(event: dict, context) -> dict:
    """Отдаёт публичный API-ключ Яндекс.Карт для инициализации карты на фронтенде."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    key = os.environ.get('YANDEX_MAPS_API_KEY', '')
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
        },
        'body': json.dumps({'key': key})
    }
