"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import "../dashboard.css";
import "./settings.css";

type Severity = "low" | "medium" | "high" | "critical";
type Preferences = { in_app_enabled: boolean; email_enabled: boolean; web_push_enabled: boolean; market_hours_only: boolean; minimum_severity: Severity };
const defaults: Preferences = { in_app_enabled: true, email_enabled: true, web_push_enabled: false, market_hours_only: false, minimum_severity: "high" };

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => { const supabase = createClient(); supabase.auth.getUser().then(async ({ data }) => { if (!data.user) { window.location.assign("/login"); return; } setUserId(data.user.id); const { data: saved, error: loadError } = await supabase.from("notification_preferences").select("in_app_enabled,email_enabled,web_push_enabled,market_hours_only,minimum_severity").eq("user_id", data.user.id).maybeSingle(); if (loadError) setError(loadError.message); if (saved) setPreferences(saved as Preferences); setReady(true); }); }, []);
  function setFlag(flag: keyof Omit<Preferences, "minimum_severity">) { setPreferences((current) => ({ ...current, [flag]: !current[flag] })); }
  async function save() { if (!userId) return; setError(null); const { error: saveError } = await createClient().from("notification_preferences").upsert({ user_id: userId, ...preferences, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago" }); if (saveError) setError(saveError.message); else setNotice("Notification preferences saved."); }
  if (!ready) return <main className="dashboard-loading">Loading notification preferences...</main>;
  return <main className="member-dashboard"><header><Link className="brand" href="/dashboard"><span>MP</span> MarketPulse <b>AI</b></Link><Link className="text-button" href="/dashboard">Back to watchlist</Link></header><section className="stock-detail"><p className="eyebrow">ALERT PREFERENCES</p><h1>Choose what reaches you.</h1><p className="member-email">These settings will be enforced before an alert is sent. Web push is prepared but not enabled until the notification provider is connected.</p>{error && <p className="dashboard-message error">{error}</p>}{notice && <p className="dashboard-message success">{notice}</p>}<div className="settings-card"><label><span>In-app alerts<small>Show qualifying alerts in your MarketPulse dashboard.</small></span><input type="checkbox" checked={preferences.in_app_enabled} onChange={() => setFlag("in_app_enabled")} /></label><label><span>Email alerts<small>Send qualifying alerts to your confirmed email address.</small></span><input type="checkbox" checked={preferences.email_enabled} onChange={() => setFlag("email_enabled")} /></label><label><span>Web push alerts<small>Available after push delivery is connected.</small></span><input type="checkbox" checked={preferences.web_push_enabled} onChange={() => setFlag("web_push_enabled")} /></label><label><span>Only during regular market hours<small>Suppress notifications outside the regular U.S. trading session.</small></span><input type="checkbox" checked={preferences.market_hours_only} onChange={() => setFlag("market_hours_only")} /></label><label className="severity-select"><span>Minimum impact severity<small>Lower-impact events stay in history but will not notify you.</small></span><select value={preferences.minimum_severity} onChange={(event) => setPreferences((current) => ({ ...current, minimum_severity: event.target.value as Severity }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label><button className="button" onClick={save}>Save preferences</button></div></section></main>;
}
