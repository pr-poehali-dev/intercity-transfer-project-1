import { createFileRoute, notFound } from "@tanstack/react-router";
import RoutePage from "@/pages/Route";
import { ROUTES_WITH_DURATION as ROUTES } from "@/components/transfer/routesData";

export const Route = createFileRoute("/marshrut/$slug")({
  loader: ({ params }) => {
    const route = ROUTES.find((r) => r.slug === params.slug);
    if (!route) throw notFound();
    const title = `Трансфер ${route.from} — ${route.to} | Заказ от ${route.priceFrom.toLocaleString("ru-RU")} ₽`;
    const description = `${route.description} Расстояние ${route.distance} км, время в пути ${route.duration}. Цена от ${route.priceFrom.toLocaleString("ru-RU")} ₽.`;
    return { title, description, slug: route.slug };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: loaderData.title },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: loaderData.title },
            { property: "og:description", content: loaderData.description },
          ],
          links: [{ rel: "canonical", href: `https://nashe-transfer.ru/marshrut/${loaderData.slug}` }],
        }
      : {},
  component: RoutePage,
});
