export const HERO_IMAGE = "https://cdn.poehali.dev/projects/62498eaa-31ad-4421-848c-bf54bb4f1b4a/files/c5f389ba-aad6-42fd-b2e7-37829ac076d6.jpg";

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

export function getDistanceSurcharge(distance: number): number {
  if (distance <= 50) return 1.5;
  if (distance <= 100) return 1.25;
  if (distance <= 200) return 1.1;
  return 1;
}

export function getLongRouteDiscount(distance: number): number {
  if (distance >= 1000) return distance - 1000;
  return 0;
}

export type IconName =
  | "MapPin" | "Navigation" | "Car" | "Star" | "Users" | "Truck" | "Baby" | "Dog"
  | "Package" | "PackageSearch" | "Zap" | "Gem" | "Bus" | "ArrowRight2"
  | "Shield" | "Clock" | "CreditCard" | "Headphones" | "Phone"
  | "Calculator" | "CheckCircle" | "Check" | "ArrowRight" | "MessageCircle" | "TriangleAlert"
  | "Send" | "Mail" | "ChevronRight" | "RefreshCw";