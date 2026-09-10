ALTER TABLE t_p48987818_intercity_transfer_p.distance_cache
    ADD COLUMN IF NOT EXISTS source TEXT;

ALTER TABLE t_p48987818_intercity_transfer_p.route_geometry_cache
    ADD COLUMN IF NOT EXISTS source TEXT;

UPDATE t_p48987818_intercity_transfer_p.distance_cache
    SET source = 'graphhopper' WHERE source IS NULL;

UPDATE t_p48987818_intercity_transfer_p.route_geometry_cache
    SET source = 'graphhopper' WHERE source IS NULL;

CREATE INDEX IF NOT EXISTS idx_distance_cache_source
    ON t_p48987818_intercity_transfer_p.distance_cache (source);

CREATE INDEX IF NOT EXISTS idx_route_geometry_source
    ON t_p48987818_intercity_transfer_p.route_geometry_cache (source);