"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import "../dashboard.css";

export default function AlertHistoryPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => { createClient().auth.getUser().then(({ data }) => { if (!data.user) window.location.assign("/login"); else setReady(true); }); }, []);
  if (!ready) return <main className="dashboard-loading">Loading your alert history...</main>;
  return <main className="member-dashboard"><header><Link className="brand" href="/dashboard"><span>MP</span> MarketPulse <b>AI</b></Link><Link className="text-button" href="/dashboard">Back to watchlist</Link></header><section className="stock-detail"><p className="eyebrow">ALERT HISTORY</p><h1>No alerts yet.</h1><p className="member-email">Your alert history will appear here after licensed data sources and the event-analysis pipeline are connected.</p><div className="empty-state alert-empty"><strong>Nothing is being hidden.</strong><span>MarketPulse AI will never create an alert from invented news, simulated sources, or unverified facts.</span></div></section></main>;
}
