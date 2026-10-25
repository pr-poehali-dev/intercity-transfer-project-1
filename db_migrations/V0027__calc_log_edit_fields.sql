ALTER TABLE t_p48987818_intercity_transfer_p.calc_log
    ADD COLUMN status TEXT NOT NULL DEFAULT 'new',
    ADD COLUMN note TEXT,
    ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE t_p48987818_intercity_transfer_p.calc_log SET hidden = TRUE WHERE from_text = 'ТЕСТ' AND to_text = 'ТЕСТ';