import { getSecCik, mapRecentFilings, type SecRecentFilings } from "../../../../lib/sec";
import { NextRequest, NextResponse } from "next/server";
type SecSubmissions = { filings?: { recent?: SecRecentFilings } };

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker") ?? "";
  const cik = getSecCik(ticker);
  if (!cik) return NextResponse.json({ error: "This security is not supported by the free SEC beta source yet." }, { status: 400 });
  const contact = process.env.SEC_CONTACT_EMAIL;
  if (!contact) return NextResponse.json({ error: "The free SEC source needs an administrator contact email before it can be used." }, { status: 503 });
  try {
    const response = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
      headers: { "User-Agent": `MarketPulse AI ${contact}`, "Accept-Encoding": "gzip, deflate" },
      next: { revalidate: 900 }
    });
    if (!response.ok) return NextResponse.json({ error: "SEC filings are temporarily unavailable. Please try again later." }, { status: 502 });
    const data = await response.json() as SecSubmissions;
    const recent = data.filings?.recent;
    if (!recent) return NextResponse.json({ filings: [] });
    const filings = mapRecentFilings(cik, recent);
    return NextResponse.json({ filings }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=900" } });
  } catch {
    return NextResponse.json({ error: "SEC filings are temporarily unavailable. Please try again later." }, { status: 502 });
  }
}

