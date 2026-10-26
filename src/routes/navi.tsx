import { createFileRoute } from "@tanstack/react-router";
import Navi from "@/pages/Navi";

export const Route = createFileRoute("/navi")({
  head: () => ({ meta: [{ title: "Маршрут поездки" }] }),
  component: Navi,
});
