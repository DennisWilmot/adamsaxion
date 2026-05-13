"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finishSignIn() {
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/lessons";

      if (!code) {
        router.replace("/?error=auth");
        return;
      }

      try {
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to finish sign in");
        }

        if (!cancelled) {
          router.replace(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to finish sign in"
          );
        }
      }
    }

    void finishSignIn();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[28rem] items-center justify-center px-xl py-4xl text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Finishing sign in
        </h1>
        <p className="mt-sm font-body text-sm text-foreground-muted">
          Setting up your profile and taking you to your lesson.
        </p>
        {error ? (
          <p className="mt-lg font-body text-sm text-error">{error}</p>
        ) : (
          <p className="mt-lg font-body text-sm text-foreground-muted animate-pulse">
            One moment...
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-[28rem] items-center justify-center px-xl py-4xl text-center">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Finishing sign in
            </h1>
            <p className="mt-sm font-body text-sm text-foreground-muted">
              Setting up your profile and taking you to your lesson.
            </p>
            <p className="mt-lg animate-pulse font-body text-sm text-foreground-muted">
              One moment...
            </p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
