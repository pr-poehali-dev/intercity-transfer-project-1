import json
from datetime import datetime

SHOP_NAME = "НАШЕ for Russia Transfer"
SHOP_URL = "https://nashe-transfer.ru"
COMPANY_NAME = "НАШЕ for Russia Transfer"

TARIFFS = [
    {"id": "tariff-econom", "name": "Трансфер — Эконом", "price": 32, "unit": "км", "description": "Комфортный седан эконом-класса. До 4 пассажиров, кондиционер, фиксированная цена без доплат. Подача от двери до двери по всей России."},
    {"id": "tariff-comfort", "name": "Трансфер — Комфорт", "price": 37, "unit": "км", "description": "Премиум-седан повышенного комфорта. До 4 пассажиров, климат-контроль, Wi-Fi. Для деловых поездок и путешествий с комфортом."},
    {"id": "tariff-business", "name": "Трансфер — Бизнес", "price": 70, "unit": "км", "description": "Люкс-класс для VIP-поездок. До 4 пассажиров, автомобили представительского класса, конфиденциальность."},
    {"id": "tariff-universal", "name": "Трансфер — Универсал", "price": 40, "unit": "км", "description": "Автомобиль-универсал для поездок с большим багажом. До 4 пассажиров, вместительный багажник."},
    {"id": "tariff-minivan-5", "name": "Трансфер — Компакт-вэн (5 мест)", "price": 45, "unit": "км", "description": "Компактный минивэн на 5 пассажиров. Просторный салон, кондиционер, удобно для семейных поездок."},
    {"id": "tariff-minivan-7", "name": "Трансфер — Минивэн (7 мест)", "price": 55, "unit": "км", "description": "Минивэн на 7 пассажиров. Идеально для групповых поездок, корпоративных трансферов и семей с детьми."},
    {"id": "tariff-minivan-10", "name": "Трансфер — Минивэн XL (10 мест)", "price": 65, "unit": "км", "description": "Большой минивэн на 10 пассажиров. Для крупных групп, туристических поездок и корпоративных мероприятий."},
    {"id": "tariff-delivery", "name": "Доставка грузов и посылок", "price": 15, "unit": "км", "description": "Попутная доставка грузов и посылок по всей России. Надёжно, быстро, без агрегаторов."},
]

ROUTES = [
    {"id": "moskva-sankt-peterburg", "from": "Москва", "to": "Санкт-Петербург", "distance": 708, "duration": "8-9 часов", "price": 22650},
    {"id": "moskva-sochi", "from": "Москва", "to": "Сочи", "distance": 1626, "duration": "20-22 часа", "price": 52050},
    {"id": "moskva-kazan", "from": "Москва", "to": "Казань", "distance": 833, "duration": "10-11 часов", "price": 26650},
    {"id": "moskva-krasnodar", "from": "Москва", "to": "Краснодар", "distance": 1349, "duration": "16-18 часов", "price": 43150},
    {"id": "moskva-nizhniy-novgorod", "from": "Москва", "to": "Нижний Новгород", "distance": 436, "duration": "5-6 часов", "price": 13950},
    {"id": "sankt-peterburg-moskva", "from": "Санкт-Петербург", "to": "Москва", "distance": 708, "duration": "8-9 часов", "price": 22650},
    {"id": "moskva-voronezh", "from": "Москва", "to": "Воронеж", "distance": 521, "duration": "6-7 часов", "price": 16650},
    {"id": "moskva-tula", "from": "Москва", "to": "Тула", "distance": 183, "duration": "2-3 часа", "price": 5850},
    {"id": "moskva-yaroslavl", "from": "Москва", "to": "Ярославль", "distance": 274, "duration": "3-4 часа", "price": 8750},
    {"id": "moskva-tver", "from": "Москва", "to": "Тверь", "distance": 187, "duration": "2-2.5 часа", "price": 6000},
    {"id": "krasnodar-rostov-na-donu", "from": "Краснодар", "to": "Ростов-на-Дону", "distance": 275, "duration": "3-4 часа", "price": 8800},
    {"id": "rostov-na-donu-krasnodar", "from": "Ростов-на-Дону", "to": "Краснодар", "distance": 275, "duration": "3-4 часа", "price": 8800},
    {"id": "moskva-samara", "from": "Москва", "to": "Самара", "distance": 1090, "duration": "12-14 часов", "price": 34900},
    {"id": "kazan-nizhniy-novgorod", "from": "Казань", "to": "Нижний Новгород", "distance": 401, "duration": "5-6 часов", "price": 12850},
    {"id": "yekaterinburg-perm", "from": "Екатеринбург", "to": "Пермь", "distance": 360, "duration": "4-5 часов", "price": 11550},
    {"id": "moskva-rostov-na-donu", "from": "Москва", "to": "Ростов-на-Дону", "distance": 1080, "duration": "12-14 часов", "price": 34550},
    {"id": "sankt-peterburg-tver", "from": "Санкт-Петербург", "to": "Тверь", "distance": 540, "duration": "6-7 часов", "price": 17280},
    {"id": "moskva-vladimir", "from": "Москва", "to": "Владимир", "distance": 200, "duration": "2.5-3 часа", "price": 6400},
    {"id": "moskva-suzdal", "from": "Москва", "to": "Суздаль", "distance": 236, "duration": "3-3.5 часа", "price": 7550},
    {"id": "moskva-ryazan", "from": "Москва", "to": "Рязань", "distance": 200, "duration": "2.5-3 часа", "price": 6400},
    {"id": "moskva-kaluga", "from": "Москва", "to": "Калуга", "distance": 188, "duration": "2.5-3 часа", "price": 6000},
    {"id": "moskva-smolensk", "from": "Москва", "to": "Смоленск", "distance": 395, "duration": "5-6 часов", "price": 12650},
    {"id": "moskva-kursk", "from": "Москва", "to": "Курск", "distance": 527, "duration": "6-7 часов", "price": 16850},
    {"id": "moskva-belgorod", "from": "Москва", "to": "Белгород", "distance": 665, "duration": "8-9 часов", "price": 21300},
    {"id": "moskva-bryansk", "from": "Москва", "to": "Брянск", "distance": 382, "duration": "5-6 часов", "price": 12200},
    {"id": "moskva-orel", "from": "Москва", "to": "Орёл", "distance": 362, "duration": "4.5-5.5 часов", "price": 11600},
    {"id": "moskva-lipeck", "from": "Москва", "to": "Липецк", "distance": 470, "duration": "5.5-6.5 часов", "price": 15050},
    {"id": "moskva-tambov", "from": "Москва", "to": "Тамбов", "distance": 464, "duration": "6-7 часов", "price": 14850},
    {"id": "moskva-penza", "from": "Москва", "to": "Пенза", "distance": 651, "duration": "8-9 часов", "price": 20850},
    {"id": "moskva-saratov", "from": "Москва", "to": "Саратов", "distance": 849, "duration": "10-12 часов", "price": 27150},
    {"id": "moskva-ufa", "from": "Москва", "to": "Уфа", "distance": 1328, "duration": "16-18 часов", "price": 42500},
    {"id": "moskva-stavropol", "from": "Москва", "to": "Ставрополь", "distance": 1409, "duration": "18-20 часов", "price": 45100},
    {"id": "moskva-gelendzhik", "from": "Москва", "to": "Геленджик", "distance": 1521, "duration": "18-20 часов", "price": 48650},
    {"id": "moskva-anapa", "from": "Москва", "to": "Анапа", "distance": 1505, "duration": "17-19 часов", "price": 48150},
    {"id": "moskva-ivanovo", "from": "Москва", "to": "Иваново", "distance": 313, "duration": "4-5 часов", "price": 10000},
    {"id": "moskva-kostroma", "from": "Москва", "to": "Кострома", "distance": 346, "duration": "5-6 часов", "price": 11050},
    {"id": "moskva-vologda", "from": "Москва", "to": "Вологда", "distance": 477, "duration": "6-7 часов", "price": 15250},
    {"id": "moskva-pskov", "from": "Москва", "to": "Псков", "distance": 758, "duration": "9-10 часов", "price": 24250},
    {"id": "moskva-velikiy-novgorod", "from": "Москва", "to": "Великий Новгород", "distance": 545, "duration": "6.5-7.5 часов", "price": 17450},
    {"id": "moskva-cheboksary", "from": "Москва", "to": "Чебоксары", "distance": 684, "duration": "8-10 часов", "price": 21900},
    {"id": "moskva-ulyanovsk", "from": "Москва", "to": "Ульяновск", "distance": 870, "duration": "11-13 часов", "price": 27840},
    {"id": "moskva-saransk", "from": "Москва", "to": "Саранск", "distance": 630, "duration": "8-9 часов", "price": 20160},
    {"id": "moskva-chelyabinsk", "from": "Москва", "to": "Челябинск", "distance": 1733, "duration": "22-24 часа", "price": 55450},
    {"id": "moskva-kirov", "from": "Москва", "to": "Киров", "distance": 958, "duration": "11-13 часов", "price": 30650},
    {"id": "moskva-novosibirsk", "from": "Москва", "to": "Новосибирск", "distance": 3223, "duration": "3-4 суток", "price": 103150},
    {"id": "moskva-tolyatti", "from": "Москва", "to": "Тольятти", "distance": 990, "duration": "12-14 часов", "price": 31680},
    {"id": "moskva-orenburg", "from": "Москва", "to": "Оренбург", "distance": 1496, "duration": "18-20 часов", "price": 47850},
    {"id": "moskva-astrahan", "from": "Москва", "to": "Астрахань", "distance": 1400, "duration": "16-20 часов", "price": 44800},
    {"id": "moskva-tyumen", "from": "Москва", "to": "Тюмень", "distance": 1993, "duration": "24-28 часов", "price": 63800},
    {"id": "moskva-sergiev-posad", "from": "Москва", "to": "Сергиев Посад", "distance": 79, "duration": "1-2 часа", "price": 2528},
    {"id": "moskva-pereslavl-zalesskiy", "from": "Москва", "to": "Переславль-Залесский", "distance": 143, "duration": "2-3 часа", "price": 4576},
    {"id": "moskva-rostov-velikiy", "from": "Москва", "to": "Ростов Великий", "distance": 219, "duration": "3-4 часа", "price": 7008},
    {"id": "moskva-uglich", "from": "Москва", "to": "Углич", "distance": 240, "duration": "3-4 часа", "price": 7680},
    {"id": "moskva-bezhetsk", "from": "Москва", "to": "Бежецк", "distance": 181, "duration": "2.5-3 часа", "price": 5792},
    {"id": "ivanovo-yaroslavl", "from": "Иваново", "to": "Ярославль", "distance": 115, "duration": "2-3 часа", "price": 3680},
    {"id": "yaroslavl-vologda", "from": "Ярославль", "to": "Вологда", "distance": 203, "duration": "3-4 часа", "price": 6496},
    {"id": "moskva-dmitrov", "from": "Москва", "to": "Дмитров", "distance": 65, "duration": "1-1.5 часа", "price": 2080},
    {"id": "krasnodar-gelendzhik", "from": "Краснодар", "to": "Геленджик", "distance": 145, "duration": "2-2.5 часа", "price": 4640},
    {"id": "anapa-moskva", "from": "Анапа", "to": "Москва", "distance": 1505, "duration": "17-19 часов", "price": 48150},
    {"id": "gelendzhik-moskva", "from": "Геленджик", "to": "Москва", "distance": 1521, "duration": "18-20 часов", "price": 48650},
    {"id": "sankt-peterburg-novgorod", "from": "Санкт-Петербург", "to": "Великий Новгород", "distance": 180, "duration": "2.5-3 часа", "price": 5750},
    {"id": "sankt-peterburg-pskov", "from": "Санкт-Петербург", "to": "Псков", "distance": 290, "duration": "3.5-4 часа", "price": 9250},
    {"id": "nizhniy-novgorod-moskva", "from": "Нижний Новгород", "to": "Москва", "distance": 436, "duration": "5-6 часов", "price": 13950},
    {"id": "kazan-moskva", "from": "Казань", "to": "Москва", "distance": 833, "duration": "10-11 часов", "price": 26650},
    {"id": "rostov-na-donu-moskva", "from": "Ростов-на-Дону", "to": "Москва", "distance": 1080, "duration": "12-14 часов", "price": 34550},
    {"id": "voronezh-moskva", "from": "Воронеж", "to": "Москва", "distance": 521, "duration": "6-7 часов", "price": 16650},
    {"id": "samara-moskva", "from": "Самара", "to": "Москва", "distance": 1090, "duration": "12-14 часов", "price": 34900},
    {"id": "sochi-krasnodar", "from": "Сочи", "to": "Краснодар", "distance": 250, "duration": "3-4 часа", "price": 8000},
    {"id": "sochi-moskva", "from": "Сочи", "to": "Москва", "distance": 1626, "duration": "20-22 часа", "price": 52050},
    {"id": "krasnodar-moskva", "from": "Краснодар", "to": "Москва", "distance": 1349, "duration": "16-18 часов", "price": 43150},
    {"id": "ufa-moskva", "from": "Уфа", "to": "Москва", "distance": 1328, "duration": "16-18 часов", "price": 42500},
    {"id": "stavropol-moskva", "from": "Ставрополь", "to": "Москва", "distance": 1409, "duration": "18-20 часов", "price": 45100},
    {"id": "penza-moskva", "from": "Пенза", "to": "Москва", "distance": 651, "duration": "8-9 часов", "price": 20850},
    {"id": "saratov-moskva", "from": "Саратов", "to": "Москва", "distance": 849, "duration": "10-12 часов", "price": 27150},
    {"id": "orel-moskva", "from": "Орёл", "to": "Москва", "distance": 362, "duration": "4.5-5.5 часов", "price": 11600},
    {"id": "bryansk-moskva", "from": "Брянск", "to": "Москва", "distance": 382, "duration": "5-6 часов", "price": 12200},
    {"id": "smolensk-moskva", "from": "Смоленск", "to": "Москва", "distance": 395, "duration": "5-6 часов", "price": 12650},
    {"id": "kursk-moskva", "from": "Курск", "to": "Москва", "distance": 527, "duration": "7-8 часов", "price": 16850},
    {"id": "belgorod-moskva", "from": "Белгород", "to": "Москва", "distance": 665, "duration": "9-11 часов", "price": 21300},
    {"id": "kaluga-moskva", "from": "Калуга", "to": "Москва", "distance": 188, "duration": "2-3 часа", "price": 6000},
    {"id": "ryazan-moskva", "from": "Рязань", "to": "Москва", "distance": 200, "duration": "2-3 часа", "price": 6400},
    {"id": "vladimir-moskva", "from": "Владимир", "to": "Москва", "distance": 200, "duration": "2-3 часа", "price": 6400},
    {"id": "ivanovo-moskva", "from": "Иваново", "to": "Москва", "distance": 313, "duration": "4-5 часов", "price": 10000},
    {"id": "kostroma-moskva", "from": "Кострома", "to": "Москва", "distance": 346, "duration": "5-6 часов", "price": 11050},
    {"id": "vologda-moskva", "from": "Вологда", "to": "Москва", "distance": 477, "duration": "6-7 часов", "price": 15250},
    {"id": "pskov-moskva", "from": "Псков", "to": "Москва", "distance": 758, "duration": "9-11 часов", "price": 24250},
    {"id": "velikiy-novgorod-moskva", "from": "Великий Новгород", "to": "Москва", "distance": 545, "duration": "7-9 часов", "price": 17450},
    {"id": "cheboksary-moskva", "from": "Чебоксары", "to": "Москва", "distance": 684, "duration": "8-10 часов", "price": 21900},
    {"id": "ulyanovsk-moskva", "from": "Ульяновск", "to": "Москва", "distance": 870, "duration": "11-13 часов", "price": 27840},
    {"id": "saransk-moskva", "from": "Саранск", "to": "Москва", "distance": 630, "duration": "8-9 часов", "price": 20160},
    {"id": "chelyabinsk-moskva", "from": "Челябинск", "to": "Москва", "distance": 1733, "duration": "20-24 часа", "price": 55450},
    {"id": "kirov-moskva", "from": "Киров", "to": "Москва", "distance": 958, "duration": "11-13 часов", "price": 30650},
    {"id": "novosibirsk-moskva", "from": "Новосибирск", "to": "Москва", "distance": 3223, "duration": "более 40 часов", "price": 103150},
    {"id": "tolyatti-moskva", "from": "Тольятти", "to": "Москва", "distance": 990, "duration": "12-14 часов", "price": 31680},
    {"id": "orenburg-moskva", "from": "Оренбург", "to": "Москва", "distance": 1496, "duration": "18-20 часов", "price": 47850},
    {"id": "astrahan-moskva", "from": "Астрахань", "to": "Москва", "distance": 1400, "duration": "16-20 часов", "price": 44800},
    {"id": "tyumen-moskva", "from": "Тюмень", "to": "Москва", "distance": 1993, "duration": "24-28 часов", "price": 63800},
    {"id": "volgograd-rostov-na-donu", "from": "Волгоград", "to": "Ростов-на-Дону", "distance": 560, "duration": "6-8 часов", "price": 17920},
    {"id": "rostov-na-donu-volgograd", "from": "Ростов-на-Дону", "to": "Волгоград", "distance": 560, "duration": "6-8 часов", "price": 17920},
    {"id": "sochi-adler", "from": "Сочи", "to": "Адлер", "distance": 50, "duration": "1-1.5 часа", "price": 1600},
    {"id": "adler-krasnaya-polyana", "from": "Адлер", "to": "Красная Поляна", "distance": 45, "duration": "1-1.5 часа", "price": 1440},
    {"id": "sochi-pshada", "from": "Сочи", "to": "Пшада", "distance": 70, "duration": "1.5-2 часа", "price": 2240},
    {"id": "anapa-gelendzhik", "from": "Анапа", "to": "Геленджик", "distance": 240, "duration": "3-4 часа", "price": 7680},
    {"id": "gelendzhik-sochi", "from": "Геленджик", "to": "Сочи", "distance": 350, "duration": "5-6 часов", "price": 11200},
    {"id": "anapa-sochi", "from": "Анапа", "to": "Сочи", "distance": 600, "duration": "8-10 часов", "price": 19200},
    {"id": "sochi-tuapse", "from": "Сочи", "to": "Туапсе", "distance": 110, "duration": "2-3 часа", "price": 3520},
    {"id": "adler-gagra", "from": "Адлер", "to": "Гагра", "distance": 100, "duration": "2-3 часа", "price": 3200},
    {"id": "gelendzhik-anapa", "from": "Геленджик", "to": "Анапа", "distance": 240, "duration": "3-4 часа", "price": 7680},
    {"id": "krasnodar-anapa", "from": "Краснодар", "to": "Анапа", "distance": 375, "duration": "5-6 часов", "price": 12000},
    {"id": "krasnodar-sochi", "from": "Краснодар", "to": "Сочи", "distance": 500, "duration": "6-8 часов", "price": 16000},
    {"id": "krasnodar-novorossiysk", "from": "Краснодар", "to": "Новороссийск", "distance": 120, "duration": "2-3 часа", "price": 3840},
    {"id": "sochi-novorossiysk", "from": "Сочи", "to": "Новороссийск", "distance": 350, "duration": "5-6 часов", "price": 11200},
    {"id": "stavropol-pyatigorsk", "from": "Ставрополь", "to": "Пятигорск", "distance": 180, "duration": "2-3 часа", "price": 5760},
    {"id": "krasnodar-kabardinka", "from": "Краснодар", "to": "Кабардинка", "distance": 140, "duration": "2-3 часа", "price": 4480},
    {"id": "rostov-na-donu-pyatigorsk", "from": "Ростов-на-Дону", "to": "Пятигорск", "distance": 510, "duration": "7-9 часов", "price": 16320},
    {"id": "krasnodar-vityazevo", "from": "Краснодар", "to": "Витязево", "distance": 165, "duration": "2-3 часа", "price": 5280},
    {"id": "sochi-azov", "from": "Сочи", "to": "Азов", "distance": 560, "duration": "8-10 часов", "price": 17920},
    {"id": "anapa-rostov-na-donu", "from": "Анапа", "to": "Ростов-на-Дону", "distance": 430, "duration": "6-7 часов", "price": 13760},
    {"id": "gelendzhik-rostov-na-donu", "from": "Геленджик", "to": "Ростов-на-Дону", "distance": 480, "duration": "6-8 часов", "price": 15360},
    {"id": "stavropol-mineralnye-vody", "from": "Ставрополь", "to": "Минеральные Воды", "distance": 200, "duration": "3-4 часа", "price": 6400},
    {"id": "sochi-kislovodsk", "from": "Сочи", "to": "Кисловодск", "distance": 560, "duration": "8-10 часов", "price": 17920},
    {"id": "kazan-samara", "from": "Казань", "to": "Самара", "distance": 360, "duration": "5-6 часов", "price": 11520},
    {"id": "samara-kazan", "from": "Самара", "to": "Казань", "distance": 360, "duration": "5-6 часов", "price": 11520},
    {"id": "kazan-ufa", "from": "Казань", "to": "Уфа", "distance": 525, "duration": "7-9 часов", "price": 16800},
    {"id": "ufa-kazan", "from": "Уфа", "to": "Казань", "distance": 525, "duration": "7-9 часов", "price": 16800},
    {"id": "samara-ufa", "from": "Самара", "to": "Уфа", "distance": 460, "duration": "6-8 часов", "price": 14720},
    {"id": "ufa-samara", "from": "Уфа", "to": "Самара", "distance": 460, "duration": "6-8 часов", "price": 14720},
    {"id": "samara-yekaterinburg", "from": "Самара", "to": "Екатеринбург", "distance": 870, "duration": "11-13 часов", "price": 27840},
    {"id": "ufa-chelyabinsk", "from": "Уфа", "to": "Челябинск", "distance": 420, "duration": "5-7 часов", "price": 13440},
    {"id": "chelyabinsk-ufa", "from": "Челябинск", "to": "Уфа", "distance": 420, "duration": "5-7 часов", "price": 13440},
    {"id": "yekaterinburg-chelyabinsk", "from": "Екатеринбург", "to": "Челябинск", "distance": 210, "duration": "3-4 часа", "price": 6720},
    {"id": "chelyabinsk-yekaterinburg", "from": "Челябинск", "to": "Екатеринбург", "distance": 210, "duration": "3-4 часа", "price": 6720},
    {"id": "yekaterinburg-tyumen", "from": "Екатеринбург", "to": "Тюмень", "distance": 320, "duration": "4-5 часов", "price": 10240},
    {"id": "tyumen-yekaterinburg", "from": "Тюмень", "to": "Екатеринбург", "distance": 320, "duration": "4-5 часов", "price": 10240},
    {"id": "novosibirsk-omsk", "from": "Новосибирск", "to": "Омск", "distance": 630, "duration": "8-10 часов", "price": 20160},
    {"id": "omsk-novosibirsk", "from": "Омск", "to": "Новосибирск", "distance": 630, "duration": "8-10 часов", "price": 20160},
    {"id": "novosibirsk-tomsk", "from": "Новосибирск", "to": "Томск", "distance": 280, "duration": "4-5 часов", "price": 8960},
    {"id": "tomsk-novosibirsk", "from": "Томск", "to": "Новосибирск", "distance": 280, "duration": "4-5 часов", "price": 8960},
    {"id": "novosibirsk-barnaul", "from": "Новосибирск", "to": "Барнаул", "distance": 220, "duration": "3-4 часа", "price": 7040},
    {"id": "barnaul-novosibirsk", "from": "Барнаул", "to": "Новосибирск", "distance": 220, "duration": "3-4 часа", "price": 7040},
    {"id": "yekaterinburg-nizhniy-tagil", "from": "Екатеринбург", "to": "Нижний Тагил", "distance": 140, "duration": "2-2.5 часа", "price": 4480},
    {"id": "nizhniy-tagil-yekaterinburg", "from": "Нижний Тагил", "to": "Екатеринбург", "distance": 140, "duration": "2-2.5 часа", "price": 4480},
    {"id": "ufa-orenburg", "from": "Уфа", "to": "Оренбург", "distance": 370, "duration": "5-6 часов", "price": 11840},
    {"id": "orenburg-ufa", "from": "Оренбург", "to": "Уфа", "distance": 370, "duration": "5-6 часов", "price": 11840},
    {"id": "kazan-cheboksary", "from": "Казань", "to": "Чебоксары", "distance": 140, "duration": "2-3 часа", "price": 4480},
    {"id": "cheboksary-kazan", "from": "Чебоксары", "to": "Казань", "distance": 140, "duration": "2-3 часа", "price": 4480},
    {"id": "nizhniy-novgorod-kazan", "from": "Нижний Новгород", "to": "Казань", "distance": 401, "duration": "5-6 часов", "price": 12832},
    {"id": "saratov-volgograd", "from": "Саратов", "to": "Волгоград", "distance": 380, "duration": "5-6 часов", "price": 12160},
    {"id": "volgograd-saratov", "from": "Волгоград", "to": "Саратов", "distance": 380, "duration": "5-6 часов", "price": 12160},
    {"id": "volgograd-astrahan", "from": "Волгоград", "to": "Астрахань", "distance": 430, "duration": "6-7 часов", "price": 13760},
    {"id": "astrahan-volgograd", "from": "Астрахань", "to": "Волгоград", "distance": 430, "duration": "6-7 часов", "price": 13760},
]


def escape_xml(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def build_yml() -> str:
    date = datetime.now().strftime("%Y-%m-%d %H:%M")
    offers = []

    for t in TARIFFS:
        offers.append(f"""    <offer id="{t['id']}" available="true">
      <url>{SHOP_URL}/#contacts</url>
      <name>{escape_xml(t['name'])}</name>
      <price>{t['price']}</price>
      <currencyId>RUR</currencyId>
      <categoryId>1</categoryId>
      <description>{escape_xml(t['description'])}</description>
      <vendor>{escape_xml(COMPANY_NAME)}</vendor>
      <param name="Цена за км">{t['price']} ₽/км</param>
      <param name="Оплата">Фиксированная цена</param>
      <param name="Работаем">Круглосуточно</param>
    </offer>""")

    for r in ROUTES:
        name = f"Трансфер {r['from']} — {r['to']}"
        desc = f"Межгородний трансфер {r['from']} — {r['to']}. Расстояние {r['distance']} км, время в пути {r['duration']}. Без агрегаторов, фиксированная цена, подача от двери до двери."
        offers.append(f"""    <offer id="{r['id']}" available="true">
      <url>{SHOP_URL}/?from={escape_xml(r['from'])}&amp;to={escape_xml(r['to'])}</url>
      <name>{escape_xml(name)}</name>
      <price>{r['price']}</price>
      <currencyId>RUR</currencyId>
      <categoryId>2</categoryId>
      <description>{escape_xml(desc)}</description>
      <vendor>{escape_xml(COMPANY_NAME)}</vendor>
      <param name="Откуда">{escape_xml(r['from'])}</param>
      <param name="Куда">{escape_xml(r['to'])}</param>
      <param name="Расстояние">{r['distance']} км</param>
      <param name="Время в пути">{r['duration']}</param>
      <param name="Оплата">Фиксированная цена</param>
    </offer>""")

    offers_xml = "\n".join(offers)

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="{date}">
  <shop>
    <name>{escape_xml(SHOP_NAME)}</name>
    <company>{escape_xml(COMPANY_NAME)}</company>
    <url>{SHOP_URL}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Тарифы трансфера</category>
      <category id="2">Популярные маршруты</category>
    </categories>
    <offers>
{offers_xml}
    </offers>
  </shop>
</yml_catalog>"""


def handler(event: dict, context) -> dict:
    """Генерирует YML-фид для Яндекс.Маркета со всеми тарифами и маршрутами"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': ''
        }

    yml = build_yml()
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/xml; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
        },
        'body': yml
    }