import { createFileRoute } from "@tanstack/react-router";
import { AdminLock } from "@/components/admin/AdminLock";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminStatus } from "@/lib/site-content.functions";
import { siteContentQuery } from "@/lib/site-content-query";

export const Route = createFileRoute("/admin")({
  loader: async ({ context }) => {
    const [status] = await Promise.all([
      getAdminStatus(),
      context.queryClient.ensureQueryData(siteContentQuery),
    ]);
    return status;
  },
  head: () => ({
    meta: [
      { title: "Owner Dashboard · PrimeHaven Properties Lagos" },
      { name: "description", content: "Private owner dashboard for editing the PrimeHaven listing page." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Owner Dashboard · PrimeHaven Properties Lagos" },
      { property: "og:description", content: "Private owner dashboard for editing the PrimeHaven listing page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { unlocked } = Route.useLoaderData();
  return unlocked ? <AdminDashboard /> : <AdminLock />;
}
