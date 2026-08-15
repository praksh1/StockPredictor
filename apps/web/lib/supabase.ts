import { createBrowserClient } from "@supabase/ssr";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createClient() {
  if (!projectUrl || !publishableKey) throw new Error("MarketPulse AI authentication is not configured yet.");
  return createBrowserClient(projectUrl, publishableKey);
}

export function appUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
