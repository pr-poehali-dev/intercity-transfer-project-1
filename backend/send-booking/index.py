import json
import os
import smtplib
import urllib.request
import urllib.parse
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(subject: str, text: str):
    email_from = os.environ.get('EMAIL_FROM', '')
    email_password = os.environ.get('EMAIL_PASSWORD', '').replace(' ', '')
    email_to = os.environ.get('EMAIL_TO', '')
    if not (email_from and email_password and email_to):
        print("Email secrets not configured, skipping email")
        return
    msg = MIMEMultipart()
    msg['From'] = email_from
    msg['To'] = email_to
    msg['Subject'] = subject
    msg.attach(MIMEText(text, 'plain', 'utf-8'))
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(email_from, email_password)
        server.sendmail(email_from, email_to, msg.as_string())
    print(f"Email sent to {email_to}")


def handler(event: dict, context) -> dict:
    """Отправляет заявку на бронирование в Telegram и на Email"""
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

    tg_distance_line = f"\n📏 Расстояние: {distance} км" if distance else ""
    tg_via_line = f"📌 Через: {via_city}\n" if via_city else ""
    tg_services_line = f"\n🧩 Доп. услуги: {services}" if services and services != '—' else ""
    tg_comment_line = f"\n💬 Комментарий: {comment}" if comment and comment != '—' else ""

    tg_text = (
        f"🚗 Новое бронирование!\n\n"
        f"👤 Имя: {name}\n"
        f"📞 Телефон: {phone}\n"
        f"📍 Откуда: {from_city}\n"
        f"{tg_via_line}"
        f"🏁 Куда: {to_city}"
        f"{tg_distance_line}\n"
        f"📅 Дата: {date}\n"
        f"👥 Пассажиры: {passengers}\n"
        f"🚘 Тариф: {tariff}"
        f"{tg_services_line}"
        f"{tg_comment_line}\n"
        f"💰 Стоимость: {price} ₽"
    )

    email_text = (
        f"Новое бронирование!\n\n"
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

    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    token_hint = f"{token[:10]}...{token[-4:]}" if len(token) > 14 else "EMPTY/SHORT"
    print(f"Using token: {token_hint}, chat_id: {chat_id}")

    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': tg_text,
    }).encode()

    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=data,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"Telegram error {e.code}: {err_body}")
        return {
            'statusCode': 502,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'error': err_body})
        }
    except Exception as e:
        print(f"Telegram unexpected error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'error': str(e)})
        }

    try:
        send_email(f"Новая заявка: {from_city} → {to_city}", email_text)
    except Exception as e:
        print(f"Email error (non-critical): {e}")

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': result.get('ok', False)})
    }
