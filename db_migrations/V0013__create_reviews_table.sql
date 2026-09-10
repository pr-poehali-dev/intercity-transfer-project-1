CREATE TABLE IF NOT EXISTS t_p48987818_intercity_transfer_p.reviews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    route VARCHAR(200) NOT NULL,
    rating SMALLINT NOT NULL DEFAULT 5,
    text TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved_created
    ON t_p48987818_intercity_transfer_p.reviews (approved, created_at DESC);
