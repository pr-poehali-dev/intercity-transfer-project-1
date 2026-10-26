import { createFileRoute } from "@tanstack/react-router";
import CalcJournal from "@/pages/CalcJournal";

export const Route = createFileRoute("/zhurnal")({
  component: CalcJournal,
});
