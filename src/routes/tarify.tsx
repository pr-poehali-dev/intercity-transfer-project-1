import { createFileRoute } from "@tanstack/react-router";
import Tariffs from "@/pages/Tariffs";

export const Route = createFileRoute("/tarify")({
  component: Tariffs,
});
