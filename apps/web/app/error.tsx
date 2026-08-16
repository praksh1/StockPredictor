"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("MarketPulse page error", error); }, [error]);
  return <main className="system-page"><section className="system-card"><p className="eyebrow">TEMPORARY PROBLEM</p><h1>That page needs another try.</h1><p>Nothing has been changed in your account. You can retry the page or return to your dashboard.</p><div className="system-actions"><button className="button" onClick={reset}>Try again</button><a className="button ghost" href="/dashboard">Go to dashboard</a></div></section></main>;
}

