import { Bell, FileText, Sparkles } from 'lucide-react'
import { navItems, type ViewName } from '../constants'
import { Metric } from '../components/common'
import { currency } from '../utils'
import type { DemoRole } from '../types'

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
  isExporting,
  setActiveView,
  metrics,
  onExportReport,
  role,
  children,
}: {
  activeView: ViewName
  isExporting: boolean
  setActiveView: (view: ViewName) => void
  metrics: Metrics
  onExportReport: () => void
  role: DemoRole
  children: React.ReactNode
}) {
  const roleHelp = {
    Owner: 'Full access to pipeline, exports, reports, and settings.',
    'Team member': 'Can update assigned leads, follow-ups, deals, and briefs.',
    Viewer: 'Read-only review mode for dashboards and reports.',
  }

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
            <div className="role-display" aria-label="Current role">
              <span>Role</span>
              <strong>{role}</strong>
            </div>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="primary-button" type="button" onClick={onExportReport}>
              <FileText size={17} />
              {isExporting ? 'Exporting...' : 'Export report'}
            </button>
          </div>
        </header>
        <div className="permission-strip">
          <strong>{role}</strong>
          <span>{roleHelp[role]}</span>
        </div>

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
