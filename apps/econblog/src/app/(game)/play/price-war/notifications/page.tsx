"use client";

import { NotificationsScreen } from "@/components/pricewar/screens/NotificationsScreen";
import { MarginShellFrame } from "@/components/pricewar/shell/MarginShellFrame";

export default function NotificationsPage() {
  return (
    <MarginShellFrame contentPadding={18}>
      <NotificationsScreen />
    </MarginShellFrame>
  );
}
