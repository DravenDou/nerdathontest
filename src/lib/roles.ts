// src/lib/roles.ts
export function isCoordinator(email?: string | null): boolean {
  if (!email) return false;

  const coordinatorEmails = process.env.COORDINATOR_EMAILS?.split(",") || [];
  return coordinatorEmails.includes(email);
}
