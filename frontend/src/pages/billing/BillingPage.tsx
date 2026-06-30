import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'

const PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    price: '₹25,000',
    period: '/month',
    students: 'Up to 500 students',
    features: ['Attendance + Auto Calls', 'Fee Management', 'AI Exam Generator', 'Parent Portal', 'Basic Analytics', 'CSV Import'],
    cta: 'Current Plan',
    color: 'border-sky-brand',
    highlight: false,
  },
  {
    id: 'professional',
    label: 'Professional',
    price: '₹75,000',
    period: '/month',
    students: 'Up to 2,000 students',
    features: ['Everything in Starter', 'LMS Courses', 'AI Talking Video', 'Auto Agent (24/7)', 'Advanced Analytics', 'WhatsApp Broadcast', 'Enquiry CRM'],
    cta: 'Upgrade',
    color: 'border-gold',
    highlight: true,
  },
  {
    id: 'elite',
    label: 'Elite',
    price: '₹1,00,000',
    period: '/month',
    students: 'Unlimited students',
    features: ['Everything in Professional', 'AI Receptionist', 'Gamification', 'Multi-branch Support', 'Priority Support', 'Custom Integrations'],
    cta: 'Contact Sales',
    color: 'border-purple-400',
    highlight: false,
  },
]

export function BillingPage() {
  const { user } = useAuthStore()
  const toast = useToast()

  function upgrade(planId: string) {
    toast.info('Redirecting to payment…', `Upgrading to ${planId}`)
  }

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="text-center">
        <h2 className="text-xl font-bold text-ink-0 page-title">Choose your plan</h2>
        <p className="text-sm text-ink-3 mt-1">All plans include 7-day free trial. Cancel anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => {
          const isCurrent = plan.id === user?.school_plan
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card p-5 flex flex-col border-2 ${plan.highlight ? plan.color : 'border-transparent'} ${isCurrent ? plan.color : ''}`}
            >
              {plan.highlight && (
                <div className="flex justify-center mb-3">
                  <Badge variant="gold"><Star className="h-3 w-3 mr-1" />Most Popular</Badge>
                </div>
              )}
              <h3 className="text-lg font-bold text-ink-0 page-title">{plan.label}</h3>
              <p className="text-xs text-ink-3 mt-0.5">{plan.students}</p>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold text-ink-0">{plan.price}</span>
                <span className="text-sm text-ink-3">{plan.period}</span>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-2">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrent ? 'ghost' : plan.highlight ? 'gold' : 'outline'}
                className="w-full"
                disabled={isCurrent}
                onClick={() => upgrade(plan.id)}
              >
                {isCurrent ? 'Current Plan ✓' : plan.cta}
              </Button>
            </motion.div>
          )
        })}
      </div>

      <Card className="text-center">
        <p className="text-sm text-ink-2">All plans include cloud sync, AI voice calls, and Edunex support.</p>
        <p className="text-xs text-ink-3 mt-1">GST applicable. Annual plans available with 20% discount.</p>
      </Card>
    </div>
  )
}
