import type { ReactNode } from "react";
import { AdminJobsWidget } from "@/components/admin/AdminJobsWidget";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <AdminJobsWidget />
    </>
  );
}
