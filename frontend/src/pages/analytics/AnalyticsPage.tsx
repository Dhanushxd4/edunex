import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { KpiCard } from '@/components/ui/Card'
import { TrendingUp, Users, Phone, DollarSign } from 'lucide-react'

const ATTENDANCE_DATA = [
  { day: 'Mon', present: 312, absent: 30 },
  { day: 'Tue', present: 325, absent: 17 },
  { day: 'Wed', present: 308, absent: 34 },
  { day: 'Thu', present: 330, absent: 12 },
  { day: 'Fri', present: 319, absent: 23 },
  { day: 'Sat', present: 295, absent: 47 },
]

const FEES_DATA = [
  { month: 'Jan', collected: 720000, pending: 80000 },
  { month: 'Feb', collected: 680000, pending: 120000 },
  { month: 'Mar', collected: 750000, pending: 50000 },
  { month: 'Apr', collected: 800000, pending: 60000 },
  { month: 'May', collected: 850000, pending: 124000 },
  { month: 'Jun', collected: 420000, pending: 280000 },
]

const FEE_PIE = [
  { name: 'Paid',    value: 68, color: '#2D9B6F' },
  { name: 'Pending', value: 22, color: '#C9973A' },
  { name: 'Overdue', value: 10, color: '#D94F4F' },
]

export function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fadeUp">
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Avg Attendance"   value="93.4%"  icon={<Users className="h-5 w-5 text-gold" />}      iconBg="bg-gold-muted"   trend={{ value: 2, label: 'this week' }} />
        <KpiCard title="Calls This Month" value="245"    icon={<Phone className="h-5 w-5 text-sky-dark" />}  iconBg="bg-sky-brand/10" trend={{ value: 8, label: 'vs last month' }} />
        <KpiCard title="Fee Collection"   value="87%"    icon={<DollarSign className="h-5 w-5 text-success" />} iconBg="bg-success/10" trend={{ value: 5, label: 'improvement' }} />
        <KpiCard title="Active Students"  value="324"    icon={<TrendingUp className="h-5 w-5 text-gold" />} iconBg="bg-gold-muted" />
      </div>

      {/* Attendance chart */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-0 mb-4">Weekly Attendance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={ATTENDANCE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2D9B6F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2D9B6F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#D94F4F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D94F4F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9A8F82' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9A8F82' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }} />
            <Area type="monotone" dataKey="present" stroke="#2D9B6F" strokeWidth={2} fill="url(#gradPresent)" name="Present" />
            <Area type="monotone" dataKey="absent"  stroke="#D94F4F" strokeWidth={2} fill="url(#gradAbsent)"  name="Absent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Fees + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card p-5">
          <h3 className="text-sm font-semibold text-ink-0 mb-4">Fee Collection (Monthly)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={FEES_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9A8F82' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9A8F82' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }} formatter={(v) => typeof v === 'number' ? `₹${v.toLocaleString()}` : v} />
              <Bar dataKey="collected" fill="#C9973A" radius={[4, 4, 0, 0]} name="Collected" />
              <Bar dataKey="pending"   fill="#EDE8DF" radius={[4, 4, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 card p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-ink-0 mb-4 self-start">Fee Status Split</h3>
          <PieChart width={160} height={160}>
            <Pie data={FEE_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
              {FEE_PIE.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="space-y-1.5 mt-3 self-start">
            {FEE_PIE.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-ink-2">{item.name}</span>
                <span className="ml-auto font-semibold text-ink-0">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
