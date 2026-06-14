import Link from "next/link";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="7" fill="#2F5FD0" />
      <path
        d="M16 7.5 22.75 24.5h-2.65l-1.35-3.75h-5.5l-1.35 3.75H9.25L16 7.5Zm-1.05 9.25h2.1L16 13.1l-1.05 3.65Z"
        fill="#fff"
      />
    </svg>
  );
}

interface AuthLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showDomain?: boolean;
}

const sizeClasses = {
  sm: {
    mark: "size-8",
    title: "text-base",
    domain: "text-[10px]",
  },
  md: {
    mark: "size-10",
    title: "text-xl",
    domain: "text-xs",
  },
  lg: {
    mark: "size-12",
    title: "text-2xl",
    domain: "text-xs",
  },
} as const;

export function AuthLogo({
  href = "/",
  size = "md",
  showDomain = false,
}: AuthLogoProps) {
  const classes = sizeClasses[size];

  const content = (
    <span className="inline-flex items-center gap-md">
      <LogoMark className={`shrink-0 ${classes.mark}`} />
      <span className="flex flex-col items-start leading-none">
        <span
          className={`font-display font-bold tracking-tight text-foreground ${classes.title}`}
        >
          Adam&apos;s Axioms
        </span>
        {showDomain && (
          <span
            className={`mt-xs font-body font-medium uppercase tracking-[0.18em] text-foreground-muted ${classes.domain}`}
          >
            admasaxiom.com
          </span>
        )}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
