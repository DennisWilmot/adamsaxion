export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const adminEmails = getAdminEmails();
  return adminEmails.length > 0 && adminEmails.includes(email.toLowerCase());
}

export function isAdminUser(user: { email?: string | null } | null | undefined) {
  return isAdminEmail(user?.email);
}
