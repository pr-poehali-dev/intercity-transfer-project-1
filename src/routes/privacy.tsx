import { createFileRoute } from "@tanstack/react-router";
import Privacy from "@/pages/Privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Политика конфиденциальности | НАШЕ for Russia Transfer" }] }),
  component: Privacy,
});
