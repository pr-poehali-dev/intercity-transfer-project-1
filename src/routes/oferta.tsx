import { createFileRoute } from "@tanstack/react-router";
import Oferta from "@/pages/Oferta";

export const Route = createFileRoute("/oferta")({
  head: () => ({ meta: [{ title: "Публичная оферта | НАШЕ for Russia Transfer" }] }),
  component: Oferta,
});
