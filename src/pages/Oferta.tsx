import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";

export default function Oferta() {
  useEffect(() => {
    document.title = "Публичная оферта | НАШЕ for Russia Transfer";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 pt-28">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8">
          <Icon name="ArrowLeft" size={16} fallback="ChevronRight" />
          На главную
        </Link>

        <div className="font-display text-neon text-base tracking-widest mb-2">ДОКУМЕНТЫ</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Публичная оферта</h1>

        <div className="space-y-8 text-base leading-relaxed text-muted-foreground">
          <p className="text-sm text-muted-foreground/70">Редакция от 01.08.2026</p>

          <p>
            Настоящий документ является публичной офертой <span className="text-foreground">[название организации / ИП, ИНН]</span>
            {" "}(далее — «Исполнитель») и содержит все существенные условия оказания услуг по организации
            пассажирских перевозок и трансферов. Оставляя заявку на Сайте, Заказчик подтверждает согласие
            с условиями настоящей оферты.
          </p>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Термины</h2>
            <p>
              <span className="text-foreground">Исполнитель</span> — лицо, оказывающее услуги трансфера.
              <span className="text-foreground"> Заказчик</span> — физическое или юридическое лицо,
              оформившее заявку. <span className="text-foreground">Услуга</span> — организация поездки по
              согласованному маршруту.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Предмет оферты</h2>
            <p>
              Исполнитель обязуется организовать перевозку Заказчика и/или его груза по согласованному
              маршруту, а Заказчик обязуется оплатить услугу в размере и порядке, установленных настоящей
              офертой. Стоимость поездки рассчитывается на Сайте исходя из расстояния, выбранного тарифа и
              дополнительных опций.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Оформление заказа</h2>
            <p>
              Заказ оформляется через форму на Сайте или по телефону. После получения заявки Исполнитель
              связывается с Заказчиком для подтверждения деталей поездки: маршрута, даты, времени, класса
              автомобиля и итоговой стоимости.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Стоимость и оплата</h2>
            <p>
              Стоимость услуги определяется на момент подтверждения заказа и фиксируется. Оплата
              производится способами, согласованными с Исполнителем. Итоговая цена может отличаться от
              предварительного расчёта при изменении маршрута или дополнительных пожеланиях Заказчика.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Права и обязанности сторон</h2>
            <p>
              Исполнитель обязуется подать технически исправный автомобиль в согласованное время и
              обеспечить безопасность поездки. Заказчик обязуется предоставить достоверную информацию,
              быть готовым к поездке в назначенное время и соблюдать правила поведения в салоне
              автомобиля.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Отмена и изменение заказа</h2>
            <p>
              Заказчик вправе отменить или изменить заказ, уведомив Исполнителя заблаговременно. Условия
              отмены и возможные удержания согласовываются сторонами индивидуально при подтверждении
              заказа.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Ответственность</h2>
            <p>
              Стороны несут ответственность в соответствии с законодательством Российской Федерации.
              Исполнитель не несёт ответственности за задержки, вызванные обстоятельствами непреодолимой
              силы, дорожной обстановкой и иными не зависящими от него причинами.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Персональные данные</h2>
            <p>
              Оформляя заказ, Заказчик даёт согласие на обработку персональных данных на условиях
              {" "}<Link to="/privacy" className="text-neon hover:underline">Политики конфиденциальности</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">9. Заключительные положения</h2>
            <p>
              Настоящая оферта вступает в силу с момента её размещения на Сайте и действует до отзыва.
              Исполнитель вправе изменять условия оферты в одностороннем порядке. Актуальная редакция
              всегда доступна на данной странице.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link to="/privacy" className="inline-flex items-center gap-2 text-sm text-neon hover:underline">
            Политика конфиденциальности
            <Icon name="ChevronRight" size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
