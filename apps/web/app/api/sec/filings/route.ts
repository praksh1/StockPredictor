import { NextRequest, NextResponse } from "next/server";

const cikByTicker: Record<string, string> = {
  AAPL: "0000320193", AMD: "0000002488", AMZN: "0001018724", CVX: "0000093410",
  META: "0001326801", MSFT: "0000789019", NVDA: "0001045810", TSLA: "0001318605"
};

type SecRecentFilings = { form: string[]; filingDate: string[]; accessionNumber: string[]; primaryDocument: string[]; primaryDocDescription: string[] };
type SecSubmissions = { filings?: { recent?: SecRecentFilings } };

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker")?.trim().toUpperCase();
  if (!ticker || !cikByTicker[ticker]) return NextResponse.json({ error: "This security is not supported by the free SEC beta source yet." }, { status: 400 });
  const contact = process.env.SEC_CONTACT_EMAIL;
  if (!contact) return NextResponse.json({ error: "The free SEC source needs an administrator contact email before it can be used." }, { status: 503 });
  try {
    const response = await fetch(`https://data.sec.gov/submissions/CIK${cikByTicker[ticker]}.json`, {
      headers: { "User-Agent": `MarketPulse AI ${contact}`, "Accept-Encoding": "gzip, deflate" },
      next: { revalidate: 900 }
    });
    if (!response.ok) return NextResponse.json({ error: "SEC filings are temporarily unavailable. Please try again later." }, { status: 502 });
    const data = await response.json() as SecSubmissions;
    const recent = data.filings?.recent;
    if (!recent) return NextResponse.json({ filings: [] });
    const filings = recent.form.slice(0, 20).map((form, index) => {
      const accession = recent.accessionNumber[index];
      const document = recent.primaryDocument[index];
      const accessionWithoutDashes = accession.replaceAll("-", "");
      return { form, filingDate: recent.filingDate[index], description: recent.primaryDocDescription[index] || "SEC filing", url: `https://www.sec.gov/Archives/edgar/data/${Number(cikByTicker[ticker])}/${accessionWithoutDashes}/${document}` };
    });
    return NextResponse.json({ filings }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=900" } });
  } catch {
    return NextResponse.json({ error: "SEC filings are temporarily unavailable. Please try again later." }, { status: 502 });
  }
}
