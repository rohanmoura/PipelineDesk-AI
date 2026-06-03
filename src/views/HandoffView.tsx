import { Metric } from '../components/common'

export function HandoffView({
  handoffChecks,
  setHandoffChecks,
}: {
  handoffChecks: string[]
  setHandoffChecks: (items: string[]) => void
}) {
  const checklist = ['Kickoff call booked', 'Admin access collected', 'Brand assets received', 'Core user flow approved', 'Milestone board created', 'Weekly update rhythm set']
  const progress = Math.round((handoffChecks.length / checklist.length) * 100)

  function toggleItem(item: string) {
    setHandoffChecks(
      handoffChecks.includes(item)
        ? handoffChecks.filter((current) => current !== item)
        : [...handoffChecks, item],
    )
  }

  return (
    <div className="handoff-page">
      <section className="panel handoff-hero">
        <div>
          <p className="eyebrow">Won deal to delivery</p>
          <h2>PixelForge product retainer handoff</h2>
          <p>Convert the closed deal into a clean delivery workspace with assets, kickoff, milestones, and communication rhythm.</p>
        </div>
        <div className="handoff-progress-card">
          <strong>{progress}%</strong>
          <span>handoff ready</span>
          <div className="probability-track"><i style={{ width: `${progress}%` }} /></div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Delivery readiness</h2>
          <span className={progress === 100 ? 'badge green' : 'badge amber'}>{progress === 100 ? 'Ready' : 'Onboarding'}</span>
        </div>
        <div className="handoff-grid">
          <div className="handoff-summary">
            <Metric title="Deal value" value="$11,800" caption="First month plus setup" />
            <Metric title="Delivery owner" value="Karan" caption="Product and launch" />
            <Metric title="Kickoff" value="Jun 5" caption="Client confirmed" tone="success" />
          </div>
          <div className="checklist">
            {checklist.map((item) => (
              <label key={item}>
                <input type="checkbox" checked={handoffChecks.includes(item)} onChange={() => toggleItem(item)} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
