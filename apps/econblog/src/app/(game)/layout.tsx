import { GameShell } from "@/components/pricewar/shell/GameShell";
import { GameErrorBoundary } from "@/components/pricewar/shell/GameErrorBoundary";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameShell>
      <GameErrorBoundary>{children}</GameErrorBoundary>
    </GameShell>
  );
}
