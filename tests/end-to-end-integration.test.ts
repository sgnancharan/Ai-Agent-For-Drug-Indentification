import test from 'node:test';
import assert from 'node:assert/strict';
import { processMedicineQuery } from '../src/lib/agent-backend.ts';
import { MedicineSearchEngine } from '../src/lib/medicine-search.ts';
import { LMStudioClient } from '../src/lib/lm-studio-client.ts';
import type { MedicineRecord } from '../src/types/medicine.ts';
import { POST } from '../src/app/api/medicine/route.ts';
import type { AgentResponse, AgentErrorResponse } from '../src/types/agent.ts';

// Verified reference record fixture
const verifiedReferenceRecord: MedicineRecord = {
  id: 'ref-verified-amoxicillin-500',
  genericName: 'Amoxicillin',
  verifiedBrandNames: ['Amoxil'],
  activeIngredients: [{ name: 'Amoxicillin Trihydrate', strength: '500', unit: 'mg' }],
  strengthsAndUnits: [{ strength: '500', unit: 'mg' }],
  dosageForms: ['capsule'],
  medicineCategory: {
    status: 'verified_present',
    data: 'Beta-Lactam Antibacterial (Aminopenicillin)',
    note: 'Pharmacological class',
  },
  documentedUses: {
    status: 'verified_present',
    data: ['Ear, nose, and throat bacterial infections'],
    note: 'Clinical reference only',
  },
  mechanismOfAction: {
    status: 'verified_present',
    data: 'Inhibition of cell wall biosynthesis.',
    note: 'Pharmacodynamics reference',
  },
  commonSideEffects: {
    status: 'verified_present',
    data: ['Nausea', 'Diarrhea'],
    note: 'Clinical reference only',
  },
  seriousWarnings: {
    status: 'verified_present',
    data: ['Severe hypersensitivity reactions'],
    note: 'Boxed warning reference',
  },
  contraindications: {
    status: 'verified_present',
    data: ['Known serious hypersensitivity to beta-lactams'],
    note: 'Contraindication reference',
  },
  precautions: {
    status: 'verified_present',
    data: ['Assess for previous penicillin sensitivity'],
    note: 'Precaution reference',
  },
  knownInteractions: {
    status: 'verified_present',
    data: [{ interactingAgent: 'Probenecid', severity: 'moderate', description: 'Increases amoxicillin blood levels' }],
    note: 'Interaction reference',
  },
  storageInformation: {
    status: 'verified_present',
    data: 'Store at 20°C to 25°C',
    note: 'Storage reference',
  },
  overdoseGuidance: {
    status: 'verified_present',
    data: 'Treat symptomatically; hemodialysis can remove amoxicillin.',
    note: 'Emergency reference',
  },
  isTestFixture: false,
  reviewStatus: 'verified_reference',
  sourceProvenance: {
    sourceTitle: 'FDA Approved Prescribing Information - Amoxil',
    organization: 'US FDA',
    documentIdentifierOrUrl: 'FDA-NDA-050542',
    publicationOrRevisionDate: '2021-08-01',
    localReviewDate: '2025-01-15',
  },
  missingInformationIndicators: [],
};

const provisionalRecord: MedicineRecord = {
  ...verifiedReferenceRecord,
  id: 'ref-provisional-drug',
  genericName: 'ProvisionalDrug',
  reviewStatus: 'provisional',
};

const mockEngine = new MedicineSearchEngine([
  verifiedReferenceRecord,
  provisionalRecord,
]);

// ---------------------------------------------------------------------------
// Phase 6 Failure Scenario & Safety Boundary Tests
// ---------------------------------------------------------------------------

test('Failure Scenario - LM Studio server stopped / unreachable', async () => {
  const unreachableClient = new LMStudioClient({
    baseUrl: 'http://127.0.0.1:54321/v1',
    modelId: 'medgemma-4b-it',
    timeoutMs: 1500,
  });

  const res = await processMedicineQuery(
    { query: 'Amoxicillin', language: 'en' },
    { searchEngine: mockEngine, lmClient: unreachableClient }
  );

  assert.equal(res.matchStatus, 'exact');
  assert.ok(res.verifiedFacts !== null); // Verified facts are preserved
  assert.equal(res.aiExplanation.available, false);
  assert.ok(res.aiExplanation.message.includes('unavailable'));
  assert.ok(res.sourceMetadata !== null);
});

test('Failure Scenario - Request timeout', async () => {
  const timeoutClient = new LMStudioClient({
    baseUrl: 'http://127.0.0.1:12345/v1',
    modelId: 'medgemma-4b-it',
    timeoutMs: 1, // 1 millisecond guarantees abort
  });

  const res = await processMedicineQuery(
    { query: 'Amoxicillin', language: 'en' },
    { searchEngine: mockEngine, lmClient: timeoutClient }
  );

  assert.equal(res.matchStatus, 'exact');
  assert.ok(res.verifiedFacts !== null);
  assert.equal(res.aiExplanation.available, false);
  assert.ok(res.aiExplanation.message.includes('timed out'));
});

test('Failure Scenario - Invalid JSON request', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"invalid": json...',
  });

  const res = await POST(req);
  assert.equal(res.status, 400);

  const errorData = (await res.json()) as AgentErrorResponse;
  assert.equal(errorData.error.code, 'MALFORMED_JSON');
  // Ensure stack traces are never exposed
  assert.equal((errorData as unknown as { stack?: string }).stack, undefined);
});

test('Failure Scenario - Empty search input', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '   ' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 400);

  const errorData = (await res.json()) as AgentErrorResponse;
  assert.equal(errorData.error.code, 'MISSING_QUERY');
});

test('Failure Scenario - Unsupported language', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Amoxicillin', language: 'elvish' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 400);

  const errorData = (await res.json()) as AgentErrorResponse;
  assert.equal(errorData.error.code, 'UNSUPPORTED_LANGUAGE');
});

test('Failure Scenario - Unknown medicine fails safely without hallucination', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'NonExistentDrug123' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as AgentResponse;
  assert.equal(data.matchStatus, 'not-found');
  assert.equal(data.selectedMedicineId, null);
  assert.equal(data.verifiedFacts, null);
  assert.equal(data.aiExplanation.available, false);
});

test('Failure Scenario - Ambiguous medicine never silently selected', async () => {
  const multiRecord1: MedicineRecord = {
    ...verifiedReferenceRecord,
    id: 'amox-250',
    strengthsAndUnits: [{ strength: '250', unit: 'mg' }],
  };
  const multiRecord2: MedicineRecord = {
    ...verifiedReferenceRecord,
    id: 'amox-500',
    strengthsAndUnits: [{ strength: '500', unit: 'mg' }],
  };
  const ambigEngine = new MedicineSearchEngine([multiRecord1, multiRecord2]);

  const res = await processMedicineQuery(
    { query: 'Amoxicillin' },
    { searchEngine: ambigEngine }
  );

  assert.equal(res.matchStatus, 'ambiguous');
  assert.equal(res.candidateSummaries.length, 2);
  assert.equal(res.selectedMedicineId, null);
  assert.equal(res.verifiedFacts, null);
  assert.equal(res.aiExplanation.available, false);
});

test('Failure Scenario - Synthetic test fixture is quarantined in production', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Test-Compound-Alpha' }),
  });

  const res = await POST(req);
  const data = (await res.json()) as AgentResponse;

  assert.equal(data.matchStatus, 'not-found');
  assert.equal(data.aiExplanation.available, false);
});

test('Failure Scenario - Unreviewed medicine record is rejected', async () => {
  const res = await processMedicineQuery(
    { query: 'ProvisionalDrug' },
    { searchEngine: mockEngine }
  );

  assert.equal(res.matchStatus, 'not-found');
  assert.equal(res.verifiedFacts, null);
  assert.equal(res.aiExplanation.available, false);
  assert.ok(res.aiExplanation.message.includes('Medical explanation refused'));
});

test('Failure Scenario - Missing reference fields formatted safely without crash', async () => {
  const incompleteRecord: MedicineRecord = {
    id: 'incomplete-record',
    genericName: 'IncompleteMedicine',
    verifiedBrandNames: [],
    activeIngredients: [],
    strengthsAndUnits: [],
    dosageForms: [],
    medicineCategory: { status: 'not_assessed', note: 'Missing' },
    documentedUses: { status: 'not_assessed', note: 'Missing' },
    mechanismOfAction: { status: 'not_assessed', note: 'Missing' },
    commonSideEffects: { status: 'not_assessed', note: 'Missing' },
    seriousWarnings: { status: 'not_assessed', note: 'Missing' },
    contraindications: { status: 'not_assessed', note: 'Missing' },
    precautions: { status: 'not_assessed', note: 'Missing' },
    knownInteractions: { status: 'not_assessed', note: 'Missing' },
    storageInformation: { status: 'not_assessed', note: 'Missing' },
    overdoseGuidance: { status: 'not_assessed', note: 'Missing' },
    isTestFixture: false,
    reviewStatus: 'verified_reference',
    sourceProvenance: {
      sourceTitle: 'Sparse Monograph',
      organization: 'Agency',
      documentIdentifierOrUrl: 'DOC-001',
      localReviewDate: '2025-01-01',
    },
    missingInformationIndicators: ['documentedUses', 'seriousWarnings'],
  };

  const sparseEngine = new MedicineSearchEngine([incompleteRecord]);
  const mockLMClient = {
    getModelId: () => 'medgemma-4b-it',
    generateGroundedExplanation: async () => ({
      success: true,
      explanation: 'Explanation for sparse monograph.',
      modelId: 'medgemma-4b-it',
      language: 'en' as const,
    }),
  } as unknown as LMStudioClient;

  const res = await processMedicineQuery(
    { query: 'IncompleteMedicine', language: 'en' },
    { searchEngine: sparseEngine, lmClient: mockLMClient }
  );

  assert.equal(res.matchStatus, 'exact');
  assert.equal(res.verifiedFacts?.genericName, 'IncompleteMedicine');
  assert.equal(res.aiExplanation.available, true);
});

test('Failure Scenario - Malformed or empty model response handled gracefully', async () => {
  const emptyOutputLMClient = {
    getModelId: () => 'medgemma-4b-it',
    generateGroundedExplanation: async () => ({
      success: false,
      errorCode: 'MALFORMED_OUTPUT',
      errorMessage: 'Local model returned empty or whitespace-only response.',
    }),
  } as unknown as LMStudioClient;

  const res = await processMedicineQuery(
    { query: 'Amoxicillin', language: 'en' },
    { searchEngine: mockEngine, lmClient: emptyOutputLMClient }
  );

  assert.equal(res.matchStatus, 'exact');
  assert.ok(res.verifiedFacts !== null); // Verified facts remain completely intact
  assert.equal(res.aiExplanation.available, false);
  assert.ok(res.aiExplanation.message.includes('MALFORMED_OUTPUT') || res.aiExplanation.message.includes('unavailable'));
});
