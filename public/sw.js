self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(
    fetch(e.request).catch(
      () =>
        new Response(
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d1014;color:#fff;font-family:sans-serif;text-align:center;padding:24px"><div><h2>Нет интернета</h2><p>Проверьте подключение и попробуйте снова.<br>Заказать по телефону: <a style="color:#ff9f1a" href="tel:+79961606567">+7 996 160-65-67</a></p></div>',
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        )
    )
  );
});
