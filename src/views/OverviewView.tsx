import { ArrowRight, Bell, CheckCircle2, Clock3, Filter, ShieldAlert, Sparkles } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { activity, deals, leads, revenueTrend, sourceData, tasks } from '../data'
import { type ViewName } from '../constants'
import { aiRecommendation, currency, scoreTone } from '../utils'

export function OverviewView({ setActiveView }: { setActiveView: (view: ViewName) => void }) {
  const latestTrend = revenueTrend[revenueTrend.length - 1]
  const pipelineValue = deals.filter((deal) => deal.stage !== 'Won' && deal.stage !== 'Lost').reduce((sum, deal) => sum + deal.value, 0)
  const weightedForecast = Math.round(deals.reduce((sum, deal) => sum + deal.value * deal.probability, 0))
  const followUpsDue = tasks.filter((task) => task.status !== 'Completed' && task.dueDate <= '2026-06-03').length
  const openDeals = deals.filter((deal) => deal.stage !== 'Won' && deal.stage !== 'Lost').length
  const wonValue = deals.filter((deal) => deal.stage === 'Won').reduce((sum, deal) => sum + deal.value, 0)
  const forecastCards = [
    { label: 'Pipeline now', value: currency.format(pipelineValue), detail: '+19% from May' },
    { label: 'Weighted close', value: currency.format(weightedForecast), detail: 'Probability adjusted' },
    { label: 'Won run-rate', value: currency.format(latestTrend.won), detail: `${currency.format(wonValue)} booked` },
  ]
  const motionItems = [
    { label: 'Proposal sent', value: '1 deal', tone: 'blue', note: 'BrightCart needs scope approval' },
    { label: 'Negotiation', value: '1 deal', tone: 'amber', note: 'MentorDesk can close this week' },
    { label: 'Lost risk', value: '1 lead', tone: 'red', note: 'CreatorOS needs paid discovery' },
  ]

  return (
    <div className="overview-page">
      <section className="overview-hero">
        <div>
          <p className="eyebrow">KMAX internal tool portfolio project</p>
          <h2>Client ops command center</h2>
          <p>Track qualified leads, revenue movement, handoff readiness, and follow-up pressure from one focused workspace.</p>
          <div className="overview-pills">
            <span>{openDeals} open deals</span>
            <span>{followUpsDue} due today</span>
            <span>50% close rate</span>
          </div>
        </div>
        <div className="overview-health-card">
          <span>Pipeline health</span>
          <strong>78%</strong>
          <div className="health-meter"><span /></div>
          <p>Strong fit leads are healthy, but proposal movement needs owner attention.</p>
        </div>
      </section>

      <section className="forecast-panel">
        <div className="forecast-heading">
          <div>
            <p className="eyebrow">Revenue forecast</p>
            <h2>Pipeline is growing, but proposals need movement</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => setActiveView('Analytics')}>
            View reports <ArrowRight size={16} />
          </button>
        </div>

        <div className="forecast-dashboard">
          <div className="forecast-main">
            <div className="forecast-cards">
              {forecastCards.map((card) => (
                <div className="forecast-card" key={card.label}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <small>{card.detail}</small>
                </div>
              ))}
            </div>
            <div className="forecast-chart-card">
              <div className="chart-toolbar">
                <span><i className="legend-dot blue" />Pipeline value</span>
                <span><i className="legend-dot green" />Won revenue</span>
              </div>
              <div className="overview-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend} margin={{ top: 16, right: 12, left: 0, bottom: 2 }}>
                    <defs>
                      <linearGradient id="overviewPipeline" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.34} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="overviewWon" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.24} />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e8edf5" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} dy={8} />
                    <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tickLine={false} axisLine={false} width={50} />
                    <Tooltip formatter={(value) => currency.format(Number(value))} />
                    <Area animationDuration={900} type="monotone" dataKey="pipeline" stroke="#2563eb" fill="url(#overviewPipeline)" strokeWidth={4} />
                    <Area animationBegin={180} animationDuration={900} type="monotone" dataKey="won" stroke="#16a34a" fill="url(#overviewWon)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <aside className="movement-card">
            <div>
              <p className="eyebrow">Deal movement</p>
              <h3>Where attention should go next</h3>
            </div>
            <div className="movement-list">
              {motionItems.map((item) => (
                <button key={item.label} type="button" onClick={() => setActiveView('Pipeline')}>
                  <span className={`badge ${item.tone}`}>{item.value}</span>
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="overview-lower-grid">
        <div className="overview-main-stack">
          <section className="panel action-panel">
        <div>
          <p className="eyebrow">Today focus</p>
          <h2>Move the best-fit leads before they cool down</h2>
          <p>High-score opportunities are ready for scoped proposals, while unclear budget leads should go through paid discovery.</p>
        </div>
        <div className="focus-list">
          <div>
            <CheckCircle2 size={18} />
            <span>Send phased proposal to NovaLaunch</span>
            <strong>92 score</strong>
          </div>
          <div>
            <Clock3 size={18} />
            <span>Follow up on BrightCart reporting scope</span>
            <strong>Today</strong>
          </div>
          <div>
            <ShieldAlert size={18} />
            <span>Push CreatorOS into paid discovery</span>
            <strong>Risk</strong>
          </div>
        </div>
        <div className="action-row">
          <span><strong>2</strong> high-fit</span>
          <span><strong>3</strong> follow-ups</span>
          <span><strong>1</strong> risk</span>
        </div>
          </section>

          <section className="panel">
            <div className="panel-heading compact">
              <h2>Source quality</h2>
              <Filter size={18} />
            </div>
            <div className="chart-mid">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar animationDuration={800} dataKey="leads" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar animationBegin={150} animationDuration={800} dataKey="won" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="overview-side-stack">
          <section className="panel">
        <div className="panel-heading compact">
          <h2>AI priority queue</h2>
          <Sparkles size={18} />
        </div>
        <div className="stack">
          {leads.slice(0, 4).map((lead) => (
            <button className="lead-mini" key={lead.id} type="button" onClick={() => setActiveView('Leads')}>
              <span className={`score ${scoreTone(lead.qualityScore)}`}>{lead.qualityScore}</span>
              <span>
                <strong>{lead.company}</strong>
                <small>{aiRecommendation(lead)}</small>
              </span>
            </button>
          ))}
        </div>
          </section>

          <section className="panel">
        <div className="panel-heading compact">
          <h2>Recent activity</h2>
          <Bell size={18} />
        </div>
        <div className="timeline">
          {activity.map((item) => (
            <div className="timeline-item" key={item.id}>
              <span />
              <div>
                <strong>{item.actor}</strong>
                <p>{item.message}</p>
                <small>{item.createdAt}</small>
              </div>
            </div>
          ))}
        </div>
          </section>
        </div>
      </section>
    </div>
  )
}
