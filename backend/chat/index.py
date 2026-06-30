import json
import os
import re
import requests
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}

BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '') or '-1003992864128'


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def tg_send(text, reply_to=None):
    if not BOT_TOKEN:
        return None
    payload = {'chat_id': CHAT_ID, 'text': text, 'parse_mode': 'HTML'}
    if reply_to:
        payload['reply_to_message_id'] = reply_to
        payload['allow_sending_without_reply'] = True
    try:
        resp = requests.post(
            f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage',
            json=payload, timeout=8,
        )
        data = resp.json()
        if data.get('ok'):
            return data['result']['message_id']
    except Exception as e:
        print(f"tg_send error: {e}")
    return None


def short_sid(session_id):
    return session_id[:8]


def handle_send(body):
    session_id = (body.get('session_id') or '').strip()
    text = (body.get('text') or '').strip()
    name = (body.get('name') or '').strip()
    if not session_id or not text:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'session_id and text required'})}

    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT tg_root_message_id FROM chat_sessions WHERE session_id = %s", (session_id,))
    row = cur.fetchone()
    is_new = row is None
    root_msg_id = row[0] if row else None

    label = f"💬 Чат #{short_sid(session_id)}"
    if name:
        label += f" · {name}"
    tg_text = f"{label}\n\n👤 {text}\n\n<i>Ответьте на это сообщение (reply), чтобы написать клиенту.</i>"
    sent_id = tg_send(tg_text, reply_to=root_msg_id)

    if is_new:
        cur.execute(
            "INSERT INTO chat_sessions (session_id, tg_root_message_id, last_name) VALUES (%s, %s, %s)",
            (session_id, sent_id, name or None),
        )
    elif name:
        cur.execute("UPDATE chat_sessions SET last_name = %s WHERE session_id = %s", (name, session_id))

    cur.execute(
        "INSERT INTO chat_messages (session_id, sender, text, tg_message_id) VALUES (%s, 'client', %s, %s) RETURNING id, created_at",
        (session_id, text, sent_id),
    )
    mid, created = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': mid})}


def handle_poll(session_id, after):
    if not session_id:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'session_id required'})}
    conn = db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, sender, text, EXTRACT(EPOCH FROM created_at) FROM chat_messages "
        "WHERE session_id = %s AND id > %s ORDER BY id ASC LIMIT 100",
        (session_id, after),
    )
    msgs = [{'id': r[0], 'sender': r[1], 'text': r[2], 'ts': int(r[3])} for r in cur.fetchall()]
    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'messages': msgs})}


def handle_webhook(update):
    message = update.get('message') or update.get('channel_post')
    if not message:
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}
    reply = message.get('reply_to_message')
    text = (message.get('text') or '').strip()
    if not reply or not text:
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    replied_id = reply.get('message_id')
    conn = db()
    cur = conn.cursor()
    session_id = None
    cur.execute("SELECT session_id FROM chat_sessions WHERE tg_root_message_id = %s", (replied_id,))
    r = cur.fetchone()
    if r:
        session_id = r[0]
    else:
        cur.execute("SELECT session_id FROM chat_messages WHERE tg_message_id = %s LIMIT 1", (replied_id,))
        r = cur.fetchone()
        if r:
            session_id = r[0]
    if not session_id:
        replied_text = reply.get('text') or ''
        m = re.search(r'Чат #([0-9a-fA-F]{8})', replied_text)
        if m:
            cur.execute("SELECT session_id FROM chat_sessions WHERE session_id LIKE %s LIMIT 1", (m.group(1) + '%',))
            r = cur.fetchone()
            if r:
                session_id = r[0]

    if session_id:
        cur.execute(
            "INSERT INTO chat_messages (session_id, sender, text, tg_message_id) VALUES (%s, 'operator', %s, %s)",
            (session_id, text, message.get('message_id')),
        )
        conn.commit()
    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}


def handler(event: dict, context) -> dict:
    """Онлайн-чат сайта: клиент пишет в Telegram, оператор отвечает reply'ем, ответ возвращается на сайт."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    if isinstance(body, dict) and ('update_id' in body or 'message' in body or 'channel_post' in body):
        return handle_webhook(body)

    if params.get('action') == 'setup_webhook':
        webhook_url = params.get('url') or ''
        if not webhook_url:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'url required'})}
        try:
            resp = requests.get(
                f'https://api.telegram.org/bot{BOT_TOKEN}/setWebhook',
                params={'url': webhook_url, 'allowed_updates': json.dumps(['message', 'channel_post'])},
                timeout=8,
            )
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(resp.json())}
        except Exception as e:
            return {'statusCode': 500, 'headers': CORS, 'body': json.dumps({'error': str(e)})}

    if method == 'GET' or params.get('action') == 'poll':
        session_id = (params.get('session_id') or '').strip()
        try:
            after = int(params.get('after') or 0)
        except Exception:
            after = 0
        return handle_poll(session_id, after)

    action = body.get('action') or 'send'
    if action == 'poll':
        return handle_poll((body.get('session_id') or '').strip(), int(body.get('after') or 0))
    return handle_send(body)