import { describe, expect, it } from "vitest";
import { buildSecFilingUrl, getSecCik, mapRecentFilings } from "./sec";

describe("SEC filing helpers", () => {
  it("finds a supported ticker without caring about capitalization", () => {
    expect(getSecCik(" aapl ")).toBe("0000320193");
    expect(getSecCik("unknown")).toBeUndefined();
  });

  it("builds the original SEC archive filing URL", () => {
    expect(buildSecFilingUrl("0000320193", "0000320193-24-000069", "aapl-20231230.htm"))
      .toBe("https://www.sec.gov/Archives/edgar/data/320193/000032019324000069/aapl-20231230.htm");
  });

  it("maps usable recent filings and skips incomplete SEC rows", () => {
    const filings = mapRecentFilings("0000320193", {
      form: ["10-K", "8-K"], filingDate: ["2024-11-01", "2024-10-15"],
      accessionNumber: ["0000320193-24-000069", ""], primaryDocument: ["aapl-20231230.htm", ""],
      primaryDocDescription: ["Annual report", "Current report"]
    });
    expect(filings).toEqual([{
      form: "10-K", filingDate: "2024-11-01", description: "Annual report",
      url: "https://www.sec.gov/Archives/edgar/data/320193/000032019324000069/aapl-20231230.htm"
    }]);
  });
});

