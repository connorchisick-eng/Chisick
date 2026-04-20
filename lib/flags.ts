"use client";
import { useFeatureFlagEnabled } from "posthog-js/react";

/**
 * All feature flags the app knows about live here. Starting with a
 * single kill-switch for the AI chat — add as we go. Keeping the list
 * typed means a flag name typo is a TypeScript error, not a silent
 * always-off.
 */
export type FeatureFlag = "ai_help_agent";

/**
 * Client-side flag hook. Returns `fallback` (default: false) until
 * PostHog has loaded the decide response — for `ai_help_agent` that's
 * exactly what we want: the chat stays hidden during the pre-hydration
 * window, so it can't leak while we're still rolling it out.
 */
export function useFlag(flag: FeatureFlag, fallback = false): boolean {
  const value = useFeatureFlagEnabled(flag);
  if (value === undefined) return fallback;
  return value;
}
