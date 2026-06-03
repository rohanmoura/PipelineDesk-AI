import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../components/common'
import type { Lead, TeamMember } from '../types'
import { scoreTone } from '../utils'
import { AddLeadModal } from './AddLeadModal'
import { LeadDetail } from './LeadDetail'

export function LeadsView({
  filteredLeads,
  budget,
  setBudget,
  query,
  setQuery,
  owner,
  setOwner,
  source,
  setSource,
  service,
  setService,
  status,
  setStatus,
  budgets,
  owners,
  sources,
  services,
  statuses,
  selectedLead,
  setSelectedLeadId,
  onCreateLead,
}: {
  filteredLeads: Lead[]
  budget: string
  setBudget: (value: string) => void
  query: string
  setQuery: (value: string) => void
  owner: string
  setOwner: (value: string) => void
  source: string
  setSource: (value: string) => void
  service: string
  setService: (value: string) => void
  status: string
  setStatus: (value: string) => void
  budgets: string[]
  owners: TeamMember[]
  sources: string[]
  services: string[]
  statuses: string[]
  selectedLead: Lead
  setSelectedLeadId: (value: string) => void
  onCreateLead: (lead: Lead) => void
}) {
  const [isAddingLead, setIsAddingLead] = useState(false)

  return (
    <div className="split-layout">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Lead intelligence</p>
            <h2>{filteredLeads.length} matching opportunities</h2>
          </div>
          <button className="primary-button" type="button" onClick={() => setIsAddingLead(true)}>
            <Plus size={17} /> Add lead
          </button>
        </div>
        <div className="toolbar">
          <label className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search leads" />
          </label>
          <label className="filter-control">
            <span>Source</span>
            <select value={source} onChange={(event) => setSource(event.target.value)}>
              {sources.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-control">
            <span>Service</span>
            <select value={service} onChange={(event) => setService(event.target.value)}>
              {services.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-control">
            <span>Budget</span>
            <select value={budget} onChange={(event) => setBudget(event.target.value)}>
              {budgets.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-control">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-control">
            <span>Owner</span>
            <select value={owner} onChange={(event) => setOwner(event.target.value)}>
              <option value="All">All owners</option>
              {owners.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Service</th>
                <th>Budget</th>
                <th>Score</th>
                <th>Status</th>
                <th>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  className={selectedLead.id === lead.id ? 'selected-row' : undefined}
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <td>
                    <strong>{lead.company}</strong>
                    <small>{lead.name}</small>
                  </td>
                  <td>{lead.serviceType}</td>
                  <td>{lead.budgetRange}</td>
                  <td><span className={`score ${scoreTone(lead.qualityScore)}`}>{lead.qualityScore}</span></td>
                  <td><span className="badge blue">{lead.status}</span></td>
                  <td>{lead.nextFollowUpDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="filter-summary">
          <span>Source: {source}</span>
          <span>Service: {service}</span>
          <span>Budget: {budget}</span>
          <span>Status: {status}</span>
          <span>Owner: {owner === 'All' ? 'All' : owners.find((item) => item.id === owner)?.name}</span>
          <span>Search: {query || 'None'}</span>
        </div>
        {filteredLeads.length === 0 && <EmptyState title="No leads match this filter" />}
      </section>
      <LeadDetail lead={selectedLead} />
      {isAddingLead && (
        <AddLeadModal
          onClose={() => setIsAddingLead(false)}
          onCreate={(lead) => {
            onCreateLead(lead)
            setIsAddingLead(false)
          }}
        />
      )}
    </div>
  )
}
