CREATE TABLE t_p48987818_intercity_transfer_p.calc_log (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    from_text TEXT NOT NULL,
    to_text TEXT NOT NULL,
    via_text TEXT,
    distance_km INTEGER,
    price INTEGER,
    tariff TEXT,
    round_trip BOOLEAN NOT NULL DEFAULT FALSE,
    success BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX calc_log_created_at_idx ON t_p48987818_intercity_transfer_p.calc_log (created_at DESC);