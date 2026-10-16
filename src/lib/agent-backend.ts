import type {
  AgentRequest,
  AgentResponse,
  AgentErrorResponse,
  SupportedLanguage,
  VerifiedMedicineFacts,
} from '../types/agent.ts';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../types/agent.ts';
import type { MedicineRecord } from '../types/medicine.ts';
import {
  MedicineSearchEngine,
  defaultMedicineSearch,
} from './medicine-search.ts';
import {
  LMStudioClient,
  defaultLMStudioClient,
} from './lm-studio-client.ts';

export const STANDARD_SAFETY_DISCLAIMER =
  'MediGuide AI provides factual clinical reference summaries for educational and informational purposes only. ' +
  'It is not a substitute for professional clinical judgment, diagnosis, or personalized medical care. ' +
  'Never alter, commence, or discontinue medication regimens without consulting a qualified healthcare provider. ' +
  'In the event of a suspected adverse drug reaction or medical emergency, contact emergency medical services or poison control immediately.';

export interface ProcessQueryOptions {
  searchEngine?: MedicineSearchEngine;
  lmClient?: LMStudioClient;
  records?: MedicineRecord[];
  // Safety override for testing harness ONLY:
  allowTestFixturesForTestHarness?: boolean;
}

export class AgentValidationError extends Error {
  public code: string;
  public details?: string[];

  constructor(message: string, code = 'INVALID_REQUEST', details?: string[]) {
    super(message);
    this.name = 'AgentValidationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Validates the incoming agent query request.
 */
export function validateAgentRequest(raw: unknown): AgentRequest {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new AgentValidationError(
      'Request body must be a JSON object with at least a "query" field.',
      'INVALID_BODY'
    );
  }

  const candidate = raw as Record<string, unknown>;

  if (typeof candidate.query !== 'string' || candidate.query.trim().length === 0) {
    throw new AgentValidationError(
      'Field "query" is required and must be a non-empty string.',
      'MISSING_QUERY'
    );
  }

  let language: SupportedLanguage = DEFAULT_LANGUAGE;
  if (candidate.language !== undefined) {
    if (
      typeof candidate.language !== 'string' ||
      !SUPPORTED_LANGUAGES.includes(candidate.language as SupportedLanguage)
    ) {
      throw new AgentValidationError(
        `Language '${String(candidate.language)}' is not supported. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}.`,
        'UNSUPPORTED_LANGUAGE'
      );
    }
    language = candidate.language as SupportedLanguage;
  }

  const strength =
    typeof candidate.strength === 'string' && candidate.strength.trim()
      ? candidate.strength.trim()
      : undefined;

  const unit =
    typeof candidate.unit === 'string' && candidate.unit.trim()
      ? candidate.unit.trim()
      : undefined;

  const dosageForm =
    typeof candidate.dosageForm === 'string' && candidate.dosageForm.trim()
      ? candidate.dosageForm.trim()
      : undefined;

  return {
    query: candidate.query.trim(),
    language,
    strength,
    unit,
    dosageForm,
  };
}

/**
 * Core agent query processor.
 * Deterministically retrieves verified reference records, guards against synthetic fixtures,
 * preserves source provenance, and connects to local LM Studio only for eligible verified references.
 */
export async function processMedicineQuery(
  rawInput: unknown,
  options: ProcessQueryOptions = {}
): Promise<AgentResponse> {
  const requestId = crypto.randomUUID();

  // Step 1: Validate input
  const validated = validateAgentRequest(rawInput);
  const searchEngine = options.searchEngine || defaultMedicineSearch;
  const lmClient = options.lmClient || defaultLMStudioClient;

  // Step 2: Query search engine
  // Production search engine strictly excludes test fixtures (includeTestFixtures: false)
  const searchResult = searchEngine.search({
    query: validated.query,
    strength: validated.strength,
    unit: validated.unit,
    dosageForm: validated.dosageForm,
    includeTestFixtures: Boolean(options.allowTestFixturesForTestHarness),
  });

  // Base response template (model NOT called)
  const baseResponse: AgentResponse = {
    requestId,
    matchStatus: searchResult.status,
    selectedMedicineId: null,
    candidateSummaries: searchResult.candidateSummaries,
    verifiedFacts: null,
    sourceMetadata: null,
    missingFields: [],
    reviewStatus: null,
    requestedLanguage: validated.language || DEFAULT_LANGUAGE,
    aiExplanation: {
      available: false,
      message:
        'Local AI explanation is available only when an official verified reference record is matched. Factual search performed without model invocation.',
    },
    safetyNotice: STANDARD_SAFETY_DISCLAIMER,
    suggestions: searchResult.suggestions || [],
    query: validated.query,
  };

  // Step 3: Handle Ambiguous Match (Model NOT called)
  if (searchResult.status === 'ambiguous') {
    return {
      ...baseResponse,
      missingFields: searchResult.missingInformationNotices,
    };
  }

  // Step 4: Handle Not-Found (Model NOT called)
  if (searchResult.status === 'not-found') {
    return {
      ...baseResponse,
      suggestions: searchResult.suggestions || [],
    };
  }

  // Step 5: Handle Single Candidate Match
  const singleId = searchResult.matchingMedicineIds[0];
  const summary = searchResult.candidateSummaries[0];

  // Safety rule: Refuse to treat synthetic test fixtures as verified medical records (Model NOT called)
  if (summary.isTestFixture || summary.reviewStatus === 'test_fixture') {
    return {
      ...baseResponse,
      matchStatus: 'not-found',
      selectedMedicineId: null,
      candidateSummaries: [],
      verifiedFacts: null,
      sourceMetadata: null,
      missingFields: [],
      reviewStatus: 'test_fixture',
      aiExplanation: {
        available: false,
        message:
          'Medical explanation refused: The queried identifier matches an internal test fixture. Synthetic fixtures are isolated from clinical advice.',
      },
    };
  }

  // Safety rule: Record must have reviewStatus: 'verified_reference' (Model NOT called)
  if (summary.reviewStatus !== 'verified_reference') {
    return {
      ...baseResponse,
      matchStatus: 'not-found',
      selectedMedicineId: null,
      candidateSummaries: [summary],
      verifiedFacts: null,
      sourceMetadata: null,
      missingFields: summary.missingInformationIndicators,
      reviewStatus: summary.reviewStatus,
      aiExplanation: {
        available: false,
        message:
          'Medical explanation refused: This medicine record is currently provisional or under review. Only clinical reference monographs marked "verified_reference" are eligible for publication.',
      },
    };
  }

  // Step 6: Locate full record for verified facts and provenance
  const allRecords = (searchEngine as unknown as { records: MedicineRecord[] }).records || [];
  const fullRecord = allRecords.find((r) => r.id === singleId);

  if (!fullRecord) {
    return {
      ...baseResponse,
      matchStatus: 'not-found',
      message: 'Record identified during search could not be resolved from local storage.',
    } as AgentResponse;
  }

  const verifiedFacts: VerifiedMedicineFacts = {
    genericName: fullRecord.genericName,
    verifiedBrandNames: fullRecord.verifiedBrandNames,
    aliases: fullRecord.aliases,
    activeIngredients: fullRecord.activeIngredients,
    strengthsAndUnits: fullRecord.strengthsAndUnits,
    dosageForms: fullRecord.dosageForms,
    medicineCategory: fullRecord.medicineCategory,
    documentedUses: fullRecord.documentedUses,
    mechanismOfAction: fullRecord.mechanismOfAction,
    commonSideEffects: fullRecord.commonSideEffects,
    seriousWarnings: fullRecord.seriousWarnings,
    contraindications: fullRecord.contraindications,
    precautions: fullRecord.precautions,
    knownInteractions: fullRecord.knownInteractions,
    storageInformation: fullRecord.storageInformation,
    overdoseGuidance: fullRecord.overdoseGuidance,
  };

  // Step 7: Eligible verified reference found — invoke local LM Studio model for grounded explanation
  const genResult = await lmClient.generateGroundedExplanation({
    facts: verifiedFacts,
    source: fullRecord.sourceProvenance,
    language: validated.language || DEFAULT_LANGUAGE,
    missingFields: fullRecord.missingInformationIndicators,
  });

  let explanationMessage = `Local model (${lmClient.getModelId()}) explanation is currently unavailable: ${genResult.errorMessage || 'Local server offline'}. Official clinical reference facts are provided directly above.`;
  if (genResult.errorCode === 'DOSAGE_CONTENT_DETECTED') {
    explanationMessage = 'Medical explanation suppressed: Local model generated content resembling dosage amounts, schedules, or prescribing instructions. MediGuide AI strictly refuses to provide dosing advice. Official reference facts are provided directly above.';
  }

  const aiExplanation = genResult.success && genResult.explanation
    ? {
        available: true,
        message: `Grounded clinical explanation generated using local model ${genResult.modelId || lmClient.getModelId()}.`,
        explanationText: genResult.explanation,
        modelId: genResult.modelId || lmClient.getModelId(),
        language: genResult.language || validated.language,
      }
    : {
        available: false,
        message: explanationMessage,
        modelId: lmClient.getModelId(),
        language: validated.language,
      };

  return {
    ...baseResponse,
    matchStatus: 'exact',
    selectedMedicineId: fullRecord.id,
    candidateSummaries: [summary],
    verifiedFacts,
    sourceMetadata: fullRecord.sourceProvenance,
    missingFields: fullRecord.missingInformationIndicators,
    reviewStatus: fullRecord.reviewStatus,
    aiExplanation,
    suggestions: [],
  };
}

/**
 * Creates a sanitized JSON error response safe for external exposure.
 * Never leaks stack traces, paths, or environment variables.
 */
export function createAgentErrorResponse(
  error: unknown,
  customRequestId?: string
): { response: AgentErrorResponse; statusCode: number } {
  const requestId = customRequestId || crypto.randomUUID();

  if (error instanceof AgentValidationError) {
    return {
      statusCode: 400,
      response: {
        requestId,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  }

  // Generic sanitized fallback
  return {
    statusCode: 500,
    response: {
      requestId,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while processing the medicine inquiry.',
      },
    },
  };
}
