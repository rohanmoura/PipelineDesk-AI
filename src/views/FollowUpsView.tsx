import { AlertCircle, Bell, CalendarPlus, CheckCircle2 } from 'lucide-react'
import { tasks, team } from '../data'
import { ownerName } from '../utils'

export function FollowUpsView({
  completedTasks,
  setCompletedTasks,
  setTaskSchedule,
  showToast,
  taskSchedule,
}: {
  completedTasks: string[]
  setCompletedTasks: (tasks: string[]) => void
  setTaskSchedule: (schedule: Record<string, string>) => void
  showToast: (message: string) => void
  taskSchedule: Record<string, string>
}) {
  function completeTask(taskId: string, title: string) {
    setCompletedTasks([...completedTasks, taskId])
    showToast(`${title} completed`)
  }

  function scheduleTomorrow(taskId: string, title: string) {
    setTaskSchedule({ ...taskSchedule, [taskId]: '2026-06-04' })
    showToast(`${title} scheduled for tomorrow`)
  }

  return (
    <div className="followup-grid">
      <section className="panel followup-summary">
        <div>
          <p className="eyebrow">Follow-up center</p>
          <h2>{tasks.length - completedTasks.length} open tasks</h2>
          <p>Keep warm leads moving with a clear daily queue, scheduling, and completion state.</p>
        </div>
        <div className="followup-stats">
          <span><strong>{tasks.filter((task) => task.status === 'Overdue').length}</strong> overdue</span>
          <span><strong>{Object.keys(taskSchedule).length}</strong> scheduled</span>
          <span><strong>{completedTasks.length}</strong> done</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading compact">
          <h2>Prioritized work queue</h2>
          <span className="badge amber">{tasks.length - completedTasks.length} open</span>
        </div>
        <div className="task-list">
          {tasks.map((task) => {
            const done = completedTasks.includes(task.id)
            const scheduledDate = taskSchedule[task.id]
            return (
              <article className={done ? 'task done' : 'task'} key={task.id}>
                <div>
                  {done ? <CheckCircle2 size={20} /> : task.status === 'Overdue' ? <AlertCircle size={20} /> : <Bell size={20} />}
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.relatedType} {task.relatedId} · {ownerName(team, task.ownerId)}</p>
                    {scheduledDate && <small>Scheduled for {scheduledDate}</small>}
                  </div>
                </div>
                <span className={`badge ${task.status === 'Overdue' ? 'red' : 'blue'}`}>{done ? 'Completed' : scheduledDate ?? task.dueDate}</span>
                <div className="task-actions">
                  <button type="button" onClick={() => scheduleTomorrow(task.id, task.title)} disabled={done}>
                    <CalendarPlus size={15} /> Tomorrow
                  </button>
                  <button type="button" onClick={() => completeTask(task.id, task.title)} disabled={done}>
                    Complete
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
