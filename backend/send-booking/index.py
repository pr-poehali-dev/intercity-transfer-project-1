import json
import os
import requests


def send_telegram(message: str):
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = '-1003992864128'
    if not (bot_token and chat_id):
        print("Telegram secrets not configured, skipping Telegram")
        return
    for attempt in range(3):
        try:
            resp = requests.post(
                f'https://api.telegram.org/bot{bot_token}/sendMessage',
                json={'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'},
                timeout=8,
            )
            break
        except Exception as e:
            print(f"Telegram attempt {attempt+1} failed: {e}")
            if attempt == 2:
                raise
    result = resp.json()
    print(f"Telegram response: {result}")
    if not result.get('ok'):
        raise Exception(f"Telegram error: {result}")


def handler(event: dict, context) -> dict:
    """Отправляет заявку на бронирование в Telegram"""
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
    name = body.get('name', '—')
    phone = body.get('phone', '—')
    from_city = body.get('from_city', '—')
    via_city = body.get('via_city')
    to_city = body.get('to_city', '—')
    round_trip = body.get('round_trip')
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
    via_line = f"📍 Промежуточный пункт: {via_city}\n\n" if via_city else ""
    roundtrip_line = "🔄 Туда и обратно\n\n" if round_trip else ""
    services_line = f"➕ Доп. услуги: {services}\n\n" if services and services != '—' else ""
    distance_line = f"↕️ Расстояние: {distance} км\n\n" if distance else ""
    duration_line = f"⌛ В пути: {duration}\n\n" if duration else ""
    comment_line = f"🗒 Комментарий: {comment}" if comment and comment != '—' else ""

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
        f"☎️ {phone} · {name}\n\n"
        f"{comment_line}"
    )

    try:
        send_telegram(msg1)
    except Exception as e:
        print(f"Telegram error: {e}")

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }