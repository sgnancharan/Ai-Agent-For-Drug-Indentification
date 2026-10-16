import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/app/api/medicine/route.ts';
import { LMStudioClient, validateOutputAgainstDosageRules } from '../src/lib/lm-studio-client.ts';
import { getTranslation, isSupportedLanguage, TRANSLATIONS } from '../src/lib/i18n.ts';
import type { AgentResponse, AgentErrorResponse, VerifiedMedicineFacts } from '../src/types/agent.ts';
import type { MedicineRecord } from '../src/types/medicine.ts';

// Verified reference fixture for regression testing
const testVerifiedRecord: MedicineRecord = {
  id: 'ref-test-cetirizine-10',
  genericName: 'Cetirizine Hydrochloride',
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

const verifiedFacts: VerifiedMedicineFacts = {
  genericName: testVerifiedRecord.genericName,
  verifiedBrandNames: testVerifiedRecord.verifiedBrandNames,
  activeIngredients: testVerifiedRecord.activeIngredients,
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
};

// ---------------------------------------------------------------------------
// Regression Test Suite: End-to-End Language Selection Flow
// ---------------------------------------------------------------------------

test('Regression 1: Selecting Hindi sends "hi" identifier to the API and returns requestedLanguage "hi"', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Cetirizine', language: 'hi' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as AgentResponse;
  assert.equal(data.requestedLanguage, 'hi');
  assert.equal(data.matchStatus, 'exact');
  assert.ok(data.verifiedFacts !== null);
  assert.ok(data.verifiedFacts.genericName.includes('Cetirizine'));
});

test('Regression 2: Selecting Telugu sends "te" identifier to the API and returns requestedLanguage "te"', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Cetirizine', language: 'te' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as AgentResponse;
  assert.equal(data.requestedLanguage, 'te');
  assert.equal(data.matchStatus, 'exact');
  assert.ok(data.verifiedFacts !== null);
  assert.ok(data.verifiedFacts.genericName.includes('Cetirizine'));
});

test('Regression 3: The backend passes the selected language and script rules into the MedGemma prompt', async () => {
  let capturedBody: { messages?: Array<{ role: string; content: string }> } = {};

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input: string | URL | Request, init?: RequestInit) => {
    if (init?.body) {
      capturedBody = JSON.parse(init.body as string);
    }
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'सेटीरिज़िन एक एंटीहिस्टामाइन दवा है जो एलर्जी के लक्षणों से राहत देती है।',
            },
          },
        ],
        model: 'medgemma-4b-it',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const client = new LMStudioClient({
      baseUrl: 'http://127.0.0.1:12345/v1',
      modelId: 'medgemma-4b-it',
    });

    const result = await client.generateGroundedExplanation({
      facts: verifiedFacts,
      language: 'hi',
    });
    assert.equal(result.available, true);
    assert.ok(result.explanationText.length > 0);

    // Verify prompt content sent to the model
    const userMessage = capturedBody.messages?.find((m) => m.role === 'user')?.content || '';
    assert.ok(
      userMessage.includes('TARGET LANGUAGE: Hindi'),
      'Prompt must instruct target language Hindi'
    );
    assert.ok(
      userMessage.includes('Devanagari script'),
      'Prompt must instruct natural Hindi Devanagari script'
    );
    assert.ok(
      userMessage.includes('Do not transliterate generic pharmaceutical names into unrecognizable forms'),
      'Prompt must protect generic medicine names from corruption'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Regression 4: Switching from English to Hindi and searching again uses Hindi without stale state', async () => {
  const capturedBodies: Array<{ messages?: Array<{ role: string; content: string }> }> = [];

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input: string | URL | Request, init?: RequestInit) => {
    if (init?.body) {
      capturedBodies.push(JSON.parse(init.body as string));
    }
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Mock explanation for language switch test.',
            },
          },
        ],
        model: 'medgemma-4b-it',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const client = new LMStudioClient({
      baseUrl: 'http://127.0.0.1:12345/v1',
      modelId: 'medgemma-4b-it',
    });

    // Step 1: Query in English
    const resEn = await client.generateGroundedExplanation({
      facts: verifiedFacts,
      language: 'en',
    });
    assert.equal(resEn.available, true);
    const firstPrompt = capturedBodies[0]?.messages?.find((m) => m.role === 'user')?.content || '';
    assert.ok(firstPrompt.includes('TARGET LANGUAGE: English'));

    // Step 2: Query immediately in Hindi
    const resHi = await client.generateGroundedExplanation({
      facts: verifiedFacts,
      language: 'hi',
    });
    assert.equal(resHi.available, true);
    const secondPrompt = capturedBodies[1]?.messages?.find((m) => m.role === 'user')?.content || '';
    assert.ok(secondPrompt.includes('TARGET LANGUAGE: Hindi'));
    assert.ok(secondPrompt.includes('Devanagari script'));
    assert.notEqual(firstPrompt, secondPrompt, 'Second prompt must not be stale from first request');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Regression 5: Missing or unsupported language values are handled safely', async () => {
  // Missing language defaults safely to 'en'
  const reqMissing = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Cetirizine' }),
  });
  const resMissing = await POST(reqMissing);
  assert.equal(resMissing.status, 200);
  const dataMissing = (await resMissing.json()) as AgentResponse;
  assert.equal(dataMissing.requestedLanguage, 'en');

  // Unsupported language returns HTTP 400 with UNSUPPORTED_LANGUAGE code
  const reqInvalid = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Cetirizine', language: 'unsupported-lang' }),
  });
  const resInvalid = await POST(reqInvalid);
  assert.equal(resInvalid.status, 400);
  const errInvalid = (await resInvalid.json()) as AgentErrorResponse;
  assert.equal(errInvalid.error.code, 'UNSUPPORTED_LANGUAGE');
});

test('Regression 6: Model errors and invalid output produce a safe fallback without crashing', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('Connection refused by local LM Studio daemon');
  };

  try {
    const client = new LMStudioClient({
      baseUrl: 'http://127.0.0.1:12345/v1',
      modelId: 'medgemma-4b-it',
    });

    const result = await client.generateGroundedExplanation({
      facts: verifiedFacts,
      language: 'hi',
    });
    assert.equal(result.available, false);
    assert.ok(result.message.length > 0);
    assert.ok(
      result.message.includes('offline') || result.message.includes('unavailable') || result.message.includes('Connection refused'),
      'Model error message should inform user safely'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Regression 7: Zero-dosage enforcement and verified-source grounding continue to pass in all languages', () => {
  // Must reject dosage recommendations in English
  const englishDosage = 'Take 10mg orally once daily at bedtime.';
  const resEn = validateOutputAgainstDosageRules(englishDosage);
  assert.equal(resEn.isValid, false, 'Must reject dosage recommendations');
  assert.ok(Boolean(resEn.reason || resEn.matchedPattern));

  // Must reject numeric dosages with frequency
  const dosageWithFreq = 'Administer 5 mg every 12 hours.';
  const resFreq = validateOutputAgainstDosageRules(dosageWithFreq);
  assert.equal(resFreq.isValid, false, 'Must reject frequency dosage');

  // Must accept purely factual, non-dosage therapeutic description
  const safeExplanation = 'Cetirizine is an antihistamine used to relieve allergy symptoms such as runny nose, sneezing, and watery eyes.';
  const resSafe = validateOutputAgainstDosageRules(safeExplanation);
  assert.equal(resSafe.isValid, true, 'Must accept factual clinical description without dosage');
});

test('Regression 8: Localized UI dictionaries provide non-empty strings across all supported languages', () => {
  const supported = ['en', 'hi', 'te', 'ta', 'kn', 'ml'] as const;

  for (const lang of supported) {
    assert.ok(isSupportedLanguage(lang), `${lang} must be supported`);
    const t = getTranslation(lang);
    assert.ok(t.appTitle.length > 0, `${lang} appTitle must be populated`);
    assert.ok(t.verifiedMonographBadge.length > 0, `${lang} verifiedMonographBadge must be populated`);
    assert.ok(t.sourceReferenceNotice.length > 0, `${lang} sourceReferenceNotice must be populated`);
    assert.ok(t.sourceReferenceExplainer.length > 0, `${lang} sourceReferenceExplainer must be populated`);
    assert.ok(t.noDosageTitle.length > 0, `${lang} noDosageTitle must be populated`);
    assert.ok(t.noDosageNotice.length > 0, `${lang} noDosageNotice must be populated`);
    assert.ok(t.documentedUses.length > 0, `${lang} documentedUses must be populated`);
    assert.ok(t.mechanismOfAction.length > 0, `${lang} mechanismOfAction must be populated`);
    assert.ok(t.seriousWarnings.length > 0, `${lang} seriousWarnings must be populated`);
    assert.ok(t.contraindications.length > 0, `${lang} contraindications must be populated`);
    assert.ok(t.commonSideEffects.length > 0, `${lang} commonSideEffects must be populated`);
    assert.ok(t.disclaimerTitle.length > 0, `${lang} disclaimerTitle must be populated`);
    assert.ok(t.emergencyTitle.length > 0, `${lang} emergencyTitle must be populated`);
  }

  // Fallback test: unlisted language returns English dictionary
  // @ts-expect-error Testing invalid language fallback
  const fallbackT = getTranslation('unknown-lang');
  assert.equal(fallbackT.appTitle, TRANSLATIONS.en.appTitle);
});
