'use client';

import React from 'react';
import type { SupportedLanguage } from '@/types/agent';
import { getTranslation } from '@/lib/i18n';

export interface NotFoundResultPanelProps {
  query: string;
  suggestions?: string[];
  safetyNotice?: string;
  language?: SupportedLanguage;
  onSelectSuggestion?: (term: string) => void;
}

export function NotFoundResultPanel({
  query,
  suggestions = [],
  safetyNotice,
  language = 'en',
  onSelectSuggestion,
}: NotFoundResultPanelProps) {
  const t = getTranslation(language);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
            {t.notFoundTitle}: &ldquo;{query}&rdquo;
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.notFoundSubtitle}
          </p>
        </div>
      </div>

      {/* Synthetic Isolation Disclosure */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-300">Data Integrity Notice:</p>
        <p className="mt-0.5">
          If your query corresponds to an internal test fixture, it is quarantined to prevent unverified clinical guidance.
          Real drug references must be ingested from verified regulatory labels (e.g. FDA SPL, EMA SmPC).
        </p>
      </div>

      {/* Typo Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t.suggestionsLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => onSelectSuggestion && onSelectSuggestion(sug)}
                className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-medium transition-colors cursor-pointer"
              >
                {sug} →
              </button>
            ))}
          </div>
        </div>
      )}

      {safetyNotice && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          {safetyNotice}
        </p>
      )}
    </div>
  );
}
