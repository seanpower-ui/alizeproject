/**
 * Storage keys and helpers for persisting app entities (work orders, visitors, reservations).
 * Reset App clears these and reloads the dashboard.
 */

export const ALIZE_WORK_ORDERS_KEY = "alize-created-work-orders";
export const ALIZE_VISITORS_KEY = "alize-created-visitors";
export const ALIZE_RESERVATIONS_KEY = "alize-created-reservations";

const ENTITY_KEYS = [
  ALIZE_WORK_ORDERS_KEY,
  ALIZE_VISITORS_KEY,
  ALIZE_RESERVATIONS_KEY,
] as const;

/** Clears all persisted entities and reloads the app at the dashboard. */
export function resetApp(): void {
  if (typeof window === "undefined") return;
  for (const key of ENTITY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  window.location.href = "/dashboard";
}
