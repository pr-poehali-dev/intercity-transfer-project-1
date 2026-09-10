CREATE TABLE IF NOT EXISTS t_p48987818_intercity_transfer_p.route_geometry_cache (
    id SERIAL PRIMARY KEY,
    cache_key TEXT NOT NULL UNIQUE,
    line JSONB NOT NULL,
    distance_km INTEGER,
    stops JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_geometry_key
    ON t_p48987818_intercity_transfer_p.route_geometry_cache (cache_key);