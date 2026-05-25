import { MatchLiveProvider } from "@/components/pricewar/shell/MatchLiveProvider";

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <MatchLiveProvider>{children}</MatchLiveProvider>;
}
