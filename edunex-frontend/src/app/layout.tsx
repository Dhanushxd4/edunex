import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: { default: 'Edunex – Learn Without Limits', template: '%s | Edunex' },
  description: 'Edunex is a modern e-learning platform offering thousands of courses in tech, design, business, and more. Learn at your own pace with expert instructors.',
  keywords: ['online learning', 'courses', 'education', 'edtech', 'edunex'],
  openGraph: {
    title: 'Edunex – Learn Without Limits',
    description: 'Thousands of courses to level up your skills.',
    type: 'website',
    siteName: 'Edunex',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
          }}
        />
      </body>
    </html>
  );
}
