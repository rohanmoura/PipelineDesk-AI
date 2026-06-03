import { CalendarCheck, MailCheck, MessageSquareWarning, PlugZap, Send, Webhook } from 'lucide-react'
import { useState } from 'react'
import { integrationDemos } from '../data'
import type { IntegrationDemo } from '../types'

export function IntegrationsView({
  canEdit,
  showToast,
}: {
  canEdit: boolean
  showToast: (message: string) => void
}) {
  const [activeId, setActiveId] = useState(integrationDemos[0].id)
  const [connected, setConnected] = useState<string[]>(integrationDemos.filter((item) => item.status === 'Connected').map((item) => item.id))
  const [events, setEvents] = useState<Array<{ id: string; message: string }>>([])
  const activeIntegration = integrationDemos.find((item) => item.id === activeId) ?? integrationDemos[0]

  function connectIntegration(item: IntegrationDemo) {
    if (!canEdit) return
    if (!connected.includes(item.id)) {
      setConnected([...connected, item.id])
    }
    showToast(`${item.name} connected for demo`)
  }

  function runDemo(item: IntegrationDemo) {
    if (!connected.includes(item.id)) {
      showToast('Connect this integration before running the demo')
      return
    }
    setEvents([{ id: `${item.id}-${Date.now()}`, message: item.result }, ...events].slice(0, 5))
    showToast(`${item.category} automation test completed`)
  }

  return (
    <div className="integrations-layout">
      <section className="panel integrations-hero">
        <div>
          <p className="eyebrow">V2 demo layer</p>
          <h2>Try lightweight integrations without leaving the product</h2>
          <p>These are mocked workflows that show how PipelineDesk can connect email, calendar, team alerts, and project handoff automation in a future full-stack version.</p>
        </div>
        <div className="integration-score-card">
          <strong>{connected.length}/{integrationDemos.length}</strong>
          <span>demo integrations connected</span>
          <div className="probability-track"><i style={{ width: `${(connected.length / integrationDemos.length) * 100}%` }} /></div>
        </div>
      </section>

      <section className="panel integration-list-panel">
        <div className="panel-heading compact">
          <h2>Demo connectors</h2>
          <span className="badge blue">{integrationDemos.length} workflows</span>
        </div>
        <div className="integration-list">
          {integrationDemos.map((item) => {
            const isConnected = connected.includes(item.id)
            const Icon = iconFor(item.category)
            return (
              <button className={activeIntegration.id === item.id ? 'integration-row active-integration' : 'integration-row'} key={item.id} type="button" onClick={() => setActiveId(item.id)}>
                <Icon size={19} />
                <span><strong>{item.name}</strong><small>{item.category} automation</small></span>
                <em className={`badge ${isConnected ? 'green' : item.status === 'Needs review' ? 'amber' : 'blue'}`}>{isConnected ? 'Connected' : item.status}</em>
              </button>
            )
          })}
        </div>
      </section>

      <aside className="panel integration-detail">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">{activeIntegration.category}</p>
            <h2>{activeIntegration.name}</h2>
          </div>
          <PlugZap size={19} />
        </div>
        <p>{activeIntegration.description}</p>
        <div className="integration-demo-box">
          <span>Sample event</span>
          <strong>{activeIntegration.sampleEvent}</strong>
        </div>
        <div className="integration-actions">
          <button className="ghost-button" type="button" disabled={!canEdit || connected.includes(activeIntegration.id)} onClick={() => connectIntegration(activeIntegration)}>
            <PlugZap size={16} /> Connect demo
          </button>
          <button className="primary-button" type="button" onClick={() => runDemo(activeIntegration)}>
            <Send size={16} /> Run test
          </button>
        </div>
      </aside>

      <section className="panel panel-wide integration-events">
        <div className="panel-heading compact">
          <h2>Automation event log</h2>
          <span className="badge green">{events.length} test events</span>
        </div>
        {events.length === 0 ? (
          <p className="muted">Run a connected integration test to see what PipelineDesk would create or send.</p>
        ) : (
          <div className="event-log">
            {events.map((event) => (
              <div key={event.id}>
                <Webhook size={17} />
                <span>{event.message}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function iconFor(category: IntegrationDemo['category']) {
  if (category === 'Email') return MailCheck
  if (category === 'Calendar') return CalendarCheck
  if (category === 'Alert') return MessageSquareWarning
  return Webhook
}
