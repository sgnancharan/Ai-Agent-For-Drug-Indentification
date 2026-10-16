# MediGuide AI

**MediGuide AI** is an offline multilingual medicine-information assistant built to provide accurate drug details and safety guidance entirely on local hardware.

---

## Status: Phase 7 Complete — Verified Medicine Knowledge Base & Zero-Dosage Architecture

- [x] **Phase 1**: Workspace initialization, Next.js 16 App Router (strict TypeScript, Tailwind CSS v4, ESLint, npm).
- [x] **Phase 2**: Strict medicine schema with explicit absence vs unassessed indicators, zero-dependency runtime validator, version-controlled JSON storage, deterministic search engine with normalization and ambiguity guards, test fixtures, unit tests, and reference ingestion guide.
- [x] **Phase 3**: Local agent backend service, Next.js API Route Handler (`POST /api/medicine`), strict language validation, synthetic fixture exclusion and unreviewed record rejection, structured fact extraction, and sanitized errors.
- [x] **Phase 4**: Typed server-side LM Studio client with loopback enforcement, grounded explanation workflow conditioned strictly on verified reference monographs, verified on-device inference using **MedGemma 4B IT Q8_0** (`medgemma-4b-it`), empirical multilingual evaluation, safety boundary tests, and zero remote dependencies.
- [x] **Phase 5**: Polished, accessible, 100% offline medicine-information dashboard:
  - Responsive desktop/mobile medical layout with clean typography (local system font stack, zero cloud font calls).
  - Prominent search input with 6-language selector (English, Telugu, Hindi, Tamil, Kannada, Malayalam).
  - Interactive ambiguity resolution panel displaying candidate options without silent selection.
  - Transparent unavailable state explaining synthetic fixture quarantine and zero-hallucination policy.
  - Structured medicine monograph card detailing verified ingredients, uses, warnings, contraindications, side effects, precautions, interactions, missing fields, and source provenance.
  - Local AI explanation panel with an explicit **non-English experimental translation warning** banner.
  - Persistent clinical reference disclaimer and emergency poison control guidance.
- [x] **Phase 6**: End-to-End Integration & Strict Offline Verification:
  - Full pipeline verification connecting the live dashboard (`localhost:3000`), `/api/medicine` endpoint, deterministic search guardrails, and real local on-device **MedGemma 4B IT Q8_0** inference in LM Studio.
  - Complete failure scenario hardening: server stopped / port unreachable, timeout handling, invalid JSON, empty queries, unsupported languages, unknown medicines, ambiguous candidates, synthetic test fixture quarantine, unreviewed drafts, and missing reference fields.
  - Strict offline operation confirmed: zero external CDNs, zero cloud APIs, zero remote font calls, loopback-only communication.
- [x] **Phase 7**: Verified Medicine Knowledge Base & Strict Zero-Dosage Enforcement:
  - Added **5 real, reviewed reference medicines** audited against official public regulatory monographs (US FDA DailyMed SPLs and Indian CDSCO / National Formulary of India).
  - Added verified fields: `medicineCategory`, `mechanismOfAction`, `aliases`, `jurisdiction`, `reviewerRole`, and `auditHistory`.
  - Strict **zero-dosage architecture**: MediGuide AI strictly identifies drugs from their names and explains what they are in simple language. The application completely eliminates dosage recommendations, administration schedules, dose calculations, frequency, and maximum daily limits across datasets, backend, model prompts, output validator, and UI.
  - **Deterministic regex output validator** (`validateOutputAgainstDosageRules`) detects and suppresses any model-generated dosage content, falling back to a safe unavailable notice (`DOSAGE_CONTENT_DETECTED`).
  - Strict jurisdiction disambiguation: distinguishes between US FDA and Indian CDSCO formulations without silent collapsing.
  - Comprehensive automated test suite expanded to **71 passing tests** across 6 test suites.

> **Medical Integrity & Safety Notice:**
> - MediGuide AI identifies a drug from its name and explains what it is in simple language.
> - The application does **NOT** provide dosage recommendations, dosing frequencies, dose calculations, maximum daily doses, or personalized prescribing advice.
> - Source attribution and jurisdiction provenance are preserved for every record.
> - Audits were conducted by a Technical Regulatory Specialist against public regulatory labels; records have not been reviewed by an independent practicing clinician.
> - Synthetic test fixtures remain completely segregated from production search (`includeTestFixtures: false`).
> - The dataset is curated for demonstration purposes and is **not** comprehensive.

---

## Target Environment

- **Host Device:** HP Flip 14 (Intel Core Ultra 7 258V, 32 GB RAM)
- **OS:** Windows 11
- **Local Inference Server:** LM Studio
- **Verified Local Model:** `medgemma-4b-it` (MedGemma 4B IT Q8_0 GGUF, Gemma 3 architecture)
- **Active Endpoint:** `http://127.0.0.1:12345/v1` (default fallback `http://127.0.0.1:1234/v1`)
- **Application Framework:** Next.js 16 (App Router, Turbopack)
- **Language / Typing:** Strict TypeScript (no `any`)
- **Styling:** Tailwind CSS v4 (Custom medical tokens)
- **Package Manager:** npm

---

## Local Inference Configuration & LM Studio Setup

### 1. Model Verification
The active model ID returned by LM Studio's `/v1/models` endpoint is confirmed as:
```json
{
  "id": "medgemma-4b-it",
  "object": "model",
  "owned_by": "organization_owner"
}
```
Quantization confirmed: **Q8_0** (8-bit quantization, 4.98 GB file `medgemma-4b-it-Q8_0.gguf`).

### 2. Starting the Local LM Studio Server
MediGuide AI communicates strictly over loopback (`127.0.0.1`).

```powershell
# If port 1234 is occupied by Windows portproxy:
lms server start --port 12345

# Or standard port 1234:
lms server start
```

---

## Empirical Multilingual Evaluation & Language Advisory Notice

During empirical testing with MedGemma 4B IT Q8_0 across Indian languages, translations produced fluent terminology, but non-English generation in certain languages exhibited subtle symptom hallucinations (e.g. adding nausea or cough to allergic rhinitis in Telugu) or English code-switching (Kannada, Malayalam).

As required by clinical safety standards:
- **English explanations** are grounded strictly in backend facts.
- **Non-English queries** display a prominent amber advisory warning stating:
  > *"Experimental Translation Notice: Medical explanations in non-English Indian languages are experimental and generated locally by MedGemma 4B IT. Clinical testing has identified potential phrasing inaccuracies or symptom additions in regional translations. Always cross-reference the verified English monograph above and consult a healthcare professional."*

---

## Project Structure

```text
.
├── .env.example              # Environment variables template
├── .env.local                # Local environment configuration (LM Studio endpoints)
├── AGENTS.md                 # Agent guidance rules for Next.js App Router
├── docs/
│   └── data-curation-guide.md # Regulatory and clinical data ingestion protocol
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies and npm scripts
├── scripts/
│   └── validate-medicines.ts # Dataset integrity and schema validator script
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/
│   │   │   └── medicine/
│   │   │       └── route.ts  # POST /api/medicine Route Handler
│   │   ├── globals.css       # Tailwind CSS v4 design tokens and medical theme
│   │   ├── layout.tsx        # Root layout with offline system font stack
│   │   └── page.tsx          # Main interactive dashboard client
│   ├── components/           # Accessible, modular UI components
│   │   ├── AiExplanationCard.tsx    # Grounded AI explanation card with language warning
│   │   ├── AmbiguousResultPanel.tsx # Interactive disambiguation candidate picker
│   │   ├── Header.tsx               # App header with offline badge and model chip
│   │   ├── MedicineFactCard.tsx     # Structured verified monograph viewer
│   │   ├── NotFoundResultPanel.tsx  # Honest unavailable panel with fixture disclosure
│   │   ├── SafetyDisclaimer.tsx     # Medical disclaimer and poison control advisory
│   │   ├── SearchForm.tsx           # Search input, language selector, and quick chips
│   │   └── index.ts                 # Component exports
│   ├── config/               # App and model configuration
│   │   └── model.ts          # MedGemma model configuration
│   ├── data/
│   │   └── medicines.json    # Local version-controlled medicine dataset
│   ├── lib/                  # Utilities, agent service, search engine, runtime validation
│   │   ├── agent-backend.ts  # Local medicine-agent workflow service
│   │   ├── lm-studio-client.ts # Typed LM Studio loopback client for MedGemma
│   │   ├── medicine-search.ts
│   │   └── medicine-validation.ts
│   └── types/                # Core TypeScript types, agent types, and medicine schema
│       ├── agent.ts          # Agent request, response, and error types
│       ├── index.ts
│       └── medicine.ts
├── scripts/
│   ├── validate-medicines.ts       # Dataset integrity and schema validator script
│   └── verify-e2e.ts               # Live end-to-end integration verification script
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/
│   │   │   └── medicine/
│   │   │       └── route.ts        # POST /api/medicine Route Handler
│   │   ├── globals.css             # Tailwind CSS v4 design tokens and medical theme
│   │   ├── layout.tsx              # Root layout with offline system font stack
│   │   └── page.tsx                # Main interactive dashboard client
│   ├── components/                 # Accessible, modular UI components
│   │   ├── AiExplanationCard.tsx   # Grounded AI explanation card with language warning
│   │   ├── AmbiguousResultPanel.tsx # Interactive disambiguation candidate picker
│   │   ├── Header.tsx              # App header with offline badge and model chip
│   │   ├── MedicineFactCard.tsx    # Structured verified monograph viewer
│   │   ├── NotFoundResultPanel.tsx # Honest unavailable panel with fixture disclosure
│   │   ├── SafetyDisclaimer.tsx    # Medical disclaimer and poison control advisory
│   │   ├── SearchForm.tsx          # Search input, language selector, and quick chips
│   │   └── index.ts                # Component exports
│   ├── config/                     # App and model configuration
│   │   └── model.ts                # MedGemma model configuration
│   ├── data/
│   │   └── medicines.json          # Local version-controlled medicine dataset
│   ├── lib/                        # Utilities, agent service, search engine, runtime validation
│   │   ├── agent-backend.ts        # Local medicine-agent workflow service
│   │   ├── lm-studio-client.ts     # Typed LM Studio loopback client for MedGemma
│   │   ├── medicine-search.ts
│   │   └── medicine-validation.ts
│   └── types/                      # Core TypeScript types, agent types, and medicine schema
│       ├── agent.ts                # Agent request, response, and error types
│       ├── index.ts
│       └── medicine.ts
├── tests/
│   ├── agent-backend.test.ts       # Agent service and API route integration tests (17 tests)
│   ├── end-to-end-integration.test.ts # Failure scenario and safety boundary tests (11 tests)
│   ├── frontend-workflow.test.ts   # Frontend workflow and safety integration tests (7 tests)
│   ├── lm-studio-client.test.ts    # LM Studio client and safety boundary tests (13 tests)
│   ├── medicine-search.test.ts     # Search engine unit tests (9 tests)
│   └── medicine-validation.test.ts # Schema and dataset validation unit tests (7 tests)
└── tsconfig.json                   # TypeScript configuration (strict mode enabled)
```

---

## Development & Test Commands

```powershell
# Run the complete test suite (64 tests across validation, search, backend, client, frontend, and failure scenarios)
npm test

# Run the live end-to-end verification script against running local servers
node --env-file=.env.local --experimental-strip-types scripts/verify-e2e.ts

# Validate dataset integrity and review statistics
npm run validate
# or: npm run validate:data

# Run ESLint checks
npm run lint

# Build production bundle
npm run build

# Start local Next.js development server
npm run dev
```

### Running Locally

1. Ensure LM Studio server is running locally on port 12345 (or 1234) with `medgemma-4b-it` loaded:
   ```powershell
   lms ps
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```
3. Open your browser to `http://localhost:3000` to interact with MediGuide AI.

