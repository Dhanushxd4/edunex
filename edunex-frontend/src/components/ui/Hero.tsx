'use client';
import Link from 'next/link';
import { ArrowRight, Play, Star, Users, BookOpen } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTI4MzgiIGZpbGwtb3BhY2l0eT0iMC41Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyek0zMCAzNGgtMnYtMmgyek0yNCAzNGgtMnYtMmgyek0xOCAzNGgtMnYtMmgyek0xMiAzNGgtMnYtMmgyek02IDM0SDR2LTJoMnYyek0zNiAyOGgtMnYtMmgyek0zMCAyOGgtMnYtMmgyek0yNCAyOGgtMnYtMmgyek0xOCAyOGgtMnYtMmgyek0xMiAyOGgtMnYtMmgyek02IDI4SDR2LTJoMnYyek0zNiAyMmgtMnYtMmgyek0zMCAyMmgtMnYtMmgyek0yNCAyMmgtMnYtMmgyek0xOCAyMmgtMnYtMmgyek0xMiAyMmgtMnYtMmgyek02IDIySDF2LTJoMnYyek0zNiAxNmgtMnYtMmgyek0zMCAxNmgtMnYtMmgyek0yNCAxNmgtMnYtMmgyek0xOCAxNmgtMnYtMmgyek0xMiAxNmgtMnYtMmgyek02IDE2SDR2LTJoMnYyek0zNiAxMGgtMnYtMmgyek0zMCAxMGgtMnYtMmgyek0yNCAxMGgtMnYtMmgyek0xOCAxMGgtMnYtMmgyek0xMiAxMGgtMnYtMmgyek02IDEwSDR2LTJoMnYyek0zNiA0aC0yVjJoMnYyek0zMCA0aC0yVjJoMnYyek0yNCA0aC0yVjJoMnYyek0xOCA0aC0yVjJoMnYyek0xMiA0aC0yVjJoMnYyek02IDRINHZ2Mmgyek0zNiA0MGgtMnYtMmgyek0zMCA0MGgtMnYtMmgyek0yNCA0MGgtMnYtMmgyek0xOCA0MGgtMnYtMmgyek0xMiA0MGgtMnYtMmgyek02IDQwSDR2LTJoMnYyek0zNiA0NmgtMnYtMmgyek0zMCA0NmgtMnYtMmgyek0yNCA0NmgtMnYtMmgyek0xOCA0NmgtMnYtMmgyek0xMiA0NmgtMnYtMmgyek02IDQ2SDR2LTJoMnYyek0zNiA1MmgtMnYtMmgyek0zMCA1MmgtMnYtMmgyek0yNCA1MmgtMnYtMmgyek0xOCA1MmgtMnYtMmgyek0xMiA1MmgtMnYtMmgyek02IDUySDF2LTJoMnYyek0zNiA1OGgtMnYtMmgyek0zMCA1OGgtMnYtMmgyek0yNCA1OGgtMnYtMmgyek0xOCA1OGgtMnYtMmgyek0xMiA1OGgtMnYtMmgyek02IDU4SDR2LTJoMnYyek0zNiAyOGgtMnYtMmgyek0zMCAyOGgtMnYtMmgyek0yNCAyOGgtMnYtMmgyek0xOCAyOGgtMnYtMmgyek0xMiAyOGgtMnYtMmgyek02IDI4SDR2LTJoMnYyek0zNiAyMmgtMnYtMmgyek0zMCAyMmgtMnYtMmgyek0yNCAyMmgtMnYtMmgyek0xOCAyMmgtMnYtMmgyek0xMiAyMmgtMnYtMmgyek02IDIySDF2LTJoMnYyek0zNiAxNmgtMnYtMmgyek0zMCAxNmgtMnYtMmgyek0yNCAxNmgtMnYtMmgyek0xOCAxNmgtMnYtMmgyek0xMiAxNmgtMnYtMmgyek02IDE2SDR2LTJoMnYyek0zNiAxMGgtMnYtMmgyek0zMCAxMGgtMnYtMmgyek0yNCAxMGgtMnYtMmgyek0xOCAxMGgtMnYtMmgyek0xMiAxMGgtMnYtMmgyek02IDEwSDR2LTJoMnYyek0zNiA0aC0yVjJoMnYyek0zMCA0aC0yVjJoMnYyek0yNCA0aC0yVjJoMnYyek0xOCA0aC0yVjJoMnYyek0xMiA0aC0yVjJoMnYyek02IDRINHZ2Mmgyek0zNiA0MGgtMnYtMmgyek0zMCA0MGgtMnYtMmgyek0yNCA0MGgtMnYtMmgyek0xOCA0MGgtMnYtMmgyek0xMiA0MGgtMnYtMmgyek02IDQwSDR2LTJoMnYyek0zNiA0NmgtMnYtMmgyek0zMCA0NmgtMnYtMmgyek0yNCA0NmgtMnYtMmgyek0xOCA0NmgtMnYtMmgyek0xMiA0NmgtMnYtMmgyek02IDQ2SDR2LTJoMnYyek0zNiA1MmgtMnYtMmgyek0zMCA1MmgtMnYtMmgyek0yNCA1MmgtMnYtMmgyek0xOCA1MmgtMnYtMmgyek0xMiA1MmgtMnYtMmgyek02IDUySDF2LTJoMnYyek0zNiA1OGgtMnYtMmgyek0zMCA1OGgtMnYtMmgyek0yNCA1OGgtMnYtMmgyek0xOCA1OGgtMnYtMmgyek0xMiA1OGgtMnYtMmgyek02IDU4SDR2LTJoMnYyek0zNiAyOGgtMnYtMmgyek0zMCAyOGgtMnYtMmgyek0yNCAyOGgtMnYtMmgyek0xOCAyOGgtMnYtMmgyek0xMiAyOGgtMnYtMmgyek02IDI4SDR2LTJoMnYyek0zNiAyMmgtMnYtMmgyek0zMCAyMmgtMnYtMmgyek0yNCAyMmgtMnYtMmgyek0xOCAyMmgtMnYtMmgyek0xMiAyMmgtMnYtMmgyek02IDIySDF2LTJoMnYyek0zNiAxNmgtMnYtMmgyek0zMCAxNmgtMnYtMmgyek0yNCAxNmgtMnYtMmgyek0xOCAxNmgtMnYtMmgyek0xMiAxNmgtMnYtMmgyek02IDE2SDR2LTJoMnYyek0zNiAxMGgtMnYtMmgyek0zMCAxMGgtMnYtMmgyek0yNCAxMGgtMnYtMmgyek0xOCAxMGgtMnYtMmgyek0xMiAxMGgtMnYtMmgyek02IDEwSDR2LTJoMnYyek0zNiA0aC0yVjJoMnYyek0zMCA0aC0yVjJoMnYyek0yNCA0aC0yVjJoMnYyek0xOCA0aC0yVjJoMnYyek0xMiA0aC0yVjJoMnYyek02IDRINHZ2MmgySMiIvPjwvZz48L2c+PC9zdmc+')] opacity-[0.03]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
          <Star className="w-4 h-4 text-primary-400 fill-primary-400" />
          <span className="text-sm text-primary-400 font-medium">Trusted by 500,000+ learners worldwide</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Learn Skills That<br />
          <span className="gradient-text">Shape Your Future</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Access 10,000+ expert-led courses in programming, design, data science, and business.
          Learn at your own pace. Build real-world skills. Get hired faster.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/courses" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4">
            Browse Courses <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/courses?is_free=true" className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4">
            <Play className="w-5 h-5" /> Start for Free
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap justify-center gap-8 text-center">
          {[
            { icon: BookOpen, value: '10,000+', label: 'Courses' },
            { icon: Users, value: '500K+', label: 'Students' },
            { icon: Star, value: '4.8/5', label: 'Avg Rating' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-gray-400">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
