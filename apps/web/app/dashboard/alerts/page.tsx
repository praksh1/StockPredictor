"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import { getMember } from "../../../lib/member";
import "../dashboard.css";
import "./alerts.css";

type AlertDelivery = {
  id: string;
  status: string;
  created_at: string;
  alerts: { headline: string; summary: string; securities: { ticker: string; name: string } | null } | null;
};

export default function AlertHistoryPage() {
  const [ready, setReady] = useState(false);
  const [deliveries, setDeliveries] = useState<AlertDelivery[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getMember({ requireOnboarding: true }).then(async (user) => { if (!user) return; const { data, error: loadError } = await createClient().from("alert_deliveries").select("id,status,created_at,alerts(headline,summary,securities(ticker,name))").order("created_at", { ascending: false }).limit(50); if (loadError) setError("Unable to load your alert history. Please refresh the page."); else setDeliveries((data ?? []) as unknown as AlertDelivery[]); setReady(true); }).catch(() => window.location.assign("/login")); }, []);
  if (!ready) return <main className="dashboard-loading">Loading your alert history...</main>;
  return <main className="member-dashboard"><header><Link className="brand" href="/dashboard"><span>MP</span> MarketPulse <b>AI</b></Link><Link className="text-button" href="/dashboard">Back to watchlist</Link></header><section className="stock-detail"><p className="eyebrow">ALERT HISTORY</p><h1>Your sourced alerts.</h1><p className="member-email">Only alerts generated from supported source documents appear here. Delivery status is shown for each alert.</p>{error && <p className="dashboard-message error" role="alert">{error}</p>}{deliveries.length ? <div className="alert-list">{deliveries.flatMap((delivery) => delivery.alerts ? [<article className="alert-history-card" key={delivery.id}><div><span className="delivery-status">{delivery.status}</span><h2>{delivery.alerts.headline}</h2><p>{delivery.alerts.summary}</p></div><aside><strong>{delivery.alerts.securities?.ticker ?? "MARKET"}</strong><span>{new Date(delivery.created_at).toLocaleString()}</span></aside></article>] : [])}</div> : <div className="empty-state alert-empty"><strong>No sourced alerts yet.</strong><span>The free SEC source is available from each stock page. This history will populate only when a verified event passes the alert rules.</span></div>}</section></main>;
}

