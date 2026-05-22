"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/auth/redirect";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = safeNextPath(searchParams.get("next"));
  const mode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";
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
      <div className="max-w-[24rem] mx-auto px-xl py-5xl text-center">
        <p className="font-body text-sm text-foreground-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[28rem] mx-auto px-xl py-4xl">
      <Link
        href="/"
        className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors"
      >
        Adam&apos;s Axioms
      </Link>
      <h1 className="font-display font-bold text-2xl text-foreground mt-2xl mb-sm">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="font-body text-sm text-foreground-secondary mb-2xl">
        {mode === "signup"
          ? "Choose a username and password, or continue with Google."
          : "Sign in with email or Google to save progress and earn XP."}
      </p>
      <AuthForm nextPath={next} initialMode={mode} />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[24rem] mx-auto px-xl py-5xl text-center">
          <p className="font-body text-sm text-foreground-muted">Loading…</p>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
