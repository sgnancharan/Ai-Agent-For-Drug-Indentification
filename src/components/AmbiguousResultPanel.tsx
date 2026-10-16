'use client';

import React from 'react';
import type { MedicineSummary } from '@/types/medicine';
import type { SupportedLanguage } from '@/types/agent';
import { getTranslation } from '@/lib/i18n';

export interface AmbiguousResultPanelProps {
  query: string;
  candidates: MedicineSummary[];
  missingNotices: string[];
  language?: SupportedLanguage;
  onSelectCandidate: (candidate: MedicineSummary) => void;
}

export function AmbiguousResultPanel({
  query,
  candidates,
  missingNotices,
  language = 'en',
  onSelectCandidate,
}: AmbiguousResultPanelProps) {
  const t = getTranslation(language);

  return (
    <div className="w-full space-y-4 animate-fade-in" aria-live="polite">
      {/* Ambiguity Header Alert */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-100 flex items-start gap-3">
        <span className="text-xl select-none" aria-hidden="true">
          ⚠️
        </span>
        <div>
          <h3 className="font-semibold text-sm">
            {t.ambiguousTitle}: &ldquo;{query}&rdquo;
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
            {t.ambiguousSubtitle}
          </p>
        </div>
      </div>

      {/* Candidate List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 shadow-sm flex flex-col justify-between transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {cand.genericName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ID: <span className="font-mono">{cand.id}</span>
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {cand.reviewStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {cand.verifiedBrandNames.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Brands: </span>
                    <span>{cand.verifiedBrandNames.join(', ')}</span>
                  </div>
                )}
                {cand.activeIngredients.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Active Ingredients: </span>
                    <span>{cand.activeIngredients.join(', ')}</span>
                  </div>
                )}
                {cand.strengths.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Strength: </span>
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      {cand.strengths.join(', ')}
                    </span>
                  </div>
                )}
                {cand.dosageForms.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Form: </span>
                    <span>{cand.dosageForms.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4">
              <button
                type="button"
                onClick={() => onSelectCandidate(cand)}
                className="w-full py-2.5 px-4 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t.selectFormulationButton} →</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Missing Information Notices */}
      {missingNotices.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-medium text-slate-700 dark:text-slate-300">Safety Notices:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {missingNotices.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
