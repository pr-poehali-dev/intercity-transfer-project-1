import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import func2url from "../../backend/func2url.json";

const urls: Record<string, string> = func2url;

function YmlRedirect() {
  useEffect(() => {
    const target = urls["yml-feed"];
    if (target) window.location.replace(target);
  }, []);
  return (
    <p className="sr-only">
      YML-фид каталога маршрутов НАШЕ Трансфер. Перенаправление на актуальный файл фида выполняется автоматически.
    </p>
  );
}

export const Route = createFileRoute("/yml")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: YmlRedirect,
});
