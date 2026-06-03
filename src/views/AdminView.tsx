import { ArrowRight, LockKeyhole, RotateCcw, Settings } from 'lucide-react'
import { useState } from 'react'
import { clients, team } from '../data'
import type { DemoRole } from '../types'
import { currency } from '../utils'

export function AdminView({
  onResetDemo,
  role,
  setRole,
}: {
  onResetDemo: () => void
  role: DemoRole
  setRole: (role: DemoRole) => void
}) {
  const configItems = ['Lead scoring rules', 'Pipeline stages', 'Proposal templates', 'Follow-up reminders', 'CSV import/export']
  const [activeConfig, setActiveConfig] = useState(configItems[0])
  const roleCards: Array<{ label: DemoRole; text: string }> = [
    { label: 'Owner', text: 'Full access to pipeline, exports, reports, settings, and demo controls.' },
    { label: 'Team member', text: 'Can work assigned leads, move deals, complete follow-ups, and generate briefs.' },
    { label: 'Viewer', text: 'Read-only review mode for dashboards, reports, and portfolio demos.' },
  ]

  return (
    <div className="page-grid">
      <section className="panel panel-wide">
        <div className="panel-heading compact"><h2>Workspace role</h2><LockKeyhole size={18} /></div>
        <div className="role-card-grid">
          {roleCards.map((item) => (
            <button
              className={role === item.label ? 'role-card active-role' : 'role-card'}
              key={item.label}
              type="button"
              onClick={() => setRole(item.label)}
            >
              <strong>{item.label}</strong>
              <span>{item.text}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading compact"><h2>Team permissions</h2><LockKeyhole size={18} /></div>
        <div className="stack">
          {team.map((member) => (
            <div className="team-row" key={member.id}>
              <div className="avatar">{member.name.slice(0, 1)}</div>
              <div><strong>{member.name}</strong><small>{member.email}</small></div>
              <span className="badge blue">{member.role}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading compact"><h2>Workflow config</h2><Settings size={18} /></div>
        <div className="config-list">
          {configItems.map((item) => (
            <button className={activeConfig === item ? 'active-config' : undefined} key={item} type="button" onClick={() => setActiveConfig(item)}>
              {item}<ArrowRight size={16} />
            </button>
          ))}
        </div>
        <div className="config-preview">
          <span>Selected setting</span>
          <strong>{activeConfig}</strong>
          <p>{getConfigDescription(activeConfig)}</p>
          <label><input type="checkbox" defaultChecked /> Enabled for demo workspace</label>
        </div>
      </section>
      <section className="panel reset-panel">
        <div>
          <p className="eyebrow">Demo controls</p>
          <h2>Reset workspace data</h2>
          <p>Restores leads, pipeline stages, follow-ups, and proposal exports back to the original demo state.</p>
        </div>
        <button className="danger-button" type="button" onClick={onResetDemo}>
          <RotateCcw size={17} /> Reset demo
        </button>
      </section>
      <section className="panel panel-wide">
        <div className="panel-heading compact"><h2>Client accounts</h2></div>
        <div className="client-list">
          {clients.map((client) => (
            <article className="client-row" key={client.id}>
              <div>
                <strong>{client.company}</strong>
                <p>{client.name}</p>
              </div>
              <span>{client.email}</span>
              <strong>{currency.format(client.totalRevenue)}</strong>
              <span className="badge green">{client.status}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function getConfigDescription(item: string) {
  const descriptions: Record<string, string> = {
    'Lead scoring rules': 'Scores budget, urgency, clarity, source trust, and risk into one qualification signal.',
    'Pipeline stages': 'Controls the sales workflow from new inquiry to won, lost, or handoff-ready.',
    'Proposal templates': 'Keeps brief, scope, assumptions, milestones, and next-email sections consistent.',
    'Follow-up reminders': 'Keeps overdue, today, and scheduled follow-ups visible across the workspace.',
    'CSV import/export': 'Supports moving leads and reports in or out of the internal dashboard.',
  }
  return descriptions[item] ?? 'Workspace configuration for the client operations system.'
}
