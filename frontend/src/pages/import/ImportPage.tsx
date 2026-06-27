import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Check, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/store/ui.store'

interface ParsedRow {
  name: string
  cls: string
  roll: string
  phone: string
  parent: string
  parent_email: string
}

export function ImportPage() {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)

  function parseCSV(text: string): ParsedRow[] {
    const lines = text.trim().split('\n')
    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''))
    return lines.slice(1).map((line) => {
      const vals = line.split(',').map((v) => v.trim().replace(/"/g, ''))
      const get = (keys: string[]) => {
        for (const k of keys) {
          const i = headers.indexOf(k)
          if (i >= 0) return vals[i] ?? ''
        }
        return ''
      }
      return {
        name:         get(['name', 'student name', 'student_name']),
        cls:          get(['class', 'cls', 'grade']),
        roll:         get(['roll', 'roll no', 'roll_no', 'roll number']),
        phone:        get(['phone', 'mobile', 'contact', 'parent phone']),
        parent:       get(['parent', 'parent name', 'guardian']),
        parent_email: get(['email', 'parent email', 'parent_email']),
      }
    }).filter((r) => r.name)
  }

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) { toast.error('Please upload a CSV file'); return }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setRows(parsed)
      setDone(false)
    }
    reader.readAsText(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function doImport() {
    setImporting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setImporting(false)
    setDone(true)
    toast.success('Import successful', `${rows.length} students added`)
  }

  return (
    <div className="space-y-5 animate-fadeUp max-w-3xl">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-card p-10 text-center cursor-pointer transition-all ${
          dragging ? 'border-gold bg-gold-muted' : 'border-black/15 hover:border-gold/50 hover:bg-gold-muted/50'
        }`}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
        <Upload className="h-10 w-10 text-gold mx-auto mb-3" />
        <p className="text-sm font-semibold text-ink-1">Drop your CSV file here</p>
        <p className="text-xs text-ink-3 mt-1">or click to browse · Columns: name, class, roll, phone, parent, email</p>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {rows.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card padding="none">
              <div className="px-5 py-4 flex items-center justify-between border-b border-black/8">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-ink-3" />
                  <span className="text-sm font-medium text-ink-0">{fileName}</span>
                  <Badge variant="gold">{rows.length} students</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" leftIcon={<X className="h-4 w-4" />} onClick={() => { setRows([]); setFileName('') }}>Clear</Button>
                  {!done && (
                    <Button variant="gold" size="sm" loading={importing} leftIcon={<ArrowRight className="h-4 w-4" />} onClick={doImport}>
                      Import {rows.length} Students
                    </Button>
                  )}
                  {done && <Badge variant="green"><Check className="h-3.5 w-3.5 mr-1" />Imported</Badge>}
                </div>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-surface-1">
                    <tr className="border-b border-black/8">
                      {['Name', 'Class', 'Roll', 'Phone', 'Parent', 'Email'].map((h) => (
                        <th key={h} className="text-left py-2 px-4 text-ink-3 font-semibold uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-b border-black/5 hover:bg-cream-100">
                        <td className="py-2 px-4 font-medium text-ink-0">{r.name}</td>
                        <td className="py-2 px-4 text-ink-2">{r.cls}</td>
                        <td className="py-2 px-4 text-ink-2">{r.roll}</td>
                        <td className="py-2 px-4 text-ink-2 font-mono">{r.phone}</td>
                        <td className="py-2 px-4 text-ink-2">{r.parent}</td>
                        <td className="py-2 px-4 text-ink-3">{r.parent_email || '—'}</td>
                      </tr>
                    ))}
                    {rows.length > 20 && (
                      <tr><td colSpan={6} className="py-2 px-4 text-center text-ink-3">… and {rows.length - 20} more rows</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
