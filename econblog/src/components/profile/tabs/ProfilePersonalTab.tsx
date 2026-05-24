"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePersonalTabProps {
  username: string;
  email: string;
  avatarUrl: string | null;
}

type ThemePreference = "light" | "dark" | "auto";

const INITIAL_PRONOUNS = "";
const INITIAL_COUNTRY = "";
const INITIAL_THEME: ThemePreference = "light";
const INITIAL_LANGUAGE = "English";

export function ProfilePersonalTab({
  username: initialUsername,
  email,
  avatarUrl,
}: ProfilePersonalTabProps) {
  const [savedUsername, setSavedUsername] = useState(initialUsername);
  const [username, setUsername] = useState(initialUsername);
  const [pronouns, setPronouns] = useState(INITIAL_PRONOUNS);
  const [country, setCountry] = useState(INITIAL_COUNTRY);
  const [theme, setTheme] = useState<ThemePreference>(INITIAL_THEME);
  const [language, setLanguage] = useState(INITIAL_LANGUAGE);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayName = username || savedUsername;
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isDirty =
    username !== savedUsername ||
    pronouns !== INITIAL_PRONOUNS ||
    country !== INITIAL_COUNTRY ||
    theme !== INITIAL_THEME ||
    language !== INITIAL_LANGUAGE;

  function handleDiscard() {
    setUsername(savedUsername);
    setPronouns(INITIAL_PRONOUNS);
    setCountry(INITIAL_COUNTRY);
    setTheme(INITIAL_THEME);
    setLanguage(INITIAL_LANGUAGE);
    setError(null);
    setMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save changes");
        return;
      }
      setSavedUsername(data.username);
      setUsername(data.username);
      setMessage("Changes saved");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-2xl lg:grid-cols-[11rem_minmax(0,1fr)]">
      <aside className="flex flex-col items-center gap-lg">
        <div className="relative mx-auto aspect-square w-full max-w-[11rem] overflow-hidden rounded-full border border-border bg-surface-sunken">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="11rem"
            />
          ) : (
            <div className="flex size-full items-center justify-center font-display text-4xl font-bold text-foreground">
              {initials}
            </div>
          )}
        </div>

        <div className="w-full space-y-sm px-sm">
          <div className="border-b border-dashed border-border/70" />
          <div className="ml-auto w-4/5 border-b border-dashed border-border/70" />
        </div>

        <button
          type="button"
          disabled
          className="rounded-full border border-border px-lg py-sm font-body text-sm text-foreground-muted"
          title="Coming soon"
        >
          replace
        </button>
      </aside>

      <div className="space-y-xl">
        <section className="rounded-xl border border-border p-xl">
          <p className="mb-xl font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
            Inline edit · click to change
          </p>
          <div className="grid gap-x-xl gap-y-xl sm:grid-cols-2">
            <InlineField
              label="Name"
              value={username}
              onChange={setUsername}
              placeholder={savedUsername}
            />
            <InlineField
              label="Pronouns"
              value={pronouns}
              onChange={setPronouns}
              placeholder="Add pronouns"
            />
            <InlineField label="Email" value={email} readOnly />
            <InlineField
              label="Country"
              value={country}
              onChange={setCountry}
              placeholder="Add country"
            />
          </div>
        </section>

        <section className="rounded-xl border border-border p-xl">
          <p className="mb-xl font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
            Preferences
          </p>
          <dl className="space-y-lg">
            <div className="flex flex-wrap items-center justify-between gap-md border-b border-dashed border-border/80 pb-lg">
              <dt className="font-body text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Theme
              </dt>
              <dd>
                <ThemePicker value={theme} onChange={setTheme} />
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-md">
              <dt className="font-body text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Language
              </dt>
              <dd className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none rounded-md border-0 bg-transparent pr-6 text-right font-body text-sm text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option>English</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              </dd>
            </div>
          </dl>
        </section>

        {(error || message) && (
          <p
            className={`font-body text-sm ${error ? "text-error" : "text-success"}`}
          >
            {error ?? message}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-md">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!isDirty || saving}
            className="rounded-full border border-border px-xl py-md font-body text-sm font-medium text-foreground hover:bg-surface-sunken disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-full bg-primary px-xl py-md font-body text-sm font-semibold text-surface-raised hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InlineField({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block cursor-text">
      <span className="mb-sm block font-body text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
        {label}
      </span>
      {readOnly ? (
        <p className="border-b border-dashed border-border/80 py-sm font-body text-sm text-foreground-secondary">
          {value}
        </p>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full border-b border-dashed border-border/80 bg-transparent py-sm font-body text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-primary focus:border-solid focus:outline-none"
        />
      )}
    </label>
  );
}

function ThemePicker({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
}) {
  const options: { id: ThemePreference; label: string }[] = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "auto", label: "Auto" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-xs font-body text-sm text-foreground-secondary">
      {options.map((option, index) => (
        <span key={option.id} className="inline-flex items-center gap-xs">
          {index > 0 && (
            <span className="text-foreground-muted/50" aria-hidden>
              ·
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "transition-colors hover:text-foreground",
              value === option.id
                ? "font-semibold text-foreground"
                : "text-foreground-muted"
            )}
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  );
}
