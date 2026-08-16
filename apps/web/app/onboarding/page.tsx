"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import "./onboarding.css";

type TraderStyle = "day_trader" | "swing_trader" | "long_term_investor" | "combination";
const choices: { value: TraderStyle; title: string; detail: string }[] = [
  { value: "day_trader", title: "Day trader", detail: "I focus on movements within a single trading day." },
  { value: "swing_trader", title: "Swing trader", detail: "I usually hold positions for several days or weeks." },
  { value: "long_term_investor", title: "Long-term investor", detail: "I focus on longer time horizons and company fundamentals." },
  { value: "combination", title: "A combination", detail: "My approach changes depending on the opportunity." }
];

export default function OnboardingPage() {
  const [choice, setChoice] = useState<TraderStyle | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { createClient().auth.getUser().then(({ data }) => { if (!data.user) window.location.assign("/login"); else setUserId(data.user.id); }); }, []);
  async function continueToDashboard() { if (!choice || !userId) return; setSaving(true); setError(null); const { error: saveError } = await createClient().from("profiles").update({ trader_style: choice, onboarding_completed_at: new Date().toISOString() }).eq("id", userId); if (saveError) { setError(saveError.message); setSaving(false); return; } window.location.assign("/dashboard"); }
  return <main className="onboarding"><Link className="brand" href="/"><span>MP</span> MarketPulse <b>AI</b></Link><section><p className="eyebrow">WELCOME</p><h1>How do you approach the market?</h1><p className="onboarding-intro">This helps us shape the information we show you later. It does not change your account access or provide investment advice.</p><div className="choice-grid">{choices.map((item) => <button className={choice === item.value ? "choice selected" : "choice"} key={item.value} onClick={() => setChoice(item.value)}><strong>{item.title}</strong><span>{item.detail}</span></button>)}</div>{error && <p className="onboarding-error">{error}</p>}<button className="button continue" disabled={!choice || saving} onClick={continueToDashboard}>{saving ? "Saving..." : "Continue to my watchlist"}</button></section></main>;
}
