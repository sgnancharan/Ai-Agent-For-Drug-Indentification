'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchForm } from '@/components/SearchForm';
import { MedicineFactCard } from '@/components/MedicineFactCard';
import { AiExplanationCard } from '@/components/AiExplanationCard';
import { AmbiguousResultPanel } from '@/components/AmbiguousResultPanel';
import { NotFoundResultPanel } from '@/components/NotFoundResultPanel';
import { SafetyDisclaimer } from '@/components/SafetyDisclaimer';
import type { AgentResponse, SupportedLanguage, AgentErrorResponse } from '@/types/agent';
import type { MedicineSummary } from '@/types/medicine';
import { getTranslation } from '@/lib/i18n';

export default function Home() {
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('en');

  const t = getTranslation(activeLanguage);

  const executeSearch = async (params: {
    query: string;
    language: SupportedLanguage;
    strength?: string;
    unit?: string;
    dosageForm?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastQuery(params.query);
    setActiveLanguage(params.language);

    try {
      const res = await fetch('/api/medicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        let errorData: AgentErrorResponse | null = null;
        try {
          errorData = (await res.json()) as AgentErrorResponse;
        } catch {
          // ignore json parse error
        }
        setErrorMessage(
          errorData?.error?.message || `Server returned an error (${res.status} ${res.statusText}).`
        );
        setResult(null);
        return;
      }

      const data = (await res.json()) as AgentResponse;
      setResult(data);
    } catch {
      setErrorMessage(
        'Unable to connect to the local MediGuide AI agent service. Please verify that the application server is running.'
      );
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCandidate = (candidate: MedicineSummary) => {
    const candidateStrength = candidate.strengths[0]?.replace(/[^\d.]/g, '') || undefined;
    executeSearch({
      query: candidate.genericName,
      language: activeLanguage,
      strength: candidateStrength,
    });
  };

  const handleSelectSuggestion = (suggestion: string) => {
    executeSearch({
      query: suggestion,
      language: activeLanguage,
    });
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setActiveLanguage(newLang);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div>
        <Header language={activeLanguage} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Hero Section */}
          <section className="text-center sm:text-left space-y-2 py-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.heroTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {t.heroSubtitle}
            </p>
          </section>

          {/* Search Form */}
          <SearchForm
            onSearch={executeSearch}
            isLoading={isLoading}
            initialLanguage={activeLanguage}
            language={activeLanguage}
            onLanguageChange={handleLanguageChange}
          />

          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-sm flex items-start gap-3 animate-fade-in"
            >
              <span className="text-lg select-none" aria-hidden="true">❌</span>
              <div>
                <p className="font-semibold">Query Execution Error</p>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
                <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
              </div>
              <div className="text-center pt-2 text-xs text-slate-400">
                Running deterministic lookup and querying local MedGemma 4B model...
              </div>
            </div>
          )}

          {/* Results Display */}
          {!isLoading && result && (
            <div className="space-y-6">
              {/* Exact Match View */}
              {result.matchStatus === 'exact' && result.verifiedFacts && (
                <>
                  <MedicineFactCard
                    medicineId={result.selectedMedicineId || 'verified-record'}
                    facts={result.verifiedFacts}
                    source={result.sourceMetadata}
                    reviewStatus={result.reviewStatus}
                    missingFields={result.missingFields}
                    language={result.requestedLanguage || activeLanguage}
                  />

                  <AiExplanationCard
                    explanation={result.aiExplanation}
                    requestedLanguage={result.requestedLanguage || activeLanguage}
                  />
                </>
              )}

              {/* Ambiguous Match View */}
              {result.matchStatus === 'ambiguous' && (
                <AmbiguousResultPanel
                  query={result.query || lastQuery}
                  candidates={result.candidateSummaries}
                  missingNotices={result.missingFields}
                  language={result.requestedLanguage || activeLanguage}
                  onSelectCandidate={handleSelectCandidate}
                />
              )}

              {/* Not Found View */}
              {result.matchStatus === 'not-found' && (
                <NotFoundResultPanel
                  query={result.query || lastQuery}
                  suggestions={result.suggestions}
                  safetyNotice={result.safetyNotice}
                  language={result.requestedLanguage || activeLanguage}
                  onSelectSuggestion={handleSelectSuggestion}
                />
              )}
            </div>
          )}

          {/* Initial Clean Empty State */}
          {!isLoading && !result && !errorMessage && (
            <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                  Ready for Local Medicine Inquiries
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter a medicine name above to verify indications, warnings, contraindications, and drug interactions.
                  All operations run locally with zero internet dependency.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">1. Provenance First</span>
                  <span className="text-slate-500 dark:text-slate-400">Strictly grounded in audited clinical monographs.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">2. No Silent Guesses</span>
                  <span className="text-slate-500 dark:text-slate-400">Ambiguous names present explicit candidate choices.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">3. Local Inference</span>
                  <span className="text-slate-500 dark:text-slate-400">Runs locally on MedGemma 4B IT (Q8_0).</span>
                </div>
              </div>
            </div>
          )}

          {/* Persistent Medical Safety Disclaimer */}
          <SafetyDisclaimer language={activeLanguage} />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediGuide AI — College Hackathon Demonstration Edition</span>
          <span>Offline Architecture • Loopback Only • Strict Provenance</span>
        </div>
      </footer>
    </div>
  );
}
