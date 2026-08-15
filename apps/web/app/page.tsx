import Link from "next/link";
import "./home.css";

const watchlist = [
  { ticker: "NVDA", name: "NVIDIA", price: "$184.22", change: "+2.81%", tone: "positive", signal: "Bullish" },
  { ticker: "AAPL", name: "Apple", price: "$228.54", change: "+0.42%", tone: "neutral", signal: "Watching" },
  { ticker: "CVX", name: "Chevron", price: "$156.87", change: "+1.63%", tone: "positive", signal: "Bullish" },
  { ticker: "TSLA", name: "Tesla", price: "$319.05", change: "-1.18%", tone: "negative", signal: "Cautious" }
];

export default function Home() {
  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top"><span>MP</span> MarketPulse <b>AI</b></a>
        <div className="nav-links"><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#disclaimer">Safety</a></div>
        <div className="nav-actions"><Link className="text-button" href="/login">Sign in</Link><Link className="button small" style={{ textDecoration: "none" }} href="/signup">Start free</Link></div>
      </nav>

      <section id="top" className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><i /> MARKET INTELLIGENCE, NOT PREDICTIONS</p>
          <h1>Know what matters<br /><em>before</em> the market reacts.</h1>
          <p className="lede">MarketPulse AI monitors the events affecting the stocks you follow, then turns the signal into a clear, cited assessment.</p>
          <div className="hero-actions"><Link className="button" style={{ textDecoration: "none" }} href="/signup">Start free <span>Start</span></Link><a className="button ghost" href="#how">See how it works</a></div>
          <p className="micro">No credit card required for the private beta. Delayed U.S. quotes.</p>
        </div>
        <div className="alert-card" aria-label="Example AI assessment">
          <div className="card-top"><span className="live"><i /> NEW HIGH-IMPACT EVENT</span><span>10:42 AM</span></div>
          <div className="card-title"><div className="ticker-icon">CVX</div><div><strong>Chevron</strong><small>NYSE: CVX</small></div><b className="impact">HIGH</b></div>
          <div className="assessment"><span className="signal-dot" /> <div><small>AI MARKET ASSESSMENT</small><strong>Potentially bullish pressure</strong></div></div>
          <p>Shipping disruption may tighten crude supply. Chevron&apos;s upstream exposure could benefit if oil prices hold higher.</p>
          <div className="evidence"><span>Verified: 3 source-backed facts</span><a href="#disclaimer">View reasoning</a></div>
          <p className="demo">DEMO EXAMPLE - not live market data or financial advice.</p>
        </div>
      </section>

      <section id="how" className="how"><p className="eyebrow">A CLEARER WAY TO FOLLOW THE MARKET</p><h2>From noise to <em>context</em>, fast.</h2>
        <div className="steps"><article><b>01</b><h3>Monitor</h3><p>Authorized news, filings, and market data are continuously checked for material events.</p></article><article><b>02</b><h3>Assess</h3><p>AI weighs source quality, company exposure, market context, and counterarguments.</p></article><article><b>03</b><h3>Alert</h3><p>You get one consolidated alert with the original sources and a plain-English explanation.</p></article></div>
      </section>

      <section className="dashboard" aria-label="Dashboard preview"><div className="dashboard-head"><div><p className="eyebrow">YOUR WATCHLIST</p><h2>Today&apos;s signals</h2></div><span className="demo-tag">DEMO DATA</span></div>
        <div className="dashboard-grid"><div className="stocks">{watchlist.map((stock) => <article className="stock" key={stock.ticker}><span className={`status ${stock.tone}`} /><div><strong>{stock.ticker}</strong><small>{stock.name}</small></div><div className="stock-price"><strong>{stock.price}</strong><small className={stock.tone}>{stock.change}</small></div><span className={`pill ${stock.tone}`}>{stock.signal}</span></article>)}</div>
          <article className="latest"><p className="eyebrow">LATEST ASSESSMENT</p><span className="green-label">BULLISH</span><h3>AI infrastructure demand remains a key NVIDIA driver.</h3><p>Multiple source-backed developments point to potential positive pressure, with valuation sensitivity as the primary counterargument.</p><div className="latest-footer"><span>Confidence: <b>Medium</b></span><button className="text-button">Explore alert</button></div></article></div>
      </section>

      <section id="pricing" className="pricing"><p className="eyebrow">SIMPLE, FLEXIBLE PLANS</p><h2>Intelligence that fits your trading style.</h2><div className="plans"><article><h3>Basic</h3><p className="price">$5.99 <small>/ month</small></p><p>For focused watchlists.</p><ul><li>50 qualifying alerts / month</li><li>In-app and email alerts</li><li>Source links and reasoning</li></ul><button className="button ghost">Choose Basic</button></article><article className="featured"><span className="popular">MOST POPULAR</span><h3>Pro</h3><p className="price">$10.99 <small>/ month</small></p><p>For active market followers.</p><ul><li>100 qualifying alerts / month</li><li>Web push notifications</li><li>Priority alert delivery</li></ul><button className="button">Choose Pro</button></article><article><h3>Unlimited</h3><p className="price">$20 <small>/ month</small></p><p>For serious coverage.</p><ul><li>Unlimited qualifying alerts*</li><li>All available channels</li><li>Advanced preferences</li></ul><button className="button ghost">Choose Unlimited</button></article></div><p className="micro">* Subject to fair-use safeguards. Plans and limits are configurable before launch.</p></section>

      <footer id="disclaimer"><a className="brand" href="#top"><span>MP</span> MarketPulse <b>AI</b></a><p>MarketPulse AI provides informational and educational market intelligence - not financial, investment, trading, legal, or tax advice. Assessments can be inaccurate or delayed. Do your own research.</p><small>Copyright 2026 MarketPulse AI | Delayed quote policy for private beta</small></footer>
    </main>
  );
}
