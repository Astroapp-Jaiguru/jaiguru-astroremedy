/**
 * Service mode visibility types & constants (pure — safe for client use).
 * Server-side read/write helpers live in mode-visibility-actions.ts.
 */

export interface ModeVisibility {
  online: boolean;
  offline: boolean;
  homeService: boolean;
}

export const DEFAULT_MODE_VISIBILITY: ModeVisibility = {
  online: true,
  offline: true,
  homeService: true,
};

export const MODE_IDS = ["online", "offline", "homeService"] as const;
export type ModeId = (typeof MODE_IDS)[number];

export const MODE_LABELS: Record<ModeId, string> = {
  online: "Online",
  offline: "Offline",
  homeService: "Home Service / Home Visit",
};