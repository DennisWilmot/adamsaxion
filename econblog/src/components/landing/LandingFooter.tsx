import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-sunken">
      <div className="max-w-[64rem] mx-auto px-xl py-3xl">
        <div className="flex flex-col gap-2xl sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display font-bold text-lg text-foreground mb-sm">
              Adam&apos;s Axioms
            </p>
            <p className="font-body text-sm text-foreground-muted max-w-xs leading-relaxed">
              Interactive economics education for people who want to understand —
              not just watch.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-2xl gap-y-lg">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-sm">
                Product
              </p>
              <ul className="space-y-xs">
                <li>
                  <Link
                    href="/lessons"
                    className="font-body text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    Lessons
                  </Link>
                </li>
                <li>
                  <Link
                    href="/subscribe"
                    className="font-body text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leaderboard"
                    className="font-body text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-sm">
                Account
              </p>
              <ul className="space-y-xs">
                <li>
                  <Link
                    href="/auth"
                    className="font-body text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="font-body text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-2xl pt-xl border-t border-border-subtle font-body text-xs text-foreground-muted">
          © {new Date().getFullYear()} Adam&apos;s Axioms
        </p>
      </div>
    </footer>
  );
}
