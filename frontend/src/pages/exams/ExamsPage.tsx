import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, FileText, Printer, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'
import type { ExamQuestion } from '@/types'

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Telugu', 'Hindi', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
const CLASSES  = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']

export function ExamsPage() {
  const toast = useToast()
  const [subject, setSubject]   = useState('Mathematics')
  const [cls, setCls]           = useState('Class 10')
  const [difficulty, setDiff]   = useState('Medium')
  const [qType, setQType]       = useState('Mixed')
  const [language, setLang]     = useState('English')
  const [topic, setTopic]       = useState('')
  const [count, setCount]       = useState('10')
  const [loading, setLoading]   = useState(false)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])

  async function generate() {
    setLoading(true)
    setQuestions([])
    try {
      const { data } = await api.post<{ questions: ExamQuestion[] }>('/ai/exams', {
        subject, cls, difficulty, type: qType, language, topic, count: parseInt(count),
      })
      setQuestions(data.questions)
      toast.success('Exam generated', `${data.questions.length} questions ready`)
    } catch (err) {
      toast.error('Generation failed', err instanceof Error ? err.message : 'Check backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Config card */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-gold-muted rounded-btn">
            <Sparkles className="h-4 w-4 text-gold" />
          </div>
          <h3 className="text-base font-semibold text-ink-0">AI Exam Generator</h3>
          <Badge variant="gold">Powered by Gemini 2.0</Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Select label="Subject" options={SUBJECTS.map((s) => ({ value: s, label: s }))} value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Select label="Class"   options={CLASSES.map((c)  => ({ value: c, label: c }))} value={cls}     onChange={(e) => setCls(e.target.value)} />
          <Select label="Difficulty" options={['Easy', 'Medium', 'Hard', 'Mixed'].map((d) => ({ value: d, label: d }))} value={difficulty} onChange={(e) => setDiff(e.target.value)} />
          <Select label="Question Type" options={['MCQ', 'Short Answer', 'Long Answer', 'Mixed'].map((t) => ({ value: t, label: t }))} value={qType} onChange={(e) => setQType(e.target.value)} />
          <Select label="Language" options={['English', 'Telugu', 'Hindi', 'Bilingual'].map((l) => ({ value: l, label: l }))} value={language} onChange={(e) => setLang(e.target.value)} />
          <Select label="Number of Questions" options={['5', '8', '10', '12', '15'].map((n) => ({ value: n, label: n }))} value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
        <div className="mt-4">
          <Input label="Topic / Chapter (optional)" placeholder="e.g. Quadratic Equations, Photosynthesis" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="gold" onClick={generate} loading={loading} leftIcon={!loading ? <Sparkles className="h-4 w-4" /> : undefined} className="flex-1 lg:flex-none lg:w-48">
            {loading ? 'Generating…' : 'Generate Exam'}
          </Button>
          {questions.length > 0 && (
            <>
              <Button variant="outline" size="md" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print</Button>
              <Button variant="ghost" size="md" leftIcon={<Send className="h-4 w-4" />}>Publish to Parents</Button>
            </>
          )}
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <Card className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-6 w-6 text-gold animate-spin" />
          <p className="text-sm text-ink-2">Generating {count} questions for {subject} ({difficulty})…</p>
        </Card>
      )}

      {/* Questions */}
      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-0">
                {questions.length} Questions · {subject} · {cls} · {difficulty}
              </h3>
            </div>
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gold text-white text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-0">{q.question}</p>
                      {q.options && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, j) => (
                            <p key={j} className="text-sm text-ink-2 pl-2">
                              {String.fromCharCode(65 + j)}. {opt}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        <Badge variant="blue">{q.type.toUpperCase()}</Badge>
                        <span className="text-xs text-ink-3">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && questions.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="h-10 w-10 text-ink-3 mx-auto mb-3" />
          <p className="text-sm font-medium text-ink-2">Configure the options above and click Generate Exam</p>
          <p className="text-xs text-ink-3 mt-1">Uses Gemini 2.0 Flash via secure backend API</p>
        </Card>
      )}
    </div>
  )
}
