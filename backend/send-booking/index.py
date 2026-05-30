import json
import os
import urllib.request
import urllib.parse
import urllib.error


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

    distance_line = f"\n📏 Расстояние: {distance} км" if distance else ""
    via_line = f"📌 Через: {via_city}\n" if via_city else ""
    services_line = f"\n🧩 Доп. услуги: {services}" if services and services != '—' else ""
    comment_line = f"\n💬 Комментарий: {comment}" if comment and comment != '—' else ""

    text = (
        f"🚗 Новое бронирование!\n\n"
        f"👤 Имя: {name}\n"
        f"📞 Телефон: {phone}\n"
        f"📍 Откуда: {from_city}\n"
        f"{via_line}"
        f"🏁 Куда: {to_city}"
        f"{distance_line}\n"
        f"📅 Дата: {date}\n"
        f"👥 Пассажиры: {passengers}\n"
        f"🚘 Тариф: {tariff}"
        f"{services_line}"
        f"{comment_line}\n"
        f"💰 Стоимость: {price} ₽"
    )

    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')

    token_hint = f"{token[:10]}...{token[-4:]}" if len(token) > 14 else "EMPTY/SHORT"
    print(f"Using token: {token_hint}, chat_id: {chat_id}")

    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
    }).encode()

    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=data,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': result.get('ok', False)})
        }
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"Telegram error {e.code}: {err_body}, token_hint={token_hint}")
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'error': err_body, 'code': e.code, 'token_hint': token_hint})
        }