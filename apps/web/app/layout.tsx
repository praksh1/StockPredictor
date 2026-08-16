import type { Metadata } from "next";
import "./globals.css";
import "./system.css";

export const metadata: Metadata = {
  title: "MarketPulse AI | Market intelligence, clearly explained",
  description: "AI-powered market intelligence with cited sources and clear uncertainty."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

