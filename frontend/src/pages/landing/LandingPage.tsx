import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import {
  Phone, DollarSign, Bus, Users, FileText,
  Check, X, ArrowRight, Sparkles,
  Mail, PhoneCall,
} from 'lucide-react'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// ── Feature tabs data ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'absence',
    label: 'Absence Calls',
    icon: <Phone className="h-4 w-4" />,
    title: 'Auto-Call Parents the Moment a Child Is Absent',
    desc: 'The second a student is marked absent, Edunex calls the parent in Telugu. No manual effort. No missed absences. The call plays your school\'s personalised message and logs the response.',
    points: ['Instant call — within 60 seconds of marking absent', 'Telugu, English, or Hindi voice selection', 'Parent presses 1 = coming, 2 = not coming', 'Full call log with timestamps'],
    preview: (
      <div className="bg-ink-0 rounded-card p-5 text-white text-sm font-mono space-y-3">
        <p className="text-ink-3 text-xs uppercase tracking-widest">Student Attendance — Today</p>
        {[
          { name: 'Arjun Mehta',  status: 'PRESENT',       color: 'bg-success/20 text-success border border-success/30' },
          { name: 'Priya Sharma', status: 'ABSENT · CALLED', color: 'bg-danger/20 text-danger border border-danger/30' },
          { name: 'Rahul Verma',  status: 'PRESENT',       color: 'bg-success/20 text-success border border-success/30' },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gold/30 flex items-center justify-center text-xs text-gold font-bold">
                {s.name[0]}
              </div>
              <span className="text-white/80">{s.name}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.color}`}>{s.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'fee',
    label: 'Fee Reminders',
    icon: <DollarSign className="h-4 w-4" />,
    title: 'Automated Fee Reminders by Call & SMS',
    desc: 'Edunex calls every parent with a pending fee balance at 11 AM automatically. No awkward conversations. Just results. Track collections in real time.',
    points: ['Daily auto-call to all pending parents', 'SMS + WhatsApp reminder option', 'Visual collection progress bar', 'Mark paid with one click'],
    preview: (
      <div className="bg-ink-0 rounded-card p-5 text-white space-y-3">
        <p className="text-ink-3 text-xs uppercase tracking-widest mb-2">Fee Collection — This Month</p>
        <div className="space-y-2">
          {[
            { name: 'Arjun Mehta',  status: 'PAID',    pct: 100 },
            { name: 'Sneha Patel',  status: 'OVERDUE', pct: 0 },
            { name: 'Karan Singh',  status: 'PENDING', pct: 50 },
          ].map((s) => (
            <div key={s.name} className="space-y-1">
              <div className="flex justify-between text-xs text-white/70">
                <span>{s.name}</span>
                <span className={s.status === 'PAID' ? 'text-success' : s.status === 'OVERDUE' ? 'text-danger' : 'text-gold'}>
                  {s.status}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full">
                <div className={`h-full rounded-full ${s.status === 'PAID' ? 'bg-success' : s.status === 'OVERDUE' ? 'bg-danger' : 'bg-gold'}`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-white/10">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full" />
          </div>
          <p className="text-xs text-white/50 mt-1">68% collected · ₹8.5L of ₹12.5L</p>
        </div>
      </div>
    ),
  },
  {
    id: 'bus',
    label: 'Bus Tracking',
    icon: <Bus className="h-4 w-4" />,
    title: 'Live GPS Bus Tracking for Parents',
    desc: 'Parents see exact bus location in real-time during morning and evening routes. WhatsApp alert sent when bus is 2 stops away.',
    points: ['Morning window: 7:00 AM – 8:30 AM', 'Evening window: 4:30 PM – 6:00 PM', 'WhatsApp ETA alert to parents', 'Live stop-by-stop route view', 'Driver and student count per bus'],
    preview: (
      <div className="bg-ink-0 rounded-card p-5 text-white space-y-3">
        <p className="text-ink-3 text-xs uppercase tracking-widest">Route 3 — Live</p>
        <div className="space-y-2">
          {['Ameerpet', 'SR Nagar', 'Begumpet', '🏫 School'].map((stop, i) => (
            <div key={stop} className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full shrink-0 ${i <= 1 ? 'bg-success' : i === 2 ? 'bg-gold animate-pulse' : 'bg-white/20'}`} />
              <span className={`text-sm ${i <= 1 ? 'text-white/50 line-through' : i === 2 ? 'text-gold font-semibold' : 'text-white/70'}`}>{stop}</span>
              {i === 2 && <span className="ml-auto text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">Bus here</span>}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 bg-success/10 border border-success/20 rounded-btn px-3 py-2 text-xs text-success text-center">🗺 Open Live Map</div>
          <div className="flex-1 bg-green-900/30 border border-green-500/20 rounded-btn px-3 py-2 text-xs text-green-400 text-center">WhatsApp Alert</div>
        </div>
      </div>
    ),
  },
  {
    id: 'students',
    label: 'Student & Staff',
    icon: <Users className="h-4 w-4" />,
    title: 'Complete Student & Staff Management',
    desc: 'Manage thousands of students and staff from one clean interface. Import via CSV, search instantly, and track every record.',
    points: ['Bulk CSV import in seconds', 'Auto-create parent login accounts', 'Teacher leave management', 'Class-wise filtering and search'],
    preview: (
      <div className="bg-ink-0 rounded-card p-5 text-white space-y-2">
        <p className="text-ink-3 text-xs uppercase tracking-widest mb-2">Students — Class 10A</p>
        {['Arjun Mehta', 'Priya Sharma', 'Rahul Verma', 'Sneha Patel'].map((name, i) => (
          <div key={name} className="flex items-center gap-3 py-1.5 border-b border-white/10">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center text-xs font-bold text-white">{name[0]}</div>
            <span className="text-white/80 text-sm flex-1">{name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${i === 3 ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
              {i === 3 ? 'Overdue' : 'Paid'}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'exams',
    label: 'Exam Generation',
    icon: <FileText className="h-4 w-4" />,
    title: 'AI-Generated Exam Papers in Seconds',
    desc: 'Pick subject, class, difficulty and language. Gemini AI generates a full exam paper instantly. Print or publish to parents.',
    points: ['Powered by Google Gemini 2.0', 'Telugu, English, Hindi support', 'MCQ, Short, Long, or Mixed questions', 'Publish directly to parent portal'],
    preview: (
      <div className="bg-ink-0 rounded-card p-5 text-white space-y-3 text-sm">
        <div className="flex gap-2 flex-wrap">
          {['Mathematics', 'Class 10', 'Medium', 'Mixed'].map((t) => (
            <span key={t} className="px-2 py-0.5 bg-gold/15 text-gold rounded-full text-xs">{t}</span>
          ))}
        </div>
        <div className="space-y-2 mt-2">
          {[
            'Q1. Solve: 2x² + 5x − 3 = 0  [2 marks]',
            'Q2. Find the area of a circle with r = 7cm  [2 marks]',
            'Q3. Which is a prime? A) 4  B) 6  C) 7  D) 9  [1 mark]',
          ].map((q, i) => (
            <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.3 }} className="text-white/70 text-xs leading-relaxed">{q}</motion.p>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 bg-gold/15 border border-gold/30 rounded-btn px-3 py-1.5 text-xs text-gold text-center">🖨 Print</div>
          <div className="flex-1 bg-success/10 border border-success/20 rounded-btn px-3 py-1.5 text-xs text-success text-center">📤 Publish</div>
        </div>
      </div>
    ),
  },
]

// ── Pricing ───────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    price: '₹25,000',
    sub: 'per month · up to 500 students',
    dark: false,
    features: [
      { text: 'Automated Absence Calls',     ok: true },
      { text: 'Fee Due Reminders (SMS)',      ok: true },
      { text: 'Student & Teacher Management',ok: true },
      { text: 'Marks & Results Module',      ok: true },
      { text: 'Parent App Access',           ok: true },
      { text: 'Live Bus Tracking',           ok: false },
      { text: 'AI Exam Paper Generation',    ok: false },
    ],
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: '₹75,000',
    sub: 'per month · up to 2,000 students',
    dark: true,
    features: [
      { text: 'Everything in Starter',          ok: true },
      { text: 'Live Bus Tracking (GPS)',         ok: true },
      { text: 'AI Exam Paper Generation',        ok: true },
      { text: 'Fee Reminders via Calls + SMS',   ok: true },
      { text: 'Advanced Reports & Analytics',    ok: true },
      { text: 'Multi-branch Support',            ok: true },
      { text: 'Priority Support',                ok: true },
    ],
  },
  {
    id: 'elite',
    name: 'ELITE',
    price: '₹1,00,000',
    sub: 'per month · unlimited students',
    dark: false,
    features: [
      { text: 'Everything in Professional',      ok: true },
      { text: 'AI School Promotion Videos',      ok: true },
      { text: 'Custom Branding & White Label',   ok: true },
      { text: 'Dedicated Account Manager',       ok: true },
      { text: 'API Access & Integrations',       ok: true },
      { text: 'On-site Training Session',        ok: true },
      { text: '24/7 Phone Support',              ok: true },
    ],
  },
]

// ── Main component ────────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate()
  const [activeFeature, setActiveFeature] = useState('absence')

  const activeF = FEATURES.find((f) => f.id === activeFeature) || FEATURES[0]

  return (
    <div className="min-h-screen bg-cream font-body overflow-x-hidden">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-black/8">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-xl font-display font-bold">
              <span className="text-ink-0">Edu</span>
              <span className="text-gold italic">nex</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-ink-2 hover:text-ink-0 transition-colors hidden sm:block">
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-ink-0 text-cream text-sm font-semibold px-5 py-2.5 rounded-btn hover:bg-ink-1 transition-colors"
            >
              REQUEST DEMO
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-16 text-center">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-[0.2em] text-gold uppercase border border-gold/30 inline-block px-4 py-1.5 rounded-full">
            School Management, Reimagined
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-ink-0 leading-tight">
            Run Every School<br />Operation <span className="text-gold italic">with Elegance</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-ink-2 max-w-2xl mx-auto leading-relaxed">
            Automated absence calls, fee reminders, live bus tracking, AI exam generation, AI promotion videos, and complete student & staff management — all in one intelligent platform.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-ink-0 text-cream text-sm font-semibold px-8 py-3.5 rounded-btn hover:bg-ink-1 transition-colors flex items-center justify-center gap-2"
            >
              VIEW PLANS <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-ink-0 text-ink-0 text-sm font-semibold px-8 py-3.5 rounded-btn hover:bg-ink-0/5 transition-colors"
            >
              EXPLORE FEATURES
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-ink-0 py-14">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { val: '500+', label: 'SCHOOLS ONBOARDED' },
            { val: '1.2M', label: 'STUDENTS MANAGED' },
            { val: '98%',  label: 'ATTENDANCE ACCURACY' },
            { val: '40%',  label: 'ADMIN TIME SAVED' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-4xl sm:text-5xl font-display font-black text-gold">{s.val}</p>
              <p className="text-xs text-white/50 tracking-widest mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12 space-y-3">
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Modules</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-black text-ink-0">
            Modules, <span className="text-gold italic">One Seamless Platform</span>
          </motion.h2>
          <motion.div variants={fadeUp} className="w-12 h-0.5 bg-gold mx-auto" />
          <motion.p variants={fadeUp} className="text-ink-2 max-w-lg mx-auto">
            Select any feature tab below to see exactly what it does inside Edunex.
          </motion.p>
        </motion.div>

        {/* Feature tabs */}
        <div className="flex flex-col gap-2 lg:flex-row lg:gap-8">
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible lg:w-64 shrink-0">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFeature(f.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-btn text-sm font-semibold text-left whitespace-nowrap transition-all ${
                  activeFeature === f.id
                    ? 'bg-ink-0 text-white'
                    : 'bg-white border border-black/8 text-ink-2 hover:border-black/20'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 grid lg:grid-cols-2 gap-6"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold text-ink-0">{activeF.title}</h3>
              <p className="text-ink-2 leading-relaxed text-sm">{activeF.desc}</p>
              <ul className="space-y-2">
                {activeF.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-ink-2">
                    <span className="text-gold mt-0.5">—</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>{activeF.preview}</div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-cream-300 py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Simple Onboarding</p>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-ink-0">
              Up & Running <span className="text-gold italic">in Days, Not Months</span>
            </h2>
            <div className="flex justify-center gap-4">
              <div className="w-8 h-0.5 bg-gold" />
              <div className="w-8 h-0.5 bg-gold/40" />
            </div>
          </div>
          <div className="space-y-10">
            {[
              { n: '01', title: 'Import Your School Data', desc: 'Upload existing student and staff records via Excel, or connect from your current system. We handle the migration.' },
              { n: '02', title: 'Configure Your Modules', desc: 'Activate features, set bus routes, fee structure, timetable, and communication preferences through a guided setup wizard.' },
              { n: '03', title: 'Go Live Instantly', desc: 'Your school is live. Parents get login details, teachers access dashboards, and all automation begins from day one.' },
            ].map((step) => (
              <motion.div key={step.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex gap-6">
                <span className="text-6xl font-display font-black text-black/8 leading-none shrink-0">{step.n}</span>
                <div>
                  <h3 className="text-lg font-bold text-ink-0">{step.title}</h3>
                  <p className="text-ink-2 text-sm mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Simple, Transparent Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-ink-0">
            Choose Your <span className="text-gold italic">Plan</span>
          </h2>
          <div className="w-12 h-0.5 bg-gold mx-auto" />
          <p className="text-ink-2">All plans include onboarding support and a 14-day free trial. No hidden charges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-card p-6 flex flex-col ${plan.dark ? 'bg-ink-0 text-white' : 'bg-white border border-black/8'}`}
            >
              <p className={`text-xs font-bold tracking-widest mb-3 ${plan.dark ? 'text-gold' : 'text-ink-3'}`}>{plan.name}</p>
              <p className={`text-4xl font-display font-black ${plan.dark ? 'text-white' : 'text-ink-0'}`}>{plan.price}</p>
              <p className={`text-xs mt-1 mb-5 pb-5 border-b ${plan.dark ? 'text-white/40 border-white/10' : 'text-ink-3 border-black/8'}`}>{plan.sub}</p>
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.ok ? (plan.dark ? 'text-white/80' : 'text-ink-1') : 'text-ink-3'}`}>
                    {f.ok
                      ? <Check className={`h-4 w-4 shrink-0 ${plan.dark ? 'text-gold' : 'text-gold'}`} />
                      : <X className="h-4 w-4 shrink-0 text-ink-3" />
                    }
                    {f.text}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className={`mt-6 py-3 rounded-btn text-sm font-semibold transition-colors ${
                  plan.dark
                    ? 'bg-gold text-white hover:bg-gold-dark'
                    : 'border border-ink-0 text-ink-0 hover:bg-ink-0 hover:text-white'
                }`}
              >
                GET STARTED
              </button>
            </motion.div>
          ))}
        </div>

        {/* Founding offer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-ink-0 rounded-card p-6 text-center"
        >
          <p className="text-gold text-xs font-bold tracking-widest uppercase mb-2">🚀 Founding School Offer</p>
          <p className="text-white text-base font-semibold">
            Get Elite plan worth ₹1,00,000/month at just <span className="text-gold font-bold">₹25,000/month</span> for our first 10 clients.
          </p>
          <p className="text-gold font-bold mt-1">7 spots remaining.</p>
        </motion.div>
      </section>

      {/* ── Why Edunex ── */}
      <section className="bg-ink-0 py-20 text-center">
        <div className="max-w-2xl mx-auto px-5 space-y-6">
          <h2 className="text-3xl font-display font-black text-white">
            Why Schools Are <span className="text-gold italic">Choosing Edunex</span>
          </h2>
          <p className="text-white/60 italic text-lg">"Built with love for every school that deserves better."</p>
          <p className="text-white/70 leading-relaxed">
            We're on a mission to automate every school in India. When you choose Edunex, you give your teachers more time to teach, your parents more peace of mind, and your students a better future.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href="tel:+919999999999" className="flex items-center justify-center gap-2 bg-white text-ink-0 text-sm font-semibold px-6 py-3 rounded-btn hover:bg-cream transition-colors">
              <PhoneCall className="h-4 w-4" /> CALL US NOW
            </a>
            <a href="mailto:hello@edunex.in" className="flex items-center justify-center gap-2 border border-white/30 text-white text-sm font-semibold px-6 py-3 rounded-btn hover:bg-white/10 transition-colors">
              <Mail className="h-4 w-4" /> HELLO@EDUNEX.IN
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-ink-0 border-t border-white/8 py-8 text-center">
        <p className="text-gold text-xs uppercase tracking-widest font-semibold">WE'RE GRATEFUL</p>
        <p className="text-white/30 text-xs mt-2">© 2026 Edunex · AI-Powered School Management</p>
      </footer>
    </div>
  )
}
