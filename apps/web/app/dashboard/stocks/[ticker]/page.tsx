"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import "../../dashboard.css";

type Security = { ticker: string; name: string; exchange: string; sector: string | null; industry: string | null };

export default function StockDetailPage() {
  const params = useParams<{ ticker: string }>();
  const [security, setSecurity] = useState<Security | null>(null);
  const [status, setStatus] = useState("Loading stock details...");
  useEffect(() => { createClient().from("securities").select("ticker,name,exchange,sector,industry").eq("ticker", params.ticker.toUpperCase()).maybeSingle().then(({ data, error }) => { if (error || !data) setStatus("This stock is not available in the beta catalog."); else { setSecurity(data as Security); setStatus(""); } }); }, [params.ticker]);
  return <main className="member-dashboard"><header><Link className="brand" href="/dashboard"><span>MP</span> MarketPulse <b>AI</b></Link><Link className="text-button" href="/dashboard">Back to watchlist</Link></header><section className="stock-detail">{security ? <><p className="eyebrow">STOCK DETAIL</p><h1>{security.ticker}</h1><p className="company-name">{security.name} | {security.exchange}</p><div className="detail-grid"><article><h2>Market data</h2><p>Delayed market data is not connected yet.</p><span className="integration-status">Provider connection pending</span></article><article><h2>AI market assessment</h2><p>No sourced event analysis is available yet for this security.</p><span className="integration-status">No live signal</span></article><article><h2>Company profile</h2><p><b>Sector:</b> {security.sector ?? "Not available"}</p><p><b>Industry:</b> {security.industry ?? "Not available"}</p></article></div><p className="catalog-note">This page will show only licensed market data and source-backed AI analyses after the data pipeline is connected.</p></> : <p className="dashboard-message error">{status}</p>}</section></main>;
}
