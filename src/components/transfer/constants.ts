export const HERO_IMAGE = "https://cdn.poehali.dev/projects/62498eaa-31ad-4421-848c-bf54bb4f1b4a/files/7abb32d5-3e82-4181-9766-9e4568cb20f2.jpg";

export const CITIES = [
  "Москва", "Санкт-Петербург", "Казань", "Нижний Новгород",
  "Самара", "Екатеринбург", "Краснодар", "Ростов-на-Дону",
  "Воронеж", "Уфа", "Пермь", "Тверь", "Ярославль", "Тула",
];

export const TARIFFS = [
  { name: "Эконом", pricePerKm: 32, icon: "Car", desc: "Комфортный седан" },
  { name: "Комфорт", pricePerKm: 37, icon: "Star", desc: "Повышенный комфорт" },
  { name: "Минивэн", pricePerKm: 55, icon: "Users", desc: "До 10 пассажиров" },
];

export const DISTANCES: Record<string, Record<string, number>> = {
  "Москва": { "Санкт-Петербург": 710, "Казань": 820, "Нижний Новгород": 410, "Тверь": 167, "Ярославль": 265, "Тула": 193, "Воронеж": 524, "Краснодар": 1360, "Ростов-на-Дону": 1080 },
  "Санкт-Петербург": { "Москва": 710, "Тверь": 485, "Ярославль": 630, "Нижний Новгород": 800 },
  "Казань": { "Москва": 820, "Уфа": 525, "Нижний Новгород": 415, "Самара": 360, "Пермь": 570, "Екатеринбург": 800 },
  "Нижний Новгород": { "Москва": 410, "Казань": 415, "Ярославль": 330, "Санкт-Петербург": 800 },
  "Краснодар": { "Москва": 1360, "Ростов-на-Дону": 280 },
  "Ростов-на-Дону": { "Москва": 1080, "Краснодар": 280, "Воронеж": 590 },
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

export function getDistance(from: string, to: string): number {
  if (DISTANCES[from]?.[to]) return DISTANCES[from][to];
  if (DISTANCES[to]?.[from]) return DISTANCES[to][from];
  return Math.floor(250 + Math.random() * 500);
}

export type IconName =
  | "MapPin" | "Navigation" | "Car" | "Star" | "Users"
  | "Shield" | "Clock" | "CreditCard" | "Headphones" | "Phone"
  | "Calculator" | "CheckCircle" | "ArrowRight" | "MessageCircle"
  | "Send" | "Mail" | "ChevronRight";