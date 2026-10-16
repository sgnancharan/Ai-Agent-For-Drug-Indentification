/**
 * Phase 6 End-to-End Live Integration Verification Script
 * 
 * Tests the live Next.js application at http://localhost:3000
 * and the live LM Studio server at http://127.0.0.1:12345/v1 with MedGemma 4B IT Q8_0.
 */

import { processMedicineQuery } from '../src/lib/agent-backend.ts';
import { MedicineSearchEngine } from '../src/lib/medicine-search.ts';
import { defaultLMStudioClient, LMStudioClient } from '../src/lib/lm-studio-client.ts';
import type { MedicineRecord } from '../src/types/medicine.ts';

// Real verified clinical reference record fixture (matching FDA Amoxil monograph)
const verifiedMonograph: MedicineRecord = {
  id: 'ref-verified-amoxicillin-500',
  genericName: 'Amoxicillin',
  verifiedBrandNames: ['Amoxil', 'Trimox'],
  activeIngredients: [
    {
      name: 'Amoxicillin Trihydrate',
      strength: '500',
      unit: 'mg',
    },
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
    data: ['Ear, nose, and throat bacterial infections', 'Lower respiratory tract infections'],
    note: 'Clinical reference only',
  },
  mechanismOfAction: {
    status: 'verified_present',
    data: 'Inhibition of cell wall biosynthesis through binding to penicillin-binding proteins.',
    note: 'Pharmacodynamics reference',
  },
  commonSideEffects: {
    status: 'verified_present',
    data: ['Nausea', 'Vomiting', 'Diarrhea', 'Skin rash'],
    note: 'Clinical reference only',
  },
  seriousWarnings: {
    status: 'verified_present',
    data: ['Severe hypersensitivity / anaphylactic reactions', 'Clostridioides difficile-associated diarrhea'],
    note: 'Boxed warning reference',
  },
  contraindications: {
    status: 'verified_present',
    data: ['Known serious hypersensitivity to amoxicillin or other beta-lactam antibacterials'],
    note: 'Contraindication reference',
  },
  precautions: {
    status: 'verified_present',
    data: ['Assess for previous penicillin sensitivity prior to therapy'],
    note: 'Precaution reference',
  },
  knownInteractions: {
    status: 'verified_present',
    data: [
      {
        interactingAgent: 'Probenecid',
        severity: 'moderate',
        description: 'Decreases renal tubular secretion of amoxicillin, resulting in higher blood levels.',
      },
    ],
    note: 'Interaction reference',
  },
  storageInformation: {
    status: 'verified_present',
    data: 'Store at 20°C to 25°C (68°F to 77°F). Protect from moisture.',
    note: 'Storage reference',
  },
  overdoseGuidance: {
    status: 'verified_present',
    data: 'Discontinue medication, treat symptomatically, and institute supportive measures. Amoxicillin can be removed by hemodialysis.',
    note: 'Emergency reference',
  },
  isTestFixture: false,
  reviewStatus: 'verified_reference',
  sourceProvenance: {
    sourceTitle: 'US FDA Approved Prescribing Information - Amoxil',
    organization: 'US Food and Drug Administration',
    documentIdentifierOrUrl: 'FDA-NDA-050542',
    publicationOrRevisionDate: '2021-08-01',
    localReviewDate: '2025-01-15',
  },
  missingInformationIndicators: [],
};

async function runLiveTests() {
  console.log('====================================================');
  console.log('[Phase 6 Live Verification] Starting End-to-End Tests');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Frontend SSR Load
  console.log('--- Test 1: Browser/Frontend HTML Load ---');
  try {
    const res = await fetch('http://localhost:3000');
    const html = await res.text();
    console.log(`Frontend Status: ${res.status}`);
    const hasTitle = html.includes('MediGuide AI');
    const hasOfflineBadge = html.includes('Offline');
    const hasModelBadge = html.includes('MedGemma 4B IT (Q8_0)');
    console.log(`  - HTML includes 'MediGuide AI': ${hasTitle}`);
    console.log(`  - HTML includes 'Offline': ${hasOfflineBadge}`);
    console.log(`  - HTML includes 'MedGemma 4B IT (Q8_0)': ${hasModelBadge}`);
    if (!hasTitle || !hasOfflineBadge || !hasModelBadge) throw new Error('Missing expected tokens in HTML');
    console.log('✓ Test 1 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 1 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 2: Live LM Studio Connectivity
  console.log('--- Test 2: Local LM Studio Model Verification ---');
  try {
    const res = await fetch('http://127.0.0.1:12345/v1/models');
    const json = (await res.json()) as { data: Array<{ id: string }> };
    console.log(`LM Studio Status: ${res.status}`);
    console.log(`Available Models:`, json.data.map(m => m.id));
    const hasMedGemma = json.data.some(m => m.id === 'medgemma-4b-it');
    console.log(`  - MedGemma 4B IT loaded: ${hasMedGemma}`);
    if (!hasMedGemma) throw new Error('MedGemma model not loaded in LM Studio');
    console.log('✓ Test 2 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 2 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 3: Search for unknown medicine
  console.log('--- Test 3: Unknown Medicine Query Handling ---');
  try {
    const res = await fetch('http://localhost:3000/api/medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'UnknownHerbalExtract99', language: 'en' }),
    });
    const data = await res.json();
    console.log(`Response HTTP Status: ${res.status}`);
    console.log(`  - Match Status: ${data.matchStatus}`);
    console.log(`  - AI Explanation Available: ${data.aiExplanation?.available}`);
    console.log(`  - Selected Medicine: ${data.selectedMedicineId}`);
    if (data.matchStatus !== 'not-found' || data.aiExplanation.available !== false) {
      throw new Error('Unknown medicine did not fail safely to not-found!');
    }
    console.log('✓ Test 3 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 3 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 4: Synthetic Test Fixture Exclusion
  console.log('--- Test 4: Synthetic Test Fixture Quarantine Enforcement ---');
  try {
    const res = await fetch('http://localhost:3000/api/medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Test-Compound-Alpha', language: 'en' }),
    });
    const data = await res.json();
    console.log(`Response HTTP Status: ${res.status}`);
    console.log(`  - Match Status: ${data.matchStatus}`);
    console.log(`  - AI Explanation Available: ${data.aiExplanation?.available}`);
    if (data.matchStatus !== 'not-found' || data.aiExplanation.available !== false) {
      throw new Error('Synthetic fixture was not excluded in production search!');
    }
    console.log('✓ Test 4 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 4 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 5: Empty Search Request
  console.log('--- Test 5: Empty Search Request Rejection ---');
  try {
    const res = await fetch('http://localhost:3000/api/medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '   ', language: 'en' }),
    });
    const data = await res.json();
    console.log(`Response HTTP Status: ${res.status}`);
    console.log(`  - Error Code: ${data.error?.code}`);
    console.log(`  - Error Message: ${data.error?.message}`);
    if (res.status !== 400 || data.error?.code !== 'MISSING_QUERY') {
      throw new Error('Empty query was not rejected with HTTP 400 MISSING_QUERY');
    }
    console.log('✓ Test 5 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 5 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 6: Malformed JSON
  console.log('--- Test 6: Malformed JSON Handling ---');
  try {
    const res = await fetch('http://localhost:3000/api/medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"query": "broken json...',
    });
    const data = await res.json();
    console.log(`Response HTTP Status: ${res.status}`);
    console.log(`  - Error Code: ${data.error?.code}`);
    console.log(`  - No Stack Trace Leaked: ${data.stack === undefined}`);
    if (res.status !== 400 || data.error?.code !== 'MALFORMED_JSON') {
      throw new Error('Malformed JSON was not rejected with HTTP 400 MALFORMED_JSON');
    }
    console.log('✓ Test 6 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 6 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 7: Unsupported Language
  console.log('--- Test 7: Unsupported Language Handling ---');
  try {
    const res = await fetch('http://localhost:3000/api/medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Paracetamol', language: 'klingon' }),
    });
    const data = await res.json();
    console.log(`Response HTTP Status: ${res.status}`);
    console.log(`  - Error Code: ${data.error?.code}`);
    console.log(`  - Error Message: ${data.error?.message}`);
    if (res.status !== 400 || data.error?.code !== 'UNSUPPORTED_LANGUAGE') {
      throw new Error('Unsupported language was not rejected with HTTP 400 UNSUPPORTED_LANGUAGE');
    }
    console.log('✓ Test 7 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 7 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 8: Live Real Inference Execution via MedGemma 4B IT Q8_0
  console.log('--- Test 8: Live Real Inference Execution via MedGemma ---');
  try {
    const liveEngine = new MedicineSearchEngine([verifiedMonograph]);
    const start = Date.now();
    const result = await processMedicineQuery(
      { query: 'Amoxicillin', language: 'en' },
      { searchEngine: liveEngine, lmClient: defaultLMStudioClient }
    );
    const duration = Date.now() - start;
    console.log(`Inference Duration: ${duration}ms`);
    console.log(`Match Status: ${result.matchStatus}`);
    console.log(`Generic Name: ${result.verifiedFacts?.genericName}`);
    console.log(`AI Explanation Available: ${result.aiExplanation.available}`);
    console.log(`AI Explanation Model: ${result.aiExplanation.modelId}`);
    console.log(`Live Model Output Preview:\n"${result.aiExplanation.explanationText?.slice(0, 200)}..."`);
    if (!result.aiExplanation.available || !result.aiExplanation.explanationText) {
      throw new Error('Live MedGemma inference failed to produce explanation text');
    }
    console.log('✓ Test 8 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 8 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 9: Failure Scenario - LM Studio Unreachable Port
  console.log('--- Test 9: Failure Scenario - LM Studio Port Unreachable ---');
  try {
    const offlineClient = new LMStudioClient({
      baseUrl: 'http://127.0.0.1:54321/v1', // Unreachable port
      modelId: 'medgemma-4b-it',
      timeoutMs: 1500,
    });
    const liveEngine = new MedicineSearchEngine([verifiedMonograph]);
    const result = await processMedicineQuery(
      { query: 'Amoxicillin', language: 'en' },
      { searchEngine: liveEngine, lmClient: offlineClient }
    );
    console.log(`Match Status: ${result.matchStatus}`);
    console.log(`Verified Facts Preserved: ${result.verifiedFacts !== null}`);
    console.log(`AI Explanation Handled Gracefully: ${result.aiExplanation.available === false}`);
    console.log(`AI Message: ${result.aiExplanation.message}`);
    if (result.aiExplanation.available !== false || !result.verifiedFacts) {
      throw new Error('Offline server did not fail safely or stripped verified facts');
    }
    console.log('✓ Test 9 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 9 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 10: Failure Scenario - Request Timeout
  console.log('--- Test 10: Failure Scenario - Request Timeout ---');
  try {
    const timeoutClient = new LMStudioClient({
      baseUrl: 'http://127.0.0.1:12345/v1',
      modelId: 'medgemma-4b-it',
      timeoutMs: 1, // 1ms timeout guarantees abort
    });
    const liveEngine = new MedicineSearchEngine([verifiedMonograph]);
    const result = await processMedicineQuery(
      { query: 'Amoxicillin', language: 'en' },
      { searchEngine: liveEngine, lmClient: timeoutClient }
    );
    console.log(`Match Status: ${result.matchStatus}`);
    console.log(`AI Explanation Available: ${result.aiExplanation.available}`);
    console.log(`AI Message: ${result.aiExplanation.message}`);
    if (result.aiExplanation.available !== false) {
      throw new Error('Timeout did not fail safely');
    }
    console.log('✓ Test 10 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 10 Failed:', (err as Error).message, '\n');
    failed++;
  }

  // Test 11: Ambiguous Medicine Match
  console.log('--- Test 11: Ambiguous Medicine Match Without Silent Pick ---');
  try {
    const multiRecord1: MedicineRecord = {
      ...verifiedMonograph,
      id: 'amox-250',
      strengthsAndUnits: [{ strength: '250', unit: 'mg' }],
    };
    const multiRecord2: MedicineRecord = {
      ...verifiedMonograph,
      id: 'amox-500',
      strengthsAndUnits: [{ strength: '500', unit: 'mg' }],
    };
    const ambigEngine = new MedicineSearchEngine([multiRecord1, multiRecord2]);
    const result = await processMedicineQuery(
      { query: 'Amoxicillin' },
      { searchEngine: ambigEngine, lmClient: defaultLMStudioClient }
    );
    console.log(`Match Status: ${result.matchStatus}`);
    console.log(`Candidate Count: ${result.candidateSummaries.length}`);
    console.log(`AI Explanation: ${result.aiExplanation.available}`);
    if (result.matchStatus !== 'ambiguous' || result.candidateSummaries.length !== 2 || result.aiExplanation.available !== false) {
      throw new Error('Ambiguous query did not preserve candidates or wrongly invoked model');
    }
    console.log('✓ Test 11 Passed\n');
    passed++;
  } catch (err: unknown) {
    console.error('✗ Test 11 Failed:', (err as Error).message, '\n');
    failed++;
  }

  console.log('====================================================');
  console.log(`[Phase 6 Live Verification] Complete: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveTests();
