import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateMedicineRecord,
  validateMedicineDataset,
} from '../src/lib/medicine-validation.ts';
import defaultDataset from '../src/data/medicines.json' with { type: 'json' };

test('Medicine Validation - Default Dataset passes full integrity validation', () => {
  const result = validateMedicineDataset(defaultDataset);
  assert.equal(result.valid, true);
  assert.equal(result.totalRecords, 11);
  assert.equal(result.validCount, 11);
  assert.equal(result.testFixtureCount, 6);
  assert.equal(result.verifiedReferenceCount, 5);
  assert.equal(result.duplicateIds.length, 0);
});

test('Medicine Validation - Rejects records containing dosage recommendations or schedules', () => {
  const dosageRecord: unknown = {
    ...defaultDataset[0],
    id: 'test-with-dosage',
    documentedUses: {
      status: 'verified_present',
      data: ['Take 2 tablets twice a day with water for relief'],
    },
  };

  const result = validateMedicineRecord(dosageRecord);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((err) => err.includes('prohibited dosage recommendation')));
});

test('Medicine Validation - Rejects records with missing source information', () => {
  const invalidRecord: unknown = {
    id: 'test-no-source',
    genericName: 'Test Incomplete Drug',
    verifiedBrandNames: ['BrandX'],
    activeIngredients: [{ name: 'ingredient-x' }],
    strengthsAndUnits: [{ strength: '100', unit: 'mg' }],
    dosageForms: ['tablet'],
    documentedUses: { status: 'verified_present', data: ['indication'] },
    commonSideEffects: { status: 'unknown' },
    seriousWarnings: { status: 'unknown' },
    contraindications: { status: 'unknown' },
    precautions: { status: 'unknown' },
    knownInteractions: { status: 'unknown' },
    storageInformation: { status: 'verified_present', data: 'room temp' },
    overdoseGuidance: { status: 'unknown' },
    // sourceProvenance missing!
    reviewStatus: 'test_fixture',
    isTestFixture: true,
    missingInformationIndicators: ['commonSideEffects'],
  };

  const result = validateMedicineRecord(invalidRecord);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((err) => err.includes("Missing 'sourceProvenance' object")));
});

test('Medicine Validation - Rejects records with incomplete source provenance fields', () => {
  const invalidRecord: unknown = {
    id: 'test-bad-provenance',
    genericName: 'Test Bad Provenance Drug',
    verifiedBrandNames: [],
    activeIngredients: [{ name: 'ingredient-x' }],
    strengthsAndUnits: [{ strength: '100', unit: 'mg' }],
    dosageForms: ['tablet'],
    documentedUses: { status: 'unknown' },
    commonSideEffects: { status: 'unknown' },
    seriousWarnings: { status: 'unknown' },
    contraindications: { status: 'unknown' },
    precautions: { status: 'unknown' },
    knownInteractions: { status: 'unknown' },
    storageInformation: { status: 'unknown' },
    overdoseGuidance: { status: 'unknown' },
    sourceProvenance: {
      sourceTitle: '', // Empty source title
      organization: 'Some Org',
      documentIdentifierOrUrl: 'http://example.com',
      localReviewDate: '2026-10-16',
    },
    reviewStatus: 'test_fixture',
    isTestFixture: true,
    missingInformationIndicators: [],
  };

  const result = validateMedicineRecord(invalidRecord);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((err) => err.includes('sourceProvenance.sourceTitle')));
});

test('Medicine Validation - Rejects invalid assessment statuses', () => {
  const invalidRecord: unknown = {
    id: 'test-bad-status',
    genericName: 'Test Bad Status Drug',
    verifiedBrandNames: [],
    activeIngredients: [{ name: 'ingredient-x' }],
    strengthsAndUnits: [{ strength: '10', unit: 'mg' }],
    dosageForms: ['capsule'],
    documentedUses: { status: 'not_a_valid_status', data: ['some use'] },
    commonSideEffects: { status: 'unknown' },
    seriousWarnings: { status: 'unknown' },
    contraindications: { status: 'unknown' },
    precautions: { status: 'unknown' },
    knownInteractions: { status: 'unknown' },
    storageInformation: { status: 'unknown' },
    overdoseGuidance: { status: 'unknown' },
    sourceProvenance: {
      sourceTitle: 'QA Specs',
      organization: 'QA',
      documentIdentifierOrUrl: 'urn:test',
      localReviewDate: '2026-10-16',
    },
    reviewStatus: 'test_fixture',
    isTestFixture: true,
    missingInformationIndicators: [],
  };

  const result = validateMedicineRecord(invalidRecord);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((err) => err.includes("invalid status 'not_a_valid_status'")));
});

test('Medicine Validation - Rejects verified_present when data is missing', () => {
  const invalidRecord: unknown = {
    id: 'test-missing-present-data',
    genericName: 'Test Drug',
    verifiedBrandNames: [],
    activeIngredients: [{ name: 'ingredient-x' }],
    strengthsAndUnits: [{ strength: '10', unit: 'mg' }],
    dosageForms: ['capsule'],
    documentedUses: { status: 'verified_present' }, // missing data property
    commonSideEffects: { status: 'unknown' },
    seriousWarnings: { status: 'unknown' },
    contraindications: { status: 'unknown' },
    precautions: { status: 'unknown' },
    knownInteractions: { status: 'unknown' },
    storageInformation: { status: 'unknown' },
    overdoseGuidance: { status: 'unknown' },
    sourceProvenance: {
      sourceTitle: 'QA Specs',
      organization: 'QA',
      documentIdentifierOrUrl: 'urn:test',
      localReviewDate: '2026-10-16',
    },
    reviewStatus: 'test_fixture',
    isTestFixture: true,
    missingInformationIndicators: [],
  };

  const result = validateMedicineRecord(invalidRecord);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((err) => err.includes("marked 'verified_present' but lacks 'data'")));
});

test('Medicine Validation - Detects duplicate IDs in dataset', () => {
  const duplicateDataset = [
    defaultDataset[0],
    { ...defaultDataset[0] }, // Exact copy with same ID
  ];

  const result = validateMedicineDataset(duplicateDataset);
  assert.equal(result.valid, false);
  assert.ok(result.duplicateIds.includes(defaultDataset[0].id));
});

test('Medicine Validation - Enforces test fixture flag integrity', () => {
  // Test fixture marked as verified_reference is rejected
  const contradictoryRecord = {
    ...defaultDataset[0],
    reviewStatus: 'verified_reference',
    isTestFixture: true,
  };

  const result = validateMedicineRecord(contradictoryRecord);
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.some((err) =>
      err.includes("A record cannot be both 'verified_reference' and 'isTestFixture: true'")
    )
  );
});
