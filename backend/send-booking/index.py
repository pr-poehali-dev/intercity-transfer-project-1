import json
import os
import random
import requests


def send_vk_to_user(user_id: str, message: str, vk_token: str):
    resp = requests.post(
        'https://api.vk.com/method/messages.send',
        data={
            'user_id': user_id.strip(),
            'message': message,
            'random_id': random.randint(0, 2**31),
            'access_token': vk_token,
            'v': '5.131',
        },
        timeout=15,
    )
    result = resp.json()
    print(f"VK response for {user_id}: {result}")
    if 'error' in result:
        raise Exception(f"VK error for {user_id}: {result['error']}")


def send_vk_all(msg1: str, msg2: str):
    vk_token = os.environ.get('VK_BOT_TOKEN', '')
    # Поддерживаем как VK_USER_IDS (несколько), так и старый VK_USER_ID
    vk_ids_raw = os.environ.get('VK_USER_IDS', '') or os.environ.get('VK_USER_ID', '')
    if not (vk_token and vk_ids_raw):
        print("VK secrets not configured, skipping VK")
        return
    user_ids = [uid.strip() for uid in vk_ids_raw.split(',') if uid.strip()]
    for uid in user_ids:
        send_vk_to_user(uid, msg1, vk_token)
        send_vk_to_user(uid, msg2, vk_token)


def send_telegram(message: str):
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not (bot_token and chat_id):
        print("Telegram secrets not configured, skipping Telegram")
        return
    resp = requests.post(
        f'https://api.telegram.org/bot{bot_token}/sendMessage',
        json={'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'},
        timeout=15,
    )
    result = resp.json()
    print(f"Telegram response: {result}")
    if not result.get('ok'):
        raise Exception(f"Telegram error: {result}")


def handler(event: dict, context) -> dict:
    """Отправляет заявку на бронирование в VK двумя сообщениями всем получателям"""
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

    distance_line = f"\nРасстояние: {distance} км" if distance else ""
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
        f"{distance_line}\n"
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
        f"{distance_line}\n"
        f"Дата: {date}\n"
        f"Тариф: {tariff}\n"
        f"Пассажиры: {passengers}"
        f"{msg2_services}"
        f"{msg2_comment}"
    )

    try:
        send_vk_all(msg1, msg2)
    except Exception as e:
        print(f"VK error: {e}")

    try:
        send_telegram(msg1)
    except Exception as e:
        print(f"Telegram error: {e}")

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }