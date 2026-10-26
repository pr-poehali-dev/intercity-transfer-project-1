import { createFileRoute } from "@tanstack/react-router";
import InstallPage from "@/pages/InstallPage";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Установить приложение НАШЕ Трансфер" }] }),
  component: InstallPage,
});
