import { AlertTriangle, ClipboardList, Loader2 } from 'lucide-react'

export function Metric({
  title,
  value,
  caption,
  tone = 'neutral',
}: {
  title: string
  value: string
  caption: string
  tone?: string
}) {
  return (
    <article className={`metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  )
}

export function Block({ title, text }: { title: string; text: string }) {
  return (
    <div className="brief-block">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

export function EmptyState({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className={compact ? 'empty compact-empty' : 'empty'}>
      <ClipboardList size={compact ? 18 : 26} />
      <p>{title}</p>
    </div>
  )
}

export function StateNotice({
  title,
  text,
  tone = 'info',
}: {
  title: string
  text: string
  tone?: 'info' | 'warning' | 'error' | 'success'
}) {
  return (
    <div className={`state-notice ${tone}`}>
      <AlertTriangle size={18} />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

export function LoadingState({ title }: { title: string }) {
  return (
    <div className="loading-state">
      <Loader2 size={20} />
      <strong>{title}</strong>
    </div>
  )
}
