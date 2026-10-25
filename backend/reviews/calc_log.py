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


STATUSES = ('new', 'called', 'booked', 'refused', 'spam')


def is_admin(event: dict) -> bool:
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    password = os.environ.get('ADMIN_PASSWORD', '')
    return bool(password) and headers.get('x-admin-password', '') == password


def edit_row(schema: str, body: dict) -> dict:
    row_id = to_int(body.get('id'))
    if not row_id:
        return resp(400, {'error': 'id required'})
    sets = []
    if 'status' in body:
        st = body.get('status')
        if st not in STATUSES:
            return resp(400, {'error': 'bad status'})
        sets.append(f"status = '{st}'")
    for field, col in (('note', 'note'), ('client_name', 'client_name'), ('client_phone', 'client_phone'),
                       ('from', 'from_text'), ('to', 'to_text'), ('tariff', 'tariff'), ('city', 'client_city')):
        if field in body:
            val = (body.get(field) or '').strip()
            sets.append(f"{col} = '{esc(val)}'" if val or col in ('note', 'client_name', 'client_phone', 'client_city', 'tariff') else '')
    for field, col in (('price', 'price'), ('distance', 'distance_km')):
        if field in body:
            v = to_int(body.get(field))
            sets.append(f"{col} = {v if v is not None else 'NULL'}")
    for field in ('booked', 'hidden'):
        if field in body:
            sets.append(f"{field} = {'TRUE' if body.get(field) else 'FALSE'}")
    sets = [x for x in sets if x]
    if not sets:
        return resp(400, {'error': 'nothing to update'})
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(f"UPDATE {schema}.calc_log SET {', '.join(sets)} WHERE id = {row_id}")
    conn.close()
    return resp(200, {'ok': True})


def parse_day(value: str):
    return datetime.strptime(value, '%Y-%m-%d') - timedelta(hours=3)


def list_rows(schema: str, qs: dict) -> dict:
    today = (datetime.utcnow() + timedelta(hours=3)).strftime('%Y-%m-%d')
    d_from = qs.get('date_from') or qs.get('date') or today
    d_to = qs.get('date_to') or d_from
    try:
        start = parse_day(d_from)
        end = parse_day(d_to) + timedelta(days=1)
    except ValueError:
        return resp(400, {'error': 'bad date'})
    if (end - start).days > 93:
        start = end - timedelta(days=93)

    where = [f"created_at >= '{start.isoformat()}'", f"created_at < '{end.isoformat()}'"]
    if qs.get('show_hidden') != '1':
        where.append('hidden = FALSE')
    q = (qs.get('q') or '').strip().lower()
    if q:
        e = esc(q).replace('%', '').replace('_', '').replace('\\', '')
        where.append(
            f"(lower(from_text) LIKE '%{e}%' OR lower(to_text) LIKE '%{e}%' OR lower(coalesce(via_text,'')) LIKE '%{e}%' "
            f"OR lower(coalesce(client_name,'')) LIKE '%{e}%' OR coalesce(client_phone,'') LIKE '%{e}%' "
            f"OR lower(coalesce(note,'')) LIKE '%{e}%')"
        )
    if qs.get('ip'):
        where.append(f"client_ip = '{esc(qs['ip'])}'")
    if qs.get('city'):
        where.append(f"lower(coalesce(client_city,'')) LIKE '%{esc(qs['city'].lower())}%'")
    if qs.get('tariff'):
        where.append(f"tariff = '{esc(qs['tariff'])}'")
    if qs.get('status') in STATUSES:
        where.append(f"status = '{qs['status']}'")
    if qs.get('booked') in ('0', '1'):
        where.append(f"booked = {'TRUE' if qs['booked'] == '1' else 'FALSE'}")
    if qs.get('success') in ('0', '1'):
        where.append(f"success = {'TRUE' if qs['success'] == '1' else 'FALSE'}")

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, created_at + interval '3 hours', from_text, to_text, via_text, distance_km, price, tariff, round_trip, success, "
        f"booked, booked_at + interval '3 hours', client_name, client_phone, client_ip, client_city, status, note, hidden "
        f"FROM {schema}.calc_log WHERE {' AND '.join(where)} ORDER BY created_at DESC LIMIT 2000"
    )
    rows = cur.fetchall()
    cur.execute(
        f"SELECT DISTINCT tariff FROM {schema}.calc_log WHERE tariff IS NOT NULL AND tariff <> '' ORDER BY tariff"
    )
    tariffs = [r[0] for r in cur.fetchall()]
    conn.close()
    items = [
        {
            'id': r[0],
            'date': r[1].strftime('%d.%m'), 'time': r[1].strftime('%H:%M'),
            'from': r[2], 'to': r[3], 'via': r[4],
            'distance': r[5], 'price': r[6], 'tariff': r[7],
            'round_trip': r[8], 'success': r[9],
            'booked': r[10], 'booked_time': r[11].strftime('%d.%m %H:%M') if r[11] else None,
            'client_name': r[12], 'client_phone': r[13],
            'ip': r[14], 'city': r[15], 'status': r[16], 'note': r[17], 'hidden': r[18],
        }
        for r in rows
    ]
    return resp(200, {'date_from': d_from, 'date_to': d_to, 'items': items, 'tariffs': tariffs})


def handle_calc_log(event: dict) -> dict:
    method = event.get('httpMethod')

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        if body.get('edit'):
            if not is_admin(event):
                return resp(401, {'error': 'Неверный пароль'})
            return edit_row(schema, body)
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

    if not is_admin(event):
        return resp(401, {'error': 'Неверный пароль'})
    return list_rows(schema, event.get('queryStringParameters') or {})
