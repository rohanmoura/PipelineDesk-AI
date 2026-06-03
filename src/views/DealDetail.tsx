import { ArrowRight, BadgeDollarSign, CalendarClock, CheckCircle2, CircleSlash, UserRound } from 'lucide-react'
import { leads, tasks, team } from '../data'
import type { Deal } from '../types'
import { currency, leadForDeal, ownerName } from '../utils'

export function DealDetail({
  deal,
  onMarkLost,
  onMove,
}: {
  deal: Deal
  onMarkLost: (deal: Deal) => void
  onMove: (deal: Deal) => void
}) {
  const lead = leadForDeal(leads, deal)
  const relatedTasks = tasks.filter((task) => task.relatedId === deal.id || task.relatedId === deal.leadId)
  const isClosed = deal.stage === 'Won' || deal.stage === 'Lost'

  return (
    <aside className="deal-detail-panel">
      <div className="deal-detail-head">
        <div>
          <p className="eyebrow">Deal detail</p>
          <h2>{deal.title}</h2>
        </div>
        <span className={`badge ${deal.stage === 'Lost' ? 'red' : deal.stage === 'Won' ? 'green' : 'blue'}`}>{deal.stage}</span>
      </div>

      <p>{deal.notes}</p>

      <div className="deal-detail-grid">
        <div><BadgeDollarSign size={17} /><span>Value</span><strong>{currency.format(deal.value)}</strong></div>
        <div><CalendarClock size={17} /><span>Close date</span><strong>{deal.expectedCloseDate}</strong></div>
        <div><UserRound size={17} /><span>Owner</span><strong>{ownerName(team, deal.ownerId)}</strong></div>
        <div><CheckCircle2 size={17} /><span>Probability</span><strong>{Math.round(deal.probability * 100)}%</strong></div>
      </div>

      <div className="decision-card">
        <span>Decision maker</span>
        <strong>{lead?.name ?? 'Unknown contact'}</strong>
        <small>{lead?.email ?? 'No email available'}</small>
      </div>

      <div className="deal-detail-section">
        <h3>Activity timeline</h3>
        <div className="deal-timeline">
          <span><i />Proposal status: {deal.proposalStatus}</span>
          <span><i />Stage updated on {deal.updatedAt}</span>
          <span><i />Next close target: {deal.expectedCloseDate}</span>
        </div>
      </div>

      <div className="deal-detail-section">
        <h3>Related tasks</h3>
        {relatedTasks.length === 0 ? (
          <p className="muted">No follow-up tasks attached yet.</p>
        ) : (
          <div className="deal-task-list">
            {relatedTasks.map((task) => (
              <span key={task.id}>
                <strong>{task.title}</strong>
                <small>{task.priority} priority · due {task.dueDate}</small>
              </span>
            ))}
          </div>
        )}
      </div>

      {!isClosed && (
        <div className="deal-detail-actions">
          <button className="primary-button" type="button" onClick={() => onMove(deal)}>
            Move stage <ArrowRight size={16} />
          </button>
          <button className="danger-button" type="button" onClick={() => onMarkLost(deal)}>
            <CircleSlash size={16} /> Mark lost
          </button>
        </div>
      )}
    </aside>
  )
}
