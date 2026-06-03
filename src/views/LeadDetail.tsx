import { ArrowRight, Sparkles } from 'lucide-react'
import { team } from '../data'
import type { Lead } from '../types'
import { aiRecommendation, ownerName, scoreTone } from '../utils'

export function LeadDetail({ lead }: { lead: Lead }) {
  return (
    <aside className="panel detail-panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Lead detail</p>
          <h2>{lead.company}</h2>
        </div>
        <span className={`score ${scoreTone(lead.qualityScore)}`}>{lead.qualityScore}</span>
      </div>
      <p className="muted">{lead.projectSummary}</p>
      <div className="detail-list">
        <div><span>Contact</span><strong>{lead.name}</strong><small>{lead.email}</small></div>
        <div><span>Source</span><strong>{lead.source}</strong></div>
        <div><span>Budget</span><strong>{lead.budgetRange}</strong></div>
        <div><span>Timeline</span><strong>{lead.timeline}</strong></div>
        <div><span>Owner</span><strong>{ownerName(team, lead.ownerId)}</strong></div>
        <div><span>Risk</span><strong>{lead.riskLevel}</strong></div>
      </div>
      <div className="ai-card">
        <Sparkles size={18} />
        <div>
          <strong>Next best action</strong>
          <p>{aiRecommendation(lead)}</p>
        </div>
      </div>
      <button className="primary-button full" type="button">
        Convert to deal <ArrowRight size={16} />
      </button>
    </aside>
  )
}
