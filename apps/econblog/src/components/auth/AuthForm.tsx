"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ensureProfileOnClient,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth/client";
import {
  sanitizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/auth/username";
import { authPageUrl, safeNextPath } from "@/lib/auth/redirect";

type AuthMode = "signin" | "signup";

interface AuthFormProps {
  nextPath: string;
  initialMode?: AuthMode;
  compact?: boolean;
}

const inputClassName =
  "w-full rounded-lg border border-border bg-surface px-md py-sm font-body text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthForm({
  nextPath,
  initialMode = "signin",
  compact = false,
}: AuthFormProps) {
  const router = useRouter();
  const next = safeNextPath(nextPath);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setInfo(null);
    router.replace(authPageUrl(next, nextMode), { scroll: false });
  }

  async function checkUsername(value: string) {
    const sanitized = sanitizeUsername(value);
    const formatError = validateUsername(sanitized);
    if (formatError) {
      setUsernameStatus(formatError);
      return false;
    }

    const res = await fetch(
      `/api/auth/check-username?username=${encodeURIComponent(sanitized)}`
    );
    const data = await res.json();
    setUsernameStatus(data.error ?? (data.available ? "Available" : null));
    return Boolean(data.available);
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle(next);
    } catch {
      setError("Google sign-in failed. Try again.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const emailErr = validateEmail(email);
      if (emailErr) {
        setError(emailErr);
        return;
      }

      const passwordErr = validatePassword(password);
      if (passwordErr) {
        setError(passwordErr);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const available = await checkUsername(username);
        if (!available) {
          setError(usernameStatus ?? "Choose a different username.");
          return;
        }

        const normalizedUsername = sanitizeUsername(username);
        const { data, error: signUpError } = await signUpWithEmail(
          normalizedEmail,
          password,
          normalizedUsername,
          next
        );

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          await ensureProfileOnClient();
          router.push(next);
          router.refresh();
          return;
        }

        setInfo(
          "Check your email for a confirmation link, then sign in to continue."
        );
        switchMode("signin");
        return;
      }

      const { data, error: signInError } = await signInWithEmail(
        normalizedEmail,
        password
      );

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.session) {
        await ensureProfileOnClient();
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "" : "w-full"}>
      <div className="mb-xl flex rounded-full border border-border-subtle bg-surface-sunken p-xs">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-full py-sm font-body text-sm font-semibold transition-colors ${
            mode === "signin"
              ? "bg-surface-raised text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-full py-sm font-body text-sm font-semibold transition-colors ${
            mode === "signup"
              ? "bg-surface-raised text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="mb-lg flex w-full items-center justify-center gap-sm rounded-lg border border-border bg-surface px-lg py-md font-body text-sm font-semibold text-foreground transition-colors hover:bg-surface-sunken disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="mb-lg flex items-center gap-md">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="font-body text-xs text-foreground-muted">or email</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-md">
        {mode === "signup" && (
          <div>
            <label className="mb-xs block font-body text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameStatus(null);
              }}
              onBlur={() => {
                if (username.trim()) void checkUsername(username);
              }}
              className={inputClassName}
              placeholder="econlearner"
              required
            />
            {usernameStatus && (
              <p
                className={`mt-xs font-body text-xs ${
                  usernameStatus === "Available"
                    ? "text-success"
                    : "text-foreground-muted"
                }`}
              >
                {usernameStatus}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-xs block font-body text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="mb-xs block font-body text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Password
          </label>
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            placeholder={mode === "signup" ? "At least 8 characters" : ""}
            required
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="mb-xs block font-body text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Confirm password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClassName}
              required
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-error/30 bg-error-subtle px-md py-sm font-body text-sm text-error">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg border border-primary/20 bg-primary-subtle/30 px-md py-sm font-body text-sm text-primary">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-md font-body text-sm font-semibold text-surface-raised transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {loading
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      {!compact && (
        <p className="mt-lg text-center font-body text-xs text-foreground-muted">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}
