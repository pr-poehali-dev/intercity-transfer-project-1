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
    duration = body.get('duration')
    services = body.get('services', '—')
    comment = body.get('comment', '—')

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

    # Сообщение 2 — только данные о поездке, без контактов и стоимости
    import re
    def strip_prices(text: str) -> str:
        # Убираем (+500 ₽) и (500 ₽/км) и подобные скобки с ценами
        return re.sub(r'\s*\([^)]*₽[^)]*\)', '', text).strip()

    msg2_comment = f"\nКомментарий: {comment}" if comment and comment != '—' else ""
    if services and services != '—':
        services_clean = "; ".join(strip_prices(s) for s in services.split("; "))
        msg2_services = f"\nДоп. услуги: {services_clean}"
    else:
        msg2_services = ""
    msg2 = (
        f"📋 Детали поездки:\n\n"
        f"Откуда: {from_city}\n"
        f"{via_line}"
        f"Куда: {to_city}"
        f"{distance_line}"
        f"{duration_line}\n"
        f"Дата: {date}\n"
        f"Тариф: {tariff}\n"
        f"Пассажиры: {passengers}"
        f"{msg2_services}"
        f"{msg2_comment}"
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