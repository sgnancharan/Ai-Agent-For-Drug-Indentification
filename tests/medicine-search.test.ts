import test from 'node:test';
import assert from 'node:assert/strict';
import { MedicineSearchEngine } from '../src/lib/medicine-search.ts';
import defaultDataset from '../src/data/medicines.json' with { type: 'json' };
import type { MedicineRecord } from '../src/types/medicine.ts';

const searchEngine = new MedicineSearchEngine(defaultDataset as unknown as MedicineRecord[]);

test('Medicine Search - Test fixtures excluded by default in production search', () => {
  // Querying a test fixture name without includeTestFixtures must return 'not-found'
  const result = searchEngine.search({ query: 'Test-Compound-Alpha' });
  assert.equal(result.status, 'not-found');
  assert.equal(result.matchingMedicineIds.length, 0);
  assert.ok(result.message.includes('No verified medicine records matched'));
  assert.ok(result.message.includes('Synthetic test fixtures matched this term but are excluded'));
});

test('Medicine Search - Exact generic-name match with test mode enabled', () => {
  const result = searchEngine.search({
    query: 'Test-Compound-Beta',
    includeTestFixtures: true,
  });

  assert.equal(result.status, 'exact');
  assert.equal(result.matchingMedicineIds.length, 1);
  assert.equal(result.matchingMedicineIds[0], 'fixture-med-beta-250');
  assert.equal(result.candidateSummaries[0].genericName, 'Test-Compound-Beta');
  assert.ok(result.candidateSummaries[0].isTestFixture);
  // Missing information indicators must be present
  assert.ok(result.candidateSummaries[0].missingInformationIndicators.includes('seriousWarnings'));
});

test('Medicine Search - Verified brand-name match', () => {
  const result = searchEngine.search({
    query: 'BetaCalm',
    includeTestFixtures: true,
  });

  assert.equal(result.status, 'exact');
  assert.equal(result.matchingMedicineIds.length, 1);
  assert.equal(result.matchingMedicineIds[0], 'fixture-med-beta-250');
});

test('Medicine Search - Active-ingredient search', () => {
  const result = searchEngine.search({
    query: 'compound-gamma-sodium',
    includeTestFixtures: true,
  });

  assert.equal(result.status, 'exact');
  assert.equal(result.matchingMedicineIds.length, 1);
  assert.equal(result.matchingMedicineIds[0], 'fixture-med-gamma-solution');
});

test('Medicine Search - Case and whitespace normalization', () => {
  // Variations with mixed casing, extra spaces, and hyphens/symbols
  const queries = [
    '   test-compound-beta   ',
    'TEST   COMPOUND   BETA',
    '  test compound beta  ',
  ];

  for (const q of queries) {
    const res = searchEngine.search({
      query: q,
      includeTestFixtures: true,
    });
    assert.equal(res.status, 'exact', `Failed for query variation: "${q}"`);
    assert.equal(res.matchingMedicineIds[0], 'fixture-med-beta-250');
  }
});

test('Medicine Search - Unknown medicine returns not-found and does not hallucinate', () => {
  const result = searchEngine.search({
    query: 'CompletelyNonExistentDrugName999',
    includeTestFixtures: true,
  });

  assert.equal(result.status, 'not-found');
  assert.equal(result.matchingMedicineIds.length, 0);
  assert.equal(result.candidateSummaries.length, 0);
  assert.ok(result.message.includes('No verified medicine records matched'));
});

test('Medicine Search - Controlled fuzzy suggestions on close typo', () => {
  const result = searchEngine.search({
    query: 'BetaCal', // Typo for BetaCalm (1 char difference)
    includeTestFixtures: true,
  });

  assert.equal(result.status, 'not-found');
  assert.ok(result.suggestions && result.suggestions.length > 0);
  assert.ok(result.suggestions.includes('BetaCalm'));
});

test('Medicine Search - Ambiguous medicine names are never silently chosen', () => {
  // "IsoTest Multi-Brand" is associated with two distinct test records (Isoform-A and Isoform-B)
  const result = searchEngine.search({
    query: 'IsoTest Multi-Brand',
    includeTestFixtures: true,
  });

  assert.equal(result.status, 'ambiguous');
  assert.equal(result.matchingMedicineIds.length, 2);
  assert.ok(result.matchingMedicineIds.includes('fixture-ambiguous-one'));
  assert.ok(result.matchingMedicineIds.includes('fixture-ambiguous-two'));
  assert.equal(result.candidateSummaries.length, 2);
  assert.ok(result.message.includes('is ambiguous and matches 2 distinct medicine records'));
});

test('Medicine Search - Strength disambiguation for multi-strength generic drugs', () => {
  // Querying generic "Test-Compound-Alpha" matches both 500mg and 1000mg
  const ambiguousResult = searchEngine.search({
    query: 'Test-Compound-Alpha',
    includeTestFixtures: true,
  });

  assert.equal(ambiguousResult.status, 'ambiguous');
  assert.equal(ambiguousResult.matchingMedicineIds.length, 2);

  // Providing explicit strength "500" narrows it to the exact 500mg record
  const exactResult = searchEngine.search({
    query: 'Test-Compound-Alpha',
    strength: '500',
    unit: 'mg',
    includeTestFixtures: true,
  });

  assert.equal(exactResult.status, 'exact');
  assert.equal(exactResult.matchingMedicineIds.length, 1);
  assert.equal(exactResult.matchingMedicineIds[0], 'fixture-med-alpha-500');

  // Providing explicit strength "1000" narrows it to the 1000mg record
  const exactResult1000 = searchEngine.search({
    query: 'Test-Compound-Alpha',
    strength: '1000',
    unit: 'mg',
    includeTestFixtures: true,
  });

  assert.equal(exactResult1000.status, 'exact');
  assert.equal(exactResult1000.matchingMedicineIds.length, 1);
  assert.equal(exactResult1000.matchingMedicineIds[0], 'fixture-med-alpha-1000');
});

test('Medicine Search - Alias matching finds correct medicine record', () => {
  // Acetaminophen is a verified alias for US FDA Paracetamol
  const result = searchEngine.search({
    query: 'Acetaminophen',
  });

  assert.equal(result.status, 'exact');
  assert.equal(result.matchingMedicineIds.length, 1);
  assert.equal(result.matchingMedicineIds[0], 'med-paracetamol-us-fda');

  // APAP is also an alias for US FDA Paracetamol
  const apapResult = searchEngine.search({
    query: 'APAP',
  });
  assert.equal(apapResult.status, 'exact');
  assert.equal(apapResult.matchingMedicineIds[0], 'med-paracetamol-us-fda');

  // PCM is a verified alias for Indian CDSCO Paracetamol
  const pcmResult = searchEngine.search({
    query: 'PCM',
  });
  assert.equal(pcmResult.status, 'exact');
  assert.equal(pcmResult.matchingMedicineIds[0], 'med-paracetamol-in-cdsco');
});

test('Medicine Search - Production verified medicines: jurisdiction distinctions preserved', () => {
  // Querying generic "Paracetamol" in production matches both US FDA and CDSCO records
  const result = searchEngine.search({
    query: 'Paracetamol',
  });

  assert.equal(result.status, 'ambiguous');
  assert.equal(result.matchingMedicineIds.length, 2);
  assert.ok(result.matchingMedicineIds.includes('med-paracetamol-us-fda'));
  assert.ok(result.matchingMedicineIds.includes('med-paracetamol-in-cdsco'));

  // Searching by jurisdiction-specific brand name cleanly isolates the jurisdiction:
  // "Tylenol" -> US FDA monograph
  const usBrand = searchEngine.search({ query: 'Tylenol' });
  assert.equal(usBrand.status, 'exact');
  assert.equal(usBrand.matchingMedicineIds[0], 'med-paracetamol-us-fda');
  assert.equal(usBrand.candidateSummaries[0].genericName, 'Paracetamol');

  // "Crocin" -> Indian CDSCO monograph
  const inBrand = searchEngine.search({ query: 'Crocin' });
  assert.equal(inBrand.status, 'exact');
  assert.equal(inBrand.matchingMedicineIds[0], 'med-paracetamol-in-cdsco');
  assert.equal(inBrand.candidateSummaries[0].genericName, 'Paracetamol');
});

test('Medicine Search - Production verified medicines: exact matches for Cetirizine, Amoxicillin, Metformin', () => {
  const cetirizineRes = searchEngine.search({ query: 'Cetirizine' });
  assert.equal(cetirizineRes.status, 'exact');
  assert.equal(cetirizineRes.matchingMedicineIds[0], 'ref-cetirizine-10mg');
  assert.equal(cetirizineRes.candidateSummaries[0].medicineCategory, 'Second-Generation H1-Receptor Antagonist (Non-Sedating Antihistamine)');

  const amoxRes = searchEngine.search({ query: 'Amoxicillin' });
  assert.equal(amoxRes.status, 'exact');
  assert.equal(amoxRes.matchingMedicineIds[0], 'ref-amoxicillin-500');
  assert.equal(amoxRes.candidateSummaries[0].medicineCategory, 'Beta-Lactam Antibacterial (Aminopenicillin)');

  const metRes = searchEngine.search({ query: 'Metformin' });
  assert.equal(metRes.status, 'exact');
  assert.equal(metRes.matchingMedicineIds[0], 'ref-metformin-500');
  assert.equal(metRes.candidateSummaries[0].medicineCategory, 'Biguanide Antihyperglycemic Agent');
});

