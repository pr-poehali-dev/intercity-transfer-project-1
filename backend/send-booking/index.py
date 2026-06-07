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
    date = body.get('date', '—')
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
    distance_line = f"\nРасстояние: {distance} км" if distance else ""
    duration_line = f"\nВремя в пути: {duration}" if duration else ""
    via_line = f"Через: {via_city}\n" if via_city else ""
    services_line = f"\nДоп. услуги: {services}" if services and services != '—' else ""
    comment_line = f"\nКомментарий: {comment}" if comment and comment != '—' else ""

    # Сообщение 1 — полная информация о заявке
    msg1 = (
        f"🚗 Новое бронирование!\n\n"
        f"Имя: {name}\n"
        f"Телефон: {phone}\n"
        f"Откуда: {from_city}\n"
        f"{via_line}"
        f"Куда: {to_city}"
        f"{distance_line}"
        f"{duration_line}\n"
        f"Дата: {date}\n"
        f"Пассажиры: {passengers}\n"
        f"Тариф: {tariff}"
        f"{services_line}"
        f"{comment_line}\n"
        f"Стоимость: {price} руб."
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