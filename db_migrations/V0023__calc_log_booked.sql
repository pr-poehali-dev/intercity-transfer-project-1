ALTER TABLE t_p48987818_intercity_transfer_p.calc_log
    ADD COLUMN booked BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN booked_at TIMESTAMP,
    ADD COLUMN client_name TEXT,
    ADD COLUMN client_phone TEXT;