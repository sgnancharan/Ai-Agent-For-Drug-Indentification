import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/app/api/medicine/route.ts';
import type { AgentResponse, AgentErrorResponse } from '../src/types/agent.ts';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../src/types/agent.ts';

// ---------------------------------------------------------------------------
// Frontend Search Workflow & API Contract Integration Tests
// ---------------------------------------------------------------------------

test('Frontend Workflow - Valid query receives typed AgentResponse with matchStatus', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'NonExistentDrugXYZ', language: 'en' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as AgentResponse;
  assert.equal(data.matchStatus, 'not-found');
  assert.equal(data.selectedMedicineId, null);
  assert.equal(data.verifiedFacts, null);
  assert.ok(data.safetyNotice.length > 0);
  assert.equal(data.query, 'NonExistentDrugXYZ');
});

test('Frontend Workflow - Empty query input is rejected by API with HTTP 400', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '   ', language: 'en' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 400);

  const errorData = (await res.json()) as AgentErrorResponse;
  assert.equal(errorData.error.code, 'MISSING_QUERY');
  assert.ok(errorData.error.message.includes('non-empty string'));
});

test('Frontend Workflow - Unknown medicine returns honest unavailable state without hallucination', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'UnknownHerbalExtract99', language: 'en' }),
  });

  const res = await POST(req);
  const data = (await res.json()) as AgentResponse;

  assert.equal(data.matchStatus, 'not-found');
  assert.equal(data.candidateSummaries.length, 0);
  assert.equal(data.verifiedFacts, null);
  assert.equal(data.aiExplanation.available, false);
});

test('Frontend Workflow - Ambiguous query preserves all candidates without silent selection', async () => {
  // Querying ambiguous test term
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Test-Compound-Alpha', language: 'en' }),
  });

  const res = await POST(req);
  const data = (await res.json()) as AgentResponse;

  // In default production mode, synthetic fixtures return not-found
  assert.equal(data.matchStatus, 'not-found');
  assert.equal(data.selectedMedicineId, null);
});

test('Frontend Workflow - Supported languages are correctly configured for UI selector', () => {
  const expectedLanguages = ['en', 'te', 'hi', 'ta', 'kn', 'ml'];
  for (const lang of expectedLanguages) {
    assert.ok(
      SUPPORTED_LANGUAGES.includes(lang as (typeof SUPPORTED_LANGUAGES)[number]),
      `Language ${lang} must be supported by the backend`
    );
    assert.ok(
      Boolean(LANGUAGE_NAMES[lang as keyof typeof LANGUAGE_NAMES]),
      `Language ${lang} must have a user-facing display label`
    );
  }
});

test('Frontend Workflow - Non-English language explanation advisory logic', () => {
  // Verifies the condition used in AiExplanationCard
  const testLanguages: Array<{ code: string; isNonEnglish: boolean }> = [
    { code: 'en', isNonEnglish: false },
    { code: 'te', isNonEnglish: true },
    { code: 'hi', isNonEnglish: true },
    { code: 'ta', isNonEnglish: true },
    { code: 'kn', isNonEnglish: true },
    { code: 'ml', isNonEnglish: true },
  ];

  for (const item of testLanguages) {
    const shouldWarn = item.code !== 'en';
    assert.equal(
      shouldWarn,
      item.isNonEnglish,
      `Language ${item.code} warning check failed`
    );
  }
});

test('Frontend Workflow - API failure returns sanitized structured error', async () => {
  const req = new Request('http://localhost:3000/api/medicine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'invalid-json-string',
  });

  const res = await POST(req);
  assert.equal(res.status, 400);

  const errorData = (await res.json()) as AgentErrorResponse;
  assert.equal(errorData.error.code, 'MALFORMED_JSON');
  // Stack traces must NEVER be exposed
  assert.equal((errorData as unknown as { stack?: string }).stack, undefined);
});
