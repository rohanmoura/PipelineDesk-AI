import { AlertCircle, Bell, CalendarPlus, CheckCircle2, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../components/common'
import { team } from '../data'
import type { Task } from '../types'
import { ownerName } from '../utils'

export function FollowUpsView({
  canEdit,
  completedTasks,
  completionNotes,
  setCompletedTasks,
  setCompletionNotes,
  setTaskSchedule,
  showToast,
  taskSchedule,
  tasks,
}: {
  canEdit: boolean
  completedTasks: string[]
  completionNotes: Record<string, string>
  setCompletedTasks: (tasks: string[]) => void
  setCompletionNotes: (notes: Record<string, string>) => void
  setTaskSchedule: (schedule: Record<string, string>) => void
  showToast: (message: string) => void
  taskSchedule: Record<string, string>
  tasks: Task[]
}) {
  const [completionDrafts, setCompletionDrafts] = useState<Record<string, string>>({})
  const [dateDrafts, setDateDrafts] = useState<Record<string, string>>({})
  const today = '2026-06-03'
  const isDone = (task: Task) => completedTasks.includes(task.id)
  const taskDate = (task: Task) => taskSchedule[task.id] ?? task.dueDate
  const openTasks = tasks.filter((task) => !isDone(task))
  const overdueTasks = openTasks.filter((task) => task.status === 'Overdue' || taskDate(task) < today)
  const todayTasks = openTasks.filter((task) => task.status !== 'Overdue' && taskDate(task) === today)
  const upcomingTasks = openTasks.filter((task) => task.status !== 'Overdue' && taskDate(task) > today)
  const doneTasks = tasks.filter((task) => isDone(task))

  function completeTask(taskId: string, title: string) {
    const note = completionDrafts[taskId]?.trim()
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId])
    }
    if (note) {
      setCompletionNotes({ ...completionNotes, [taskId]: note })
    }
    showToast(`${title} completed`)
  }

  function scheduleTomorrow(taskId: string, title: string) {
    setTaskSchedule({ ...taskSchedule, [taskId]: '2026-06-04' })
    showToast(`${title} scheduled for tomorrow`)
  }

  function scheduleCustomDate(taskId: string, title: string) {
    const date = dateDrafts[taskId]
    if (!date) {
      showToast('Choose a follow-up date first')
      return
    }
    setTaskSchedule({ ...taskSchedule, [taskId]: date })
    showToast(`${title} scheduled for ${date}`)
  }

  function updateCompletionDraft(taskId: string, value: string) {
    setCompletionDrafts({ ...completionDrafts, [taskId]: value })
  }

  function updateDateDraft(taskId: string, value: string) {
    setDateDrafts({ ...dateDrafts, [taskId]: value })
  }

  return (
    <div className="followup-grid">
      <section className="panel followup-summary">
        <div>
          <p className="eyebrow">Follow-up center</p>
          <h2>{openTasks.length} open tasks</h2>
          <p>Work overdue items first, clear today's queue, schedule the next touch, and capture what happened.</p>
        </div>
        <div className="followup-stats">
          <span><strong>{overdueTasks.length}</strong> overdue</span>
          <span><strong>{todayTasks.length}</strong> today</span>
          <span><strong>{upcomingTasks.length}</strong> upcoming</span>
          <span><strong>{Object.keys(taskSchedule).length}</strong> scheduled</span>
          <span><strong>{doneTasks.length}</strong> done</span>
        </div>
      </section>

      <TaskSection
        badgeTone="red"
        canEdit={canEdit}
        completionDrafts={completionDrafts}
        completionNotes={completionNotes}
        dateDrafts={dateDrafts}
        emptyText="No overdue follow-ups. Good rhythm."
        icon="overdue"
        onComplete={completeTask}
        onScheduleCustomDate={scheduleCustomDate}
        onScheduleTomorrow={scheduleTomorrow}
        onUpdateCompletionDraft={updateCompletionDraft}
        onUpdateDateDraft={updateDateDraft}
        taskDate={taskDate}
        tasks={overdueTasks}
        title="Overdue"
      />
      <TaskSection
        badgeTone="amber"
        canEdit={canEdit}
        completionDrafts={completionDrafts}
        completionNotes={completionNotes}
        dateDrafts={dateDrafts}
        emptyText="Today's queue is clear."
        icon="today"
        onComplete={completeTask}
        onScheduleCustomDate={scheduleCustomDate}
        onScheduleTomorrow={scheduleTomorrow}
        onUpdateCompletionDraft={updateCompletionDraft}
        onUpdateDateDraft={updateDateDraft}
        taskDate={taskDate}
        tasks={todayTasks}
        title="Today"
      />
      <TaskSection
        badgeTone="blue"
        canEdit={canEdit}
        completionDrafts={completionDrafts}
        completionNotes={completionNotes}
        dateDrafts={dateDrafts}
        emptyText="No upcoming work scheduled."
        icon="upcoming"
        onComplete={completeTask}
        onScheduleCustomDate={scheduleCustomDate}
        onScheduleTomorrow={scheduleTomorrow}
        onUpdateCompletionDraft={updateCompletionDraft}
        onUpdateDateDraft={updateDateDraft}
        taskDate={taskDate}
        tasks={upcomingTasks}
        title="Upcoming"
      />
      <TaskSection
        badgeTone="green"
        canEdit={canEdit}
        completionDrafts={completionDrafts}
        completionNotes={completionNotes}
        dateDrafts={dateDrafts}
        emptyText="No completed follow-ups yet."
        icon="done"
        isCompletedSection
        onComplete={completeTask}
        onScheduleCustomDate={scheduleCustomDate}
        onScheduleTomorrow={scheduleTomorrow}
        onUpdateCompletionDraft={updateCompletionDraft}
        onUpdateDateDraft={updateDateDraft}
        taskDate={taskDate}
        tasks={doneTasks}
        title="Completed"
      />
    </div>
  )
}

function TaskSection({
  badgeTone,
  canEdit,
  completionDrafts,
  completionNotes,
  dateDrafts,
  emptyText,
  icon,
  isCompletedSection = false,
  onComplete,
  onScheduleCustomDate,
  onScheduleTomorrow,
  onUpdateCompletionDraft,
  onUpdateDateDraft,
  taskDate,
  tasks,
  title,
}: {
  badgeTone: string
  canEdit: boolean
  completionDrafts: Record<string, string>
  completionNotes: Record<string, string>
  dateDrafts: Record<string, string>
  emptyText: string
  icon: 'overdue' | 'today' | 'upcoming' | 'done'
  isCompletedSection?: boolean
  onComplete: (taskId: string, title: string) => void
  onScheduleCustomDate: (taskId: string, title: string) => void
  onScheduleTomorrow: (taskId: string, title: string) => void
  onUpdateCompletionDraft: (taskId: string, value: string) => void
  onUpdateDateDraft: (taskId: string, value: string) => void
  taskDate: (task: Task) => string
  tasks: Task[]
  title: string
}) {
  const Icon = icon === 'overdue' ? AlertCircle : icon === 'done' ? CheckCircle2 : icon === 'upcoming' ? Clock3 : Bell
  return (
    <section className="panel followup-section">
      <div className="panel-heading compact">
        <h2>{title}</h2>
        <span className={`badge ${badgeTone}`}>{tasks.length} tasks</span>
      </div>
      {tasks.length === 0 ? <EmptyState title={emptyText} compact /> : (
        <div className="task-list">
          {tasks.map((task) => (
            <article className={isCompletedSection ? 'task done' : 'task'} key={task.id}>
              <div>
                <Icon size={20} />
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.relatedType} {task.relatedId} · {ownerName(team, task.ownerId)} · {task.priority} priority</p>
                  <small>{isCompletedSection ? 'Completed' : `Due ${taskDate(task)}`}</small>
                  {completionNotes[task.id] && <em>{completionNotes[task.id]}</em>}
                </div>
              </div>
              <span className={`badge ${badgeTone}`}>{isCompletedSection ? 'Completed' : taskDate(task)}</span>
              {!isCompletedSection && (
                <div className="task-workflow">
                  <label>
                    <span>Next date</span>
                    <input disabled={!canEdit} type="date" value={dateDrafts[task.id] ?? ''} onChange={(event) => onUpdateDateDraft(task.id, event.target.value)} />
                  </label>
                  <textarea
                    disabled={!canEdit}
                    value={completionDrafts[task.id] ?? ''}
                    onChange={(event) => onUpdateCompletionDraft(task.id, event.target.value)}
                    placeholder="Completion note"
                    rows={2}
                  />
                  <div className="task-actions">
                    <button type="button" disabled={!canEdit} onClick={() => onScheduleTomorrow(task.id, task.title)}>
                      <CalendarPlus size={15} /> Tomorrow
                    </button>
                    <button type="button" disabled={!canEdit} onClick={() => onScheduleCustomDate(task.id, task.title)}>
                      Schedule
                    </button>
                    <button type="button" disabled={!canEdit} onClick={() => onComplete(task.id, task.title)}>
                      Complete
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
