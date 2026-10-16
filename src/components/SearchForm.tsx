'use client';

import React, { useState, useEffect } from 'react';
import type { SupportedLanguage } from '@/types/agent';
import { LANGUAGE_NAMES } from '@/types/agent';
import { getTranslation } from '@/lib/i18n';

export interface SearchFormProps {
  onSearch: (params: {
    query: string;
    language: SupportedLanguage;
    strength?: string;
    unit?: string;
    dosageForm?: string;
  }) => void;
  isLoading: boolean;
  initialQuery?: string;
  initialLanguage?: SupportedLanguage;
  language?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

const UI_LANGUAGES: SupportedLanguage[] = [
  'en',
  'hi',
  'te',
  'ta',
  'kn',
  'ml',
];

const EXAMPLE_QUERIES = [
  { label: 'Cetirizine', query: 'Cetirizine' },
  { label: 'Amoxicillin', query: 'Amoxicillin' },
  { label: 'Paracetamol (US)', query: 'Tylenol' },
  { label: 'Paracetamol (IN)', query: 'Crocin' },
  { label: 'Metformin', query: 'Metformin' },
];

export function SearchForm({
  onSearch,
  isLoading,
  initialQuery = '',
  initialLanguage = 'en',
  language: controlledLanguage,
  onLanguageChange,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [internalLanguage, setInternalLanguage] = useState<SupportedLanguage>(controlledLanguage || initialLanguage);
  const [strength, setStrength] = useState('');
  const [unit, setUnit] = useState('mg');
  const [dosageForm, setDosageForm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (controlledLanguage) {
      setInternalLanguage(controlledLanguage);
    } else if (initialLanguage) {
      setInternalLanguage(initialLanguage);
    }
  }, [controlledLanguage, initialLanguage]);

  const activeLanguage = controlledLanguage || internalLanguage;
  const t = getTranslation(activeLanguage);

  const handleLanguageSelect = (newLang: SupportedLanguage) => {
    setInternalLanguage(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    onSearch({
      query: trimmed,
      language: activeLanguage,
      strength: strength.trim() || undefined,
      unit: strength.trim() ? unit.trim() : undefined,
      dosageForm: dosageForm.trim() || undefined,
    });
  };

  const handleChipClick = (q: string) => {
    setQuery(q);
    onSearch({
      query: q,
      language: activeLanguage,
      strength: strength.trim() || undefined,
      unit: strength.trim() ? unit.trim() : undefined,
      dosageForm: dosageForm.trim() || undefined,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Input & Language Selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="medicine-search-input" className="sr-only">
              {t.searchPlaceholder}
            </label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="medicine-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              disabled={isLoading}
              className="w-full pl-11 pr-10 py-3.5 text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={t.clearInput}
              >
                ✕
              </button>
            )}
          </div>

          {/* Language Selector */}
          <div className="w-full sm:w-56">
            <label htmlFor="language-select" className="sr-only">
              {t.targetLanguageLabel}
            </label>
            <select
              id="language-select"
              value={activeLanguage}
              onChange={(e) => handleLanguageSelect(e.target.value as SupportedLanguage)}
              disabled={isLoading}
              className="w-full py-3.5 px-3.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-60 font-medium cursor-pointer"
            >
              {UI_LANGUAGES.map((langCode) => (
                <option key={langCode} value={langCode}>
                  {LANGUAGE_NAMES[langCode] || langCode}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{t.searchingButton}</span>
              </>
            ) : (
              <span>{t.searchButton}</span>
            )}
          </button>
        </div>

        {/* Optional Strength & Formulation Filters Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{showFilters ? t.hideFilters : t.showFilters}</span>
          </button>

          {showFilters && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
              <div>
                <label htmlFor="filter-strength" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.filterStrength}
                </label>
                <input
                  id="filter-strength"
                  type="text"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="e.g. 500, 10"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="filter-unit" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.filterUnit}
                </label>
                <select
                  id="filter-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="mcg">mcg</option>
                  <option value="mL">mL</option>
                  <option value="mg/mL">mg/mL</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-dosage-form" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.filterFormulation}
                </label>
                <input
                  id="filter-dosage-form"
                  type="text"
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  placeholder="e.g. tablet, capsule"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Example Query Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {t.exampleQueriesLabel}
          </span>
          {EXAMPLE_QUERIES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleChipClick(item.query)}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
