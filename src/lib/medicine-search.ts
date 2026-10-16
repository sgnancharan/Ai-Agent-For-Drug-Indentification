import type {
  MedicineRecord,
  MedicineSummary,
  SearchOptions,
  SearchResult,
  ReviewStatus,
} from '../types/medicine.ts';
import defaultDataset from '../data/medicines.json' with { type: 'json' };

/**
 * Normalizes text by converting to lowercase, removing punctuation,
 * and collapsing multiple whitespace characters.
 */
export function normalizeQuery(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // replace punctuation/symbols with space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Levenshtein distance between two strings for controlled fuzzy suggestions.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Converts a medicine record to a safe, concise candidate summary.
 */
export function toMedicineSummary(med: MedicineRecord): MedicineSummary {
  return {
    id: med.id,
    genericName: med.genericName,
    verifiedBrandNames: med.verifiedBrandNames,
    aliases: med.aliases,
    activeIngredients: med.activeIngredients.map(
      (ai) => `${ai.name}${ai.strength ? ` ${ai.strength}${ai.unit || ''}` : ''}`
    ),
    strengths: med.strengthsAndUnits.map((s) => `${s.strength}${s.unit}`),
    dosageForms: med.dosageForms,
    medicineCategory:
      med.medicineCategory?.status === 'verified_present' && typeof med.medicineCategory.data === 'string'
        ? med.medicineCategory.data
        : undefined,
    reviewStatus: med.reviewStatus,
    isTestFixture: med.isTestFixture,
    missingInformationIndicators: med.missingInformationIndicators,
  };
}

/**
 * Deterministic medicine search engine.
 *
 * Guarantees:
 * 1. Deterministic evaluation order: exact generic -> exact brand -> exact active ingredient.
 * 2. Ambiguity safety: Multiple matches NEVER collapse silently into one.
 * 3. Test fixture segregation: Test fixtures are excluded from production searches unless explicitly requested.
 * 4. Controlled suggestions: Typo suggestions are never automatically selected.
 */
export class MedicineSearchEngine {
  private records: MedicineRecord[];

  constructor(records: MedicineRecord[] = defaultDataset as unknown as MedicineRecord[]) {
    this.records = records;
  }

  /**
   * Search records with full criteria.
   */
  public search(options: SearchOptions): SearchResult {
    const rawQuery = options.query || '';
    const normQuery = normalizeQuery(rawQuery);
    const includeTestFixtures = Boolean(options.includeTestFixtures);

    if (!normQuery) {
      return {
        status: 'not-found',
        query: rawQuery,
        matchingMedicineIds: [],
        candidateSummaries: [],
        missingInformationNotices: [],
        reviewStatus: {},
        suggestions: [],
        message: 'Search query cannot be empty.',
      };
    }

    // Step 1: Filter dataset based on test fixture inclusion policy
    const eligibleRecords = this.records.filter((rec) => {
      if (!includeTestFixtures && (rec.isTestFixture || rec.reviewStatus === 'test_fixture')) {
        return false;
      }
      return true;
    });

    // Step 2: Exact matching across fields
    const genericMatches: MedicineRecord[] = [];
    const brandMatches: MedicineRecord[] = [];
    const ingredientMatches: MedicineRecord[] = [];
    const aliasMatches: MedicineRecord[] = [];

    for (const rec of eligibleRecords) {
      const normGeneric = normalizeQuery(rec.genericName);
      if (normGeneric === normQuery) {
        genericMatches.push(rec);
        continue;
      }

      const brandMatched = rec.verifiedBrandNames.some(
        (brand) => normalizeQuery(brand) === normQuery
      );
      if (brandMatched) {
        brandMatches.push(rec);
        continue;
      }

      const ingMatched = rec.activeIngredients.some(
        (ai) => normalizeQuery(ai.name) === normQuery
      );
      if (ingMatched) {
        ingredientMatches.push(rec);
        continue;
      }

      const aliasMatched = Array.isArray(rec.aliases) && rec.aliases.some(
        (alias) => normalizeQuery(alias) === normQuery
      );
      if (aliasMatched) {
        aliasMatches.push(rec);
      }
    }

    // Combined unique matches in deterministic precedence order
    const matchMap = new Map<string, MedicineRecord>();
    [...genericMatches, ...brandMatches, ...ingredientMatches, ...aliasMatches].forEach((rec) => {
      matchMap.set(rec.id, rec);
    });

    let candidates = Array.from(matchMap.values());

    // Step 3: Filter by strength and unit if specified
    if (options.strength && candidates.length > 0) {
      const targetStrength = options.strength.trim().toLowerCase();
      const targetUnit = options.unit ? options.unit.trim().toLowerCase() : null;

      candidates = candidates.filter((rec) =>
        rec.strengthsAndUnits.some((su) => {
          const strengthMatches = su.strength.toLowerCase() === targetStrength;
          const unitMatches = !targetUnit || su.unit.toLowerCase() === targetUnit;
          return strengthMatches && unitMatches;
        })
      );
    }

    // Step 4: Filter by dosage form if specified
    if (options.dosageForm && candidates.length > 0) {
      const targetForm = normalizeQuery(options.dosageForm);
      candidates = candidates.filter((rec) =>
        rec.dosageForms.some((df) => normalizeQuery(df) === targetForm)
      );
    }

    // Step 5: Gather missing information notices across all candidates
    const missingNotices = new Set<string>();
    const reviewStatusMap: Record<string, ReviewStatus> = {};

    candidates.forEach((c) => {
      reviewStatusMap[c.id] = c.reviewStatus;
      if (c.missingInformationIndicators && c.missingInformationIndicators.length > 0) {
        c.missingInformationIndicators.forEach((ind) => {
          missingNotices.add(
            `Medicine '${c.genericName}' (${c.id}) has unassessed/unknown field: '${ind}'.`
          );
        });
      }
    });

    // Step 6: Determine search outcome status
    if (candidates.length === 1) {
      const single = candidates[0];
      return {
        status: 'exact',
        query: rawQuery,
        matchingMedicineIds: [single.id],
        candidateSummaries: [toMedicineSummary(single)],
        missingInformationNotices: Array.from(missingNotices),
        reviewStatus: reviewStatusMap,
        message: single.isTestFixture
          ? 'Exact match found (TEST FIXTURE ONLY - NOT FOR MEDICAL USE).'
          : 'Exact medicine match found.',
      };
    }

    if (candidates.length > 1) {
      return {
        status: 'ambiguous',
        query: rawQuery,
        matchingMedicineIds: candidates.map((c) => c.id),
        candidateSummaries: candidates.map(toMedicineSummary),
        missingInformationNotices: Array.from(missingNotices),
        reviewStatus: reviewStatusMap,
        message: `Query '${rawQuery}' is ambiguous and matches ${candidates.length} distinct medicine records. Specify formulation, strength, or active ingredient.`,
      };
    }

    // Step 7: Not found - calculate controlled fuzzy suggestions
    const suggestions: string[] = [];
    const maxDistance = normQuery.length <= 4 ? 1 : 2;

    for (const rec of eligibleRecords) {
      const namesToCheck = [
        rec.genericName,
        ...rec.verifiedBrandNames,
        ...(rec.aliases || []),
        ...rec.activeIngredients.map((ai) => ai.name),
      ];

      for (const name of namesToCheck) {
        const normName = normalizeQuery(name);
        const distance = levenshteinDistance(normQuery, normName);
        if (distance <= maxDistance && !suggestions.includes(name)) {
          suggestions.push(name);
        } else if (normName.startsWith(normQuery) && normQuery.length >= 3 && !suggestions.includes(name)) {
          suggestions.push(name);
        }
        if (suggestions.length >= 5) break;
      }
      if (suggestions.length >= 5) break;
    }

    // Check if query matched test fixtures that were excluded
    let excludedFixtureNote = '';
    if (!includeTestFixtures) {
      const fixtureMatches = this.records.filter(
        (rec) =>
          rec.isTestFixture &&
          (normalizeQuery(rec.genericName) === normQuery ||
            rec.verifiedBrandNames.some((b) => normalizeQuery(b) === normQuery))
      );
      if (fixtureMatches.length > 0) {
        excludedFixtureNote =
          ' Note: Synthetic test fixtures matched this term but are excluded from verified medicine results.';
      }
    }

    return {
      status: 'not-found',
      query: rawQuery,
      matchingMedicineIds: [],
      candidateSummaries: [],
      missingInformationNotices: [],
      reviewStatus: {},
      suggestions,
      message: `No verified medicine records matched query '${rawQuery}'.${excludedFixtureNote}`,
    };
  }
}

/**
 * Convenient singleton helper for default search operations.
 */
export const defaultMedicineSearch = new MedicineSearchEngine();
