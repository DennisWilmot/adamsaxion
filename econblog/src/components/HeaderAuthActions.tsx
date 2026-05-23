"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";
import { signInWithGoogle } from "@/lib/auth/client";
import { authPageUrl } from "@/lib/auth/redirect";
import { lessonZeroPath } from "@/lib/constants/lessons";
import type { User } from "@supabase/supabase-js";

function AuthActionsSkeleton() {
  return (
    <div className="h-8 w-24 shrink-0 rounded-lg bg-surface-sunken animate-pulse" />
  );
}

function HeaderAuthActionsInner({
  pathname,
  user,
  loading,
  isAdmin,
  displayName,
}: {
  pathname: string;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  displayName: string | null;
}) {
  const searchParams = useSearchParams();

  function authNextPath() {
    return searchParams.get("next") ?? pathname ?? "/lessons";
  }

  async function handleSignIn() {
    await signInWithGoogle(authNextPath());
  }

  function handleStartForFree() {
    window.location.href = authPageUrl(lessonZeroPath(), "signup");
  }

  if (loading) {
    return <AuthActionsSkeleton />;
  }

  if (user) {
    return (
      <>
        {isAdmin ? (
          <Link
            href="/admin"
            className={`hidden h-8 items-center gap-sm rounded-lg px-md text-sm font-medium transition-colors sm:inline-flex ${
              pathname.startsWith("/admin")
                ? "bg-primary text-surface-raised"
                : "bg-surface-sunken text-foreground-muted hover:bg-border hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin
          </Link>
        ) : null}
        <Link
          href="/profile"
          className={`flex h-8 items-center justify-center gap-sm rounded-lg px-md text-sm font-medium transition-colors ${
            pathname === "/profile"
              ? "bg-primary text-surface-raised"
              : "bg-surface-sunken text-foreground-muted hover:bg-border hover:text-foreground"
          }`}
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="h-5 w-5 rounded-full"
            />
          ) : null}
          <span className="hidden sm:inline">
            {displayName ??
              user.user_metadata?.full_name?.split(" ")[0] ??
              "Profile"}
          </span>
        </Link>
      </>
    );
  }

  return (
    <div className="hidden items-center gap-sm sm:flex">
      <button
        type="button"
        onClick={handleStartForFree}
        className="h-8 rounded-lg bg-primary px-lg text-sm font-semibold text-surface-raised transition-colors hover:bg-primary-hover"
      >
        Start for free
      </button>
      <button
        type="button"
        onClick={() => void handleSignIn()}
        className="h-8 rounded-lg px-md text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
      >
        Sign in
      </button>
    </div>
  );
}

export function HeaderAuthActions(props: {
  pathname: string;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  displayName: string | null;
}) {
  return (
    <Suspense fallback={<AuthActionsSkeleton />}>
      <HeaderAuthActionsInner {...props} />
    </Suspense>
  );
}

export function MobileAuthActions({
  pathname,
  user,
  loading,
  onClose,
}: {
  pathname: string;
  user: User | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <Suspense fallback={null}>
      <MobileAuthActionsInner
        pathname={pathname}
        user={user}
        loading={loading}
        onClose={onClose}
      />
    </Suspense>
  );
}

function MobileAuthActionsInner({
  pathname,
  user,
  loading,
  onClose,
}: {
  pathname: string;
  user: User | null;
  loading: boolean;
  onClose: () => void;
}) {
  const searchParams = useSearchParams();

  if (loading || user) {
    return null;
  }

  async function handleSignIn() {
    onClose();
    await signInWithGoogle(
      searchParams.get("next") ?? pathname ?? "/lessons"
    );
  }

  function handleStartForFree() {
    onClose();
    window.location.href = authPageUrl(lessonZeroPath(), "signup");
  }

  return (
    <>
      <button
        type="button"
        onClick={handleStartForFree}
        className="block w-full py-sm text-left text-sm font-semibold text-primary"
      >
        Start for free
      </button>
      <button
        type="button"
        onClick={() => void handleSignIn()}
        className="block w-full py-sm text-left text-sm font-medium text-foreground-secondary"
      >
        Sign in
      </button>
    </>
  );
}
