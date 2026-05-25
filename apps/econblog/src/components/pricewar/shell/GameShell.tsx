"use client";

import Link from "next/link";
import { ReactQueryProvider } from "@/client/pricewar/providers/QueryProvider";
import { CafeDuelRoot } from "@/components/pricewar/design-system/CafeDuelRoot";
import { CD } from "@/components/pricewar/design-system/tokens";
import { PriceWarErrorProvider } from "@/components/pricewar/screens/PriceWarErrorModal";

export function GameShell({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <PriceWarErrorProvider>
        <CafeDuelRoot style={{ minHeight: "100%", background: CD.paper }}>
          <div className="mx-auto w-full max-w-[1400px] px-6 py-8">{children}</div>
        </CafeDuelRoot>
      </PriceWarErrorProvider>
    </ReactQueryProvider>
  );
}
