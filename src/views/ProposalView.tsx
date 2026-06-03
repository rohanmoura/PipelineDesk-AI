import { AlertTriangle, CheckCircle2, Clipboard, Download, RefreshCw, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Block } from '../components/common'
import { team } from '../data'
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
  const [generationState, setGenerationState] = useState<'ready' | 'generating' | 'error'>('ready')
  const isExported = exportedProposalIds.includes(selectedLead.id)
  const brief = useMemo(() => buildBrief(selectedLead), [selectedLead])
  const briefText = [
    `Proposal brief for ${selectedLead.company}`,
    `Package: ${brief.packageName}`,
    `Problem: ${brief.problem}`,
    `Scope: ${brief.scope}`,
    `Features: ${brief.features.join(', ')}`,
    `Milestones: ${brief.milestones.join(' -> ')}`,
    `Assumptions: ${brief.assumptions}`,
    `Exclusions: ${brief.exclusions}`,
    `Risks: ${brief.risks}`,
    `Suggested email: ${brief.email}`,
  ].join('\n\n')

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(briefText)
      showToast('Proposal brief copied')
    } catch {
      showToast('Copy blocked by browser, export is ready')
    }
  }

  function generateBrief() {
    setGenerationState('generating')
    window.setTimeout(() => {
      setGenerationState('ready')
      showToast(`Proposal brief regenerated for ${selectedLead.company}`)
    }, 900)
  }

  function simulateFailure() {
    setGenerationState('error')
    showToast('Proposal generation failed. Check scope inputs and retry.')
  }

  function exportBrief() {
    const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedLead.company.replace(/\s+/g, '-').toLowerCase()}-proposal-brief.txt`
    link.click()
    URL.revokeObjectURL(url)
    if (!isExported) {
      setExportedProposalIds([...exportedProposalIds, selectedLead.id])
    }
    showToast('Proposal brief exported')
  }

  return (
    <div className="proposal-layout">
      <LeadDetail
        canEdit={false}
        lead={selectedLead}
        notes={[]}
        onAddFollowUp={() => showToast('Open Leads to create a follow-up')}
        onAddNote={() => showToast('Open Leads to add discovery notes')}
        onConvertToDeal={() => showToast('Open Leads to convert this lead')}
        onUpdateOwner={() => showToast('Open Leads to update owner')}
        owners={team}
      />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Proposal AI workspace</p>
            <h2>Proposal brief for {selectedLead.company}</h2>
          </div>
          <div className="proposal-actions">
            <button className="ghost-button" type="button" onClick={generateBrief} disabled={generationState === 'generating'}>
              <RefreshCw size={16} /> {generationState === 'generating' ? 'Generating...' : 'Generate'}
            </button>
            <button className="ghost-button" type="button" onClick={copyBrief}>
              <Clipboard size={16} /> Copy
            </button>
            <button className="primary-button" type="button" onClick={exportBrief}>
              {isExported ? <CheckCircle2 size={17} /> : <Download size={17} />}
              {isExported ? 'Export ready' : 'Export'}
            </button>
          </div>
        </div>
        <div className={generationState === 'error' ? 'brief-status error' : 'brief-status'}>
          {generationState === 'error' ? <AlertTriangle size={17} /> : <Sparkles size={17} />}
          <span>
            {generationState === 'generating' && 'Generating proposal sections from lead score, budget, timeline, scope clarity, and risk level.'}
            {generationState === 'ready' && 'Generated from lead score, scope clarity, risk level, budget, and timeline.'}
            {generationState === 'error' && 'Generation failed in demo mode. Retry after checking scope details.'}
          </span>
          {generationState === 'error' && <button type="button" onClick={generateBrief}>Retry</button>}
        </div>
        <div className="proposal-control-strip">
          <span className="badge blue">{brief.packageName}</span>
          <span className={`badge ${selectedLead.riskLevel === 'High' ? 'red' : selectedLead.riskLevel === 'Medium' ? 'amber' : 'green'}`}>{selectedLead.riskLevel} risk</span>
          <span className="badge green">{selectedLead.timeline}</span>
          <button className="danger-button" type="button" onClick={simulateFailure}>
            <AlertTriangle size={16} /> Simulate failure
          </button>
        </div>
        {generationState === 'generating' ? (
          <div className="proposal-loading">
          <Sparkles size={17} />
            <strong>Drafting scope, milestones, risks, and next email...</strong>
          </div>
        ) : (
          <div className="proposal">
          <Block
            title="Problem summary"
            text={brief.problem}
          />
          <Block
            title="Recommended scope"
            text={brief.scope}
          />
            <div className="feature-grid">
              {brief.features.map((feature) => (
                <span key={feature}><CheckCircle2 size={16} />{feature}</span>
              ))}
            </div>
          <div className="milestones">
              {brief.milestones.map((item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
          <Block
            title="Assumptions and exclusions"
              text={`${brief.assumptions} Exclusions: ${brief.exclusions}`}
          />
          <Block
            title="Risk notes"
              text={brief.risks}
          />
          <Block
            title="Suggested next email"
              text={brief.email}
          />
        </div>
        )}
      </section>
    </div>
  )
}

function buildBrief(lead: Lead) {
  const packageName = lead.estimatedValue >= 12000 ? 'Growth build package' : lead.estimatedValue >= 7000 ? 'Focused MVP package' : 'Discovery-first package'
  const needsDiscovery = lead.riskLevel === 'High' || lead.timeline === 'Not clear'
  return {
    packageName,
    problem: `${lead.company} needs a focused ${lead.serviceType.toLowerCase()} with clear scope, fast delivery, and a build plan that avoids unclear v1/v2 boundaries.`,
    scope: needsDiscovery
      ? 'Start with a paid discovery sprint before build commitment. Validate workflow, decision maker, sample data, and launch constraints before quoting the full MVP.'
      : 'Start with the workflow that produces revenue or saves operational time first. Move integrations, advanced permissions, and notification automation into v2 unless they are launch-critical.',
    features: [
      'Role-aware dashboard',
      'Core workflow screens',
      'Actionable reports',
      'Admin configuration',
      'Launch handoff checklist',
    ],
    milestones: [
      'Discovery and workflow map',
      'MVP interface and data model',
      'Automation and reporting layer',
      'QA, launch, and handover',
    ],
    assumptions: 'Client provides brand assets, sample data, admin workflow rules, and decision-maker availability.',
    exclusions: 'Real payments, email/calendar sync, and advanced AI automations are scoped after MVP validation.',
    risks: needsDiscovery
      ? 'Budget or timeline clarity is weak. Recommend discovery-first engagement to avoid under-scoped delivery.'
      : 'Main delivery risk is scope creep. Keep v1 focused and push non-critical integrations into v2.',
    email: `Hi ${lead.name}, based on your goals, I recommend a phased MVP plan for ${lead.company}. The first phase will focus on the core workflow, measurable outcome, and clean launch path before adding advanced integrations.`,
  }
}
