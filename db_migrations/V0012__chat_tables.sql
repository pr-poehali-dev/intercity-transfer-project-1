CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    sender VARCHAR(16) NOT NULL,
    text TEXT NOT NULL,
    tg_message_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_tg ON chat_messages(tg_message_id);

CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    tg_root_message_id BIGINT,
    last_name VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);