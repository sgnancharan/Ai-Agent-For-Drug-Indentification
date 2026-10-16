/**
 * MediGuide AI - Medicine Data Schema (Phase 2)
 *
 * Safety Principles:
 * 1. Distinction of absence: "verified_absent" is distinct from "unknown", "unavailable", or "not_assessed".
 * 2. Missing information rule: Missing information must NEVER be interpreted as evidence that a risk does not exist.
 * 3. Provenance: Every record must carry source provenance and review status.
 * 4. Test fixture safety: Test fixtures must be explicitly flagged and excluded from verified medical queries.
 */

export type AssessmentStatus =
  | 'verified_present'
  | 'verified_absent'
  | 'unknown'
  | 'not_assessed'
  | 'unavailable';

export interface AssessedField<T> {
  status: AssessmentStatus;
  data?: T;
  note?: string;
}

export type ReviewStatus =
  | 'verified_reference' // Manually audited against official clinical/pharmacological reference
  | 'under_review'       // In process of being audited
  | 'provisional'        // Imported draft, pending clinical review
  | 'test_fixture';      // Synthetic test fixture, MUST NOT be used for real clinical advice

export interface ActiveIngredient {
  name: string;
  strength?: string;
  unit?: string;
}

export interface StrengthAndUnit {
  strength: string; // e.g. "500"
  unit: string;     // e.g. "mg"
}

export interface DrugInteraction {
  interactingAgent: string;
  severity?: 'major' | 'moderate' | 'minor' | 'unknown';
  description?: string;
}

export interface AuditEntry {
  reviewDate: string;
  reviewerRole: string;
  reviewStatus: ReviewStatus;
  notes?: string;
}

export interface SourceProvenance {
  sourceTitle: string;
  organization: string;
  jurisdiction?: string; // e.g. "US (FDA)", "IN (CDSCO)"
  documentIdentifierOrUrl: string;
  publicationOrRevisionDate?: string;
  localReviewDate: string;
  reviewerRole?: string;
  auditHistory?: AuditEntry[];
}

export interface MedicineRecord {
  id: string;
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
  sourceProvenance: SourceProvenance;
  reviewStatus: ReviewStatus;
  isTestFixture: boolean;
  missingInformationIndicators: string[];
}

export interface MedicineSummary {
  id: string;
  genericName: string;
  verifiedBrandNames: string[];
  aliases?: string[];
  activeIngredients: string[];
  strengths: string[];
  dosageForms: string[];
  medicineCategory?: string;
  reviewStatus: ReviewStatus;
  isTestFixture: boolean;
  missingInformationIndicators: string[];
}

export type SearchMatchStatus = 'exact' | 'ambiguous' | 'not-found';

export interface SearchOptions {
  query: string;
  strength?: string;
  unit?: string;
  dosageForm?: string;
  includeTestFixtures?: boolean;
}

export interface SearchResult {
  status: SearchMatchStatus;
  query: string;
  matchingMedicineIds: string[];
  candidateSummaries: MedicineSummary[];
  missingInformationNotices: string[];
  reviewStatus: Record<string, ReviewStatus>;
  suggestions?: string[];
  message: string;
}
