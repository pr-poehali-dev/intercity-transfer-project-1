import json
import os
from datetime import datetime, timedelta

import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    'Access-Control-Max-Age': '86400',
}


def esc(value) -> str:
    return str(value).replace("'", "''")[:300]


def resp(code: int, data) -> dict:
    return {
        'statusCode': code,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }


def to_int(v):
    try:
        return int(round(float(v)))
    except (TypeError, ValueError):
        return None


def handle_calc_log(event: dict) -> dict:
    method = event.get('httpMethod')

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        frm = (body.get('from') or '').strip()
        to = (body.get('to') or '').strip()
        if not frm or not to:
            return resp(400, {'error': 'from and to required'})
        via = (body.get('via') or '').strip()
        km = to_int(body.get('distance'))
        price = to_int(body.get('price'))
        tariff = (body.get('tariff') or '').strip()
        rt = 'TRUE' if body.get('round_trip') else 'FALSE'
        ok = 'FALSE' if body.get('success') is False else 'TRUE'
        via_sql = "'" + esc(via) + "'" if via else 'NULL'
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.calc_log (from_text, to_text, via_text, distance_km, price, tariff, round_trip, success) "
            f"VALUES ('{esc(frm)}', '{esc(to)}', {via_sql}, "
            f"{km if km is not None else 'NULL'}, {price if price is not None else 'NULL'}, "
            f"'{esc(tariff)}', {rt}, {ok})"
        )
        conn.close()
        return resp(200, {'ok': True})

    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    password = os.environ.get('ADMIN_PASSWORD', '')
    if not password or headers.get('x-admin-password', '') != password:
        return resp(401, {'error': 'Неверный пароль'})

    qs = event.get('queryStringParameters') or {}
    day = qs.get('date') or (datetime.utcnow() + timedelta(hours=3)).strftime('%Y-%m-%d')
    try:
        start = datetime.strptime(day, '%Y-%m-%d') - timedelta(hours=3)
    except ValueError:
        return resp(400, {'error': 'bad date'})
    end = start + timedelta(days=1)

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        f"SELECT created_at + interval '3 hours', from_text, to_text, via_text, distance_km, price, tariff, round_trip, success "
        f"FROM {schema}.calc_log WHERE created_at >= '{start.isoformat()}' AND created_at < '{end.isoformat()}' "
        f"ORDER BY created_at DESC LIMIT 1000"
    )
    rows = cur.fetchall()
    conn.close()
    items = [
        {
            'time': r[0].strftime('%H:%M'),
            'from': r[1], 'to': r[2], 'via': r[3],
            'distance': r[4], 'price': r[5], 'tariff': r[6],
            'round_trip': r[7], 'success': r[8],
        }
        for r in rows
    ]
    return resp(200, {'date': day, 'items': items})
