import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  PlugZap,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import type { DealStage } from './types'

export const stages: DealStage[] = ['New Lead', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost']

export const navItems = [
  ['Overview', LayoutDashboard],
  ['Leads', Users],
  ['Pipeline', BriefcaseBusiness],
  ['Follow-ups', ListChecks],
  ['Proposal AI', Sparkles],
  ['Handoff', ClipboardList],
  ['Clients', Building2],
  ['Integrations', PlugZap],
  ['Analytics', BarChart3],
  ['Settings', Settings],
] as const

export type ViewName = (typeof navItems)[number][0]

export const viewToHash: Record<ViewName, string> = {
  Overview: 'overview',
  Leads: 'leads',
  Pipeline: 'pipeline',
  'Follow-ups': 'follow-ups',
  'Proposal AI': 'proposal-ai',
  Handoff: 'handoff',
  Clients: 'clients',
  Integrations: 'integrations',
  Analytics: 'analytics',
  Settings: 'settings',
}

export function viewFromHash(hash: string): ViewName {
  const cleanHash = hash.replace(/^#/, '')
  if (cleanHash === 'admin') return 'Settings'
  const match = (Object.entries(viewToHash) as Array<[ViewName, string]>).find(([, value]) => value === cleanHash)
  return match?.[0] ?? 'Overview'
}
