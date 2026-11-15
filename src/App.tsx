import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { HashRouter, Route, Routes, Link } from 'react-router-dom'
import { AppProvider } from './app/context'
import AppShell from './components/AppShell'

const HomePage = lazy(() => import('./pages/GettingStarted').then((module) => ({ default: module.HomePage })))
const ProfilePage = lazy(() => import('./pages/GettingStarted').then((module) => ({ default: module.ProfilePage })))
const ScreeningPage = lazy(() => import('./pages/Screening'))
const ExplorePage = lazy(() => import('./pages/Explore'))
const AboutPage = lazy(() => import('./pages/About'))

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('AHARWISE application error:', error, info.componentStack) }
  render() {
    if (this.state.hasError) return <div className="fatal-error"><h1>Something didn’t load as expected.</h1><p>Your saved information remains in this browser. You can try returning home or refreshing the page.</p><a className="button button-primary" href="#/">Return home</a></div>
    return this.props.children
  }
}

function NotFound() {
  return <div className="not-found"><span className="eyebrow">Page not found</span><h1>That page isn’t here.</h1><p>The link may be out of date. Your family information remains saved in this browser.</p><Link className="button button-primary" to="/">Back to AHARWISE</Link></div>
}

function RouteFallback() {
  return <div className="page-wrap"><div className="loading-surface" role="status">Loading AHARWISE…</div></div>
}

export default function App() {
  return <ErrorBoundary><AppProvider><HashRouter><Routes><Route element={<AppShell />}><Route index element={<Suspense fallback={<RouteFallback />}><HomePage /></Suspense>} /><Route path="profile" element={<Suspense fallback={<RouteFallback />}><ProfilePage /></Suspense>} /><Route path="screening" element={<Suspense fallback={<RouteFallback />}><ScreeningPage /></Suspense>} /><Route path="budget" element={<Suspense fallback={<RouteFallback />}><ExplorePage /></Suspense>} /><Route path="substitutions" element={<Suspense fallback={<RouteFallback />}><ExplorePage /></Suspense>} /><Route path="gaps" element={<Suspense fallback={<RouteFallback />}><ExplorePage /></Suspense>} /><Route path="results" element={<Suspense fallback={<RouteFallback />}><ExplorePage /></Suspense>} /><Route path="about" element={<Suspense fallback={<RouteFallback />}><AboutPage /></Suspense>} /><Route path="*" element={<NotFound />} /></Route></Routes></HashRouter></AppProvider></ErrorBoundary>
}
