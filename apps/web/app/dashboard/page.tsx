"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import "./dashboard.css";

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) window.location.assign("/login");
      else { setEmail(data.user.email ?? "MarketPulse member"); setLoading(false); }
    });
  }, []);

  async function signOut() { await createClient().auth.signOut(); window.location.assign("/"); }
  if (loading) return <main className="dashboard-loading">Loading your market brief...</main>;
  return <main className="member-dashboard"><header><Link className="brand" href="/"><span>MP</span> MarketPulse <b>AI</b></Link><button className="text-button" onClick={signOut}>Sign out</button></header><section><p className="eyebrow">YOUR MARKET BRIEF</p><h1>Welcome, {email}.</h1><p>Your account is secure and ready. Watchlist setup and live alert delivery are the next build phase.</p><div className="member-card"><strong>Account verified</strong><span>Email sign-in is working. Market data shown elsewhere remains demo-only until licensed providers are connected.</span></div></section></main>;
}
