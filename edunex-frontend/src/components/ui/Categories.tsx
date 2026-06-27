'use client';
import Link from 'next/link';
import { Code2, Database, Palette, TrendingUp, Camera, Music, Dumbbell, Cpu } from 'lucide-react';

const categories = [
  { name: 'Web Development', icon: Code2, color: 'from-blue-500 to-cyan-500', count: '2,400+' },
  { name: 'Data Science', icon: Database, color: 'from-purple-500 to-pink-500', count: '1,200+' },
  { name: 'Design', icon: Palette, color: 'from-pink-500 to-rose-500', count: '900+' },
  { name: 'Business', icon: TrendingUp, color: 'from-green-500 to-emerald-500', count: '1,800+' },
  { name: 'Machine Learning', icon: Cpu, color: 'from-orange-500 to-amber-500', count: '600+' },
  { name: 'Photography', icon: Camera, color: 'from-teal-500 to-cyan-500', count: '450+' },
  { name: 'Music', icon: Music, color: 'from-violet-500 to-purple-500', count: '350+' },
  { name: 'Health & Fitness', icon: Dumbbell, color: 'from-red-500 to-orange-500', count: '800+' },
];

export default function Categories() {
  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">Browse by Category</h2>
          <p className="section-subtitle mx-auto">Find the perfect course for your goals</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(c => (
            <Link key={c.name} href={`/courses?category=${encodeURIComponent(c.name)}`}
              className="group card p-6 flex flex-col items-center text-center hover:border-gray-600 transition-all hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <c.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{c.name}</h3>
              <p className="text-xs text-gray-500">{c.count} courses</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
