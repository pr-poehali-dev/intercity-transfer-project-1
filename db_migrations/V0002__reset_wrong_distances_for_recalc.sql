UPDATE distance_cache SET distance_km = 0
WHERE (from_city = 'Бригадировка' AND to_city = 'Шаблыкино')
   OR (from_city = 'Шаблыкино' AND to_city = 'Бригадировка')
   OR (from_city = 'Красный Яр' AND to_city = 'Бригадировка')
   OR (from_city = 'Бригадировка' AND to_city = 'Красный Яр');