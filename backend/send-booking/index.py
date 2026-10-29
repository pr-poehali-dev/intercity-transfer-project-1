import json
import os
import requests
import secrets
import string
import psycopg2
from urllib.parse import quote


def send_vk(message: str, link: str = ''):
    token = os.environ.get('VK_BOT_TOKEN', '')
    user_id = os.environ.get('VK_USER_ID', '')
    if not (token and user_id):
        print("VK secrets not configured, skipping VK")
        return
    data = {
        'user_id': user_id,
        'message': message,
        'random_id': 0,
        'access_token': token,
        'v': '5.199',
    }
    if link:
        data['keyboard'] = json.dumps({
            'inline': True,
            'buttons': [[{'action': {'type': 'open_link', 'link': link, 'label': '🗺 Открыть маршрут'}}]],
        }, ensure_ascii=False)
    resp = requests.post('https://api.vk.com/method/messages.send', data=data, timeout=3)
    result = resp.json()
    if 'error' in result and link:
        print(f"VK keyboard error, fallback to text link: {result['error']}")
        data.pop('keyboard', None)
        data['message'] = message + f"\n\n{link}"
        result = requests.post('https://api.vk.com/method/messages.send', data=data, timeout=3).json()
    print(f"VK response: {result}")
    if 'error' in result:
        raise Exception(f"VK error: {result['error']}")


def send_telegram(message: str, link: str = ''):
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not (token and chat_id):
        print("Telegram secrets not configured, skipping Telegram")
        return
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    payload = {'chat_id': chat_id, 'text': message, 'disable_web_page_preview': True}
    if link:
        payload['reply_markup'] = {
            'inline_keyboard': [[{'text': 'Маршрут', 'url': link, 'style': 'success'}]],
        }
    result = requests.post(url, json=payload, timeout=(2, 3)).json()
    if not result.get('ok') and link:
        print(f"Telegram button error, retry plain: {result}")
        payload['reply_markup'] = {'inline_keyboard': [[{'text': 'Маршрут', 'url': link}]]}
        result = requests.post(url, json=payload, timeout=(2, 3)).json()
    print(f"Telegram response ok={result.get('ok')} {'' if result.get('ok') else result}")
    if not result.get('ok'):
        raise Exception(f"Telegram error: {result.get('description')}")


ALPHABET = string.ascii_lowercase + string.digits


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def schema():
    return os.environ.get('MAIN_DB_SCHEMA', 'public')


def make_short(url: str) -> str:
    conn = db()
    cur = conn.cursor()
    code = ''
    for _ in range(5):
        code = ''.join(secrets.choice(ALPHABET) for _ in range(6))
        safe_url = url.replace("'", "''")
        cur.execute(
            f"INSERT INTO {schema()}.short_links (code, url) VALUES ('{code}', '{safe_url}') "
            f"ON CONFLICT (code) DO NOTHING"
        )
        if cur.rowcount == 1:
            break
    conn.commit()
    conn.close()
    return f'https://nashe-transfer.ru/r/{code}'


def resolve_short(code: str):
    if not code or not all(c in ALPHABET for c in code) or len(code) > 16:
        return None
    conn = db()
    cur = conn.cursor()
    cur.execute(f"SELECT url FROM {schema()}.short_links WHERE code = '{code}'")
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    """Отправляет заявку на бронирование в ВКонтакте и Telegram."""
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

    if event.get('httpMethod') == 'GET':
        code = (event.get('queryStringParameters') or {}).get('code', '')
        url = resolve_short(code)
        return {
            'statusCode': 200 if url else 404,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'url': url}),
        }

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '—')
    phone = body.get('phone', '—')
    from_city = body.get('from_city', '—')
    via_city = body.get('via_city')
    to_city = body.get('to_city', '—')
    from_region = body.get('from_region')
    via_region = body.get('via_region')
    to_region = body.get('to_region')
    round_trip = body.get('round_trip')

    def with_region(city, region):
        if city and region and region.strip() and region.strip() != city.strip():
            return f"{city} ({region})"
        return city

    def map_point(city, region):
        city = (city or '').strip()
        region = (region or '').strip()
        return f"{city}, {region}" if region and region not in city else city

    stops = [map_point(body.get('from_city'), from_region)]
    if via_city:
        stops.append(map_point(via_city, via_region))
    stops.append(map_point(body.get('to_city'), to_region))
    if round_trip:
        stops += stops[-2::-1]
    stops = [x for x in stops if x]
    route_names = [x.split(',')[0].strip() for x in stops]
    route_text = ' → '.join(route_names)
    coords = body.get('route_coords') or []
    ok_coords = (
        isinstance(coords, list) and len(coords) >= 2
        and all(isinstance(c, list) and len(c) == 2 for c in coords)
    )
    if ok_coords:
        pts = [(float(c[0]), float(c[1])) for c in coords]
        if round_trip:
            pts += pts[-2::-1]
        flat = '_'.join(f"{la:.5f}_{lo:.5f}" for la, lo in pts)
        route_url = (
            'https://nashe-transfer.ru/navi?p=' + flat
            + '&n=' + '_'.join(quote(n.replace('_', ' '), safe='') for n in route_names)
        )
    else:
        route_url = (
            'https://nashe-transfer.ru/navi?s='
            + '_'.join(quote(x.replace('_', ' '), safe='') for x in stops)
            + '&n=' + '_'.join(quote(n.replace('_', ' '), safe='') for n in route_names)
        )

    from_city = with_region(from_city, from_region)
    to_city = with_region(to_city, to_region)
    if via_city:
        via_city = with_region(via_city, via_region)
    raw_date = body.get('date', '—')
    try:
        parts = raw_date.split(' ')
        d_parts = parts[0].split('-')
        date = f"{d_parts[2]}.{d_parts[1]}.{d_parts[0][2:]}" + (f" {parts[1]}" if len(parts) > 1 else "")
    except Exception:
        date = raw_date
    passengers = body.get('passengers', '—')
    tariff = body.get('tariff', '—')
    price = body.get('price', '—')
    distance = body.get('distance')
    services = body.get('services', '—')
    comment = body.get('comment', '—')

    def get_duration(dist):
        if not dist: return None
        d = int(dist)
        if d <= 45:   return "30–40 минут"
        if d <= 80:   return "1–1.5 часа"
        if d <= 120:  return "1.5–2 часа"
        if d <= 160:  return "2–2.5 часа"
        if d <= 210:  return "2.5–3 часа"
        if d <= 270:  return "3–4 часа"
        if d <= 340:  return "4–5 часов"
        if d <= 430:  return "5–6 часов"
        if d <= 530:  return "6–7 часов"
        if d <= 630:  return "7–8 часов"
        if d <= 730:  return "8–10 часов"
        if d <= 870:  return "10–12 часов"
        if d <= 1050: return "12–14 часов"
        if d <= 1250: return "14–16 часов"
        if d <= 1450: return "16–18 часов"
        if d <= 1700: return "19–22 часа"
        if d <= 2000: return "22–26 часов"
        if d <= 2400: return "26–30 часов"
        if d <= 2800: return "30–36 часов"
        return "более 40 часов"

    duration = get_duration(distance)
    via_line = f"📍 Точка: {via_city}\n\n" if via_city else ""
    roundtrip_line = "🔄 Туда и обратно\n\n" if round_trip else ""
    services_line = f"➕ Доп. услуги: {services}\n\n" if services and services != '—' else ""
    distance_line = f"↕️ Расстояние: {distance} км\n\n" if distance else ""
    duration_line = f"⌛ В пути: {duration}\n\n" if duration else ""
    comment_line = f"🗒 Комментарий: {comment}\n\n" if comment and comment != '—' else ""

    # Сообщение 1 — полная информация о заявке
    msg1 = (
        f"🕛 {date}\n\n"
        f"🚘 Тариф: {tariff}\n\n"
        f"🔵 Откуда: {from_city}\n\n"
        f"{via_line}"
        f"🟢 Куда: {to_city}\n\n"
        f"{roundtrip_line}"
        f"{services_line}"
        f"👥 Пассажиров: {passengers}\n\n"
        f"{distance_line}"
        f"{duration_line}"
        f"💰 Стоимость: {price} руб.\n\n"
        f"{comment_line}"
        f"☎️ {phone} · {name}"
    )

    try:
        route_url = make_short(route_url)
    except Exception as e:
        print(f"Short link error: {e}")

    try:
        send_vk(msg1, route_url)
    except Exception as e:
        print(f"VK error: {e}")

    try:
        send_telegram(msg1, route_url)
    except Exception as e:
        print(f"Telegram error: {e}")

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }