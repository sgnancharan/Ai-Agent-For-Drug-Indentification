import type {
  VerifiedMedicineFacts,
  SupportedLanguage,
} from '../types/agent.ts';
import { LANGUAGE_NAMES } from '../types/agent.ts';
import type { SourceProvenance } from '../types/medicine.ts';

export const DEFAULT_LM_STUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
export const DEFAULT_LM_STUDIO_MODEL = 'medgemma-4b-it';
export const DEFAULT_TIMEOUT_MS = 60000;

export const LANGUAGE_SCRIPT_GUIDELINES: Record<
  SupportedLanguage,
  { name: string; script: string; example: string }
> = {
  en: { name: 'English', script: 'Latin script', example: 'Cetirizine' },
  hi: { name: 'Hindi (हिन्दी)', script: 'standard Devanagari script (देवनागरी लिपि)', example: 'सेटीरिज़िन (Cetirizine)' },
  te: { name: 'Telugu (తెలుగు)', script: 'standard Telugu script (తెలుగు లిపి)', example: 'సెటిరిజిన్ (Cetirizine)' },
  ta: { name: 'Tamil (தமிழ்)', script: 'standard Tamil script (தமிழ் எழுத்துமுறை)', example: 'செட்டிரிசின் (Cetirizine)' },
  kn: { name: 'Kannada (ಕನ್ನಡ)', script: 'standard Kannada script (ಕನ್ನಡ ಲಿಪಿ)', example: 'ಸೆಟಿರಿಜಿನ್ (Cetirizine)' },
  ml: { name: 'Malayalam (മലയാളം)', script: 'standard Malayalam script (മലയാള ലിപി)', example: 'സെറ്റിറൈസിൻ (Cetirizine)' },
  es: { name: 'Spanish (Español)', script: 'Spanish Latin script', example: 'Cetirizina' },
  fr: { name: 'French (Français)', script: 'French Latin script', example: 'Cétirizine' },
};

export interface ModelAvailabilityResult {
  available: boolean;
  configuredModelId: string;
  foundModelId?: string;
  availableModels: string[];
  endpoint: string;
  errorMessage?: string;
}

export interface ExplanationGenerationParams {
  facts: VerifiedMedicineFacts;
  source: SourceProvenance;
  language: SupportedLanguage;
  missingFields?: string[];
}

export interface ExplanationResult {
  success: boolean;
  explanation?: string;
  modelId?: string;
  language?: SupportedLanguage;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Validates that an endpoint URL resides strictly on the local machine loopback interface.
 * Enforces strict offline privacy and prevents silent data exfiltration to remote networks.
 */
export function validateLoopbackUrl(urlStr: string): void {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid model endpoint URL format: "${urlStr}". Must be a valid HTTP URL.`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLoopback =
    hostname === '127.0.0.1' ||
    hostname === 'localhost' ||
    hostname === '::1' ||
    hostname === '[::1]';

  if (!isLoopback) {
    throw new Error(
      `Security violation: Model endpoint "${urlStr}" is not a loopback address. ` +
      `MediGuide AI strictly requires offline local inference on 127.0.0.1 or localhost.`
    );
  }
}

export interface DosageValidationResult {
  isValid: boolean;
  reason?: string;
  matchedPattern?: string;
}

/**
 * Deterministic safety validator to detect and reject dosage-related content.
 * MediGuide AI identifies a drug from its name and explains what it is in simple language.
 * The application must NOT provide dosage recommendations, dose calculations, frequency,
 * or maximum daily amounts.
 */
export function validateOutputAgainstDosageRules(text: string): DosageValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: true };
  }

  const forbiddenPatterns: Array<{ pattern: RegExp; description: string }> = [
    {
      pattern: /\b(?:take|prescribe|administer|consume|give)\s+(?:of\s+)?(?:\d+|\b(?:one|two|three|four)\b)\s*(?:tablets?|pills?|capsules?|spoons?|drops?|mg|g|ml)\b/i,
      description: 'Administration or pill count recommendation',
    },
    {
      pattern: /\b\d+\s*(?:to|-)\s*\d+\s*(?:mg|milligrams|g|grams|mcg|ml)\b(?:\s+(?:daily|per day|every))/i,
      description: 'Daily dosage amount range instruction',
    },
    {
      pattern: /\b(?:\d+|once|twice|thrice)\s*(?:times|x)?\s*(?:a|per)\s*(?:day|daily|week|hour)\b/i,
      description: 'Dosing frequency instruction',
    },
    {
      pattern: /\b(?:once|twice|thrice)\s+(?:daily|weekly)\b/i,
      description: 'Textual dosing frequency instruction',
    },
    {
      pattern: /\bevery\s+\d+\s*(?:hours|hrs|days|weeks)\b/i,
      description: 'Dosing schedule interval',
    },
    {
      pattern: /\bmaximum\s+(?:daily\s+)?(?:dose|dosage|amount|limit)\b/i,
      description: 'Maximum daily dose instruction',
    },
    {
      pattern: /\b(?:\d+\s*)?mg\/kg(?:\/day)?\b/i,
      description: 'Weight-based dose calculation',
    },
    {
      pattern: /\b(?:recommended|initial|starting|maintenance)\s+dose\b/i,
      description: 'Prescriptive dosage recommendation',
    },
    {
      pattern: /\b(?:dose|dosage)\s+calculation\b/i,
      description: 'Dose calculation',
    },
  ];

  for (const { pattern, description } of forbiddenPatterns) {
    if (pattern.test(text)) {
      const match = text.match(pattern)?.[0];
      return {
        isValid: false,
        reason: `Generated explanation violates dosage prohibition rules: ${description} detected ("${match}").`,
        matchedPattern: match,
      };
    }
  }

  return { isValid: true };
}

export class LMStudioClient {
  private baseUrl: string;
  private modelId: string;
  private timeoutMs: number;

  constructor(options: { baseUrl?: string; modelId?: string; timeoutMs?: number } = {}) {
    const rawBaseUrl =
      options.baseUrl ||
      process.env.LM_STUDIO_BASE_URL ||
      process.env.NEXT_PUBLIC_LM_STUDIO_BASE_URL ||
      DEFAULT_LM_STUDIO_BASE_URL;

    validateLoopbackUrl(rawBaseUrl);

    // Strip trailing slashes
    this.baseUrl = rawBaseUrl.replace(/\/+$/, '');
    this.modelId = options.modelId || process.env.LM_STUDIO_MODEL || DEFAULT_LM_STUDIO_MODEL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  public getEndpoint(): string {
    return this.baseUrl;
  }

  public getModelId(): string {
    return this.modelId;
  }

  /**
   * Queries /v1/models to verify local server reachability and confirm the configured model ID.
   */
  public async checkAvailability(): Promise<ModelAvailabilityResult> {
    const endpoint = `${this.baseUrl}/models`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(this.timeoutMs, 5000));

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        return {
          available: false,
          configuredModelId: this.modelId,
          availableModels: [],
          endpoint: this.baseUrl,
          errorMessage: `LM Studio returned HTTP ${response.status} ${response.statusText}.`,
        };
      }

      const payload = (await response.json()) as {
        data?: Array<{ id?: string }>;
      };

      const models = Array.isArray(payload?.data)
        ? payload.data.map((m) => m.id).filter((id): id is string => typeof id === 'string')
        : [];

      const modelFound = models.find((m) => m === this.modelId);

      return {
        available: true,
        configuredModelId: this.modelId,
        foundModelId: modelFound,
        availableModels: models,
        endpoint: this.baseUrl,
      };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error && err.name === 'AbortError'
          ? 'Connection to local LM Studio endpoint timed out.'
          : 'Could not connect to local LM Studio server. Ensure LM Studio is running and the local server is started.';

      return {
        available: false,
        configuredModelId: this.modelId,
        availableModels: [],
        endpoint: this.baseUrl,
        errorMessage: errorMsg,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Formats structured verified facts into a prompt for grounded explanation.
   */
  private buildPrompt(params: ExplanationGenerationParams): { system: string; user: string } {
    const { facts, source, language, missingFields = [] } = params;
    const langInfo = LANGUAGE_SCRIPT_GUIDELINES[language] || {
      name: LANGUAGE_NAMES[language] || language,
      script: 'native script',
      example: facts?.genericName || 'Medicine',
    };

    const system = [
      'You are MediGuide AI, an offline medicine identification and educational assistant.',
      'Your task is to identify what the medicine is and explain its category, general uses, mechanism of action, warnings, and side effects in simple language.',
      `You MUST write the explanation in ${langInfo.name} using ${langInfo.script}.`,
      `Preserve generic medicine names, official brand names, and active ingredients in Latin script alongside the translated script for clarity (e.g., ${langInfo.example}).`,
      'Translate all section headings, uses, warnings, mechanism of action, and side effects naturally and accurately into the requested language.',
      'CRITICAL MANDATORY SCOPE RULES:',
      '1. Rely ONLY on the verified reference facts provided below. Do NOT invent, assume, or extrapolate outside facts.',
      '2. NEVER provide dosage amounts, dosage recommendations, dosing frequency (e.g., times per day, every X hours), dose calculations (e.g., mg/kg), maximum daily amounts, or administration instructions.',
      '3. Clearly remind the user that all dosage, administration, and clinical treatment decisions must be determined by a licensed physician or pharmacist.',
      '4. Accurately summarize serious warnings, contraindications, and known drug interactions exactly as documented.',
      '5. If any parameter is noted as unassessed, state that it has not been assessed in this monograph.',
      '6. Maintain professional, objective, and accessible educational communication without making prescribing claims.',
    ].join('\n');

    const formatAssessed = (label: string, field?: { status: string; data?: unknown; note?: string }) => {
      if (!field) {
        return `${label}: [UNASSESSED] Not documented in source.`;
      }
      if (field.status === 'verified_present' && field.data) {
        if (Array.isArray(field.data)) {
          return `${label}: ${field.data.join('; ')}`;
        }
        return `${label}: ${String(field.data)}`;
      }
      if (field.status === 'verified_absent') {
        return `${label}: Verified absent (${field.note || 'None documented'}).`;
      }
      return `${label}: [UNASSESSED / UNKNOWN] ${field.note || 'Information not documented in verified source'}.`;
    };

    // Include active ingredient chemical names without dosage amounts
    const ingredientsStr = Array.isArray(facts?.activeIngredients)
      ? facts.activeIngredients.map((ai) => ai.name).join(', ')
      : 'Unspecified';

    const formsStr = Array.isArray(facts?.dosageForms)
      ? facts.dosageForms.join(', ')
      : 'Unspecified';

    const brandsStr = Array.isArray(facts?.verifiedBrandNames) && facts.verifiedBrandNames.length > 0
      ? facts.verifiedBrandNames.join(', ')
      : 'None verified';

    const aliasesStr = Array.isArray(facts?.aliases) && facts.aliases.length > 0
      ? facts.aliases.join(', ')
      : 'None';

    const sourceTitle = source?.sourceTitle || 'Official Prescribing Information';
    const sourceOrg = source?.organization || 'Regulatory Agency';
    const sourceJurisdiction = source?.jurisdiction || 'Regulatory Monograph';
    const sourceReviewDate = source?.localReviewDate || 'Unspecified';

    const userParts: string[] = [
      `TARGET LANGUAGE: ${langInfo.name} (${langInfo.script})`,
      '',
      '--- VERIFIED REFERENCE MONOGRAPH ---',
      `Medicine Generic Name: ${facts?.genericName || 'Unknown Medicine'}`,
      `Medicine Category: ${facts?.medicineCategory?.data || 'Unspecified Category'}`,
      `Verified Brand Names: ${brandsStr}`,
      `Aliases / Alternative Names: ${aliasesStr}`,
      `Active Ingredients: ${ingredientsStr || 'Unspecified'}`,
      `Formulation Types: ${formsStr || 'Unspecified'}`,
      formatAssessed('Documented Uses', facts?.documentedUses),
      formatAssessed('Mechanism of Action', facts?.mechanismOfAction),
      formatAssessed('Serious Warnings', facts?.seriousWarnings),
      formatAssessed('Contraindications', facts?.contraindications),
      formatAssessed('Common Side Effects', facts?.commonSideEffects),
      formatAssessed('Precautions', facts?.precautions),
      formatAssessed('Storage', facts?.storageInformation),
      '',
      `Source Provenance: ${sourceTitle} (${sourceOrg}) [Jurisdiction: ${sourceJurisdiction}, Reviewed: ${sourceReviewDate}]`,
    ];

    if (missingFields.length > 0) {
      userParts.push(`Missing / Unassessed Fields: ${missingFields.join(', ')}`);
    }

    userParts.push(
      '',
      `Please explain what this medicine is, its category, approved uses, mechanism of action, and important warnings in clear, accessible ${langInfo.name} using ${langInfo.script}. ` +
      'Do NOT provide any dosage instructions, dosing schedules, or administration amounts.'
    );

    return { system, user: userParts.join('\n') };
  }

  /**
   * Generates a grounded explanation via the local LM Studio chat-completions endpoint.
   * Strictly conditioned on verified reference facts.
   */
  public async generateGroundedExplanation(
    params: ExplanationGenerationParams
  ): Promise<ExplanationResult> {
    const { system, user } = this.buildPrompt(params);
    const endpoint = `${this.baseUrl}/chat/completions`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.2, // Low temperature for high factual adherence
          max_tokens: 600,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        return {
          success: false,
          errorCode: 'LM_STUDIO_HTTP_ERROR',
          errorMessage: `LM Studio returned error HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
            reasoning_content?: string;
          };
        }>;
      };

      const messageObj = data.choices?.[0]?.message;
      let text = (messageObj?.content || '').trim();

      // If reasoning model exhausted tokens in reasoning_content or left content empty
      if (!text && messageObj?.reasoning_content) {
        text = messageObj.reasoning_content.trim();
      }

      if (!text) {
        return {
          success: false,
          errorCode: 'EMPTY_MODEL_OUTPUT',
          errorMessage: 'Local model returned an empty completion response.',
        };
      }

      // Deterministic Safety Output Validation: Detect and reject dosage recommendations
      const dosageValidation = validateOutputAgainstDosageRules(text);
      if (!dosageValidation.isValid) {
        return {
          success: false,
          errorCode: 'DOSAGE_CONTENT_DETECTED',
          errorMessage: dosageValidation.reason || 'Generated output contained prohibited dosage recommendations.',
        };
      }

      return {
        success: true,
        explanation: text,
        modelId: this.modelId,
        language: params.language,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          success: false,
          errorCode: 'TIMEOUT',
          errorMessage: `Inference timed out after ${this.timeoutMs / 1000}s on local model ${this.modelId}.`,
        };
      }

      return {
        success: false,
        errorCode: 'CONNECTION_FAILURE',
        errorMessage: 'Unable to communicate with local LM Studio inference engine.',
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Singleton client instance configured from environment.
 */
export const defaultLMStudioClient = new LMStudioClient();
