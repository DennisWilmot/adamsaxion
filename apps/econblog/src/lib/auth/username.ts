const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function sanitizeUsername(raw: string): string {
  return raw.trim().replace(/\s+/g, "_").slice(0, 20);
}

export function validateUsername(username: string): string | null {
  const trimmed = sanitizeUsername(username);
  if (trimmed.length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (trimmed.length > 20) {
    return "Username must be at most 20 characters.";
  }
  if (!USERNAME_RE.test(trimmed)) {
    return "Use only letters, numbers, and underscores.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 72) {
    return "Password is too long.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return null;
}
