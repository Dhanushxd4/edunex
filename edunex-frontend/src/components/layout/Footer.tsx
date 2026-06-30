'use client';
import Link from 'next/link';
import { GraduationCap, Twitter, Github, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Edunex</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Learn without limits. Access thousands of expert-led courses in tech, design, business, and more.
            </p>
            <div className="flex gap-4 mt-6">
              {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-500 hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Web Development', 'Data Science', 'Design', 'Business', 'Machine Learning'].map(c => (
                <li key={c}><Link href={`/courses?category=${c}`} className="hover:text-white transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['About', 'Blog', 'Careers', 'Press', 'Contact'].map(p => (
                <li key={p}><Link href={`/${p.toLowerCase()}`} className="hover:text-white transition-colors">{p}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Help Center', 'Terms of Service', 'Privacy Policy', 'Cookie Policy'].map(p => (
                <li key={p}><Link href="#" className="hover:text-white transition-colors">{p}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Edunex. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Built with ❤️ for learners worldwide</p>
        </div>
      </div>
    </footer>
  );
}
