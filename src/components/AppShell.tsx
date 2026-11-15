import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApp } from '../app/useApp'

const links = [
  ['/', 'Home'], ['/profile', 'Profile'], ['/screening', 'Screening'], ['/budget', 'Budget'],
  ['/substitutions', 'Swaps'], ['/gaps', 'Gaps'], ['/results', 'Results'], ['/about', 'About'],
]
const disclaimer = 'AHARWISE provides general nutrition screening and educational information only. It does not diagnose, treat, or replace advice from a qualified healthcare professional or registered dietitian. Always check product labels for allergens and consult a professional for individual medical or clinical nutrition needs.'

export function Disclaimer() {
  return <div className="disclaimer"><strong>For education only</strong><p>{disclaimer}</p><p>Results are estimates based on the information you provide.</p><p>Always verify allergen information on product labels.</p><p>Screening targets are simplified educational references.</p><p>This is screening, not a diagnosis or treatment plan.</p></div>
}

export default function AppShell() {
  const location = useLocation()
  const { toast, loadError } = useApp()
  const path = location.pathname
  const stage = path === '/profile' ? 1 : path === '/screening' ? 2 : ['/budget', '/gaps', '/substitutions'].includes(path) ? 3 : path === '/results' ? 4 : 0
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <div className="header-inner">
        <NavLink className="brand" to="/" aria-label="AHARWISE home"><span><b>AHARWISE</b><small>Eat smart. Live healthy.</small></span></NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(([href, label]) => <NavLink key={href} to={href} end={href === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{label}</NavLink>)}
        </nav>
        <NavLink className="button button-primary header-cta" to="/profile">Start family screening <ArrowRight size={16} aria-hidden="true" /></NavLink>
      </div>
      {stage > 0 && <div className="progress-wrap" aria-label={`Step ${stage} of 4`}><div className="progress-inner"><span className={stage >= 1 ? 'step reached' : 'step'}>01 <b>Profile</b></span><i className={stage >= 2 ? 'line reached' : 'line'} /><span className={stage >= 2 ? 'step reached' : 'step'}>02 <b>Screening</b></span><i className={stage >= 3 ? 'line reached' : 'line'} /><span className={stage >= 3 ? 'step reached' : 'step'}>03 <b>Explore</b></span><i className={stage >= 4 ? 'line reached' : 'line'} /><span className={stage >= 4 ? 'step reached' : 'step'}>04 <b>Results</b></span></div></div>}
    </header>
    <main id="main-content" tabIndex={-1}>{loadError ? <section className="page-wrap" role="alert"><div className="notice notice-danger"><div><b>Food data could not be loaded.</b><p>{loadError}</p><p>Check that the static data files are available, then refresh the page.</p></div></div></section> : <Outlet />}</main>
    <footer className="site-footer"><div className="footer-top"><NavLink className="brand footer-brand" to="/" aria-label="AHARWISE home"><span><b>AHARWISE</b><small>Smart nutrition for every family, every budget</small></span></NavLink><nav aria-label="Footer navigation"><NavLink to="/about">About & safety</NavLink><NavLink to="/profile">Family profile</NavLink><NavLink to="/results">Results</NavLink></nav></div><Disclaimer /><p className="copyright">© 2026 AHARWISE · Your information stays in this browser.</p></footer>
    <div className="toast" aria-live="polite" aria-atomic="true">{toast}</div>
  </>
}