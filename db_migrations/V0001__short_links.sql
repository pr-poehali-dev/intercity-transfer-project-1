CREATE TABLE IF NOT EXISTS t_p48987818_intercity_transfer_p.short_links (
    code VARCHAR(16) PRIMARY KEY,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);