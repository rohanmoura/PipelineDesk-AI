import { useMemo, useState } from 'react'
import { EmptyState, Metric, StateNotice } from '../components/common'
import type { Deal, Lead } from '../types'
import { currency, leadForDeal, ownerName } from '../utils'
import { team } from '../data'

export function HandoffView({
  canEdit,
  deals,
  handoffChecks,
  leads,
  setHandoffChecks,
}: {
  canEdit: boolean
  deals: Deal[]
  handoffChecks: string[]
  leads: Lead[]
  setHandoffChecks: (items: string[]) => void
}) {
  const wonDeals = deals.filter((deal) => deal.stage === 'Won')
  const [selectedDealId, setSelectedDealId] = useState(wonDeals[0]?.id ?? '')
  const selectedDeal = wonDeals.find((deal) => deal.id === selectedDealId) ?? wonDeals[0]
  const selectedLead = selectedDeal ? leadForDeal(leads, selectedDeal) : undefined
  const checklist = useMemo(() => getChecklist(selectedDeal, selectedLead), [selectedDeal, selectedLead])
  const progress = checklist.length ? Math.round((handoffChecks.filter((item) => checklist.includes(item)).length / checklist.length) * 100) : 0

  function toggleItem(item: string) {
    if (!canEdit) return
    setHandoffChecks(
      handoffChecks.includes(item)
        ? handoffChecks.filter((current) => current !== item)
        : [...handoffChecks, item],
    )
  }

  if (!selectedDeal) {
    return (
      <section className="panel">
        <EmptyState title="No won deals ready for handoff" />
      </section>
    )
  }

  return (
    <div className="handoff-page">
      <section className="panel handoff-hero">
        <div>
          <p className="eyebrow">Won deal to delivery</p>
          <h2>{selectedDeal.title}</h2>
          <p>{selectedLead?.projectSummary ?? selectedDeal.notes}</p>
        </div>
        <div className="handoff-progress-card">
          <strong>{progress}%</strong>
          <span>handoff ready</span>
          <div className="probability-track"><i style={{ width: `${progress}%` }} /></div>
        </div>
      </section>

      {progress < 50 && (
        <StateNotice
          title="Handoff still needs setup"
          text="Collect access, approve the first milestone, and confirm the weekly update rhythm before delivery starts."
          tone="warning"
        />
      )}

      <section className="panel">
        <div className="panel-heading">
          <h2>Delivery readiness</h2>
          <select value={selectedDeal.id} onChange={(event) => setSelectedDealId(event.target.value)}>
            {wonDeals.map((deal) => <option key={deal.id} value={deal.id}>{deal.title}</option>)}
          </select>
          <span className={progress === 100 ? 'badge green' : 'badge amber'}>{progress === 100 ? 'Ready' : 'Onboarding'}</span>
        </div>
        <div className="handoff-grid">
          <div className="handoff-summary">
            <Metric title="Deal value" value={currency.format(selectedDeal.value)} caption="Closed revenue" />
            <Metric title="Delivery owner" value={ownerName(team, selectedDeal.ownerId).split(' ')[0]} caption="Project lead" />
            <Metric title="Kickoff target" value={formatShortDate(selectedDeal.expectedCloseDate)} caption="From close plan" tone="success" />
          </div>
          <div className="checklist">
            {checklist.map((item) => (
              <label key={item}>
                <input type="checkbox" disabled={!canEdit} checked={handoffChecks.includes(item)} onChange={() => toggleItem(item)} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="handoff-detail-grid">
        <article className="panel">
          <p className="eyebrow">Discovery notes</p>
          <h2>Scope signals</h2>
          <ul className="plain-list">
            <li>Service: {selectedLead?.serviceType ?? 'Closed project'}</li>
            <li>Budget: {selectedLead?.budgetRange ?? currency.format(selectedDeal.value)}</li>
            <li>Timeline: {selectedLead?.timeline ?? selectedDeal.expectedCloseDate}</li>
            <li>Risk: {selectedLead?.riskLevel ?? 'Low'}</li>
          </ul>
        </article>
        <article className="panel">
          <p className="eyebrow">Milestones</p>
          <h2>Delivery plan</h2>
          <ul className="plain-list">
            <li>Kickoff and asset collection</li>
            <li>Prototype or workflow map approval</li>
            <li>Core build sprint</li>
            <li>QA, handover, and launch support</li>
          </ul>
        </article>
      </section>
    </div>
  )
}

function getChecklist(deal?: Deal, lead?: Lead) {
  const base = ['Kickoff call booked', 'Admin access collected', 'Brand assets received', 'Core user flow approved', 'Milestone board created', 'Weekly update rhythm set']
  if (!deal) return base
  if (lead?.serviceType.includes('AI')) return [...base, 'Sample data and prompt risks collected']
  if (lead?.serviceType.includes('dashboard')) return [...base, 'Reporting metrics confirmed']
  return base
}

function formatShortDate(value: string) {
  const [, month, day] = value.split('-')
  return `${month}/${day}`
}
