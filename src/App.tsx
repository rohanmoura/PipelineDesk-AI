import { useEffect, useMemo, useState } from 'react'
import { AppLayout } from './layout/AppLayout'
import { clients, leads as initialLeads, tasks, deals as initialDeals, team } from './data'
import { getMetrics } from './utils'
import { type ViewName, viewFromHash, viewToHash } from './constants'
import type { Deal, DemoRole, Lead, LeadNote, Task } from './types'
import { Toast } from './components/Toast'
import { usePersistentState } from './hooks/usePersistentState'
import { AdminView } from './views/AdminView'
import { AnalyticsView } from './views/AnalyticsView'
import { FollowUpsView } from './views/FollowUpsView'
import { HandoffView } from './views/HandoffView'
import { ClientsView } from './views/ClientsView'
import { IntegrationsView } from './views/IntegrationsView'
import { LeadsView } from './views/LeadsView'
import { OverviewView } from './views/OverviewView'
import { PipelineView } from './views/PipelineView'
import { ProposalView } from './views/ProposalView'

export function App() {
  const [activeView, setActiveView] = useState<ViewName>(() => viewFromHash(window.location.hash))
  const [leads, setLeads] = usePersistentState<Lead[]>('pipelinedesk:leads', initialLeads)
  const [deals, setDeals] = usePersistentState<Deal[]>('pipelinedesk:deals', initialDeals)
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('All')
  const [service, setService] = useState('All')
  const [budget, setBudget] = useState('All')
  const [status, setStatus] = useState('All')
  const [owner, setOwner] = useState('All')
  const [selectedLeadId, setSelectedLeadId] = useState('lead-1')
  const [role, setRole] = usePersistentState<DemoRole>('pipelinedesk:role', 'Owner')
  const [isExporting, setIsExporting] = useState(false)
  const [customTasks, setCustomTasks] = usePersistentState<Task[]>('pipelinedesk:customTasks', [])
  const [leadNotes, setLeadNotes] = usePersistentState<LeadNote[]>('pipelinedesk:leadNotes', [])
  const [completedTasks, setCompletedTasks] = usePersistentState<string[]>('pipelinedesk:completedTasks', [])
  const [completionNotes, setCompletionNotes] = usePersistentState<Record<string, string>>('pipelinedesk:completionNotes', {})
  const [taskSchedule, setTaskSchedule] = usePersistentState<Record<string, string>>('pipelinedesk:taskSchedule', {})
  const [handoffChecks, setHandoffChecks] = usePersistentState<string[]>('pipelinedesk:handoffChecks', ['Kickoff call booked', 'Admin access collected', 'Brand assets received'])
  const [exportedProposalIds, setExportedProposalIds] = usePersistentState<string[]>('pipelinedesk:exportedProposals', [])
  const [toast, setToast] = useState('')

  useEffect(() => {
    const onHashChange = () => setActiveView(viewFromHash(window.location.hash))
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', '#settings')
    }
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [])

  function navigateToView(view: ViewName) {
    setActiveView(view)
    const nextHash = `#${viewToHash[view]}`
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash)
    }
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function exportReport() {
    if (role === 'Viewer') {
      showToast('Viewer role can inspect reports, but export is locked')
      return
    }
    setIsExporting(true)
    window.setTimeout(() => {
      setIsExporting(false)
      showToast('Pipeline report exported')
    }, 900)
  }

  function createLead(lead: Lead) {
    setLeads((current) => [lead, ...current])
    setSelectedLeadId(lead.id)
    navigateToView('Leads')
    showToast(`${lead.company} added to lead queue`)
  }

  function updateLeadOwner(leadId: string, ownerId: string) {
    setLeads((current) => current.map((lead) => lead.id === leadId ? { ...lead, ownerId } : lead))
    showToast('Lead owner updated')
  }

  function addLeadNote(leadId: string, message: string) {
    setLeadNotes([{ id: `note-${Date.now()}`, leadId, message, createdAt: 'Today' }, ...leadNotes])
    showToast('Lead note added')
  }

  function addLeadFollowUp(lead: Lead) {
    const task: Task = {
      id: `task-${Date.now()}`,
      relatedType: 'Lead',
      relatedId: lead.id,
      title: `Follow up with ${lead.company}`,
      dueDate: '2026-06-04',
      priority: lead.riskLevel === 'High' ? 'High' : 'Medium',
      status: 'Open',
      ownerId: lead.ownerId,
    }
    setCustomTasks([task, ...customTasks])
    showToast(`Follow-up created for ${lead.company}`)
  }

  function convertLeadToDeal(lead: Lead) {
    if (deals.some((deal) => deal.leadId === lead.id)) {
      showToast(`${lead.company} already has a deal`)
      navigateToView('Pipeline')
      return
    }
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      leadId: lead.id,
      title: `${lead.company} ${lead.serviceType}`,
      stage: lead.qualityScore >= 80 ? 'Qualified' : 'New Lead',
      value: lead.estimatedValue,
      probability: Math.min(.85, Math.max(.25, lead.qualityScore / 100)),
      proposalStatus: 'Not started',
      expectedCloseDate: lead.nextFollowUpDate,
      ownerId: lead.ownerId,
      notes: aiDealNote(lead),
      updatedAt: '2026-06-03',
    }
    setDeals([newDeal, ...deals])
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: 'Converted' } : item))
    showToast(`${lead.company} converted to pipeline deal`)
    navigateToView('Pipeline')
  }

  function resetDemoData() {
    setLeads(initialLeads)
    setDeals(initialDeals)
    setCompletedTasks([])
    setCompletionNotes({})
    setTaskSchedule({})
    setCustomTasks([])
    setLeadNotes([])
    setHandoffChecks(['Kickoff call booked', 'Admin access collected', 'Brand assets received'])
    setExportedProposalIds([])
    setSelectedLeadId('lead-1')
    navigateToView('Overview')
    showToast('Demo data reset')
  }

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0]
  const allTasks = [...customTasks, ...tasks]
  const openTasks = allTasks.filter((task) => task.status !== 'Completed' && !completedTasks.includes(task.id))
  const metrics = getMetrics(deals, openTasks.filter((task) => task.dueDate <= '2026-06-03').length)
  const canEdit = role !== 'Viewer'
  const canManageSettings = role === 'Owner'

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesQuery = `${lead.name} ${lead.company} ${lead.serviceType}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesSource = source === 'All' || lead.source === source
      const matchesService = service === 'All' || lead.serviceType === service
      const matchesBudget = budget === 'All' || lead.budgetRange === budget
      const matchesStatus = status === 'All' || lead.status === status
      const matchesOwner = owner === 'All' || lead.ownerId === owner
      return matchesQuery && matchesSource && matchesService && matchesBudget && matchesStatus && matchesOwner
    })
  }, [budget, owner, query, source, service, status])

  const sources = ['All', ...Array.from(new Set(leads.map((lead) => lead.source)))]
  const services = ['All', ...Array.from(new Set(leads.map((lead) => lead.serviceType)))]
  const budgets = ['All', ...Array.from(new Set(leads.map((lead) => lead.budgetRange)))]
  const statuses = ['All', ...Array.from(new Set(leads.map((lead) => lead.status)))]

  return (
    <AppLayout
      activeView={activeView}
      isExporting={isExporting}
      metrics={metrics}
      onExportReport={exportReport}
      role={role}
      setActiveView={navigateToView}
    >
      <Toast message={toast} />
      {activeView === 'Overview' && <OverviewView setActiveView={navigateToView} />}
      {activeView === 'Leads' && (
        <LeadsView
          canEdit={canEdit}
          filteredLeads={filteredLeads}
          budget={budget}
          setBudget={setBudget}
          query={query}
          setQuery={setQuery}
          owner={owner}
          setOwner={setOwner}
          source={source}
          setSource={setSource}
          service={service}
          setService={setService}
          status={status}
          setStatus={setStatus}
          budgets={budgets}
          owners={team}
          sources={sources}
          services={services}
          statuses={statuses}
          selectedLead={selectedLead}
          setSelectedLeadId={setSelectedLeadId}
          onCreateLead={createLead}
          onAddFollowUp={addLeadFollowUp}
          onAddNote={addLeadNote}
          onConvertToDeal={convertLeadToDeal}
          onUpdateOwner={updateLeadOwner}
          selectedLeadNotes={leadNotes.filter((note) => note.leadId === selectedLead.id)}
        />
      )}
      {activeView === 'Pipeline' && <PipelineView canEdit={canEdit} deals={deals} leads={leads} setDeals={setDeals} showToast={showToast} />}
      {activeView === 'Proposal AI' && (
        <ProposalView
          exportedProposalIds={exportedProposalIds}
          selectedLead={selectedLead}
          setExportedProposalIds={setExportedProposalIds}
          showToast={showToast}
        />
      )}
      {activeView === 'Follow-ups' && (
        <FollowUpsView
          completedTasks={completedTasks}
          completionNotes={completionNotes}
          canEdit={canEdit}
          setCompletedTasks={setCompletedTasks}
          setCompletionNotes={setCompletionNotes}
          setTaskSchedule={setTaskSchedule}
          showToast={showToast}
          taskSchedule={taskSchedule}
          tasks={allTasks}
        />
      )}
      {activeView === 'Handoff' && (
        <HandoffView canEdit={canEdit} deals={deals} handoffChecks={handoffChecks} leads={leads} setHandoffChecks={setHandoffChecks} />
      )}
      {activeView === 'Clients' && <ClientsView clients={clients} deals={deals} leads={leads} showToast={showToast} />}
      {activeView === 'Integrations' && <IntegrationsView canEdit={canEdit} showToast={showToast} />}
      {activeView === 'Analytics' && <AnalyticsView deals={deals} leads={leads} showToast={showToast} />}
      {activeView === 'Settings' && <AdminView canManageSettings={canManageSettings} onResetDemo={resetDemoData} role={role} setRole={setRole} showToast={showToast} />}
    </AppLayout>
  )
}

function aiDealNote(lead: Lead) {
  if (lead.riskLevel === 'High') return 'Converted with caution. Needs paid discovery and tighter scope before proposal.'
  if (lead.qualityScore >= 85) return 'High-fit lead converted from qualification flow. Prepare scoped proposal next.'
  return 'Converted from lead intake. Needs discovery notes before proposal is sent.'
}
