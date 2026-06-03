import type { Deal, Lead, TeamMember } from './types'

export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function ownerName(team: TeamMember[], ownerId: string) {
  return team.find((member) => member.id === ownerId)?.name ?? 'Unassigned'
}

export function leadForDeal(leads: Lead[], deal: Deal) {
  return leads.find((lead) => lead.id === deal.leadId)
}

export function getMetrics(deals: Deal[], tasksCount: number) {
  const openDeals = deals.filter((deal) => !['Won', 'Lost'].includes(deal.stage))
  const wonDeals = deals.filter((deal) => deal.stage === 'Won')
  const lostDeals = deals.filter((deal) => deal.stage === 'Lost')
  const closedDeals = wonDeals.length + lostDeals.length
  const wonRevenue = wonDeals.reduce((total, deal) => total + deal.value, 0)

  return {
    pipelineValue: openDeals.reduce((total, deal) => total + deal.value, 0),
    forecast: openDeals.reduce((total, deal) => total + deal.value * deal.probability, 0),
    openDeals: openDeals.length,
    wonRevenue,
    closeRate: closedDeals === 0 ? 34 : Math.round((wonDeals.length / closedDeals) * 100),
    followUpsDue: tasksCount,
  }
}

export function scoreTone(score: number) {
  if (score >= 85) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}

export function aiRecommendation(lead: Lead) {
  if (lead.qualityScore >= 90) {
    return 'High-fit opportunity. Move quickly with a scoped MVP proposal and two phased pricing options.'
  }
  if (lead.qualityScore >= 75) {
    return 'Good opportunity. Confirm decision criteria, timeline pressure, and must-have scope before pricing.'
  }
  return 'Needs qualification. Offer paid discovery before committing to a build estimate.'
}
