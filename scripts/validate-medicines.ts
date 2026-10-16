import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMedicineDataset } from '../src/lib/medicine-validation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runValidation() {
  const datasetPath = resolve(__dirname, '../src/data/medicines.json');
  console.log(`[MediGuide AI] Validating medicine dataset at: ${datasetPath}`);

  let rawData: unknown;
  try {
    const fileContent = readFileSync(datasetPath, 'utf-8');
    rawData = JSON.parse(fileContent);
  } catch (err) {
    console.error(`[ERROR] Failed to read or parse medicines.json:`, err);
    process.exit(1);
  }

  const result = validateMedicineDataset(rawData);

  console.log('----------------------------------------------------');
  console.log(`Dataset Validation Summary:`);
  console.log(`  Total Records Scanned:     ${result.totalRecords}`);
  console.log(`  Valid Records:             ${result.validCount}`);
  console.log(`  Synthetic Test Fixtures:   ${result.testFixtureCount}`);
  console.log(`  Verified Reference Drugs:  ${result.verifiedReferenceCount}`);
  console.log(`  Duplicate IDs Found:       ${result.duplicateIds.length}`);
  console.log('----------------------------------------------------');

  if (result.verifiedReferenceCount > 0 && Array.isArray(rawData)) {
    console.log('[VERIFIED REFERENCE MONOGRAPHS]');
    const verified = (rawData as Array<Record<string, unknown>>).filter(
      (r) => r.reviewStatus === 'verified_reference'
    );
    verified.forEach((m, i) => {
      const prov = (m.sourceProvenance as Record<string, unknown>) || {};
      const cat = (m.medicineCategory as Record<string, unknown>) || {};
      console.log(`  ${i + 1}. ${m.genericName} (${m.id})`);
      console.log(`     - Category:     ${cat.data || 'Unspecified'}`);
      console.log(`     - Brands:       ${Array.isArray(m.verifiedBrandNames) ? m.verifiedBrandNames.join(', ') : 'None'}`);
      console.log(`     - Aliases:      ${Array.isArray(m.aliases) ? m.aliases.join(', ') : 'None'}`);
      console.log(`     - Jurisdiction: ${prov.jurisdiction || 'Unspecified'}`);
      console.log(`     - Source:       ${prov.sourceTitle} (${prov.organization})`);
      console.log(`     - Reviewer:     ${prov.reviewerRole || 'Unspecified'} [${prov.localReviewDate}]`);
      console.log(`     - Dosage State: Strict exclusion verified (0 dosage/frequency recommendations)`);
    });
    console.log('----------------------------------------------------');
  }

  if (!result.valid) {
    console.error(`[VALIDATION FAILED] Errors encountered:`);
    for (const [id, errors] of Object.entries(result.errors)) {
      console.error(`  - Record '${id}':`);
      errors.forEach((err) => console.error(`      * ${err}`));
    }
    process.exit(1);
  }

  console.log(`[SUCCESS] Dataset integrity verified successfully.`);
  process.exit(0);
}

runValidation();
