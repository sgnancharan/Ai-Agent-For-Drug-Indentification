export type SupportedLanguage =
  | 'en'
  | 'te'
  | 'hi'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'es'
  | 'fr';

import type {
  SearchMatchStatus,
  MedicineSummary,
  SourceProvenance,
  ReviewStatus,
  AssessedField,
  ActiveIngredient,
  StrengthAndUnit,
  DrugInteraction,
} from './medicine.ts';

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'en',
  'te',
  'hi',
  'ta',
  'kn',
  'ml',
  'es',
  'fr',
] as const;

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  te: 'Telugu (తెలుగు)',
  hi: 'Hindi (हिन्दी)',
  ta: 'Tamil (தமிழ்)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  es: 'Spanish (Español)',
  fr: 'French (Français)',
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function isSupportedLanguage(lang: unknown): lang is SupportedLanguage {
  return typeof lang === 'string' && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export interface AgentRequest {
  query: string;
  language?: SupportedLanguage;
  strength?: string;
  unit?: string;
  dosageForm?: string;
}

export interface VerifiedMedicineFacts {
  genericName: string;
  verifiedBrandNames: string[];
  aliases?: string[];
  activeIngredients: ActiveIngredient[];
  strengthsAndUnits: StrengthAndUnit[];
  dosageForms: string[];
  medicineCategory: AssessedField<string>;
  documentedUses: AssessedField<string[]>;
  mechanismOfAction: AssessedField<string>;
  commonSideEffects: AssessedField<string[]>;
  seriousWarnings: AssessedField<string[]>;
  contraindications: AssessedField<string[]>;
  precautions: AssessedField<string[]>;
  knownInteractions: AssessedField<DrugInteraction[]>;
  storageInformation: AssessedField<string>;
  overdoseGuidance: AssessedField<string>;
}

export interface AiExplanationStatus {
  available: boolean;
  message: string;
  explanationText?: string;
  modelId?: string;
  language?: SupportedLanguage;
}

export interface AgentResponse {
  requestId: string;
  matchStatus: SearchMatchStatus;
  selectedMedicineId: string | null;
  candidateSummaries: MedicineSummary[];
  verifiedFacts: VerifiedMedicineFacts | null;
  sourceMetadata: SourceProvenance | null;
  missingFields: string[];
  reviewStatus: ReviewStatus | null;
  requestedLanguage: SupportedLanguage;
  aiExplanation: AiExplanationStatus;
  safetyNotice: string;
  suggestions?: string[];
  query: string;
}

export interface AgentErrorDetail {
  code: string;
  message: string;
  details?: string[];
}

export interface AgentErrorResponse {
  requestId: string;
  error: AgentErrorDetail;
}
