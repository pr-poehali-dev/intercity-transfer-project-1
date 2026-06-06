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
    {"id": "route-msk-spb", "from": "Москва", "to": "Санкт-Петербург", "distance": 708, "duration": "8-9 часов", "price": 22650},
    {"id": "route-spb-msk", "from": "Санкт-Петербург", "to": "Москва", "distance": 708, "duration": "8-9 часов", "price": 22650},
    {"id": "route-msk-sochi", "from": "Москва", "to": "Сочи", "distance": 1626, "duration": "20-22 часа", "price": 52050},
    {"id": "route-msk-kazan", "from": "Москва", "to": "Казань", "distance": 833, "duration": "10-11 часов", "price": 26650},
    {"id": "route-msk-krasnodar", "from": "Москва", "to": "Краснодар", "distance": 1349, "duration": "16-18 часов", "price": 43150},
    {"id": "route-msk-nn", "from": "Москва", "to": "Нижний Новгород", "distance": 436, "duration": "5-6 часов", "price": 13950},
    {"id": "route-msk-voronezh", "from": "Москва", "to": "Воронеж", "distance": 521, "duration": "6-7 часов", "price": 16650},
    {"id": "route-msk-tula", "from": "Москва", "to": "Тула", "distance": 183, "duration": "2-3 часа", "price": 5850},
    {"id": "route-msk-yaroslavl", "from": "Москва", "to": "Ярославль", "distance": 274, "duration": "3-4 часа", "price": 8750},
    {"id": "route-msk-tver", "from": "Москва", "to": "Тверь", "distance": 187, "duration": "2-2.5 часа", "price": 6000},
    {"id": "route-krd-rostov", "from": "Краснодар", "to": "Ростов-на-Дону", "distance": 275, "duration": "3-4 часа", "price": 8800},
    {"id": "route-rostov-krd", "from": "Ростов-на-Дону", "to": "Краснодар", "distance": 275, "duration": "3-4 часа", "price": 8800},
    {"id": "route-msk-samara", "from": "Москва", "to": "Самара", "distance": 1090, "duration": "12-14 часов", "price": 34900},
    {"id": "route-kazan-nn", "from": "Казань", "to": "Нижний Новгород", "distance": 401, "duration": "5-6 часов", "price": 12850},
    {"id": "route-ekb-perm", "from": "Екатеринбург", "to": "Пермь", "distance": 360, "duration": "4-5 часов", "price": 11550},
    {"id": "route-msk-rostov", "from": "Москва", "to": "Ростов-на-Дону", "distance": 1080, "duration": "12-14 часов", "price": 34550},
    {"id": "route-spb-tver", "from": "Санкт-Петербург", "to": "Тверь", "distance": 540, "duration": "6-7 часов", "price": 17280},
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
