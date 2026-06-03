import json
import os
import random
import requests


def send_vk(message: str):
    vk_token = os.environ.get('VK_BOT_TOKEN', '')
    vk_user_id = os.environ.get('VK_USER_ID', '')
    if not (vk_token and vk_user_id):
        print("VK secrets not configured, skipping VK")
        return
    resp = requests.post(
        'https://api.vk.com/method/messages.send',
        data={
            'user_id': vk_user_id,
            'message': message,
            'random_id': random.randint(0, 2**31),
            'access_token': vk_token,
            'v': '5.131',
        },
        timeout=15,
    )
    result = resp.json()
    print(f"VK response: {result}")
    if 'error' in result:
        raise Exception(f"VK error: {result['error']}")


def handler(event: dict, context) -> dict:
    """Отправляет заявку на бронирование в VK"""
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

    vk_text = (
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

    try:
        send_vk(vk_text)
    except Exception as e:
        print(f"VK error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'error': str(e)})
        }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }
