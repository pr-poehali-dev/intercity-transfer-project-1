import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";

export default function Privacy() {
  useEffect(() => {
    document.title = "Политика конфиденциальности | НАШЕ for Russia Transfer";
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
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Политика конфиденциальности</h1>

        <div className="space-y-8 text-base leading-relaxed text-muted-foreground">
          <p className="text-sm text-muted-foreground/70">Редакция от 01.08.2026</p>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и
              защиты персональных данных пользователей сайта (далее — «Сайт»). Оператором персональных
              данных является <span className="text-foreground">[название организации / ИП, ИНН]</span>
              {" "}(далее — «Оператор»). Используя Сайт и оставляя заявку, вы даёте согласие на обработку
              своих персональных данных на условиях настоящей Политики.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Какие данные мы собираем</h2>
            <p>При оформлении заявки на трансфер мы можем собирать следующие данные:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>имя;</li>
              <li>номер телефона;</li>
              <li>маршрут поездки (пункты отправления и назначения);</li>
              <li>дату, время поездки и число пассажиров;</li>
              <li>текст сообщения или комментария к заявке.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Цели обработки данных</h2>
            <p>Персональные данные обрабатываются исключительно для:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>обработки заявки и организации поездки;</li>
              <li>связи с вами для уточнения деталей заказа;</li>
              <li>информирования о статусе заказа;</li>
              <li>улучшения качества обслуживания.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Защита данных</h2>
            <p>
              Оператор принимает необходимые организационные и технические меры для защиты персональных
              данных от неправомерного доступа, уничтожения, изменения, блокирования, копирования и
              распространения. Данные передаются по защищённым каналам связи и не публикуются в открытом
              доступе.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Передача третьим лицам</h2>
            <p>
              Оператор не передаёт персональные данные третьим лицам, за исключением случаев,
              необходимых для исполнения заказа (например, водителю, выполняющему поездку), а также
              случаев, предусмотренных законодательством Российской Федерации.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Права пользователя</h2>
            <p>
              Вы вправе запросить информацию об обработке ваших персональных данных, потребовать их
              уточнения, блокирования или удаления, а также отозвать согласие на обработку. Для этого
              направьте обращение по контактным данным, указанным на Сайте.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Изменения Политики</h2>
            <p>
              Оператор вправе вносить изменения в настоящую Политику. Актуальная редакция всегда доступна
              на данной странице. Продолжение использования Сайта после внесения изменений означает
              согласие с новой редакцией.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Контакты</h2>
            <p>
              По всем вопросам обработки персональных данных обращайтесь по телефонам и в мессенджеры,
              указанные в разделе <Link to="/#contacts" className="text-neon hover:underline">«Контакты»</Link>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link to="/oferta" className="inline-flex items-center gap-2 text-sm text-neon hover:underline">
            Публичная оферта
            <Icon name="ChevronRight" size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
