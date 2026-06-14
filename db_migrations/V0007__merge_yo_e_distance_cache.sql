INSERT INTO distance_cache (from_city, to_city, distance_km)
SELECT TRANSLATE(from_city, 'ё', 'е'),
       TRANSLATE(to_city, 'ё', 'е'),
       distance_km
FROM distance_cache
WHERE (from_city LIKE '%ё%' OR to_city LIKE '%ё%')
  AND distance_km > 0
ON CONFLICT (from_city, to_city) DO NOTHING;

UPDATE distance_cache
SET distance_km = 0
WHERE from_city LIKE '%ё%' OR to_city LIKE '%ё%';