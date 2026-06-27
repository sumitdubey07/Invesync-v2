import Navbar from './Navbar'
import Footer from './Footer'
import MobileNav from './MobileNav'

export default function Layout({ children, showFooter = true }) {
  return (
    // ── CHANGED: CSS variable for page background ──
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      {showFooter && <Footer />}
      <MobileNav />
    </div>
  )
}