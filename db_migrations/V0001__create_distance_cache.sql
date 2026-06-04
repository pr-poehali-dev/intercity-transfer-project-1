CREATE TABLE t_p48987818_intercity_transfer_p.distance_cache (
  id SERIAL PRIMARY KEY,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_city, to_city)
);