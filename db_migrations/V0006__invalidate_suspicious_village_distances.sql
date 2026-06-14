UPDATE distance_cache
SET distance_km = 0
WHERE from_city = 'Орёл, Орловская область'
  AND to_city = 'деревня Мешково, Орловская обл, Урицкий р-н'
  AND distance_km = 809;

UPDATE distance_cache
SET distance_km = 0
WHERE distance_km > 700
  AND (
    from_city ILIKE '%деревня%' OR to_city ILIKE '%деревня%'
    OR from_city ILIKE '%село %' OR to_city ILIKE '%село %'
    OR from_city ILIKE '%посёлок%' OR to_city ILIKE '%посёлок%'
    OR from_city ILIKE '%поселок%' OR to_city ILIKE '%поселок%'
  )
  AND (from_city ILIKE '%обл%' OR to_city ILIKE '%обл%');