UPDATE distance_cache SET distance_km = 0
WHERE (from_city = 'Краснодар' AND to_city = 'Саки')
   OR (from_city = 'Краснодар' AND to_city = 'Sakiet ez Zit')
   OR (from_city = 'Краснодар' AND to_city = 'Витязево')
   OR (from_city = 'Сочи' AND to_city = 'Красная Поляна');