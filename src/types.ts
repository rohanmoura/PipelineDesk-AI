export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted'
export type DealStage = 'New Lead' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost'
export type ProposalStatus = 'Not started' | 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected'
export type TaskStatus = 'Open' | 'Completed' | 'Overdue'
export type Priority = 'High' | 'Medium' | 'Low'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type DemoRole = 'Owner' | 'Team member' | 'Viewer'

export type TeamMember = {
  id: string
  name: string
  role: 'Owner' | 'Product strategist' | 'Developer' | 'Viewer'
  email: string
}

export type Lead = {
  id: string
  name: string
  email: string
  company: string
  source: string
  serviceType: string
  budgetRange: string
  estimatedValue: number
  timeline: string
  projectSummary: string
  status: LeadStatus
  qualityScore: number
  riskLevel: RiskLevel
  ownerId: string
  nextFollowUpDate: string
  lastContactDate: string
  createdAt: string
}

export type Deal = {
  id: string
  leadId: string
  title: string
  stage: DealStage
  value: number
  probability: number
  proposalStatus: ProposalStatus
  expectedCloseDate: string
  ownerId: string
  notes: string
  updatedAt: string
}

export type Task = {
  id: string
  relatedType: 'Lead' | 'Deal' | 'Client'
  relatedId: string
  title: string
  dueDate: string
  priority: Priority
  status: TaskStatus
  ownerId: string
}

export type Client = {
  id: string
  name: string
  company: string
  email: string
  status: 'Active' | 'Onboarding' | 'Past' | 'At risk'
  totalRevenue: number
  activeProjects: number
  ownerId: string
}

export type Activity = {
  id: string
  relatedId: string
  message: string
  actor: string
  createdAt: string
}
