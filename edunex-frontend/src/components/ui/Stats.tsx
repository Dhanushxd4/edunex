'use client';

const stats = [
  { value: '10K+', label: 'Expert Instructors' },
  { value: '95%', label: 'Completion Rate' },
  { value: '150+', label: 'Countries' },
  { value: '4.8★', label: 'Average Rating' },
];

export default function Stats() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-white mb-2">{s.value}</div>
              <div className="text-primary-100 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
