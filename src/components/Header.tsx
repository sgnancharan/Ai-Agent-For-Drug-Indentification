'use client';

import React from 'react';
import type { SupportedLanguage } from '@/types/agent';
import { getTranslation } from '@/lib/i18n';

export interface HeaderProps {
  language?: SupportedLanguage;
}

export function Header({ language = 'en' }: HeaderProps) {
  const t = getTranslation(language);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 font-bold text-lg select-none">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.appTitle}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {t.offlineBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Local Model:</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
              MedGemma 4B IT (Q8_0)
            </span>
          </div>
          <div className="hidden md:flex items-center px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span>Loopback Only</span>
          </div>
        </div>
      </div>
    </header>
  );
}
