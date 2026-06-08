-- Сбрасываем аномальное расстояние Краснодар-Армавир (365 вместо ~195 км)
UPDATE distance_cache SET distance_km = 0
WHERE from_city = 'Краснодар' AND to_city = 'Армавир';

-- Удаляем мусорную запись с тунисским городом
UPDATE distance_cache SET distance_km = 0
WHERE to_city = 'Sakiet ez Zit';