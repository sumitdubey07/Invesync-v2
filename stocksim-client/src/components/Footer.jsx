import { TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const PRODUCT_LINKS = [
  { label: 'Dashboard',       to: '/dashboard' },
  { label: 'Portfolio',       to: '/portfolio' },
  { label: 'Market Overview', to: '/dashboard' },
  { label: 'AI Forecast',     to: '/dashboard' },
]

const MARKET_LINKS = [
  { label: 'NSE Stocks',  to: 'https://www.nseindia.com/' },
  { label: 'BSE Stocks',  to: 'https://beta.bseindia.com/' },
  { label: 'Top Gainers', to: 'https://groww.in/markets/top-gainers' },
  { label: 'Top Losers',  to: 'https://groww.in/markets/top-losers' },
  { label: 'Most Active', to: 'https://groww.in/markets/top-volume' },
]

const SOCIALS = [
  { icon: <GithubIcon />,   href: 'https://github.com/sumitdubey07/',            label: 'GitHub' },
  { icon: <XIcon />,        href: 'https://x.com/',                              label: 'X / Twitter' },
  { icon: <LinkedInIcon />, href: 'https://linkedin.com/in/sumit-dubey-07s/',    label: 'LinkedIn' },
]

export default function Footer() {
  return (
    // ── CHANGED: CSS variables for background and border ──
    <footer
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      className="relative overflow-hidden mt-16"
    >

      <style>{`
        .footer-grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          opacity: .055;
          background-image:
            linear-gradient(rgba(139,92,246,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @keyframes scanline {
          0%   { transform: translateY(-4px); }
          100% { transform: translateY(320px); }
        }
        .footer-scanline {
          position: absolute; left: 0; right: 0; height: 2px; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,.35), transparent);
          animation: scanline 7s linear infinite;
        }
        .footer-col-head {
          font-size: 10px; font-weight: 600; color: #7c3aed;
          text-transform: uppercase; letter-spacing: 1.5px;
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .footer-col-head::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(90deg, rgba(124,58,237,.35), transparent);
        }
        .footer-nav-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--text-muted);
          transition: color .15s; cursor: pointer; text-decoration: none;
        }
        .footer-nav-link::before {
          content: '›'; color: #7c3aed; font-size: 14px;
          opacity: 0; transition: opacity .15s, transform .15s;
          transform: translateX(-4px);
        }
        .footer-nav-link:hover { color: #a78bfa; }
        .footer-nav-link:hover::before { opacity: 1; transform: translateX(0); }
        .footer-soc-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid rgba(139,92,246,.22);
          background: rgba(139,92,246,.06);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); cursor: pointer; text-decoration: none;
          transition: border-color .2s, background .2s, color .2s;
        }
        .footer-soc-btn:hover {
          border-color: rgba(139,92,246,.6);
          background: rgba(139,92,246,.15);
          color: #a78bfa;
        }
        @keyframes fpulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        .footer-status-dot { animation: fpulse 2s ease-in-out infinite; }
      `}</style>

      {/* Decorative layers */}
      <div className="footer-grid-bg" />
      <div className="footer-scanline" />

      {/* Top glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/5 pointer-events-none"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(139,92,246,.55),transparent)' }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-purple-500/50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-purple-500/50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
              >
                <TrendingUp size={15} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text)' }}>
                Inve<span style={{ background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>sync</span>
              </span>
            </div>

            {/* ── CHANGED: CSS variable for description text ── */}
            <p style={{ color: 'var(--text-faint)' }} className="text-xs leading-relaxed mb-5">
              Practice trading Indian stocks with ₹1,00,000 virtual money. No risk, real market data.
            </p>

            {/* Socials */}
            <div className="flex gap-2 mb-4">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="footer-soc-btn">
                  {s.icon}
                </a>
              ))}
            </div>

            {/* System status badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-green-500/20 bg-green-500/5 font-mono text-[10px] text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 footer-status-dot" />
              SYS_STATUS: ONLINE
            </div>
          </div>

          {/* Product links */}
          <div>
            <div className="footer-col-head">Product</div>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="footer-nav-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Markets links */}
          <div>
            <div className="footer-col-head">Markets</div>
            <ul className="flex flex-col gap-2.5">
              {MARKET_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.to} target="_blank" rel="noopener noreferrer" className="footer-nav-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <div className="footer-col-head">Disclaimer</div>
            {/* ── CHANGED: CSS variable for disclaimer text ── */}
            <p
              style={{
                color: 'var(--text-faint)',
                borderColor: 'rgba(139,92,246,.12)',
                background: 'rgba(139,92,246,.03)',
              }}
              className="text-[11px] leading-relaxed p-3 rounded-lg border"
            >
              Invesync is a paper trading platform for educational purposes only. All trades use virtual money. This is not financial advice. Market data is delayed by 15 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      {/* ── CHANGED: CSS variable for bottom border ── */}
      <div className="relative" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* ── CHANGED: CSS variable for copyright text ── */}
          <p style={{ color: 'var(--text-faint)' }} className="text-[11px]">
            © 2026 Invesync · Built by Sumit Dubey · Educational use only
          </p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-green-400/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 footer-status-dot" />
            </div>
            {/* ── CHANGED: CSS variable for status text ── */}
            <span style={{ color: 'var(--text-muted)' }} className="text-[11px]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}