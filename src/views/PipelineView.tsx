import { EmptyState } from '../components/common'
import { stages } from '../constants'
import { leads } from '../data'
import type { Deal, DealStage } from '../types'
import { currency, leadForDeal } from '../utils'

const nextStage: Partial<Record<DealStage, DealStage>> = {
  'New Lead': 'Qualified',
  Qualified: 'Proposal Sent',
  'Proposal Sent': 'Negotiation',
  Negotiation: 'Won',
}

export function PipelineView({
  deals,
  setDeals,
  showToast,
}: {
  deals: Deal[]
  setDeals: (deals: Deal[]) => void
  showToast: (message: string) => void
}) {
  function moveDeal(deal: Deal) {
    const stage = nextStage[deal.stage]
    if (!stage) return

    setDeals(deals.map((item) => item.id === deal.id ? { ...item, stage, updatedAt: '2026-06-03' } : item))
    showToast(`${deal.title} moved to ${stage}`)
  }

  function markLost(deal: Deal) {
    setDeals(deals.map((item) => item.id === deal.id ? { ...item, stage: 'Lost', probability: 0, updatedAt: '2026-06-03' } : item))
    showToast(`${deal.title} marked as lost`)
  }

  return (
    <section className="pipeline-shell">
      <div className="pipeline-header">
        <div>
          <p className="eyebrow">Deal board</p>
          <h2>Track every opportunity from inquiry to handoff</h2>
        </div>
        <div className="board-summary">
          <span>{deals.length} deals</span>
          <span>{currency.format(deals.reduce((sum, deal) => sum + deal.value, 0))} total value</span>
        </div>
      </div>
      <div className="pipeline-board">
        {stages.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage)
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
          return (
            <div className="stage-column" key={stage}>
              <div className="stage-heading">
                <div>
                  <strong>{stage}</strong>
                  <small>{currency.format(stageValue)}</small>
                </div>
                <span>{stageDeals.length}</span>
              </div>
              {stageDeals.length === 0 && <EmptyState title="No deals in stage" compact />}
              {stageDeals.map((deal) => {
                const lead = leadForDeal(leads, deal)
                return (
                  <article className="deal-card" key={deal.id}>
                    <div className="deal-head">
                      <strong>{deal.title}</strong>
                      <span>{Math.round(deal.probability * 100)}%</span>
                    </div>
                    <p>{lead?.company}</p>
                    <div className="deal-meta">
                      <span>{currency.format(deal.value)}</span>
                      <span>{deal.expectedCloseDate}</span>
                    </div>
                    <div className="probability-track">
                      <i style={{ width: `${Math.round(deal.probability * 100)}%` }} />
                    </div>
                    <small>{deal.notes}</small>
                    {!['Won', 'Lost'].includes(deal.stage) && (
                      <div className="deal-actions">
                        <button className="deal-action" type="button" onClick={() => moveDeal(deal)}>
                          Move to {nextStage[deal.stage]}
                        </button>
                        <button className="deal-action lost" type="button" onClick={() => markLost(deal)}>
                          Mark lost
                        </button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )
        })}
      </div>
    </section>
  )
}
