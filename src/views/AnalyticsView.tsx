import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, StateNotice } from '../components/common'
import { stages } from '../constants'
import { revenueTrend, team } from '../data'
import type { Deal, Lead } from '../types'
import { currency, leadForDeal, ownerName } from '../utils'

export function AnalyticsView({
  deals,
  leads,
  showToast,
}: {
  deals: Deal[]
  leads: Lead[]
  showToast: (message: string) => void
}) {
  const [month, setMonth] = useState('All')
  const [source, setSource] = useState('All')
  const [service, setService] = useState('All')
  const [owner, setOwner] = useState('All')
  const [savedView, setSavedView] = useState('Owner overview')
  const monthOptions = ['All', ...Array.from(new Set(deals.map((deal) => deal.expectedCloseDate.slice(0, 7))))]
  const sourceOptions = ['All', ...Array.from(new Set(leads.map((lead) => lead.source)))]
  const serviceOptions = ['All', ...Array.from(new Set(leads.map((lead) => lead.serviceType)))]
  const savedViews = ['Owner overview', 'Source health', 'Proposal risk']

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const lead = leadForDeal(leads, deal)
      const matchesMonth = month === 'All' || deal.expectedCloseDate.startsWith(month)
      const matchesSource = source === 'All' || lead?.source === source
      const matchesService = service === 'All' || lead?.serviceType === service
      const matchesOwner = owner === 'All' || deal.ownerId === owner
      return matchesMonth && matchesSource && matchesService && matchesOwner
    })
  }, [deals, leads, month, owner, service, source])

  const pieData = stages.map((stage) => ({ name: stage, value: filteredDeals.filter((deal) => deal.stage === stage).length }))
  const openDeals = filteredDeals.filter((deal) => !['Won', 'Lost'].includes(deal.stage))
  const wonDeals = filteredDeals.filter((deal) => deal.stage === 'Won')
  const lostDeals = filteredDeals.filter((deal) => deal.stage === 'Lost')
  const forecast = openDeals.reduce((sum, deal) => sum + deal.value * deal.probability, 0)
  const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0)
  const wonRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0)
  const closed = wonDeals.length + lostDeals.length
  const closeRate = closed ? Math.round((wonDeals.length / closed) * 100) : 100
  const avgDealSize = wonDeals.length ? Math.round(wonRevenue / wonDeals.length) : 0
  const colors = ['#2563eb', '#0891b2', '#f59e0b', '#7c3aed', '#16a34a', '#dc2626']
  const activePieData = pieData.filter((item) => item.value > 0)
  const sourceRows = sourceOptions.filter((item) => item !== 'All').map((item) => ({
    name: item.replace(' form', '').replace('Partner ', ''),
    leads: leads.filter((lead) => lead.source === item && (service === 'All' || lead.serviceType === service)).length,
    won: filteredDeals.filter((deal) => deal.stage === 'Won' && leadForDeal(leads, deal)?.source === item).length,
  }))

  function saveReportView() {
    showToast(`${savedView} saved with current filters`)
  }

  function exportAnalytics() {
    const body = [
      `PipelineDesk AI report: ${savedView}`,
      `Filters: month=${month}, source=${source}, service=${service}, owner=${owner === 'All' ? 'All' : ownerName(team, owner)}`,
      `Forecast: ${currency.format(forecast)}`,
      `Open pipeline: ${currency.format(pipelineValue)}`,
      `Won revenue: ${currency.format(wonRevenue)}`,
      `Close rate: ${closeRate}%`,
    ].join('\n')
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pipelinedesk-analytics-report.txt'
    link.click()
    URL.revokeObjectURL(url)
    showToast('Analytics report exported')
  }

  return (
    <div className="analytics-grid">
      <section className="analytics-hero">
        <div>
          <p className="eyebrow">Revenue intelligence</p>
          <h2>{currency.format(forecast)} forecasted from {openDeals.length} active deals</h2>
          <p>Pipeline health is strongest when proposal-stage deals move within 7 days and low-fit inquiries are marked lost quickly.</p>
        </div>
        <div className="analytics-hero-stats">
          <span><strong>{currency.format(pipelineValue)}</strong> open pipeline</span>
          <span><strong>{currency.format(wonRevenue)}</strong> won revenue</span>
          <span><strong>{closeRate}%</strong> close rate</span>
          <span><strong>{currency.format(avgDealSize)}</strong> avg won deal</span>
        </div>
      </section>
      <section className="panel analytics-wide report-controls">
        <div className="panel-heading compact">
          <h2>Report controls</h2>
          <span className="badge blue">{savedView}</span>
        </div>
        <div className="saved-report-row">
          {savedViews.map((view) => (
            <button className={savedView === view ? 'active-report' : undefined} key={view} type="button" onClick={() => setSavedView(view)}>
              {view}
            </button>
          ))}
        </div>
        <div className="analytics-filters">
          <label><span>Month</span><select value={month} onChange={(event) => setMonth(event.target.value)}>{monthOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Source</span><select value={source} onChange={(event) => setSource(event.target.value)}>{sourceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Service</span><select value={service} onChange={(event) => setService(event.target.value)}>{serviceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Owner</span><select value={owner} onChange={(event) => setOwner(event.target.value)}><option value="All">All owners</option>{team.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <div className="report-actions">
          <button className="ghost-button" type="button" onClick={saveReportView}><Save size={16} /> Save view</button>
          <button className="primary-button" type="button" onClick={exportAnalytics}><Download size={16} /> Export analytics</button>
        </div>
        {filteredDeals.length === 0 && (
          <StateNotice
            title="No report data"
            text="The current filters do not match any deals. Clear one filter to restore charts."
            tone="warning"
          />
        )}
      </section>

      <section className="panel analytics-wide">
        <div className="panel-heading compact"><h2>Revenue trend</h2><span className="badge green">{month === 'All' ? '6 month view' : month}</span></div>
        <div className="chart-tall">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => currency.format(Number(value))} />
              <Area animationBegin={120} animationDuration={900} type="monotone" dataKey="pipeline" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} />
              <Area animationBegin={260} animationDuration={900} type="monotone" dataKey="won" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading compact"><h2>Stage mix</h2><span className="badge blue">{filteredDeals.length} deals</span></div>
        {filteredDeals.length === 0 ? <EmptyState title="No stage data for these filters" compact /> : <div className="donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                animationBegin={180}
                animationDuration={900}
                data={activePieData}
                dataKey="value"
                innerRadius={58}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
                nameKey="name"
                outerRadius={92}
                paddingAngle={2}
              >
                {activePieData.map((entry) => (
                  <Cell key={entry.name} fill={colors[stages.indexOf(entry.name as typeof stages[number])]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>{filteredDeals.length}</strong>
            <span>deals</span>
          </div>
        </div>}
        <div className="stage-legend">
          {pieData.map((item, index) => (
            <span key={item.name}>
              <i style={{ background: colors[index] }} />
              {item.name}
              <strong>{item.value}</strong>
            </span>
          ))}
        </div>
      </section>
      <section className="panel analytics-wide">
        <div className="panel-heading compact"><h2>Lead source performance</h2><span className="badge amber">Quality by channel</span></div>
        <div className="chart-mid">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceRows}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar animationBegin={160} animationDuration={850} dataKey="leads" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar animationBegin={320} animationDuration={850} dataKey="won" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading compact"><h2>Insight notes</h2></div>
        <div className="insight-list">
          <div><strong>Current report</strong><span>{savedView} is filtered to {filteredDeals.length} deals and {openDeals.length} active opportunities.</span></div>
          <div><strong>Bottleneck</strong><span>Proposal Sent needs follow-up pressure before negotiation stalls.</span></div>
          <div><strong>Lost logic</strong><span>Mark low-budget, unclear-timeline, or no-fit deals as Lost to keep forecast honest.</span></div>
        </div>
      </section>
    </div>
  )
}
