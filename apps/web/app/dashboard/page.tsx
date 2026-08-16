"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase";
import "./dashboard.css";

type Security = { id: string; ticker: string; name: string; exchange: string };
type WatchlistRow = { securities: Security | null };

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Security[]>([]);
  const [items, setItems] = useState<Security[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadWatchlist() {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.assign("/login"); return; }
    const { data: profile, error: profileError } = await supabase.from("profiles").select("onboarding_completed_at").eq("id", auth.user.id).maybeSingle();
    if (profileError) throw profileError;
    if (!profile?.onboarding_completed_at) { window.location.assign("/onboarding"); return; }
    setEmail(auth.user.email ?? "MarketPulse member");
    let { data: list } = await supabase.from("watchlists").select("id").eq("user_id", auth.user.id).order("created_at").limit(1).maybeSingle();
    if (!list) {
      const created = await supabase.from("watchlists").insert({ user_id: auth.user.id, name: "My Watchlist" }).select("id").single();
      if (created.error) throw created.error;
      list = created.data;
    }
    setWatchlistId(list.id);
    const [{ data: catalogRows, error: catalogError }, { data: itemRows, error: itemError }] = await Promise.all([
      supabase.from("securities").select("id,ticker,name,exchange").eq("is_active", true).order("ticker"),
      supabase.from("watchlist_items").select("securities(id,ticker,name,exchange)").eq("watchlist_id", list.id)
    ]);
    if (catalogError) throw catalogError;
    if (itemError) throw itemError;
    const available = (catalogRows ?? []) as Security[];
    setCatalog(available);
    setItems(((itemRows ?? []) as unknown as WatchlistRow[]).flatMap((row) => row.securities ? [row.securities] : []));
    if (!available.length) setNotice("The starter stock catalog has not been installed yet. Run the catalog SQL migration in Supabase, then refresh this page.");
    setLoading(false);
  }

  useEffect(() => { loadWatchlist().catch((caught) => { setError(caught instanceof Error ? caught.message : "Unable to load your watchlist."); setLoading(false); }); }, []);
  const suggestions = useMemo(() => catalog.filter((security) => !items.some((item) => item.id === security.id) && `${security.ticker} ${security.name}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [catalog, items, query]);

  async function addSecurity(security: Security) {
    if (!watchlistId) return;
    setError(null); setNotice(null);
    const { error: insertError } = await createClient().from("watchlist_items").insert({ watchlist_id: watchlistId, security_id: security.id });
    if (insertError) { setError(insertError.message); return; }
    setItems((current) => [...current, security].sort((a, b) => a.ticker.localeCompare(b.ticker))); setQuery(""); setNotice(`${security.ticker} was added to your watchlist.`);
  }

  async function removeSecurity(security: Security) {
    if (!watchlistId) return;
    const { error: deleteError } = await createClient().from("watchlist_items").delete().eq("watchlist_id", watchlistId).eq("security_id", security.id);
    if (deleteError) { setError(deleteError.message); return; }
    setItems((current) => current.filter((item) => item.id !== security.id)); setNotice(`${security.ticker} was removed from your watchlist.`);
  }

  async function signOut() { await createClient().auth.signOut(); window.location.assign("/"); }
  if (loading) return <main className="dashboard-loading">Loading your watchlist...</main>;
  return <main className="member-dashboard"><header><Link className="brand" href="/"><span>MP</span> MarketPulse <b>AI</b></Link><nav className="member-nav"><Link href="/dashboard">Watchlist</Link><Link href="/dashboard/alerts">Alert history</Link><Link href="/dashboard/settings">Preferences</Link><button className="text-button" onClick={signOut}>Sign out</button></nav></header><section><p className="eyebrow">YOUR MARKET BRIEF</p><h1>Welcome back.</h1><p className="member-email">Signed in as {email}</p>{error && <p className="dashboard-message error">{error}</p>}{notice && <p className="dashboard-message success">{notice}</p>}<div className="watchlist-layout"><article className="watchlist-card"><div className="card-heading"><div><p className="eyebrow">MY WATCHLIST</p><h2>{items.length} selected stocks</h2></div><span className="demo-badge">NO LIVE PRICES YET</span></div>{items.length ? <div className="watchlist-items">{items.map((item) => <div className="watchlist-item" key={item.id}><div className="ticker-badge">{item.ticker}</div><Link className="security-link" href={`/dashboard/stocks/${item.ticker}`}><strong>{item.ticker}</strong><span>{item.name} | {item.exchange}</span></Link><button aria-label={`Remove ${item.ticker}`} className="remove-button" onClick={() => removeSecurity(item)}>Remove</button></div>)}</div> : <div className="empty-state"><strong>Your watchlist is empty.</strong><span>Use the search panel to add the stocks you follow.</span></div>}</article><aside className="search-card"><p className="eyebrow">ADD A STOCK</p><h2>Build your watchlist</h2><label>Search by ticker or company<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try NVDA or NVIDIA" /></label><div className="search-results">{suggestions.map((security) => <button key={security.id} onClick={() => addSecurity(security)}><span><strong>{security.ticker}</strong><small>{security.name}</small></span><b>Add</b></button>)}{query && !suggestions.length && <p>No matching stock is available in the beta catalog.</p>}</div><p className="catalog-note">Starter catalog only. Live prices, alerts, and expanded search will be connected through authorized providers in the next data phase.</p></aside></div></section></main>;
}
