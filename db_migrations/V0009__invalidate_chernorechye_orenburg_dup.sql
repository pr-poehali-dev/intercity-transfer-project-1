UPDATE distance_cache
SET distance_km = 0
WHERE from_city = 'село Черноречье, Оренбургская обл, Оренбургский р-н'
  AND to_city = 'Оренбург, Оренбург'
  AND distance_km = 395;