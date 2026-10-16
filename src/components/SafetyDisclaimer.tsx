'use client';

import React from 'react';
import type { SupportedLanguage } from '@/types/agent';
import { getTranslation } from '@/lib/i18n';

export interface SafetyDisclaimerProps {
  language?: SupportedLanguage;
}

export function SafetyDisclaimer({ language = 'en' }: SafetyDisclaimerProps) {
  const t = getTranslation(language);

  return (
    <aside
      aria-label="Medical Disclaimer"
      className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 text-xs leading-relaxed"
    >
      <div className="flex items-start gap-2.5">
        <span className="text-amber-600 dark:text-amber-400 font-bold text-base select-none" aria-hidden="true">
          ⚕️
        </span>
        <div className="space-y-1">
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            {t.disclaimerTitle}
          </p>
          <p>
            {t.disclaimerBody}
          </p>
          <p className="text-amber-800 dark:text-amber-300 font-medium pt-0.5">
            🚨 <strong>{t.emergencyTitle}</strong> {t.emergencyBody}
          </p>
        </div>
      </div>
    </aside>
  );
}
