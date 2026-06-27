import { cookies } from "next/headers";
import { get } from "@vercel/edge-config";
import React from "react";

export const USE_FEATURE_COOKIE = "USE_FEATURE";
export type FeatureFlag =
  | "no-speed"
  | "no-analitics"

// NOTE: the list of possible flags is defined in the Edge Config schema
// docs/edge-config-schema.json
// Need to keep schema in sync with the possible flags and what is on Vercel

// getFeatureFlagByName
export const listFeatures = React.cache(async () => {
  let overrides: string[] = [];
  try {
    const cookieStore = await cookies();
    overrides = (cookieStore.get(USE_FEATURE_COOKIE)?.value ?? "").split(",");
  } catch {
    // cookies() is unavailable during static generation at build time
  }

  const settings = await get("dynamicFeatureFlags");
  console.debug("listFeatures", settings);
  if (typeof settings === "string") {
    return [...settings.split(","), ...overrides] as FeatureFlag[];
  }
  console.error("[Edge Config] Misconfigured.", {
    dynamicFeatureFlags: settings,
  });
  return [...overrides] as FeatureFlag[];
});

// Check the cookie and Edge Config for the feature to be enabled, default to false
export const hasFeature = async (
  ...names: FeatureFlag[]
): Promise<boolean[]> => {
  const settings = await listFeatures().catch((error) => {
    console.error("Error fetching feature flags", error);
    return [] as string[];
  });
  return names.map((i) => settings.includes(i));
};

