export const HERO_IMAGE = "https://cdn.poehali.dev/projects/62498eaa-31ad-4421-848c-bf54bb4f1b4a/files/99cc1ffd-fc88-44f3-b35c-da2a64f216fb.jpg";

export const CITIES = [
  "Москва", "Санкт-Петербург", "Казань", "Нижний Новгород",
  "Самара", "Екатеринбург", "Краснодар", "Ростов-на-Дону",
  "Воронеж", "Уфа", "Пермь", "Тверь", "Ярославль", "Тула",
];

export const TARIFFS = [
  { name: "Эконом",    pricePerKm: 32, icon: "Car",       desc: "Комфортный седан",    maxPassengers: 4,  isDelivery: false, isMinivan: false },
  { name: "Комфорт",  pricePerKm: 37, icon: "Star",      desc: "Повышенный комфорт",  maxPassengers: 4,  isDelivery: false, isMinivan: false },
  { name: "Бизнес",   pricePerKm: 70, icon: "Gem",       desc: "Премиум класс",       maxPassengers: 4,  isDelivery: false, isMinivan: false },
  { name: "Универсал",pricePerKm: 40, icon: "Truck",     desc: "Везите больше",       maxPassengers: 4,  isDelivery: false, isMinivan: false },
  { name: "Минивэн",  pricePerKm: 0,  icon: "Bus",       desc: "Выберите вместимость",maxPassengers: 10, isDelivery: false, isMinivan: true  },
  { name: "Доставка", pricePerKm: 15, icon: "Package",   desc: "Грузы и посылки",     maxPassengers: 0,  isDelivery: true,  isMinivan: false },
];

export const MINIVAN_SUBTARIFFS = [
  { name: "Компакт вэн", seats: 5,  pricePerKm: 45, desc: "до 5 мест" },
  { name: "Минивэн",     seats: 7,  pricePerKm: 55, desc: "до 7 мест" },
  { name: "Минивэн XL",  seats: 10, pricePerKm: 65, desc: "до 10 мест" },
];

export const DELIVERY_OPTIONS = [
  { name: "Попутная", pricePerKm: 15, desc: "Вместе с другим заказом", icon: "PackageSearch" },
  { name: "Срочная", pricePerKm: 30, desc: "Отдельный рейс", icon: "Zap" },
];

export const CHILD_SEAT_PRICE = 500;

export const PET_OPTIONS = [
  { label: "До 5 кг", price: 500 },
  { label: "До 10 кг", price: 1000 },
  { label: "До 20 кг", price: 1500 },
];

export const DISTANCES: Record<string, Record<string, number>> = {
  "Москва": {
    "Санкт-Петербург": 705, "Казань": 815, "Нижний Новгород": 411, "Самара": 1057,
    "Екатеринбург": 1789, "Краснодар": 1346, "Ростов-на-Дону": 1069, "Воронеж": 517,
    "Уфа": 1342, "Пермь": 1386, "Тверь": 166, "Ярославль": 264, "Тула": 184,
    "Владимир": 185, "Суздаль": 220, "Рязань": 195, "Калуга": 188, "Смоленск": 400,
    "Курск": 537, "Белгород": 693, "Брянск": 379, "Орёл": 368, "Липецк": 438,
    "Тамбов": 481, "Пенза": 629, "Саратов": 858, "Сочи": 1620, "Анапа": 1400,
    "Геленджик": 1478, "Ставрополь": 1455, "Иваново": 293, "Кострома": 344,
  },
  "Санкт-Петербург": {
    "Казань": 1520, "Нижний Новгород": 1110, "Самара": 1760, "Екатеринбург": 2300,
    "Краснодар": 2050, "Ростов-на-Дону": 1770, "Воронеж": 1224, "Уфа": 2046,
    "Пермь": 2090, "Тверь": 540, "Ярославль": 730, "Тула": 880,
  },
  "Казань": {
    "Нижний Новгород": 401, "Самара": 360, "Екатеринбург": 762, "Краснодар": 1750,
    "Ростов-на-Дону": 1620, "Воронеж": 1010, "Уфа": 525, "Пермь": 590,
    "Тверь": 980, "Ярославль": 757, "Тула": 880,
  },
  "Нижний Новгород": {
    "Самара": 605, "Екатеринбург": 1170, "Краснодар": 1570, "Ростов-на-Дону": 1290,
    "Воронеж": 794, "Уфа": 930, "Пермь": 920, "Тверь": 560, "Ярославль": 330, "Тула": 600,
  },
  "Самара": {
    "Екатеринбург": 870, "Краснодар": 1490, "Ростов-на-Дону": 1310, "Воронеж": 950,
    "Уфа": 460, "Пермь": 630, "Тверь": 1180, "Ярославль": 1010, "Тула": 1010,
  },
  "Екатеринбург": {
    "Краснодар": 2580, "Ростов-на-Дону": 2380, "Воронеж": 1900, "Уфа": 480,
    "Пермь": 360, "Тверь": 1960, "Ярославль": 1660, "Тула": 1850,
  },
  "Краснодар": {
    "Ростов-на-Дону": 275, "Воронеж": 870, "Уфа": 2010, "Пермь": 2360,
    "Тверь": 1510, "Ярославль": 1610, "Тула": 1240,
    "Сочи": 290, "Анапа": 155, "Геленджик": 145, "Ставрополь": 350,
  },
  "Сочи": {
    "Анапа": 350, "Геленджик": 250, "Ставрополь": 450, "Ростов-на-Дону": 530,
  },
  "Анапа": {
    "Геленджик": 120, "Ставрополь": 430, "Ростов-на-Дону": 430,
  },
  "Геленджик": {
    "Ставрополь": 410, "Ростов-на-Дону": 480,
  },
  "Великий Новгород": {
    "Санкт-Петербург": 180, "Псков": 210, "Тверь": 580,
  },
  "Псков": {
    "Санкт-Петербург": 290,
  },
  "Владимир": {
    "Суздаль": 35, "Нижний Новгород": 230, "Ярославль": 185, "Иваново": 105,
  },
  "Екатеринбург": {
    "Пермь": 360,
  },
  "Ростов-на-Дону": {
    "Воронеж": 595, "Уфа": 1830, "Пермь": 2180, "Тверь": 1230,
    "Ярославль": 1330, "Тула": 960,
  },
  "Воронеж": {
    "Уфа": 1400, "Пермь": 1750, "Тверь": 680, "Ярославль": 780, "Тула": 370,
  },
  "Уфа": {
    "Пермь": 470, "Тверь": 1500, "Ярославль": 1280, "Тула": 1410,
  },
  "Пермь": {
    "Тверь": 1550, "Ярославль": 1300, "Тула": 1460,
  },
  "Тверь": {
    "Ярославль": 320, "Тула": 350,
  },
  "Ярославль": {
    "Тула": 450,
  },
};

export const FEATURES = [
  { icon: "Shield", title: "Безопасность", desc: "Проверенные водители с опытом от 5 лет" },
  { icon: "Clock", title: "Точность", desc: "Подача автомобиля минута в минуту" },
  { icon: "CreditCard", title: "Фикс. цена", desc: "Стоимость известна заранее, без сюрпризов" },
  { icon: "Headphones", title: "Поддержка 24/7", desc: "Всегда на связи для вас и водителя" },
];

export const STATS = [
  { value: "12 000+", label: "Поездок выполнено" },
  { value: "98%", label: "Довольных клиентов" },
  { value: "150+", label: "Городов и маршрутов" },
  { value: "4.9★", label: "Средняя оценка" },
];

function hashPair(a: string, b: string): number {
  const key = [a, b].sort().join("|");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDistanceSurcharge(distance: number): number {
  if (distance <= 50) return 1.5;
  if (distance <= 100) return 1.25;
  if (distance <= 200) return 1.1;
  return 1;
}

export function getDistance(from: string, to: string): number {
  if (!from || !to || from === to) return 0;
  if (DISTANCES[from]?.[to]) return DISTANCES[from][to];
  if (DISTANCES[to]?.[from]) return DISTANCES[to][from];
  const h = hashPair(from, to);
  return 250 + (h % 500);
}

export type IconName =
  | "MapPin" | "Navigation" | "Car" | "Star" | "Users" | "Truck" | "Baby" | "Dog"
  | "Package" | "PackageSearch" | "Zap" | "Gem" | "Bus" | "ArrowRight2"
  | "Shield" | "Clock" | "CreditCard" | "Headphones" | "Phone"
  | "Calculator" | "CheckCircle" | "Check" | "ArrowRight" | "MessageCircle" | "TriangleAlert"
  | "Send" | "Mail" | "ChevronRight" | "RefreshCw";