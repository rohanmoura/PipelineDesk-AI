import { ArrowRight, CalendarPlus, NotebookPen, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { Lead, LeadNote, TeamMember } from '../types'
import { aiRecommendation, ownerName, scoreTone } from '../utils'

export function LeadDetail({
  canEdit,
  lead,
  notes,
  onAddFollowUp,
  onAddNote,
  onConvertToDeal,
  onUpdateOwner,
  owners,
}: {
  canEdit: boolean
  lead: Lead
  notes: LeadNote[]
  onAddFollowUp: (lead: Lead) => void
  onAddNote: (leadId: string, message: string) => void
  onConvertToDeal: (lead: Lead) => void
  onUpdateOwner: (leadId: string, ownerId: string) => void
  owners: TeamMember[]
}) {
  const [note, setNote] = useState('')

  function submitNote() {
    const trimmed = note.trim()
    if (!trimmed) return
    onAddNote(lead.id, trimmed)
    setNote('')
  }

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
        <div><span>Owner</span><strong>{ownerName(owners, lead.ownerId)}</strong></div>
        <div><span>Risk</span><strong>{lead.riskLevel}</strong></div>
      </div>
      <label className="detail-owner">
        <span>Assigned owner</span>
        <select disabled={!canEdit} value={lead.ownerId} onChange={(event) => onUpdateOwner(lead.id, event.target.value)}>
          {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
        </select>
      </label>
      <div className="ai-card">
        <Sparkles size={18} />
        <div>
          <strong>Next best action</strong>
          <p>{aiRecommendation(lead)}</p>
        </div>
      </div>
      <div className="lead-action-grid">
        <button className="primary-button" type="button" disabled={!canEdit} onClick={() => onConvertToDeal(lead)}>
          Convert to deal <ArrowRight size={16} />
        </button>
        <button className="ghost-button" type="button" disabled={!canEdit} onClick={() => onAddFollowUp(lead)}>
          <CalendarPlus size={16} /> Follow-up
        </button>
      </div>
      <div className="note-composer">
        <div><NotebookPen size={17} /><strong>Lead notes</strong></div>
        <textarea disabled={!canEdit} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add discovery note or next action" rows={3} />
        <button className="ghost-button" type="button" disabled={!canEdit} onClick={submitNote}>Add note</button>
      </div>
      <div className="lead-note-list">
        {notes.length === 0 ? (
          <p className="muted">No notes yet. Add one after discovery or follow-up.</p>
        ) : notes.map((item) => (
          <div key={item.id}>
            <strong>{item.createdAt}</strong>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
