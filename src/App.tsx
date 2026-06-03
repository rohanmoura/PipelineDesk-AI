import { useEffect, useMemo, useState } from 'react'
import { AppLayout } from './layout/AppLayout'
import { leads as initialLeads, tasks, deals as initialDeals, team } from './data'
import { getMetrics } from './utils'
import { type ViewName, viewFromHash, viewToHash } from './constants'
import type { Deal, DemoRole, Lead } from './types'
import { Toast } from './components/Toast'
import { usePersistentState } from './hooks/usePersistentState'
import { AdminView } from './views/AdminView'
import { AnalyticsView } from './views/AnalyticsView'
import { FollowUpsView } from './views/FollowUpsView'
import { HandoffView } from './views/HandoffView'
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
  const [completedTasks, setCompletedTasks] = usePersistentState<string[]>('pipelinedesk:completedTasks', [])
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
      showToast('Pipeline report exported for demo')
    }, 900)
  }

  function createLead(lead: Lead) {
    setLeads((current) => [lead, ...current])
    setSelectedLeadId(lead.id)
    navigateToView('Leads')
    showToast(`${lead.company} added to lead queue`)
  }

  function resetDemoData() {
    setLeads(initialLeads)
    setDeals(initialDeals)
    setCompletedTasks([])
    setTaskSchedule({})
    setHandoffChecks(['Kickoff call booked', 'Admin access collected', 'Brand assets received'])
    setExportedProposalIds([])
    setSelectedLeadId('lead-1')
    navigateToView('Overview')
    showToast('Demo data reset')
  }

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0]
  const openTasks = tasks.filter((task) => task.status !== 'Completed' && !completedTasks.includes(task.id))
  const metrics = getMetrics(deals, openTasks.filter((task) => task.dueDate <= '2026-06-03').length)

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
        />
      )}
      {activeView === 'Pipeline' && <PipelineView deals={deals} setDeals={setDeals} showToast={showToast} />}
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
          setCompletedTasks={setCompletedTasks}
          setTaskSchedule={setTaskSchedule}
          showToast={showToast}
          taskSchedule={taskSchedule}
        />
      )}
      {activeView === 'Handoff' && (
        <HandoffView handoffChecks={handoffChecks} setHandoffChecks={setHandoffChecks} />
      )}
      {activeView === 'Analytics' && <AnalyticsView deals={deals} />}
      {activeView === 'Settings' && <AdminView onResetDemo={resetDemoData} role={role} setRole={setRole} />}
    </AppLayout>
  )
}
