"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import "../../dashboard.css";
import "./stocks.css";

type Security = { ticker: string; name: string; exchange: string; sector: string | null; industry: string | null };
type Filing = { form: string; filingDate: string; description: string; url: string };

export default function StockDetailPage() {
  const params = useParams<{ ticker: string }>();
  const [security, setSecurity] = useState<Security | null>(null);
  const [status, setStatus] = useState("Loading stock details...");
  const [filings, setFilings] = useState<Filing[]>([]);
  const [filingError, setFilingError] = useState<string | null>(null);
  const [loadingFilings, setLoadingFilings] = useState(false);
  const ticker = params.ticker.toUpperCase();

  useEffect(() => { createClient().from("securities").select("ticker,name,exchange,sector,industry").eq("ticker", ticker).maybeSingle().then(({ data, error }) => { if (error || !data) setStatus("This stock is not available in the beta catalog."); else { setSecurity(data as Security); setStatus(""); } }); }, [ticker]);
  async function loadFilings() { setLoadingFilings(true); setFilingError(null); try { const response = await fetch(`/api/sec/filings?ticker=${encodeURIComponent(ticker)}`); const result = await response.json() as { filings?: Filing[]; error?: string }; if (!response.ok) throw new Error(result.error ?? "Unable to load SEC filings."); setFilings(result.filings ?? []); } catch (caught) { setFilingError(caught instanceof Error ? caught.message : "Unable to load SEC filings."); } finally { setLoadingFilings(false); } }

  return <main className="member-dashboard"><header><Link className="brand" href="/dashboard"><span>MP</span> MarketPulse <b>AI</b></Link><Link className="text-button" href="/dashboard">Back to watchlist</Link></header><section className="stock-detail">{security ? <><p className="eyebrow">STOCK DETAIL</p><h1>{security.ticker}</h1><p className="company-name">{security.name} | {security.exchange}</p><div className="detail-grid"><article><h2>Market data</h2><p>Delayed market data is not connected yet.</p><span className="integration-status">Provider connection pending</span></article><article><h2>AI market assessment</h2><p>No sourced event analysis is available yet for this security.</p><span className="integration-status">No live signal</span></article><article><h2>Company profile</h2><p><b>Sector:</b> {security.sector ?? "Not available"}</p><p><b>Industry:</b> {security.industry ?? "Not available"}</p></article></div><section className="sec-filings"><div><p className="eyebrow">FREE OFFICIAL SOURCE</p><h2>Recent SEC filings</h2><p>Direct filings from the U.S. Securities and Exchange Commission. These are source documents, not AI interpretations.</p></div><button className="button" onClick={loadFilings} disabled={loadingFilings}>{loadingFilings ? "Loading filings..." : "Load SEC filings"}</button>{filingError && <p className="dashboard-message error">{filingError}</p>}{filings.length > 0 && <div className="filing-list">{filings.map((filing) => <a key={`${filing.form}-${filing.filingDate}-${filing.url}`} href={filing.url} target="_blank" rel="noreferrer"><strong>{filing.form}</strong><span>{filing.description}</span><small>{filing.filingDate} | Open SEC source</small></a>)}</div>}</section><p className="catalog-note">This page will show only licensed market data and source-backed AI analyses after those providers are connected.</p></> : <p className="dashboard-message error">{status}</p>}</section></main>;
}
