export const HERO_IMAGE = "https://cdn.poehali.dev/projects/62498eaa-31ad-4421-848c-bf54bb4f1b4a/files/c5f389ba-aad6-42fd-b2e7-37829ac076d6.jpg";

export const CITIES = [
  "Москва", "Санкт-Петербург", "Казань", "Нижний Новгород",
  "Самара", "Екатеринбург", "Краснодар", "Ростов-на-Дону",
  "Воронеж", "Уфа", "Пермь", "Тверь", "Ярославль", "Тула",
];

export const TRUST_BADGES = [
  { icon: "Clock", label: "Работаем 24/7" },
  { icon: "CreditCard", label: "Фиксированная цена" },
  { icon: "Shield", label: "Проверенные водители" },
  { icon: "Star", label: "12 000+ поездок" },
];

export const TARIFFS = [
  { name: "Эконом",    pricePerKm: 33, icon: "Car",       desc: "Комфортный седан",    maxPassengers: 4,  isDelivery: false, isMinivan: false, popular: false },
  { name: "Комфорт",  pricePerKm: 38, icon: "Star",      desc: "Повышенный комфорт",  maxPassengers: 4,  isDelivery: false, isMinivan: false, popular: true },
  { name: "Бизнес",   pricePerKm: 71, icon: "Gem",       desc: "Премиум класс",       maxPassengers: 4,  isDelivery: false, isMinivan: false, popular: false },
  { name: "Универсал",pricePerKm: 41, icon: "Truck",     desc: "Везите больше",       maxPassengers: 4,  isDelivery: false, isMinivan: false, popular: false },
  { name: "Минивэн",  pricePerKm: 0,  icon: "Bus",       desc: "Выберите вместимость",maxPassengers: 10, isDelivery: false, isMinivan: true,  popular: false },
  { name: "Доставка", pricePerKm: 16, icon: "Package",   desc: "Грузы и посылки",     maxPassengers: 0,  isDelivery: true,  isMinivan: false, popular: false },
];

export const MINIVAN_SUBTARIFFS = [
  { name: "Компакт вэн", seats: 5,  pricePerKm: 46, desc: "до 5 мест" },
  { name: "Минивэн",     seats: 7,  pricePerKm: 56, desc: "до 7 мест" },
  { name: "Минивэн XL",  seats: 10, pricePerKm: 66, desc: "до 10 мест" },
];

export const DELIVERY_OPTIONS = [
  { name: "Попутная", pricePerKm: 16, desc: "Вместе с другим заказом", icon: "PackageSearch" },
  { name: "Срочная", pricePerKm: 31, desc: "Отдельный рейс", icon: "Zap" },
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

export const GALLERY = [
  {
    src: "https://cdn.poehali.dev/projects/62498eaa-31ad-4421-848c-bf54bb4f1b4a/files/081de678-436b-4fbb-bec6-2a1cb3f23367.jpg",
    title: "Чистый салон",
    desc: "Каждая машина проходит уборку перед подачей",
  },
  {
    src: "https://cdn.poehali.dev/projects/62498eaa-31ad-4421-848c-bf54bb4f1b4a/files/ea4f1f5f-328a-42fc-bd98-3e045cd45783.jpg",
    title: "Опытные водители",
    desc: "Стаж от 5 лет, проверка документов и стажа",
  },
  {
    src: "https://cdn.poehali.dev/projects/62498eaa-31ad-4421-848c-bf54bb4f1b4a/files/9504f622-dbbe-4b0d-9bb6-d082d56a9278.jpg",
    title: "Помощь с багажом",
    desc: "Встретим, поможем загрузить и разгрузить вещи",
  },
];

export const REVIEWS = [
  {
    name: "Андрей Соколов",
    city: "Москва — Сочи",
    rating: 5,
    text: "Ехали семьёй с двумя детьми. Водитель подал машину минута в минуту, детские кресла были уже установлены. Цену назвали заранее и она не изменилась.",
  },
  {
    name: "Марина Егорова",
    city: "Санкт-Петербург — Тверь",
    rating: 5,
    text: "Заказывала трансфер после ночного рейса. Встретили с табличкой, помогли с багажом. Машина чистая, в дороге тихо и комфортно — выспалась.",
  },
  {
    name: "Дмитрий Волков",
    city: "Москва — Казань",
    rating: 5,
    text: "Пользуюсь регулярно для командировок. Дешевле агрегаторов, при этом уровень сервиса выше. Отдельный плюс — всегда можно дозвониться.",
  },
  {
    name: "Ольга Никитина",
    city: "Москва — Нижний Новгород",
    rating: 5,
    text: "Везли кота в переноске, заранее предупредила — никаких проблем. Водитель делал остановки, когда просила. Рекомендую.",
  },
  {
    name: "Сергей Панин",
    city: "Краснодар — Ростов-на-Дону",
    rating: 5,
    text: "Срочно нужна была доставка документов. Отправили в тот же день, забрали через два часа после звонка. Всё дошло в целости.",
  },
  {
    name: "Екатерина Лебедева",
    city: "Москва — Ярославль",
    rating: 5,
    text: "Заказывали минивэн на компанию из семи человек. Все поместились с багажом, ехали с комфортом. Цена вышла ниже, чем на двух такси.",
  },
];

export const STATS = [
  { value: "12 000+", label: "Поездок выполнено" },
  { value: "98%", label: "Довольных клиентов" },
  { value: "150+", label: "Городов и маршрутов" },
  { value: "4.9★", label: "Средняя оценка" },
];

export function getDistanceSurcharge(distance: number): number {
  if (distance <= 50) return 1.8;
  if (distance <= 100) return 1.5;
  if (distance <= 200) return 1.25;
  return 1;
}

export type IconName =
  | "MapPin" | "Navigation" | "Car" | "Star" | "Users" | "Truck" | "Baby" | "Dog"
  | "Package" | "PackageSearch" | "Zap" | "Gem" | "Bus" | "ArrowRight2"
  | "Shield" | "Clock" | "CreditCard" | "Headphones" | "Phone"
  | "Calculator" | "CheckCircle" | "Check" | "ArrowRight" | "MessageCircle" | "TriangleAlert"
  | "Send" | "Mail" | "ChevronRight" | "RefreshCw" | "Quote" | "ArrowLeft" | "Flame"
  | "Menu" | "X";