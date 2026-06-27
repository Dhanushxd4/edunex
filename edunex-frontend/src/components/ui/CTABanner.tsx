import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function CTABanner() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-white font-medium">Start learning today — it's free</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Ready to Level Up?</h2>
            <p className="text-xl text-primary-100 mb-10 max-w-xl mx-auto">Join over 500,000 learners who are building skills for the future. Start with free courses today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/courses" className="bg-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-colors border border-white/30 flex items-center justify-center gap-2">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
