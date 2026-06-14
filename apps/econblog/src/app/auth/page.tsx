"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/auth/redirect";
import { LESSON_ZERO_SLUG } from "@/lib/constants/lessons";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = safeNextPath(searchParams.get("next"));
  const mode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";
  const authError = searchParams.get("error") === "auth";
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(next);
      } else {
        setCheckingSession(false);
      }
    });
  }, [next, router]);

  if (checkingSession) {
    return (
      <div className="flex min-h-svh items-center justify-center px-xl">
        <p className="font-body text-sm text-foreground-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex flex-col justify-center px-xl py-3xl lg:px-4xl lg:py-4xl">
        <div className="mx-auto w-full max-w-[26rem]">
          <div className="mb-2xl lg:hidden">
            <AuthLogo size="md" showDomain />
          </div>

          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-sm">
            {mode === "signup" ? "Get started" : "Welcome back"}
          </p>
          <h1 className="font-display text-[1.75rem] font-semibold text-foreground text-balance sm:text-3xl">
            {mode === "signup"
              ? <>Create your Adam&apos;s Axioms account</>
              : <>Sign in to Adam&apos;s Axioms</>}
          </h1>
          <p className="mt-md font-body text-sm leading-relaxed text-foreground-secondary">
            {mode === "signup"
              ? "Pick a username, set a password, or continue with Google."
              : "Save progress, earn XP, and unlock your personalized learning path."}
          </p>

          {authError && (
            <p className="mt-lg rounded-lg border border-error/30 bg-error-subtle px-lg py-md font-body text-sm text-error">
              Sign in failed. Try again — if it keeps happening, add{" "}
              <span className="font-mono text-xs">/auth/callback</span> to your
              Supabase redirect URLs.
            </p>
          )}

          <div className="mt-2xl rounded-2xl border border-border bg-surface-raised p-xl shadow-sm sm:p-2xl">
            <AuthForm nextPath={next} initialMode={mode} />
          </div>

          <p className="mt-xl text-center font-body text-xs text-foreground-muted">
            Just browsing?{" "}
            <Link
              href={`/lessons/${LESSON_ZERO_SLUG}`}
              className="font-medium text-primary hover:text-primary-hover hover:underline"
            >
              Try Lesson Zero free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center px-xl">
          <p className="font-body text-sm text-foreground-muted">Loading…</p>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
