export const secCikByTicker: Record<string, string> = {
  AAPL: "0000320193",
  AMD: "0000002488",
  AMZN: "0001018724",
  CVX: "0000093410",
  META: "0001326801",
  MSFT: "0000789019",
  NVDA: "0001045810",
  TSLA: "0001318605"
};

export type SecRecentFilings = {
  form: string[];
  filingDate: string[];
  accessionNumber: string[];
  primaryDocument: string[];
  primaryDocDescription: string[];
};

export type SecFiling = { form: string; filingDate: string; description: string; url: string };

export function getSecCik(ticker: string) {
  return secCikByTicker[ticker.trim().toUpperCase()];
}

export function buildSecFilingUrl(cik: string, accessionNumber: string, document: string) {
  const accessionWithoutDashes = accessionNumber.replaceAll("-", "");
  return `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accessionWithoutDashes}/${document}`;
}

export function mapRecentFilings(cik: string, recent: SecRecentFilings, limit = 20): SecFiling[] {
  const filings: SecFiling[] = [];
  const filingCount = Math.min(recent.form.length, limit);

  for (let index = 0; index < filingCount; index += 1) {
    const accessionNumber = recent.accessionNumber[index];
    const primaryDocument = recent.primaryDocument[index];
    if (!accessionNumber || !primaryDocument) continue;
    filings.push({
      form: recent.form[index] || "SEC filing",
      filingDate: recent.filingDate[index] || "",
      description: recent.primaryDocDescription[index] || "SEC filing",
      url: buildSecFilingUrl(cik, accessionNumber, primaryDocument)
    });
  }

  return filings;
}

