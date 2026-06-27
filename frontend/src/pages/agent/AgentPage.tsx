import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Clock, Play, Pause, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/store/ui.store'

interface AgentTask {
  id: string
  time: string
  label: string
  description: string
  enabled: boolean
  lastRun: string | null
}

const INITIAL_TASKS: AgentTask[] = [
  { id: 'alarm',    time: '5:00 AM',  label: 'Class 10 Alarm Calls',       description: 'Wake-up calls for Class 10 students with exam schedule', enabled: true,  lastRun: 'Today 5:02 AM' },
  { id: 'bus_am',   time: '7:00 AM',  label: 'Morning Bus GPS Alert',       description: 'Send bus live location link to all parents via SMS',       enabled: true,  lastRun: 'Today 7:01 AM' },
  { id: 'absence',  time: '9:00 AM',  label: 'Absence Calls',               description: 'Auto-call parents of all absent students',                 enabled: true,  lastRun: 'Today 9:03 AM' },
  { id: 'fee',      time: '11:00 AM', label: 'Fee Reminder Calls',           description: 'Call parents with pending or overdue fees',                enabled: false, lastRun: null },
  { id: 'bus_pm',   time: '4:30 PM',  label: 'Evening Bus GPS Alert',       description: 'Send bus live location link to all parents',               enabled: true,  lastRun: null },
  { id: 'report',   time: '6:00 PM',  label: 'Daily Report SMS to Principal', description: 'Send attendance + fee summary SMS to principal',          enabled: true,  lastRun: null },
]

export function AgentPage() {
  const toast = useToast()
  const [masterOn, setMasterOn] = useState(true)
  const [tasks, setTasks] = useState<AgentTask[]>(INITIAL_TASKS)

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const next = { ...t, enabled: !t.enabled }
        toast.info(next.enabled ? 'Task enabled' : 'Task disabled', next.label)
        return next
      }),
    )
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Master toggle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card p-5 flex items-center justify-between transition-colors ${
          masterOn ? 'border-2 border-success/30 bg-success/5' : 'border-2 border-black/8'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-card ${masterOn ? 'bg-success/10' : 'bg-cream-400'}`}>
            <Bot className={`h-6 w-6 ${masterOn ? 'text-success' : 'text-ink-3'}`} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-0">Auto Agent</h3>
            <p className="text-xs text-ink-3">
              {masterOn ? (
                <span className="flex items-center gap-1 text-success">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  Running · {tasks.filter((t) => t.enabled).length} tasks active
                </span>
              ) : 'All automation paused'}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setMasterOn((v) => !v); toast.info(masterOn ? 'Agent paused' : 'Agent started') }}
          className={`flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium transition-all ${
            masterOn
              ? 'bg-danger/10 text-danger hover:bg-danger/20'
              : 'bg-success/10 text-success hover:bg-success/20'
          }`}
        >
          {masterOn ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
        </button>
      </motion.div>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`flex items-center gap-4 ${!masterOn || !task.enabled ? 'opacity-60' : ''}`}>
              <div className="text-center w-16 shrink-0">
                <p className="text-xs font-bold text-gold">{task.time}</p>
                <Clock className="h-3.5 w-3.5 text-ink-3 mx-auto mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-0">{task.label}</p>
                <p className="text-xs text-ink-3 mt-0.5">{task.description}</p>
                {task.lastRun && (
                  <p className="text-xs text-success mt-0.5 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Last run: {task.lastRun}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {task.enabled && masterOn ? (
                  <Badge variant="green" dot>Active</Badge>
                ) : (
                  <Badge variant="gray" dot>Off</Badge>
                )}
                <button
                  onClick={() => toggleTask(task.id)}
                  disabled={!masterOn}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-40 ${
                    task.enabled ? 'bg-gold' : 'bg-cream-400'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${task.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-ink-3 text-center">
        Tasks are executed server-side via Vercel Cron Jobs — they run even when the browser is closed
      </p>
    </div>
  )
}
