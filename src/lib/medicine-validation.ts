import type {
  AssessmentStatus,
  AssessedField,
  MedicineRecord,
  ReviewStatus,
} from '../types/medicine.ts';

const VALID_ASSESSMENT_STATUSES: Set<AssessmentStatus> = new Set([
  'verified_present',
  'verified_absent',
  'unknown',
  'not_assessed',
  'unavailable',
]);

const VALID_REVIEW_STATUSES: Set<ReviewStatus> = new Set([
  'verified_reference',
  'under_review',
  'provisional',
  'test_fixture',
]);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  medicine?: MedicineRecord;
}

export interface DatasetValidationResult {
  valid: boolean;
  totalRecords: number;
  validCount: number;
  testFixtureCount: number;
  verifiedReferenceCount: number;
  errors: Record<string, string[]>;
  duplicateIds: string[];
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

function validateAssessedField<T>(
  fieldName: string,
  field: unknown,
  errors: string[],
  validateData?: (data: unknown) => boolean
): AssessedField<T> | null {
  if (!isObject(field)) {
    errors.push(`Field '${fieldName}' must be an object with { status, data?, note? }.`);
    return null;
  }

  const status = field.status as AssessmentStatus;
  if (!VALID_ASSESSMENT_STATUSES.has(status)) {
    errors.push(
      `Field '${fieldName}.status' has invalid status '${String(status)}'. Must be one of: ${Array.from(VALID_ASSESSMENT_STATUSES).join(', ')}.`
    );
    return null;
  }

  if (status === 'verified_present') {
    if (field.data === undefined || field.data === null) {
      errors.push(`Field '${fieldName}' is marked 'verified_present' but lacks 'data'.`);
    } else if (validateData && !validateData(field.data)) {
      errors.push(`Field '${fieldName}.data' has invalid format or empty contents.`);
    }
  }

  if (field.note !== undefined && typeof field.note !== 'string') {
    errors.push(`Field '${fieldName}.note' must be a string if provided.`);
  }

  return field as unknown as AssessedField<T>;
}

/**
 * Validates a single medicine record at runtime.
 * Ensures strict typing, complete provenance, explicit assessment states,
 * and test fixture containment.
 */
export function validateMedicineRecord(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(input)) {
    return { valid: false, errors: ['Record must be a non-null object.'] };
  }

  // Stable ID
  if (!isNonEmptyString(input.id)) {
    errors.push("Missing or invalid 'id': must be a non-empty string.");
  }

  // Generic name
  if (!isNonEmptyString(input.genericName)) {
    errors.push("Missing or invalid 'genericName': must be a non-empty string.");
  }

  // Verified brand names
  if (!Array.isArray(input.verifiedBrandNames) || !input.verifiedBrandNames.every(isNonEmptyString)) {
    errors.push("Missing or invalid 'verifiedBrandNames': must be an array of non-empty strings.");
  }

  // Active ingredients
  if (!Array.isArray(input.activeIngredients) || input.activeIngredients.length === 0) {
    errors.push("Missing or invalid 'activeIngredients': must be a non-empty array.");
  } else {
    input.activeIngredients.forEach((ing, idx) => {
      if (!isObject(ing) || !isNonEmptyString(ing.name)) {
        errors.push(`Active ingredient at index ${idx} must be an object with non-empty 'name'.`);
      }
    });
  }

  // Strengths and units
  if (!Array.isArray(input.strengthsAndUnits) || input.strengthsAndUnits.length === 0) {
    errors.push("Missing or invalid 'strengthsAndUnits': must be a non-empty array.");
  } else {
    input.strengthsAndUnits.forEach((s, idx) => {
      if (!isObject(s) || !isNonEmptyString(s.strength) || !isNonEmptyString(s.unit)) {
        errors.push(`Strength item at index ${idx} must contain non-empty 'strength' and 'unit'.`);
      }
    });
  }

  // Dosage forms
  if (!Array.isArray(input.dosageForms) || input.dosageForms.length === 0 || !input.dosageForms.every(isNonEmptyString)) {
    errors.push("Missing or invalid 'dosageForms': must be a non-empty array of strings.");
  }

  // Review status
  const reviewStatus = input.reviewStatus as ReviewStatus;
  if (!VALID_REVIEW_STATUSES.has(reviewStatus)) {
    errors.push(`Invalid 'reviewStatus': must be one of: ${Array.from(VALID_REVIEW_STATUSES).join(', ')}.`);
  }

  // Test fixture flag & integrity
  if (typeof input.isTestFixture !== 'boolean') {
    errors.push("Missing or invalid 'isTestFixture': must be a boolean.");
  } else {
    if (reviewStatus === 'test_fixture' && input.isTestFixture !== true) {
      errors.push("Records with reviewStatus 'test_fixture' must have 'isTestFixture: true'.");
    }
    if (reviewStatus === 'verified_reference' && input.isTestFixture === true) {
      errors.push("A record cannot be both 'verified_reference' and 'isTestFixture: true'.");
    }
  }

  // Aliases (optional array of strings)
  if (input.aliases !== undefined) {
    if (!Array.isArray(input.aliases) || !input.aliases.every(isNonEmptyString)) {
      errors.push("Invalid 'aliases': must be an array of non-empty strings if provided.");
    }
  }

  // Source Provenance
  if (!isObject(input.sourceProvenance)) {
    errors.push("Missing 'sourceProvenance' object.");
  } else {
    const prov = input.sourceProvenance;
    if (!isNonEmptyString(prov.sourceTitle)) {
      errors.push("Missing or invalid 'sourceProvenance.sourceTitle'.");
    }
    if (!isNonEmptyString(prov.organization)) {
      errors.push("Missing or invalid 'sourceProvenance.organization'.");
    }
    if (!isNonEmptyString(prov.documentIdentifierOrUrl)) {
      errors.push("Missing or invalid 'sourceProvenance.documentIdentifierOrUrl'.");
    }
    if (!isNonEmptyString(prov.localReviewDate)) {
      errors.push("Missing or invalid 'sourceProvenance.localReviewDate' (must be a valid date string).");
    }
    if (prov.auditHistory !== undefined) {
      if (!Array.isArray(prov.auditHistory)) {
        errors.push("Invalid 'sourceProvenance.auditHistory': must be an array of audit entries.");
      }
    }
  }

  // Assessed Fields
  const validateStringArray = (val: unknown) => Array.isArray(val) && val.every((item) => typeof item === 'string');
  const validateString = (val: unknown) => typeof val === 'string' && val.trim().length > 0;

  validateAssessedField('medicineCategory', input.medicineCategory, errors, validateString);
  validateAssessedField('documentedUses', input.documentedUses, errors, validateStringArray);
  validateAssessedField('mechanismOfAction', input.mechanismOfAction, errors, validateString);
  validateAssessedField('commonSideEffects', input.commonSideEffects, errors, validateStringArray);
  validateAssessedField('seriousWarnings', input.seriousWarnings, errors, validateStringArray);
  validateAssessedField('contraindications', input.contraindications, errors, validateStringArray);
  validateAssessedField('precautions', input.precautions, errors, validateStringArray);
  validateAssessedField('knownInteractions', input.knownInteractions, errors, (data) => Array.isArray(data));
  validateAssessedField('storageInformation', input.storageInformation, errors, validateString);
  validateAssessedField('overdoseGuidance', input.overdoseGuidance, errors, validateString);

  // Missing Information Indicators
  if (!Array.isArray(input.missingInformationIndicators)) {
    errors.push("Missing or invalid 'missingInformationIndicators': must be an array of field names.");
  }

  // Strict Dosage Prohibition Check
  const FORBIDDEN_DOSAGE_PATTERNS = [
    /\b(?:take|give|administer|consume)\s+\d+\s*(?:tablet|pill|capsule|mg|ml)/i,
    /\b\d+\s*(?:times|x)\s*(?:a|per)\s*(?:day|daily|week|hour)/i,
    /\bevery\s+\d+\s*(?:hours|hrs|days)/i,
    /\bmaximum\s+(?:daily\s+)?dose\b/i,
    /\b(?:\d+\s*)?mg\/kg\b/i,
    /\b(?:recommended|starting|initial)\s+dose\s+of\b/i,
  ];

  const checkTextForDosage = (path: string, text: unknown) => {
    if (typeof text === 'string') {
      for (const pattern of FORBIDDEN_DOSAGE_PATTERNS) {
        if (pattern.test(text)) {
          errors.push(
            `Field '${path}' contains prohibited dosage recommendation or schedule: "${text.match(pattern)?.[0]}". MediGuide AI strictly forbids dosage advice.`
          );
          break;
        }
      }
    } else if (Array.isArray(text)) {
      text.forEach((item, idx) => checkTextForDosage(`${path}[${idx}]`, item));
    } else if (isObject(text) && 'data' in text) {
      checkTextForDosage(`${path}.data`, text.data);
    }
  };

  checkTextForDosage('documentedUses', input.documentedUses);
  checkTextForDosage('seriousWarnings', input.seriousWarnings);
  checkTextForDosage('commonSideEffects', input.commonSideEffects);
  checkTextForDosage('contraindications', input.contraindications);
  checkTextForDosage('precautions', input.precautions);
  checkTextForDosage('storageInformation', input.storageInformation);
  checkTextForDosage('overdoseGuidance', input.overdoseGuidance);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], medicine: input as unknown as MedicineRecord };
}

/**
 * Validates an entire dataset of medicine records.
 */
export function validateMedicineDataset(records: unknown): DatasetValidationResult {
  const result: DatasetValidationResult = {
    valid: true,
    totalRecords: 0,
    validCount: 0,
    testFixtureCount: 0,
    verifiedReferenceCount: 0,
    errors: {},
    duplicateIds: [],
  };

  if (!Array.isArray(records)) {
    result.valid = false;
    result.errors['$schema'] = ['Dataset root must be an array of medicine records.'];
    return result;
  }

  result.totalRecords = records.length;
  const seenIds = new Set<string>();

  records.forEach((raw, idx) => {
    const rowId = isObject(raw) && typeof raw.id === 'string' ? raw.id : `index-${idx}`;

    if (isObject(raw) && typeof raw.id === 'string') {
      if (seenIds.has(raw.id)) {
        result.duplicateIds.push(raw.id);
      }
      seenIds.add(raw.id);
    }

    const validation = validateMedicineRecord(raw);
    if (!validation.valid) {
      result.valid = false;
      result.errors[rowId] = validation.errors;
    } else if (validation.medicine) {
      result.validCount++;
      if (validation.medicine.isTestFixture) {
        result.testFixtureCount++;
      }
      if (validation.medicine.reviewStatus === 'verified_reference') {
        result.verifiedReferenceCount++;
      }
    }
  });

  if (result.duplicateIds.length > 0) {
    result.valid = false;
    result.errors['duplicate_ids'] = result.duplicateIds.map((id) => `Duplicate ID detected: '${id}'`);
  }

  return result;
}
