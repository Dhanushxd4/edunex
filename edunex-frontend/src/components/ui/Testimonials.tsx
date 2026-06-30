'use client';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Sarah Chen', role: 'Frontend Developer at Google', avatar: 'SC', rating: 5, text: 'Edunex transformed my career. The React courses are incredibly detailed and the instructor support is amazing. I landed my dream job within 3 months!' },
  { name: 'Marcus Johnson', role: 'Data Scientist at Netflix', avatar: 'MJ', rating: 5, text: "The Data Science curriculum is world-class. I went from zero to building ML models in production. Best investment I've made in my education." },
  { name: 'Priya Patel', role: 'UX Designer at Apple', avatar: 'PP', rating: 5, text: 'The design courses here are unmatched. Practical projects, real-world feedback, and an incredibly supportive community. Highly recommend!' },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">What Our Learners Say</h2>
          <p className="section-subtitle mx-auto">Join 500,000+ students transforming their careers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="card p-8">
              <div className="flex gap-1 mb-4">{Array(t.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="text-gray-300 mb-6 leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
