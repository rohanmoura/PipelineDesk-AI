import { Download, FolderKanban, HeartPulse, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { team } from '../data'
import type { Client, Deal, Lead } from '../types'
import { currency, leadForDeal, ownerName } from '../utils'

export function ClientsView({
  clients,
  deals,
  leads,
  showToast,
}: {
  clients: Client[]
  deals: Deal[]
  leads: Lead[]
  showToast: (message: string) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [owner, setOwner] = useState('All')
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? '')
  const statuses = ['All', ...Array.from(new Set(clients.map((client) => client.status)))]
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesQuery = `${client.company} ${client.name} ${client.email}`.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'All' || client.status === status
      const matchesOwner = owner === 'All' || client.ownerId === owner
      return matchesQuery && matchesStatus && matchesOwner
    })
  }, [clients, owner, query, status])
  const selectedClient = filteredClients.find((client) => client.id === selectedClientId) ?? filteredClients[0] ?? clients[0]
  const selectedDeals = deals.filter((deal) => leadForDeal(leads, deal)?.company === selectedClient?.company)
  const accountValue = selectedDeals.reduce((sum, deal) => sum + deal.value, selectedClient?.totalRevenue ?? 0)

  function exportAccount(client: Client) {
    const body = [
      `Client account: ${client.company}`,
      `Contact: ${client.name} <${client.email}>`,
      `Status: ${client.status}`,
      `Owner: ${ownerName(team, client.ownerId)}`,
      `Total revenue: ${currency.format(client.totalRevenue)}`,
      `Active projects: ${client.activeProjects}`,
    ].join('\n')
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${client.company.replace(/\s+/g, '-').toLowerCase()}-account.txt`
    link.click()
    URL.revokeObjectURL(url)
    showToast(`${client.company} account exported`)
  }

  return (
    <div className="clients-layout">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Accounts</p>
            <h2>{filteredClients.length} client accounts</h2>
          </div>
          <span className="badge green">{currency.format(clients.reduce((sum, client) => sum + client.totalRevenue, 0))} revenue</span>
        </div>
        <div className="client-toolbar">
          <label className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients" />
          </label>
          <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Owner</span><select value={owner} onChange={(event) => setOwner(event.target.value)}><option value="All">All owners</option>{team.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <div className="account-list">
          {filteredClients.map((client) => (
            <button className={selectedClient?.id === client.id ? 'account-row active-account' : 'account-row'} key={client.id} type="button" onClick={() => setSelectedClientId(client.id)}>
              <span><strong>{client.company}</strong><small>{client.name}</small></span>
              <span>{currency.format(client.totalRevenue)}</span>
              <span className={`badge ${client.status === 'Past' ? 'amber' : client.status === 'At risk' ? 'red' : 'green'}`}>{client.status}</span>
            </button>
          ))}
        </div>
      </section>
      {selectedClient && (
        <aside className="panel client-detail-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Client detail</p>
              <h2>{selectedClient.company}</h2>
            </div>
            <span className="badge blue">{ownerName(team, selectedClient.ownerId)}</span>
          </div>
          <p className="muted">{selectedClient.name} manages this account through {selectedClient.email}.</p>
          <div className="client-health-grid">
            <div><HeartPulse size={17} /><span>Health</span><strong>{clientHealth(selectedClient)}</strong></div>
            <div><FolderKanban size={17} /><span>Active projects</span><strong>{selectedClient.activeProjects}</strong></div>
            <div><Download size={17} /><span>Account value</span><strong>{currency.format(accountValue)}</strong></div>
          </div>
          <div className="account-projects">
            <h3>Project and deal history</h3>
            {selectedDeals.length === 0 ? (
              <p className="muted">No linked pipeline deals yet. Account history can be imported from past projects.</p>
            ) : selectedDeals.map((deal) => (
              <div key={deal.id}>
                <strong>{deal.title}</strong>
                <span>{deal.stage} · {currency.format(deal.value)} · close {deal.expectedCloseDate}</span>
              </div>
            ))}
          </div>
          <div className="client-actions">
            <button className="ghost-button" type="button" onClick={() => showToast(`Kickoff task queued for ${selectedClient.company}`)}>Queue kickoff task</button>
            <button className="primary-button" type="button" onClick={() => exportAccount(selectedClient)}>Export account</button>
          </div>
        </aside>
      )}
    </div>
  )
}

function clientHealth(client: Client) {
  if (client.status === 'At risk') return 'Needs attention'
  if (client.status === 'Past') return 'Dormant'
  if (client.status === 'Onboarding') return 'Onboarding'
  return 'Healthy'
}
