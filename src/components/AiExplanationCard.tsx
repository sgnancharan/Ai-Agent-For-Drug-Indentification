'use client';

import React from 'react';
import type { AiExplanationStatus, SupportedLanguage } from '@/types/agent';
import { LANGUAGE_NAMES } from '@/types/agent';
import { getTranslation } from '@/lib/i18n';

export interface AiExplanationCardProps {
  explanation: AiExplanationStatus;
  requestedLanguage: SupportedLanguage;
}

export function AiExplanationCard({
  explanation,
  requestedLanguage,
}: AiExplanationCardProps) {
  const isNonEnglish = requestedLanguage !== 'en';
  const languageName = LANGUAGE_NAMES[requestedLanguage] || requestedLanguage;
  const t = getTranslation(requestedLanguage);

  if (!explanation.available) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          <span>{t.modelStatusTitle}</span>
        </div>
        <p className="leading-relaxed">
          {explanation.message}
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Local AI Clinical Explanation"
      className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in"
    >
      {/* Header with Model & Language Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.aiExplanationTitle}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.aiExplanationSubtitle} {explanation.modelId || 'MedGemma 4B IT (Q8_0)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {languageName}
          </span>
        </div>
      </div>

      {/* Non-English Experimental Warning */}
      {isNonEnglish && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 text-xs leading-relaxed space-y-1"
        >
          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-100">
            <span>⚠️</span>
            <span>{t.experimentalAdvisoryTitle} ({languageName})</span>
          </div>
          <p>
            {t.experimentalAdvisoryBody}
          </p>
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            {t.experimentalAdvisoryWarning}
          </p>
        </div>
      )}

      {/* Grounded Explanation Text */}
      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
        {explanation.explanationText}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
        {t.disclaimerFootnote}
      </p>
    </section>
  );
}
