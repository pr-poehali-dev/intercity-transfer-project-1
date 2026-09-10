import json
import os

import psycopg2
import requests

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}


def esc(value: str) -> str:
    return value.replace("'", "''")


def notify_vk(name: str, route: str, rating: int, text: str):
    token = os.environ.get('VK_BOT_TOKEN', '')
    user_id = os.environ.get('VK_USER_ID', '')
    if not (token and user_id):
        return
    message = (
        f"\u2b50 Новый отзыв на модерацию\n\n"
        f"Имя: {name}\n"
        f"Маршрут: {route}\n"
        f"Оценка: {rating} из 5\n\n"
        f"{text}"
    )
    requests.post(
        'https://api.vk.com/method/messages.send',
        data={
            'user_id': user_id,
            'message': message,
            'random_id': 0,
            'access_token': token,
            'v': '5.199',
        },
        timeout=3,
    )


def handler(event: dict, context) -> dict:
    """Отдаёт одобренные отзывы клиентов и принимает новые на модерацию."""
    method = event.get('httpMethod')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    if method == 'GET':
        cur.execute(
            f"SELECT name, route, rating, text FROM {schema}.reviews "
            f"WHERE approved = TRUE ORDER BY created_at DESC LIMIT 30"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        reviews = [
            {'name': r[0], 'city': r[1], 'rating': r[2], 'text': r[3]}
            for r in rows
        ]
        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'reviews': reviews}, ensure_ascii=False),
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = str(body.get('name', '')).strip()[:100]
        route = str(body.get('route', '')).strip()[:200]
        text = str(body.get('text', '')).strip()[:2000]
        try:
            rating = int(body.get('rating', 5))
        except (TypeError, ValueError):
            rating = 5
        rating = max(1, min(5, rating))

        if not name or not route or len(text) < 10:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**CORS, 'Content-Type': 'application/json'},
                'body': json.dumps(
                    {'ok': False, 'error': 'Заполните имя, маршрут и текст отзыва'},
                    ensure_ascii=False,
                ),
            }

        cur.execute(
            f"INSERT INTO {schema}.reviews (name, route, rating, text, approved) "
            f"VALUES ('{esc(name)}', '{esc(route)}', {rating}, '{esc(text)}', FALSE)"
        )
        cur.close()
        conn.close()

        try:
            notify_vk(name, route, rating, text)
        except Exception as e:
            print(f"VK notify error: {e}")

        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}, ensure_ascii=False),
        }

    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': False, 'error': 'Method not allowed'}),
    }
