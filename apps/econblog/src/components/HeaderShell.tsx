import Link from "next/link";

/** Reserves navbar height while the client Header loads. */
export function HeaderShell() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-[72rem] items-center justify-between gap-lg px-xl">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-foreground">
          Adam&apos;s Axioms
        </Link>
        <div className="h-8 w-24 rounded-lg bg-surface-sunken" aria-hidden />
      </div>
    </header>
  );
}
