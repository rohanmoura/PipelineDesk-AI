import { ArrowRight, Bell, Download, LockKeyhole, RotateCcw, Settings, Upload } from 'lucide-react'
import { useState } from 'react'
import { stages } from '../constants'
import { clients, team } from '../data'
import { StateNotice } from '../components/common'
import type { DemoRole } from '../types'
import { currency } from '../utils'

export function AdminView({
  canManageSettings,
  onResetDemo,
  role,
  setRole,
  showToast,
}: {
  canManageSettings: boolean
  onResetDemo: () => void
  role: DemoRole
  setRole: (role: DemoRole) => void
  showToast: (message: string) => void
}) {
  const configItems = ['Lead scoring rules', 'Pipeline stages', 'Proposal templates', 'Follow-up reminders', 'CSV import/export']
  const [activeConfig, setActiveConfig] = useState(configItems[0])
  const [teamRoles, setTeamRoles] = useState<Record<string, string>>(() => Object.fromEntries(team.map((member) => [member.id, member.role])))
  const [scoreRules, setScoreRules] = useState({ budget: 35, urgency: 25, clarity: 25, fit: 15 })
  const [enabledStages, setEnabledStages] = useState(stages)
  const [notifications, setNotifications] = useState({ overdue: true, proposal: true, handoff: false })
  const [templateMode, setTemplateMode] = useState('MVP scope')
  const roleCards: Array<{ label: DemoRole; text: string }> = [
    { label: 'Owner', text: 'Full access to pipeline, exports, reports, settings, and demo controls.' },
    { label: 'Team member', text: 'Can work assigned leads, move deals, complete follow-ups, and generate briefs.' },
    { label: 'Viewer', text: 'Read-only review mode for dashboards, reports, and portfolio demos.' },
  ]
  const ruleTotal = Object.values(scoreRules).reduce((sum, value) => sum + value, 0)

  function updateScoreRule(key: keyof typeof scoreRules, value: number) {
    setScoreRules({ ...scoreRules, [key]: value })
  }

  function toggleStage(stage: typeof stages[number]) {
    setEnabledStages(enabledStages.includes(stage) ? enabledStages.filter((item) => item !== stage) : [...enabledStages, stage])
  }

  function exportCsv() {
    const csv = [
      'company,email,status,totalRevenue',
      ...clients.map((client) => `${client.company},${client.email},${client.status},${client.totalRevenue}`),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pipelinedesk-clients.csv'
    link.click()
    URL.revokeObjectURL(url)
    showToast('Client CSV exported')
  }

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
      {!canManageSettings && (
        <StateNotice
          title="Settings are read-only for this role"
          text="Switch to Owner mode to manage team permissions, scoring weights, pipeline stages, and reset controls."
          tone="info"
        />
      )}
      <section className="panel">
        <div className="panel-heading compact"><h2>Team permissions</h2><LockKeyhole size={18} /></div>
        <div className="stack">
          {team.map((member) => (
            <div className="team-row" key={member.id}>
              <div className="avatar">{member.name.slice(0, 1)}</div>
              <div><strong>{member.name}</strong><small>{member.email}</small></div>
              <select disabled={!canManageSettings} value={teamRoles[member.id]} onChange={(event) => {
                setTeamRoles({ ...teamRoles, [member.id]: event.target.value })
                showToast(`${member.name} role changed`)
              }}>
                <option>Owner</option>
                <option>Product strategist</option>
                <option>Developer</option>
                <option>Viewer</option>
              </select>
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
          <label><input type="checkbox" disabled={!canManageSettings} defaultChecked /> Enabled for workspace</label>
        </div>
      </section>
      <section className="panel panel-wide settings-workbench">
        <div className="panel-heading compact"><h2>Interactive workflow settings</h2><Settings size={18} /></div>
        <div className="settings-grid">
          <div className="setting-card">
            <div><strong>Lead scoring rules</strong><span>Total weight: {ruleTotal}%</span></div>
            {ruleTotal !== 100 && (
              <StateNotice
                title="Weight total is not 100%"
                text="This is allowed in demo mode, but production scoring should normalize these weights."
                tone="warning"
              />
            )}
            {(Object.keys(scoreRules) as Array<keyof typeof scoreRules>).map((key) => (
              <label className="range-control" key={key}>
                <span>{key}</span>
                <input disabled={!canManageSettings} min="0" max="60" type="range" value={scoreRules[key]} onChange={(event) => updateScoreRule(key, Number(event.target.value))} />
                <strong>{scoreRules[key]}%</strong>
              </label>
            ))}
          </div>
          <div className="setting-card">
            <div><strong>Pipeline stages</strong><span>{enabledStages.length} enabled</span></div>
            <div className="stage-toggle-list">
              {stages.map((stage) => (
                <label key={stage}>
                  <input checked={enabledStages.includes(stage)} disabled={!canManageSettings} type="checkbox" onChange={() => toggleStage(stage)} />
                  <span>{stage}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="setting-card">
            <div><strong>Proposal templates</strong><span>{templateMode}</span></div>
            <select disabled={!canManageSettings} value={templateMode} onChange={(event) => {
              setTemplateMode(event.target.value)
              showToast('Proposal template updated')
            }}>
              <option>MVP scope</option>
              <option>Discovery-first</option>
              <option>Retainer handoff</option>
            </select>
            <p>Controls default sections for generated proposal briefs.</p>
          </div>
          <div className="setting-card">
            <div><strong>Notification preferences</strong><Bell size={17} /></div>
            {Object.entries(notifications).map(([key, enabled]) => (
              <label className="switch-row" key={key}>
                <span>{key}</span>
                <input checked={enabled} disabled={!canManageSettings} type="checkbox" onChange={() => {
                  setNotifications({ ...notifications, [key]: !enabled })
                  showToast('Notification preference updated')
                }} />
              </label>
            ))}
          </div>
          <div className="setting-card import-card">
            <div><strong>CSV import/export</strong><span>Mock data bridge</span></div>
            <button className="ghost-button" type="button" disabled={!canManageSettings} onClick={() => showToast('CSV import validated')}>
              <Upload size={16} /> Validate import
            </button>
            <button className="primary-button" type="button" disabled={!canManageSettings} onClick={exportCsv}>
              <Download size={16} /> Export clients CSV
            </button>
          </div>
        </div>
      </section>
      <section className="panel reset-panel">
        <div>
          <p className="eyebrow">Demo controls</p>
          <h2>Reset workspace data</h2>
          <p>Restores leads, pipeline stages, follow-ups, and proposal exports back to the original demo state.</p>
        </div>
        <button className="danger-button" type="button" disabled={!canManageSettings} onClick={onResetDemo}>
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
