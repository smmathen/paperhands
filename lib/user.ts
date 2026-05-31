/**
 * Resolves the active user id for portfolio scoping.
 * Replace with session-based auth when ready.
 */
export function getUserId(): string {
  const configured = process.env.DEV_USER_ID?.trim();
  if (configured) {
    return configured;
  }
  return "local-dev";
}
