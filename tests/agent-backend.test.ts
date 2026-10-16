import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAgentRequest,
  processMedicineQuery,
  createAgentErrorResponse,
  AgentValidationError,
} from '../src/lib/agent-backend.ts';
import { MedicineSearchEngine } from '../src/lib/medicine-search.ts';
import type { MedicineRecord } from '../src/types/medicine.ts';
import type { LMStudioClient } from '../src/lib/lm-studio-client.ts';
import { POST, GET } from '../src/app/api/medicine/route.ts';

// Mock verified reference record for tests
const mockVerifiedRecord: MedicineRecord = {
  id: 'ref-verified-amoxicillin-500',
  genericName: 'Amoxicillin',
  verifiedBrandNames: ['Amoxil', 'Trimox'],
  activeIngredients: [
    { name: 'amoxicillin trihydrate', strength: '500', unit: 'mg' },
  ],
  strengthsAndUnits: [{ strength: '500', unit: 'mg' }],
  dosageForms: ['capsule'],
  medicineCategory: {
    status: 'verified_present',
    data: 'Beta-Lactam Antibacterial (Aminopenicillin)',
    note: 'Pharmacological class',
  },
  documentedUses: {
    status: 'verified_present',
    data: ['Treatment of susceptible bacterial infections.'],
  },
  mechanismOfAction: {
    status: 'verified_present',
    data: 'Inhibition of cell wall biosynthesis through binding to penicillin-binding proteins.',
    note: 'Pharmacodynamics reference',
  },
  commonSideEffects: {
    status: 'verified_present',
    data: ['Nausea', 'Vomiting', 'Diarrhea', 'Rash'],
  },
  seriousWarnings: {
    status: 'verified_present',
    data: ['Anaphylaxis in penicillin-allergic patients.'],
  },
  contraindications: {
    status: 'verified_present',
    data: ['Known serious hypersensitivity to beta-lactam antibacterials.'],
  },
  precautions: {
    status: 'verified_present',
    data: ['Monitor for Clostridioides difficile-associated diarrhea.'],
  },
  knownInteractions: {
    status: 'verified_present',
    data: [
      {
        interactingAgent: 'Probenecid',
        severity: 'moderate',
        description: 'Decreases renal tubular secretion of amoxicillin.',
      },
    ],
  },
  storageInformation: {
    status: 'verified_present',
    data: 'Store below 20°C in dry conditions.',
  },
  overdoseGuidance: {
    status: 'verified_present',
    data: 'Supportive care; hemodialysis removes amoxicillin from circulation.',
  },
  sourceProvenance: {
    sourceTitle: 'US FDA Approved Prescribing Information - Amoxil',
    organization: 'US Food and Drug Administration',
    documentIdentifierOrUrl: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=test-amoxil',
    publicationOrRevisionDate: '2025-01-15',
    localReviewDate: '2026-10-16',
  },
  reviewStatus: 'verified_reference',
  isTestFixture: false,
  missingInformationIndicators: [],
};

// Mock provisional / unreviewed record
const mockProvisionalRecord: MedicineRecord = {
  ...mockVerifiedRecord,
  id: 'ref-provisional-drug',
  genericName: 'ProvisionalDrug',
  reviewStatus: 'provisional',
  missingInformationIndicators: ['seriousWarnings'],
};

// Mock search engine containing verified, provisional, and synthetic records
const mockEngine = new MedicineSearchEngine([
  mockVerifiedRecord,
  mockProvisionalRecord,
]);

// ---------------------------------------------------------------------------
// Unit Tests: Request Validation
// ---------------------------------------------------------------------------

test('Agent Request Validation - Accepts valid query and language', () => {
  const req = validateAgentRequest({ query: 'Amoxicillin', language: 'es' });
  assert.equal(req.query, 'Amoxicillin');
  assert.equal(req.language, 'es');
});

test('Agent Request Validation - Defaults language to "en" when omitted', () => {
  const req = validateAgentRequest({ query: 'Amoxicillin' });
  assert.equal(req.query, 'Amoxicillin');
  assert.equal(req.language, 'en');
});

test('Agent Request Validation - Rejects missing or whitespace-only query', () => {
  assert.throws(
    () => validateAgentRequest({ query: '   ' }),
    (err: unknown) => {
      assert.ok(err instanceof AgentValidationError);
      assert.equal(err.code, 'MISSING_QUERY');
      return true;
    }
  );

  assert.throws(
    () => validateAgentRequest({}),
    (err: unknown) => {
      assert.ok(err instanceof AgentValidationError);
      assert.equal(err.code, 'MISSING_QUERY');
      return true;
    }
  );
});

test('Agent Request Validation - Rejects non-object bodies', () => {
  assert.throws(
    () => validateAgentRequest('string body'),
    (err: unknown) => {
      assert.ok(err instanceof AgentValidationError);
      assert.equal(err.code, 'INVALID_BODY');
      return true;
    }
  );

  assert.throws(
    () => validateAgentRequest(null),
    (err: unknown) => {
      assert.ok(err instanceof AgentValidationError);
      assert.equal(err.code, 'INVALID_BODY');
      return true;
    }
  );
});

test('Agent Request Validation - Rejects unsupported language', () => {
  assert.throws(
    () => validateAgentRequest({ query: 'Amoxicillin', language: 'klingon' }),
    (err: unknown) => {
      assert.ok(err instanceof AgentValidationError);
      assert.equal(err.code, 'UNSUPPORTED_LANGUAGE');
      assert.ok(err.message.includes('klingon'));
      return true;
    }
  );
});

// ---------------------------------------------------------------------------
// Unit Tests: Agent Workflow & Safety
// ---------------------------------------------------------------------------

test('Agent Workflow - Unknown medicine returns not-found with safety disclaimer', async () => {
  const res = await processMedicineQuery(
    { query: 'NonExistentDrug12345' },
    { searchEngine: mockEngine }
  );

  assert.equal(res.matchStatus, 'not-found');
  assert.equal(res.selectedMedicineId, null);
  assert.equal(res.verifiedFacts, null);
  assert.ok(res.requestId.length > 0);
  assert.ok(res.safetyNotice.includes('MediGuide AI provides factual clinical reference'));
  assert.equal(res.aiExplanation.available, false);
});

test('Agent Workflow - Synthetic test fixtures are excluded in default production mode', async () => {
  // Querying standard test fixture name in default mode (uses defaultDataset)
  const res = await processMedicineQuery({ query: 'Test-Compound-Alpha' });

  assert.equal(res.matchStatus, 'not-found');
  assert.equal(res.selectedMedicineId, null);
  assert.equal(res.verifiedFacts, null);
});

test('Agent Workflow - Refuses medical explanation for synthetic test fixtures even if bypassed by harness', async () => {
  const res = await processMedicineQuery(
    { query: 'Test-Compound-Beta' },
    { allowTestFixturesForTestHarness: true }
  );

  assert.equal(res.matchStatus, 'not-found');
  assert.equal(res.selectedMedicineId, null);
  assert.equal(res.verifiedFacts, null);
  assert.ok(
    res.aiExplanation.message.includes(
      'Medical explanation refused: The queried identifier matches an internal test fixture'
    )
  );
});

test('Agent Workflow - Refuses unreviewed/provisional records', async () => {
  const res = await processMedicineQuery(
    { query: 'ProvisionalDrug' },
    { searchEngine: mockEngine }
  );

  assert.equal(res.matchStatus, 'not-found');
  assert.equal(res.selectedMedicineId, null);
  assert.equal(res.verifiedFacts, null);
  assert.ok(
    res.aiExplanation.message.includes('Medical explanation refused: This medicine record is currently provisional')
  );
});

test('Agent Workflow - Verified reference match returns structured facts and invokes local model', async () => {
  const mockLMClient = {
    getModelId: () => 'medgemma-4b-it',
    generateGroundedExplanation: async () => ({
      success: true,
      explanation: 'Grounded clinical summary of amoxicillin facts.',
      modelId: 'medgemma-4b-it',
      language: 'en' as const,
    }),
  } as unknown as LMStudioClient;

  const res = await processMedicineQuery(
    { query: 'Amoxicillin', language: 'en' },
    { searchEngine: mockEngine, lmClient: mockLMClient }
  );

  assert.equal(res.matchStatus, 'exact');
  assert.equal(res.selectedMedicineId, 'ref-verified-amoxicillin-500');
  assert.ok(res.verifiedFacts !== null);
  assert.equal(res.verifiedFacts.genericName, 'Amoxicillin');
  assert.equal(res.sourceMetadata?.sourceTitle, 'US FDA Approved Prescribing Information - Amoxil');
  assert.equal(res.sourceMetadata?.organization, 'US Food and Drug Administration');
  assert.equal(res.reviewStatus, 'verified_reference');
  assert.equal(res.aiExplanation.available, true);
  assert.equal(res.aiExplanation.explanationText, 'Grounded clinical summary of amoxicillin facts.');
  assert.equal(res.aiExplanation.modelId, 'medgemma-4b-it');
});

test('Agent Workflow - Verified reference match gracefully handles model offline', async () => {
  const offlineLMClient = {
    getModelId: () => 'medgemma-4b-it',
    generateGroundedExplanation: async () => ({
      success: false,
      errorCode: 'CONNECTION_FAILURE',
      errorMessage: 'Local server offline',
    }),
  } as unknown as LMStudioClient;

  const res = await processMedicineQuery(
    { query: 'Amoxicillin', language: 'en' },
    { searchEngine: mockEngine, lmClient: offlineLMClient }
  );

  assert.equal(res.matchStatus, 'exact');
  assert.equal(res.selectedMedicineId, 'ref-verified-amoxicillin-500');
  assert.ok(res.verifiedFacts !== null); // Verified reference facts preserved!
  assert.equal(res.aiExplanation.available, false);
  assert.ok(res.aiExplanation.message.includes('Local model (medgemma-4b-it) explanation is currently unavailable'));
});

test('Agent Workflow - Ambiguous query preserves candidate summaries and does not silently pick one', async () => {
  // Querying "IsoTest Multi-Brand" in default dataset with test harness enabled to inspect ambiguity behavior
  const res = await processMedicineQuery(
    { query: 'IsoTest Multi-Brand' },
    { allowTestFixturesForTestHarness: true }
  );

  assert.equal(res.matchStatus, 'ambiguous');
  assert.equal(res.selectedMedicineId, null);
  assert.equal(res.verifiedFacts, null);
  assert.equal(res.candidateSummaries.length, 2);
  assert.ok(res.candidateSummaries.some((c) => c.id === 'fixture-ambiguous-one'));
  assert.ok(res.candidateSummaries.some((c) => c.id === 'fixture-ambiguous-two'));
});

// ---------------------------------------------------------------------------
// Integration Tests: API Route Handler (/api/medicine)
// ---------------------------------------------------------------------------

test('API Route Handler - POST with valid query returns HTTP 200', async () => {
  const request = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'NonExistentTestDrug', language: 'en' }),
  });

  const response = await POST(request);
  assert.equal(response.status, 200);

  const data = (await response.json()) as {
    matchStatus: string;
    requestId: string;
    selectedMedicineId: string | null;
  };

  assert.equal(data.matchStatus, 'not-found');
  assert.equal(data.selectedMedicineId, null);
  assert.ok(data.requestId.length > 0);
});

test('API Route Handler - POST with missing query returns HTTP 400', async () => {
  const request = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'en' }), // Missing query
  });

  const response = await POST(request);
  assert.equal(response.status, 400);

  const data = (await response.json()) as {
    error: { code: string; message: string };
  };

  assert.equal(data.error.code, 'MISSING_QUERY');
});

test('API Route Handler - POST with invalid language returns HTTP 400', async () => {
  const request = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Aspirin', language: 'invalid_lang' }),
  });

  const response = await POST(request);
  assert.equal(response.status, 400);

  const data = (await response.json()) as {
    error: { code: string; message: string };
  };

  assert.equal(data.error.code, 'UNSUPPORTED_LANGUAGE');
});

test('API Route Handler - POST with malformed JSON returns HTTP 400', async () => {
  const request = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ invalid_json_syntax: true, ',
  });

  const response = await POST(request);
  assert.equal(response.status, 400);

  const data = (await response.json()) as {
    error: { code: string; message: string };
  };

  assert.equal(data.error.code, 'MALFORMED_JSON');
});

test('API Route Handler - GET returns HTTP 405 Method Not Allowed', async () => {
  const response = await GET();
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'POST');

  const data = (await response.json()) as {
    error: { code: string; message: string };
  };

  assert.equal(data.error.code, 'METHOD_NOT_ALLOWED');
});

test('API Route Handler - Sanitized error helper never exposes stack traces', () => {
  const internalError = new Error('Secret database credentials leaked in stack trace');
  const sanitized = createAgentErrorResponse(internalError);

  assert.equal(sanitized.statusCode, 500);
  assert.equal(sanitized.response.error.code, 'INTERNAL_ERROR');
  assert.equal(
    sanitized.response.error.message,
    'An unexpected error occurred while processing the medicine inquiry.'
  );
  // Ensure stack trace is not leaked
  assert.equal((sanitized.response as unknown as { stack?: string }).stack, undefined);
});
