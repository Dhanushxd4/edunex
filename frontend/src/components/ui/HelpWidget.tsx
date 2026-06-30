import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

interface Message {
  role: 'user' | 'model'
  text: string
}

const SUGGESTIONS = [
  'How do I add a student?',
  'How do attendance calls work?',
  'How to generate an AI exam?',
  'How to collect fees?',
]

export function HelpWidget() {
  const { isAuthenticated } = useAuthStore()
  const [open, setOpen]     = useState(false)
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m the Edunex assistant. Ask me anything about using the platform.' },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  if (!isAuthenticated) return null

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }))
      const res = await api.post('/ai/chat', { message: text.trim(), history })
      const reply = res.data?.reply ?? res.data?.data?.reply ?? 'Sorry, I could not understand that.'
      setMessages((m) => [...m, { role: 'model', text: reply }])
    } catch {
      setMessages((m) => [...m, { role: 'model', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col rounded-2xl shadow-2xl border border-black/10 bg-white overflow-hidden animate-fadeUp">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gold to-amber-500">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Edunex Assistant</p>
              <p className="text-xs text-white/80">Smart AI Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-80 bg-cream-100">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs
                  ${msg.role === 'user' ? 'bg-gold' : 'bg-ink-2'}`}>
                  {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user'
                    ? 'bg-gold text-white rounded-tr-sm'
                    : 'bg-white text-ink-1 border border-black/8 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-ink-2 flex items-center justify-center">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-white border border-black/8 rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-ink-3" />
                  <span className="text-xs text-ink-3">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only first message) */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-cream-100">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-white border border-black/10 hover:border-gold/50 hover:bg-gold/5 text-ink-2 px-2.5 py-1 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-black/8 bg-white">
            <input
              className="flex-1 text-xs px-3 py-2 rounded-full border border-black/10 bg-cream-100 focus:outline-none focus:ring-2 focus:ring-gold/40 placeholder:text-ink-3"
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
              disabled={loading}
              autoFocus
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200
          ${open ? 'bg-ink-2 rotate-0 scale-95' : 'bg-gold hover:bg-amber-500 hover:scale-105'}`}
        aria-label="Open help chat"
      >
        {open
          ? <X className="h-5 w-5 text-white" />
          : <MessageCircle className="h-5 w-5 text-white" />
        }
      </button>
    </>
  )
}
