export default function SeoTextSection() {
  return (
    <section className="py-14 border-t border-border bg-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="reveal mb-10 text-center">
          <div className="inline-block font-display text-neon text-sm tracking-widest mb-2">О СЕРВИСЕ</div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">МЕЖДУГОРОДНИЙ ТРАНСФЕР ПО ВСЕЙ РОССИИ</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="reveal space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
            <p>
              <strong className="text-foreground">НАШЕ for Russia Transfer</strong> — сервис междугороднего трансфера
              и пассажирских перевозок по России без агрегаторов. Мы организуем поездки между городами
              по фиксированной цене: вы знаете итоговую стоимость до начала поездки, без скрытых доплат
              и комиссий посредников.
            </p>
            <p>
              Работаем на популярных направлениях: <strong className="text-foreground">Москва — Санкт-Петербург</strong>,
              Москва — Сочи, Москва — Краснодар, Москва — Казань, Москва — Нижний Новгород,
              Москва — Ростов-на-Дону, Москва — Воронеж, Москва — Самара, Москва — Екатеринбург,
              а также сотни других маршрутов по всей стране.
            </p>
            <p>
              Заказать межгородное такси можно онлайн: укажите маршрут, дату и количество пассажиров,
              получите расчёт стоимости на нашем сайте, а оплату производите напрямую водителю наличными
              или банковским переводом.
            </p>
          </div>

          <div className="reveal space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
            <p>
              Парк автомобилей включает <strong className="text-foreground">комфорт-класс</strong> (до 4 пассажиров),
              <strong className="text-foreground"> бизнес-класс</strong> (до 3 пассажиров в представительском авто) и
              <strong className="text-foreground"> минивэн</strong> на 6–8 пассажиров — подходит для семей и групп.
              Предоставляем детские кресла и перевозку домашних животных.
            </p>
            <p>
              Почему выбирают нас: <strong className="text-foreground">фиксированная цена</strong> на весь маршрут,
              встреча у двери, бесплатное ожидание 30 минут, круглосуточная работа 7 дней в неделю,
              профессиональные водители с опытом межгородных поездок.
            </p>
            <p>
              Также оказываем услуги <strong className="text-foreground">доставки грузов и документов</strong> между
              городами — курьерская и транспортная доставка по фиксированному тарифу.
            </p>
          </div>
        </div>

        <div className="reveal">
          <h3 className="font-display text-lg sm:text-xl font-bold mb-5 text-center">ЧАСТЫЕ ВОПРОСЫ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                q: "Как рассчитывается стоимость поездки?",
                a: "Цена рассчитывается исходя из расстояния по дорогам и выбранного тарифа. Итоговая сумма фиксирована — никаких доплат в пути.",
              },
              {
                q: "Можно ли заказать трансфер туда и обратно?",
                a: "Да, при выборе опции «Туда и обратно» цена рассчитывается автоматически. Оба плеча поездки с одним водителем.",
              },
              {
                q: "Как оплатить поездку?",
                a: "Оплата производится напрямую водителю: наличными или банковским переводом. Без предоплаты и онлайн-платежей.",
              },
              {
                q: "Есть ли промежуточные остановки?",
                a: "Да, вы можете добавить промежуточный пункт при бронировании — водитель заедет по дороге.",
              },
              {
                q: "Можно взять с собой ребёнка?",
                a: "Конечно. Мы предоставляем детское кресло для детей до 6 лет. Стоимость кресла включается в расчёт.",
              },
              {
                q: "Работаете ли вы ночью и в выходные?",
                a: "Да, принимаем заявки круглосуточно 7 дней в неделю, включая праздники.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4">
                <h4 className="font-display font-semibold text-foreground mb-2 text-sm sm:text-base">{item.q}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
