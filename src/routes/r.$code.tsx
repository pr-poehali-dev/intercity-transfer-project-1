import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import func2url from "../../backend/func2url.json";

export const Route = createFileRoute("/r/$code")({
  loader: async ({ params }) => {
    const res = await fetch(
      `${func2url["send-booking"]}?code=${encodeURIComponent(params.code)}`,
    );
    const data = res.ok ? ((await res.json()) as { url?: string }) : null;
    if (!data?.url) throw notFound();
    const target = new URL(data.url);
    throw redirect({ href: target.pathname + target.search });
  },
  component: () => null,
});
