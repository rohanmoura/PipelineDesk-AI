import { CheckCircle2, Clipboard, Download, Sparkles } from 'lucide-react'
import { Block } from '../components/common'
import type { Lead } from '../types'
import { LeadDetail } from './LeadDetail'

export function ProposalView({
  exportedProposalIds,
  selectedLead,
  setExportedProposalIds,
  showToast,
}: {
  exportedProposalIds: string[]
  selectedLead: Lead
  setExportedProposalIds: (ids: string[]) => void
  showToast: (message: string) => void
}) {
  const isExported = exportedProposalIds.includes(selectedLead.id)
  const milestones = ['Discovery and workflow map', 'MVP dashboard build', 'Automation and reporting layer', 'QA, launch, and handover']
  const briefText = [
    `Proposal brief for ${selectedLead.company}`,
    `${selectedLead.company} needs a focused ${selectedLead.serviceType.toLowerCase()} with clear scope, fast delivery, and a build plan that avoids unclear v1/v2 boundaries.`,
    'Recommended scope: Start with the workflow that produces revenue or saves operational time first.',
    `Suggested email: Hi ${selectedLead.name}, I recommend a phased MVP plan focused on the core workflow and clean launch path.`,
  ].join('\n\n')

  async function copyBrief() {
    await navigator.clipboard.writeText(briefText)
    showToast('Proposal brief copied')
  }

  return (
    <div className="proposal-layout">
      <LeadDetail lead={selectedLead} />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Mock AI output</p>
            <h2>Proposal brief for {selectedLead.company}</h2>
          </div>
          <div className="proposal-actions">
            <button className="ghost-button" type="button" onClick={copyBrief}>
              <Clipboard size={16} /> Copy
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                if (!isExported) {
                  setExportedProposalIds([...exportedProposalIds, selectedLead.id])
                }
                showToast('Proposal export prepared')
              }}
            >
              {isExported ? <CheckCircle2 size={17} /> : <Download size={17} />}
              {isExported ? 'Export ready' : 'Export'}
            </button>
          </div>
        </div>
        <div className="brief-status">
          <Sparkles size={17} />
          <span>Generated from lead score, scope clarity, risk level, budget, and timeline.</span>
        </div>
        <div className="proposal">
          <Block
            title="Problem summary"
            text={`${selectedLead.company} needs a focused ${selectedLead.serviceType.toLowerCase()} with clear scope, fast delivery, and a build plan that avoids unclear v1/v2 boundaries.`}
          />
          <Block
            title="Recommended scope"
            text="Start with the workflow that produces revenue or saves operational time first. Move integrations, advanced permissions, and notification automation into v2 unless they are launch-critical."
          />
          <div className="milestones">
            {milestones.map((item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
          <Block
            title="Assumptions and exclusions"
            text="Client provides brand assets, sample data, admin workflow rules, and decision-maker availability. Real payment, email, and calendar integrations are scoped after MVP validation."
          />
          <Block
            title="Suggested next email"
            text={`Hi ${selectedLead.name}, based on your goals, I recommend a phased MVP plan. The first phase will focus on the core workflow, measurable outcome, and clean launch path before adding advanced integrations.`}
          />
        </div>
      </section>
    </div>
  )
}
