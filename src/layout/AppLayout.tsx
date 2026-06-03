import { Bell, FileText, Sparkles } from 'lucide-react'
import { navItems, type ViewName } from '../constants'
import { Metric } from '../components/common'
import { currency } from '../utils'

type Metrics = {
  pipelineValue: number
  forecast: number
  openDeals: number
  wonRevenue: number
  closeRate: number
  followUpsDue: number
}

export function AppLayout({
  activeView,
  setActiveView,
  metrics,
  children,
}: {
  activeView: ViewName
  setActiveView: (view: ViewName) => void
  metrics: Metrics
  children: React.ReactNode
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">PD</div>
          <div>
            <strong>PipelineDesk AI</strong>
            <span>Client Ops CRM</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Primary navigation">
          {navItems.map(([label, Icon]) => (
            <button
              className={activeView === label ? 'nav-item active' : 'nav-item'}
              key={label}
              type="button"
              onClick={() => setActiveView(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-panel">
          <Sparkles size={18} />
          <strong>AI qualification</strong>
          <p>Scores leads by budget, urgency, scope clarity, and fit.</p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">KMAX internal tool portfolio project</p>
            <h1>{activeView}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="primary-button" type="button">
              <FileText size={17} />
              Export report
            </button>
          </div>
        </header>

        <section className="status-strip" aria-label="Pipeline metrics">
          <Metric title="Pipeline value" value={currency.format(metrics.pipelineValue)} caption="Open deal value" />
          <Metric title="Forecast" value={currency.format(metrics.forecast)} caption="Weighted revenue" />
          <Metric title="Open deals" value={String(metrics.openDeals)} caption="Across 4 active stages" />
          <Metric title="Won this month" value={currency.format(metrics.wonRevenue)} caption={`${metrics.closeRate}% close rate`} />
          <Metric title="Follow-ups due" value={String(metrics.followUpsDue)} caption="Needs action today" tone="warning" />
        </section>

        {children}
      </main>
    </div>
  )
}
