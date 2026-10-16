import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediGuide AI — Offline Multilingual Medicine Information',
  description:
    'Fully offline, deterministic clinical reference and multilingual medicine-information assistant powered by local MedGemma 4B IT.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
