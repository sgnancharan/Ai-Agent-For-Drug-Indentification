import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LMStudioClient,
  validateLoopbackUrl,
  validateOutputAgainstDosageRules,
} from '../src/lib/lm-studio-client.ts';
import { processMedicineQuery } from '../src/lib/agent-backend.ts';
import { MedicineSearchEngine } from '../src/lib/medicine-search.ts';
import type { MedicineRecord } from '../src/types/medicine.ts';
import type { VerifiedMedicineFacts } from '../src/types/agent.ts';

// Verified reference fixture for unit tests
const testVerifiedRecord: MedicineRecord = {
  id: 'ref-test-cetirizine-10',
  genericName: 'Cetirizine',
  verifiedBrandNames: ['Zyrtec'],
  activeIngredients: [{ name: 'cetirizine hydrochloride', strength: '10', unit: 'mg' }],
  strengthsAndUnits: [{ strength: '10', unit: 'mg' }],
  dosageForms: ['tablet'],
  medicineCategory: { status: 'verified_present', data: 'Antihistamine' },
  documentedUses: { status: 'verified_present', data: ['Relief of symptoms of allergic rhinitis'] },
  mechanismOfAction: { status: 'verified_present', data: 'Selective peripheral H1-receptor antagonist' },
  commonSideEffects: { status: 'verified_present', data: ['Somnolence', 'Dry mouth', 'Fatigue'] },
  seriousWarnings: { status: 'verified_present', data: ['Severe drowsiness with central nervous system depressants'] },
  contraindications: { status: 'verified_present', data: ['End-stage renal disease under 10 mL/min creatinine clearance'] },
  precautions: { status: 'verified_present', data: ['Caution while operating heavy machinery'] },
  knownInteractions: { status: 'verified_present', data: [{ interactingAgent: 'Alcohol', severity: 'moderate' }] },
  storageInformation: { status: 'verified_present', data: 'Store at 20°C to 25°C' },
  overdoseGuidance: { status: 'verified_present', data: 'Gastric lavage, symptomatic support' },
  sourceProvenance: {
    sourceTitle: 'FDA Monograph - Cetirizine HCl',
    organization: 'US FDA',
    documentIdentifierOrUrl: 'https://dailymed.nlm.nih.gov/test-cetirizine',
    localReviewDate: '2026-10-16',
  },
  reviewStatus: 'verified_reference',
  isTestFixture: false,
  missingInformationIndicators: [],
};

const testProvisionalRecord: MedicineRecord = {
  ...testVerifiedRecord,
  id: 'ref-test-provisional',
  genericName: 'ProvisionalMed',
  reviewStatus: 'provisional',
};

const testEngine = new MedicineSearchEngine([
  testVerifiedRecord,
  testProvisionalRecord,
]);

// ---------------------------------------------------------------------------
// Security & URL Validation Tests
// ---------------------------------------------------------------------------

test('LM Studio Client - Accepts valid loopback addresses', () => {
  assert.doesNotThrow(() => validateLoopbackUrl('http://127.0.0.1:1234/v1'));
  assert.doesNotThrow(() => validateLoopbackUrl('http://localhost:1234/v1'));
  assert.doesNotThrow(() => validateLoopbackUrl('http://127.0.0.1:12345/v1'));
});

test('LM Studio Client - Strictly rejects external and cloud URLs', () => {
  assert.throws(
    () => validateLoopbackUrl('https://api.openai.com/v1'),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes('Security violation'));
      return true;
    }
  );

  assert.throws(
    () => validateLoopbackUrl('http://192.168.1.50:1234/v1'),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes('Security violation'));
      return true;
    }
  );
});

// ---------------------------------------------------------------------------
// Unit Tests: Model Explanation Client (Mocked)
// ---------------------------------------------------------------------------

test('LM Studio Client - Successful local model response parsing', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Cetirizine 10mg is an antihistamine used to relieve allergy symptoms such as runny nose and sneezing.',
            },
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const client = new LMStudioClient({ baseUrl: 'http://127.0.0.1:1234/v1', modelId: 'medgemma-4b-it' });
    const result = await client.generateGroundedExplanation({
      facts: testVerifiedRecord as unknown as VerifiedMedicineFacts,
      source: testVerifiedRecord.sourceProvenance,
      language: 'en',
    });

    assert.equal(result.success, true);
    assert.ok(result.explanation?.includes('Cetirizine 10mg'));
    assert.equal(result.modelId, 'medgemma-4b-it');
    assert.equal(result.language, 'en');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('LM Studio Client - Handles reasoning_content when content is empty', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: 'assistant',
              content: '',
              reasoning_content: 'Reasoning-derived explanation for Cetirizine.',
            },
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const client = new LMStudioClient({ baseUrl: 'http://127.0.0.1:1234/v1' });
    const result = await client.generateGroundedExplanation({
      facts: testVerifiedRecord as unknown as VerifiedMedicineFacts,
      source: testVerifiedRecord.sourceProvenance,
      language: 'en',
    });

    assert.equal(result.success, true);
    assert.equal(result.explanation, 'Reasoning-derived explanation for Cetirizine.');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('LM Studio Client - Handles connection failure gracefully', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError('fetch failed: ECONNREFUSED');
  };

  try {
    const client = new LMStudioClient({ baseUrl: 'http://127.0.0.1:1234/v1' });
    const result = await client.generateGroundedExplanation({
      facts: testVerifiedRecord as unknown as VerifiedMedicineFacts,
      source: testVerifiedRecord.sourceProvenance,
      language: 'en',
    });

    assert.equal(result.success, false);
    assert.equal(result.errorCode, 'CONNECTION_FAILURE');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('LM Studio Client - Handles timeout correctly', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  };

  try {
    const client = new LMStudioClient({ baseUrl: 'http://127.0.0.1:1234/v1', timeoutMs: 100 });
    const result = await client.generateGroundedExplanation({
      facts: testVerifiedRecord as unknown as VerifiedMedicineFacts,
      source: testVerifiedRecord.sourceProvenance,
      language: 'en',
    });

    assert.equal(result.success, false);
    assert.equal(result.errorCode, 'TIMEOUT');
    assert.ok(result.errorMessage?.includes('timed out'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('LM Studio Client - Handles malformed empty model output', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { role: 'assistant', content: '   ' } }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const client = new LMStudioClient({ baseUrl: 'http://127.0.0.1:1234/v1' });
    const result = await client.generateGroundedExplanation({
      facts: testVerifiedRecord as unknown as VerifiedMedicineFacts,
      source: testVerifiedRecord.sourceProvenance,
      language: 'en',
    });

    assert.equal(result.success, false);
    assert.equal(result.errorCode, 'EMPTY_MODEL_OUTPUT');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('LM Studio Client - Multilingual request passes target language to prompt', async () => {
  let capturedBody = '';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    capturedBody = String(options?.body || '');
    return new Response(
      JSON.stringify({
        choices: [{ message: { role: 'assistant', content: 'సెటిరిజైన్ 10 మి.గ్రా అలెర్జీ లక్షణాల ఉపశమనం కోసం ఉపయోగించబడుతుంది.' } }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const client = new LMStudioClient({ baseUrl: 'http://127.0.0.1:1234/v1' });
    const result = await client.generateGroundedExplanation({
      facts: testVerifiedRecord as unknown as VerifiedMedicineFacts,
      source: testVerifiedRecord.sourceProvenance,
      language: 'te', // Telugu
    });

    assert.equal(result.success, true);
    assert.equal(result.language, 'te');
    assert.ok(capturedBody.includes('Telugu'));
    assert.ok(capturedBody.includes('TARGET LANGUAGE: Telugu'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ---------------------------------------------------------------------------
// Safety Boundary Tests: Never Call Model Inappropriately
// ---------------------------------------------------------------------------

test('Safety Guardrail - Unknown medicine NEVER calls the model', async () => {
  let modelCallCount = 0;
  const spyClient = {
    getModelId: () => 'medgemma-4b-it',
    generateGroundedExplanation: async () => {
      modelCallCount++;
      return { success: true, explanation: 'Should never happen' };
    },
  } as unknown as LMStudioClient;

  const res = await processMedicineQuery(
    { query: 'CompletelyNonExistentDrug123' },
    { searchEngine: testEngine, lmClient: spyClient }
  );

  assert.equal(res.matchStatus, 'not-found');
  assert.equal(modelCallCount, 0, 'Model must NOT be called for unknown medicine');
});

test('Safety Guardrail - Synthetic test fixture NEVER calls the model', async () => {
  let modelCallCount = 0;
  const spyClient = {
    getModelId: () => 'medgemma-4b-it',
    generateGroundedExplanation: async () => {
      modelCallCount++;
      return { success: true, explanation: 'Should never happen' };
    },
  } as unknown as LMStudioClient;

  const res = await processMedicineQuery(
    { query: 'Test-Compound-Alpha' },
    { lmClient: spyClient }
  );

  assert.equal(res.matchStatus, 'not-found');
  assert.equal(modelCallCount, 0, 'Model must NOT be called for synthetic fixtures');
});

test('Safety Guardrail - Unreviewed/provisional record NEVER calls the model', async () => {
  let modelCallCount = 0;
  const spyClient = {
    getModelId: () => 'medgemma-4b-it',
    generateGroundedExplanation: async () => {
      modelCallCount++;
      return { success: true, explanation: 'Should never happen' };
    },
  } as unknown as LMStudioClient;

  const res = await processMedicineQuery(
    { query: 'ProvisionalMed' },
    { searchEngine: testEngine, lmClient: spyClient }
  );

  assert.equal(res.matchStatus, 'not-found');
  assert.equal(modelCallCount, 0, 'Model must NOT be called for unreviewed records');
});

test('Safety Guardrail - Eligible reviewed record passes ONLY reference facts to model', async () => {
  let passedFacts: unknown = null;
  const spyClient = {
    getModelId: () => 'medgemma-4b-it',
    generateGroundedExplanation: async (params: { facts: VerifiedMedicineFacts }) => {
      passedFacts = params.facts;
      return {
        success: true,
        explanation: 'Verified explanation',
        modelId: 'medgemma-4b-it',
        language: 'en' as const,
      };
    },
  } as unknown as LMStudioClient;

  const res = await processMedicineQuery(
    { query: 'Cetirizine', language: 'en' },
    { searchEngine: testEngine, lmClient: spyClient }
  );

  assert.equal(res.matchStatus, 'exact');
  assert.ok(passedFacts !== null, 'Model should be called for verified reference');
  assert.equal((passedFacts as VerifiedMedicineFacts).genericName, 'Cetirizine');
  assert.equal(res.aiExplanation.available, true);
  assert.equal(res.aiExplanation.explanationText, 'Verified explanation');
});

// ---------------------------------------------------------------------------
// Phase 7: Strict Output Dosage Prohibition & Detection Tests
// ---------------------------------------------------------------------------

test('Deterministic Output Validation - Rejects clinical dosage amounts and schedules', () => {
  const violatingSamples = [
    'Take 2 tablets twice a day with water for fever relief.',
    'The recommended starting dose of this drug is 500mg.',
    'Adults can consume 1000 mg every 4 to 6 hours as needed.',
    'Do not exceed the maximum daily dose of 4000mg.',
    'Pediatric dosage is calculated as 10 mg/kg every 8 hours.',
    'Administer 1 tablet every 12 hours.',
    'Take 500mg by mouth 3 times a day.',
  ];

  for (const sample of violatingSamples) {
    const result = validateOutputAgainstDosageRules(sample);
    assert.equal(
      result.isValid,
      false,
      `Expected output validation to reject dosage statement: "${sample}"`
    );
    assert.ok(result.reason && result.reason.includes('dosage prohibition rules'));
  }
});

test('Deterministic Output Validation - Accepts factual non-dosage medical descriptions', () => {
  const safeSamples = [
    'Cetirizine is a second-generation antihistamine used to relieve allergy symptoms such as runny nose and sneezing.',
    'Paracetamol provides analgesia and antipyresis through central nervous system inhibition of prostaglandin synthesis.',
    'Amoxicillin is a beta-lactam penicillin-class antibacterial agent used for susceptible bacterial infections.',
    'Common side effects include drowsiness and dry mouth. Severe liver injury can occur with excessive alcohol consumption.',
  ];

  for (const sample of safeSamples) {
    const result = validateOutputAgainstDosageRules(sample);
    assert.equal(
      result.isValid,
      true,
      `Expected output validation to accept safe factual statement: "${sample}"`
    );
  }
});

test('Safety Guardrail - Output dosage detection suppresses model response and returns safe notice', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: 'assistant',
              // Model attempts to hallucinate dosage instructions:
              content:
                'Cetirizine is an antihistamine. Take 1 tablet (10mg) once daily before bedtime. Maximum daily dose is 10mg.',
            },
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    const client = new LMStudioClient({
      baseUrl: 'http://127.0.0.1:12345/v1',
      modelId: 'medgemma-4b-it',
    });

    const res = await client.generateGroundedExplanation({
      facts: {
        genericName: testVerifiedRecord.genericName,
        verifiedBrandNames: testVerifiedRecord.verifiedBrandNames,
        aliases: testVerifiedRecord.aliases,
        activeIngredients: testVerifiedRecord.activeIngredients,
        strengthsAndUnits: testVerifiedRecord.strengthsAndUnits,
        dosageForms: testVerifiedRecord.dosageForms,
        medicineCategory: testVerifiedRecord.medicineCategory,
        documentedUses: testVerifiedRecord.documentedUses,
        mechanismOfAction: testVerifiedRecord.mechanismOfAction,
        commonSideEffects: testVerifiedRecord.commonSideEffects,
        seriousWarnings: testVerifiedRecord.seriousWarnings,
        contraindications: testVerifiedRecord.contraindications,
        precautions: testVerifiedRecord.precautions,
        knownInteractions: testVerifiedRecord.knownInteractions,
        storageInformation: testVerifiedRecord.storageInformation,
        overdoseGuidance: testVerifiedRecord.overdoseGuidance,
      },
      source: testVerifiedRecord.sourceProvenance,
      language: 'en',
    });

    assert.equal(res.success, false);
    assert.equal(res.errorCode, 'DOSAGE_CONTENT_DETECTED');
    assert.ok(
      res.errorMessage?.includes('dosage prohibition rules')
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

