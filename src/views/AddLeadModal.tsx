import { X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { StateNotice } from '../components/common'
import type { Lead } from '../types'

const services = ['AI MVP build', 'Internal dashboard', 'Marketplace MVP', 'Creator SaaS', 'AI workflow automation']
const sources = ['Website form', 'Referral', 'LinkedIn', 'Cold outreach', 'X/Twitter', 'Partner referral']

export function AddLeadModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (lead: Lead) => void
}) {
  const [company, setCompany] = useState('OrbitOps Studio')
  const [name, setName] = useState('Rhea Kapoor')
  const [serviceType, setServiceType] = useState(services[1])
  const [source, setSource] = useState(sources[0])
  const [budgetRange, setBudgetRange] = useState('$6k-$10k')
  const [summary, setSummary] = useState('Client operations dashboard for tracking leads, invoices, and delivery tasks.')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/\d/.test(budgetRange)) {
      setError('Add a budget range with a number, for example $6k-$10k.')
      return
    }
    const id = `lead-${Date.now()}`
    onCreate({
      id,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      company,
      source,
      serviceType,
      budgetRange,
      estimatedValue: 9200,
      timeline: '5 weeks',
      projectSummary: summary,
      status: 'New',
      qualityScore: 84,
      riskLevel: 'Medium',
      ownerId: 'tm-1',
      nextFollowUpDate: '2026-06-07',
      lastContactDate: '2026-06-03',
      createdAt: '2026-06-03',
    })
  }

  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={handleSubmit}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">New opportunity</p>
            <h2>Add qualified lead</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <StateNotice title="Invalid budget" text={error} tone="error" />}
        <div className="form-grid">
          <label>
            <span>Company</span>
            <input value={company} onChange={(event) => setCompany(event.target.value)} required />
          </label>
          <label>
            <span>Contact</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            <span>Service</span>
            <select value={serviceType} onChange={(event) => setServiceType(event.target.value)}>
              {services.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Source</span>
            <select value={source} onChange={(event) => setSource(event.target.value)}>
              {sources.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Budget</span>
            <input value={budgetRange} onChange={(event) => setBudgetRange(event.target.value)} required />
          </label>
          <label className="form-wide">
            <span>Project summary</span>
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} required />
          </label>
        </div>

        <div className="modal-actions">
          <button className="ghost-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit">Create lead</button>
        </div>
      </form>
    </div>
  )
}
