"use client";

import { useState } from "react";
import Link from "next/link";
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
import { safeNextPath } from "@/lib/auth/redirect";

type AuthMode = "signin" | "signup";

interface AuthFormProps {
  nextPath: string;
  initialMode?: AuthMode;
  compact?: boolean;
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
        setMode("signin");
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
    <div className={compact ? "" : "w-full max-w-[24rem]"}>
      <div className="flex rounded-lg border border-border-subtle p-xs mb-xl">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
            setInfo(null);
          }}
          className={`flex-1 rounded-md py-sm font-body text-sm font-medium transition-colors ${
            mode === "signin"
              ? "bg-primary text-surface-raised"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
            setInfo(null);
          }}
          className={`flex-1 rounded-md py-sm font-body text-sm font-medium transition-colors ${
            mode === "signup"
              ? "bg-primary text-surface-raised"
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
        className="w-full rounded-lg border border-border px-lg py-md font-body text-sm font-semibold text-foreground hover:bg-surface-sunken transition-colors mb-lg disabled:opacity-50"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-md mb-lg">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="font-body text-xs text-foreground-muted">or</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-md">
        {mode === "signup" && (
          <div>
            <label className="block font-body text-xs font-medium text-foreground-muted mb-xs">
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
              className="w-full rounded-lg border border-border bg-surface px-md py-sm font-body text-sm text-foreground"
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
          <label className="block font-body text-xs font-medium text-foreground-muted mb-xs">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-md py-sm font-body text-sm text-foreground"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block font-body text-xs font-medium text-foreground-muted mb-xs">
            Password
          </label>
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-md py-sm font-body text-sm text-foreground"
            placeholder={mode === "signup" ? "At least 8 characters" : ""}
            required
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="block font-body text-xs font-medium text-foreground-muted mb-xs">
              Confirm password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-md py-sm font-body text-sm text-foreground"
              required
            />
          </div>
        )}

        {error && (
          <p className="font-body text-sm text-error">{error}</p>
        )}
        {info && (
          <p className="font-body text-sm text-primary">{info}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg py-md font-body text-sm font-semibold bg-primary text-surface-raised hover:bg-primary-hover disabled:opacity-50"
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
                onClick={() => setMode("signup")}
                className="text-primary hover:underline font-medium"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-primary hover:underline font-medium"
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
