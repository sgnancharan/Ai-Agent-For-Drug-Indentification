'use client';

import React from 'react';
import type { VerifiedMedicineFacts, SupportedLanguage } from '@/types/agent';
import type { SourceProvenance, ReviewStatus, AssessedField } from '@/types/medicine';
import { getTranslation } from '@/lib/i18n';

export interface MedicineFactCardProps {
  medicineId: string;
  facts: VerifiedMedicineFacts;
  source: SourceProvenance | null;
  reviewStatus: ReviewStatus | null;
  missingFields: string[];
  language?: SupportedLanguage;
}

function AssessedBlock({
  title,
  field,
  explicitlyAbsentLabel,
  unassessedLabel,
  variant = 'neutral',
}: {
  title: string;
  field: AssessedField<unknown>;
  explicitlyAbsentLabel: string;
  unassessedLabel: string;
  variant?: 'neutral' | 'danger' | 'warning' | 'info';
}) {
  if (field.status === 'verified_absent') {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">{title}</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
          {explicitlyAbsentLabel} {field.note || 'None reported in clinical evaluation.'}
        </span>
      </div>
    );
  }

  if (field.status === 'unknown' || field.status === 'not_assessed' || field.status === 'unavailable') {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">{title}</span>
        <span>
          [{unassessedLabel} {field.note || 'Information not documented'}]
        </span>
      </div>
    );
  }

  const borderClasses = {
    neutral: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300',
    danger: 'border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200',
    warning: 'border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200',
    info: 'border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/30 text-teal-950 dark:text-teal-200',
  }[variant];

  return (
    <div className={`p-4 rounded-xl border ${borderClasses} text-xs space-y-1.5`}>
      <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs tracking-wide uppercase">
        {title}
      </span>
      {Array.isArray(field.data) ? (
        <ul className="list-disc list-inside space-y-1">
          {field.data.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {typeof item === 'object' && item !== null && 'interactingAgent' in item
                ? `${item.interactingAgent}${item.severity ? ` (${item.severity.toUpperCase()})` : ''}: ${item.description || ''}`
                : String(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="leading-relaxed">{String(field.data || '')}</p>
      )}
    </div>
  );
}

export function MedicineFactCard({
  medicineId,
  facts,
  source,
  reviewStatus,
  missingFields,
  language = 'en',
}: MedicineFactCardProps) {
  const t = getTranslation(language);

  return (
    <article
      aria-label={`Verified Medicine Monograph for ${facts.genericName}`}
      className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in"
    >
      {/* Monograph Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {facts.genericName}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {t.verifiedMonographBadge}
            </span>
            {facts.medicineCategory?.data && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {facts.medicineCategory.data}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 space-y-0.5">
            {facts.verifiedBrandNames.length > 0 && (
              <p>
                {t.verifiedBrandNames}: <span className="font-medium text-slate-700 dark:text-slate-300">{facts.verifiedBrandNames.join(', ')}</span>
              </p>
            )}
            {facts.aliases && facts.aliases.length > 0 && (
              <p>
                {t.aliasesLabel}: <span className="font-medium text-slate-700 dark:text-slate-300">{facts.aliases.join(', ')}</span>
              </p>
            )}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 dark:text-slate-500">
          ID: {medicineId}
        </div>
      </div>

      {/* Official Source Provenance Clarity Notice */}
      <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 text-teal-950 dark:text-teal-200 text-xs space-y-1">
        <div className="flex items-center gap-2 font-semibold text-teal-900 dark:text-teal-100">
          <span className="select-none text-sm" aria-hidden="true">📋</span>
          <span>{t.sourceReferenceNotice}</span>
        </div>
        <p className="text-[11.5px] text-teal-800 dark:text-teal-300 leading-relaxed">
          {t.sourceReferenceExplainer}
        </p>
      </div>

      {/* Strict Dosage Exclusion Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
        <span className="text-base select-none" aria-hidden="true">⚠️</span>
        <p className="leading-relaxed">
          <strong>{t.noDosageTitle}:</strong> {t.noDosageNotice}
        </p>
      </div>

      {/* Primary Key Characteristics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400 block font-medium">{t.activeIngredients}</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
            {facts.activeIngredients.map((ai) => ai.name).join(', ')}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block font-medium">{t.availableFormulations}</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
            {facts.dosageForms.join(', ')}
          </span>
        </div>
      </div>

      {/* Clinical Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Documented Uses */}
        <AssessedBlock
          title={t.documentedUses}
          field={facts.documentedUses}
          explicitlyAbsentLabel={t.explicitlyAbsent}
          unassessedLabel={t.unassessedInLabel}
          variant="info"
        />

        {/* Mechanism of Action */}
        <AssessedBlock
          title={t.mechanismOfAction}
          field={facts.mechanismOfAction}
          explicitlyAbsentLabel={t.explicitlyAbsent}
          unassessedLabel={t.unassessedInLabel}
          variant="neutral"
        />

        {/* Serious Warnings */}
        <AssessedBlock
          title={t.seriousWarnings}
          field={facts.seriousWarnings}
          explicitlyAbsentLabel={t.explicitlyAbsent}
          unassessedLabel={t.unassessedInLabel}
          variant="danger"
        />

        {/* Contraindications */}
        <AssessedBlock
          title={t.contraindications}
          field={facts.contraindications}
          explicitlyAbsentLabel={t.explicitlyAbsent}
          unassessedLabel={t.unassessedInLabel}
          variant="danger"
        />

        {/* Common Side Effects */}
        <AssessedBlock
          title={t.commonSideEffects}
          field={facts.commonSideEffects}
          explicitlyAbsentLabel={t.explicitlyAbsent}
          unassessedLabel={t.unassessedInLabel}
          variant="warning"
        />

        {/* Precautions */}
        <AssessedBlock
          title={t.precautions}
          field={facts.precautions}
          explicitlyAbsentLabel={t.explicitlyAbsent}
          unassessedLabel={t.unassessedInLabel}
          variant="neutral"
        />

        {/* Known Interactions */}
        <AssessedBlock
          title={t.knownInteractions}
          field={facts.knownInteractions}
          explicitlyAbsentLabel={t.explicitlyAbsent}
          unassessedLabel={t.unassessedInLabel}
          variant="neutral"
        />

        {/* Storage */}
        <AssessedBlock
          title={t.storageHandling}
          field={facts.storageInformation}
          explicitlyAbsentLabel={t.explicitlyAbsent}
          unassessedLabel={t.unassessedInLabel}
          variant="neutral"
        />
      </div>

      {/* Missing Information Notice Box */}
      {missingFields.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {t.missingParametersTitle}
          </p>
          <p>
            {t.missingParametersNotice} {missingFields.join(', ')}.
            <em> {t.missingDataReminder}</em>
          </p>
        </div>
      )}

      {/* Source Provenance Footer */}
      {source && (
        <footer className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <span className="font-medium text-slate-700 dark:text-slate-300">{t.monographSource}: </span>
            <span>{source.sourceTitle} ({source.organization})</span>
            {source.jurisdiction && <span className="ml-1 text-slate-400 dark:text-slate-500">[{source.jurisdiction}]</span>}
          </div>
          <div>
            <span className="font-medium text-slate-700 dark:text-slate-300">{t.auditReview}: </span>
            <span className="font-mono">{source.localReviewDate}</span>
            {source.reviewerRole && <span className="ml-1 text-slate-600 dark:text-slate-400">• {source.reviewerRole}</span>}
            {reviewStatus && <span className="ml-2 font-semibold text-teal-700 dark:text-teal-400">[{reviewStatus}]</span>}
          </div>
        </footer>
      )}
    </article>
  );
}
