import type { ReactNode } from "react";
import { AdminJobsWidget } from "@/components/admin/AdminJobsWidget";
import { ReactQueryProvider } from "@/client/pricewar/providers/QueryProvider";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ReactQueryProvider>
      {children}
      <AdminJobsWidget />
    </ReactQueryProvider>
  );
}
