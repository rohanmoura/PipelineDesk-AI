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
import { stages } from '../constants'
import { revenueTrend, sourceData } from '../data'
import type { Deal } from '../types'
import { currency } from '../utils'

export function AnalyticsView({ deals }: { deals: Deal[] }) {
  const pieData = stages.map((stage) => ({ name: stage, value: deals.filter((deal) => deal.stage === stage).length }))
  const openDeals = deals.filter((deal) => !['Won', 'Lost'].includes(deal.stage))
  const wonDeals = deals.filter((deal) => deal.stage === 'Won')
  const lostDeals = deals.filter((deal) => deal.stage === 'Lost')
  const forecast = openDeals.reduce((sum, deal) => sum + deal.value * deal.probability, 0)
  const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0)
  const wonRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0)
  const closed = wonDeals.length + lostDeals.length
  const closeRate = closed ? Math.round((wonDeals.length / closed) * 100) : 100
  const colors = ['#2563eb', '#0891b2', '#f59e0b', '#7c3aed', '#16a34a', '#dc2626']
  const activePieData = pieData.filter((item) => item.value > 0)

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
        </div>
      </section>

      <section className="panel analytics-wide">
        <div className="panel-heading compact"><h2>Revenue trend</h2><span className="badge green">6 month view</span></div>
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
        <div className="panel-heading compact"><h2>Stage mix</h2><span className="badge blue">{deals.length} deals</span></div>
        <div className="donut-wrap">
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
            <strong>{deals.length}</strong>
            <span>deals</span>
          </div>
        </div>
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
            <BarChart data={sourceData}>
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
          <div><strong>Best channel</strong><span>Referral leads convert fastest and carry the highest trust signal.</span></div>
          <div><strong>Bottleneck</strong><span>Proposal Sent needs follow-up pressure before negotiation stalls.</span></div>
          <div><strong>Lost logic</strong><span>Mark low-budget, unclear-timeline, or no-fit deals as Lost to keep forecast honest.</span></div>
        </div>
      </section>
    </div>
  )
}
