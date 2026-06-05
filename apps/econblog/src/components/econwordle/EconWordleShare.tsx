"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Link2, MessageCircle, Share2, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function canNativeShare(data: ShareData): boolean {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  return !navigator.canShare || navigator.canShare(data);
}

export function EconWordleShare({ text, url }: { text: string; url: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState<"link" | "all" | null>(null);

  const flashCopied = useCallback((kind: "link" | "all") => {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  }, []);

  const copyValue = useCallback(
    async (value: string, kind: "link" | "all") => {
      try {
        await navigator.clipboard.writeText(value);
        flashCopied(kind);
      } catch {
        // ignore
      }
    },
    [flashCopied]
  );

  const handleShare = useCallback(async () => {
    const data: ShareData = { title: "Econ Wordle", text };
    if (canNativeShare(data)) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    setSheetOpen(true);
  }, [text]);

  const encoded = encodeURIComponent(text);

  const options = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encoded}`,
      external: true,
    },
    {
      id: "messages",
      label: "Messages",
      icon: Smartphone,
      href: `sms:?&body=${encoded}`,
      external: true,
    },
    {
      id: "link",
      label: copied === "link" ? "Link copied" : "Copy link",
      icon: copied === "link" ? Check : Link2,
      onClick: () => void copyValue(url, "link"),
    },
    {
      id: "all",
      label: copied === "all" ? "Copied" : "Copy message",
      icon: copied === "all" ? Check : Copy,
      onClick: () => void copyValue(text, "all"),
    },
  ] as const;

  return (
    <>
      <button
        type="button"
        onClick={() => void handleShare()}
        className="inline-flex items-center justify-center gap-sm rounded-lg border border-border px-xl py-md font-body text-sm font-semibold text-foreground transition-colors hover:bg-surface-sunken"
      >
        <Share2 className="size-4" />
        Share
      </button>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="max-w-sm gap-0 p-0">
          <DialogHeader className="border-b border-border px-lg py-md">
            <DialogTitle className="font-display text-lg">Share your result</DialogTitle>
          </DialogHeader>
          <ul className="divide-y divide-border">
            {options.map((opt) => {
              const Icon = opt.icon;
              const className =
                "flex w-full items-center gap-md px-lg py-md font-body text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken";

              if ("href" in opt) {
                return (
                  <li key={opt.id}>
                    <a
                      href={opt.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                      onClick={() => setSheetOpen(false)}
                    >
                      <Icon className="size-5 shrink-0 text-foreground-secondary" />
                      {opt.label}
                    </a>
                  </li>
                );
              }

              return (
                <li key={opt.id}>
                  <button type="button" className={className} onClick={opt.onClick}>
                    <Icon
                      className={`size-5 shrink-0 ${copied === opt.id ? "text-success" : "text-foreground-secondary"}`}
                    />
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
