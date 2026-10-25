import json
import os
from datetime import datetime, timedelta

import psycopg2
import requests

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


def get_ip(event: dict) -> str:
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    fwd = (headers.get('x-forwarded-for') or '').split(',')[0].strip()
    ip = fwd or headers.get('x-real-ip') or ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp') or ''
    return ip[:64]


def city_by_ip(ip: str) -> str:
    key = os.environ.get('DADATA_API_KEY', '')
    if not ip or not key:
        return ''
    try:
        r = requests.get(
            'https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address',
            params={'ip': ip},
            headers={'Authorization': f'Token {key}', 'Accept': 'application/json'},
            timeout=1.5,
        )
        loc = (r.json() or {}).get('location') or {}
        data = loc.get('data') or {}
        city = data.get('city') or data.get('settlement') or ''
        region = data.get('region_with_type') or ''
        if city and region and city not in region:
            return f"{city}, {region}"
        return city or region or loc.get('value') or ''
    except Exception as e:
        print(f"iplocate error: {e}")
        return ''


def handle_calc_log(event: dict) -> dict:
    method = event.get('httpMethod')

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        if body.get('mark_booked'):
            ids = [to_int(i) for i in (body.get('ids') or [])]
            ids = [i for i in ids if i][:20]
            if not ids:
                return resp(400, {'error': 'ids required'})
            name = esc((body.get('name') or '').strip())
            phone = esc((body.get('phone') or '').strip())
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {schema}.calc_log SET booked = TRUE, booked_at = now(), "
                f"client_name = '{name}', client_phone = '{phone}' "
                f"WHERE id IN ({','.join(str(i) for i in ids)}) AND created_at > now() - interval '3 days'"
            )
            conn.close()
            return resp(200, {'ok': True})
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
        ip = get_ip(event)
        city = city_by_ip(ip)
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.calc_log (from_text, to_text, via_text, distance_km, price, tariff, round_trip, success, client_ip, client_city) "
            f"VALUES ('{esc(frm)}', '{esc(to)}', {via_sql}, "
            f"{km if km is not None else 'NULL'}, {price if price is not None else 'NULL'}, "
            f"'{esc(tariff)}', {rt}, {ok}, '{esc(ip)}', '{esc(city)}') RETURNING id"
        )
        new_id = cur.fetchone()[0]
        conn.close()
        return resp(200, {'ok': True, 'id': new_id})

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
        f"SELECT created_at + interval '3 hours', from_text, to_text, via_text, distance_km, price, tariff, round_trip, success, "
        f"booked, booked_at + interval '3 hours', client_name, client_phone, client_ip, client_city "
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
            'booked': r[9], 'booked_time': r[10].strftime('%H:%M') if r[10] else None,
            'client_name': r[11], 'client_phone': r[12],
            'ip': r[13], 'city': r[14],
        }
        for r in rows
    ]
    return resp(200, {'date': day, 'items': items})
