# 🏥 MediGuide AI
### *100% Air-Gapped, Multilingual Clinical Medicine Intelligence on Device*

[![Next.js](https://img.shields.io/badge/Next.js%2016-App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Local AI](https://img.shields.io/badge/Model-MedGemma%204B%20IT%20(Q8__0)-teal?style=for-the-badge&logo=google)](https://huggingface.co/lmstudio-community/medgemma-4b-it-GGUF)
[![Runtime](https://img.shields.io/badge/Inference-LM%20Studio%20Loopback-8b5cf6?style=for-the-badge)](https://lmstudio.ai/)
[![Safety](https://img.shields.io/badge/Safety-Strict%20Zero--Dosage-emerald?style=for-the-badge&logo=shield)](https://github.com/)
[![Tests](https://img.shields.io/badge/Tests-79%2F79%20Passing-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

---

> [!IMPORTANT]
> **Zero-Dosage Clinical Safety Core**: MediGuide AI identifies drugs from their names and explains what they are in plain, accessible language. It strictly **refuses to provide dosage amounts, dosage recommendations, administration frequencies, dose calculations, or maximum daily limits**.

---

## 🌟 What is MediGuide AI?

**MediGuide AI** is an offline, privacy-first medical intelligence agent that runs entirely on your local machine. Built for clinical transparency, it retrieves audited regulatory monographs (US FDA & Indian CDSCO) and uses an on-device quantized **MedGemma 4B IT (Q8_0)** model to generate grounded explanations in native scripts across **6 regional languages** — with **zero cloud dependencies, zero tracking, and zero hallucination risk**.

```
 ┌──────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
 │   User Input Query   │ ───► │  Deterministic Search   │ ───► │  Verified Monograph DB  │
 │  (Brand/Generic/Syn) │      │  & Disambiguation Guard │      │  (US FDA / CDSCO NFI)   │
 └──────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
                                                                             │
                                                                             ▼
 ┌──────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
 │  Rendered Multilingual│ ◄─── │ Deterministic Output    │ ◄─── │ Local MedGemma 4B IT   │
 │  Dashboard (6 Langs) │      │ Zero-Dosage Validator   │      │ (LM Studio Q8_0 Engine) │
 └──────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

---

## ✨ Key Superpowers

### 🔒 100% Offline & Air-Gapped Loopback Architecture
- Communicates **only** via localhost (`127.0.0.1`).
- Completely rejects external APIs, telemetry, cloud LLMs, and external CDNs.
- Built-in `validateLoopbackUrl` prevents accidental connection to public IP addresses.

### 🧠 Grounded On-Device MedGemma 4B IT (Q8_0)
- Powered by Google's clinical **MedGemma 4B IT** model (Gemma 3 architecture) quantized to high-precision **Q8_0 (8-bit)**.
- Strictly conditioned on verified reference facts — the model explains only verified reference points.

### 🌐 End-to-End Multilingual Experience
- Full UI localization and model synthesis across 6 languages:
  - 🇬🇧 **English**
  - 🇮🇳 **Hindi (हिन्दी)** — Natural Devanagari script
  - 🇮🇳 **Telugu (తెలుగు)** — Authentic Telugu script
  - 🇮🇳 **Tamil (தமிழ்)** — Tamil script
  - 🇮🇳 **Kannada (ಕನ್ನಡ)** — Kannada script
  - 🇮🇳 **Malayalam (മലയാളം)** — Malayalam script
- Dual-layer approach:
  - **Regulatory Monograph**: Preserved in verbatim source English to avoid distortion of clinical facts.
  - **AI Explanation & Dashboard**: Dynamically translated into the user's chosen language with Latin pharmaceutical name preservation.

### 🛡️ Strict Zero-Dosage & Hallucination Prevention
- **No Dosage Ever**: Completely strips dosage recommendations, scheduling, and calculations.
- **Regex Safety Gate**: Any model response attempting dosage generation is suppressed by `validateOutputAgainstDosageRules`.
- **No Silent Assumptions**: Ambiguous medicines (e.g. Paracetamol US vs India, multi-strength options) present interactive candidates for user selection.
- **Fixture Isolation**: Synthetic test records are strictly quarantined from production lookups.

---

## 📸 Interactive Dashboard Experience

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ 🏥 MediGuide AI     [● Local Mode (100% Offline)]     [MedGemma 4B IT Q8_0]           │
 ├────────────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                        │
 │  [ Cetirizine                                  ] [ Hindi (हिन्दी) ▼ ] [ Verify & Explain ] │
 │                                                                                        │
 │  📋 Official Regulatory Source Record (English Original)                               │
 │  The regulatory monograph facts below are preserved verbatim to prevent distortion.    │
 │                                                                                        │
 │  ┌───────────────────────────────────────────────┐ ┌─────────────────────────────────┐ │
 │  │ 💊 Cetirizine Hydrochloride [VERIFIED]         │ │ 🤖 Grounded AI Explanation (हिन्दी) │ │
 │  │ Category: Non-Sedating Antihistamine          │ │ **Cetirizine: एक विस्तृत जानकारी**│ │
 │  │ Documented Uses: Seasonal Allergic Rhinitis   │ │ यह दवा एक एंटीहिस्टामाइन है जो   │ │
 │  │ Mechanism: Selective H1-Receptor Antagonist   │ │ एलर्जी के लक्षणों को कम करती है... │ │
 │  │ Warnings: Drowsiness with CNS Depressants     │ │ [0 Dosage Advice Guaranteed]   │ │
 │  │ Source: US FDA / CDSCO Approved Label        │ └─────────────────────────────────┘ │
 │  └───────────────────────────────────────────────┘                                     │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Operating System:** Windows 11, macOS, or Linux
- **Node.js:** v20+ or v24+
- **LM Studio:** [Download LM Studio](https://lmstudio.ai/)
- **Model:** [MedGemma 4B IT GGUF (Q8_0)](https://huggingface.co/lmstudio-community/medgemma-4b-it-GGUF) (`medgemma-4b-it`)

---

### Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/sgnancharan/Ai-Agent-For-Drug-Indentification.git
cd Ai-Agent-For-Drug-Indentification
npm install
```

### Step 2: Configure LM Studio

1. Open **LM Studio** and search for `lmstudio-community/medgemma-4b-it-GGUF`.
2. Download the **`Q8_0`** quantization file (~4.98 GB).
3. Set the model identifier to `medgemma-4b-it`.
4. Start the local server:
   ```powershell
   # Start on default loopback port 1234 (or 12345 if 1234 is occupied)
   lms server start --port 12345
   ```
5. Confirm the model is loaded:
   ```powershell
   lms ps
   ```

### Step 3: Configure Environment Variables

Create `.env.local` in the project root:

```env
# Local LM Studio Endpoint
LM_STUDIO_BASE_URL=http://127.0.0.1:12345/v1
LM_STUDIO_MODEL=medgemma-4b-it
LM_STUDIO_TIMEOUT_MS=60000

# Client accessible mirror
NEXT_PUBLIC_LM_STUDIO_BASE_URL=http://127.0.0.1:12345/v1
NEXT_PUBLIC_LM_STUDIO_MODEL=medgemma-4b-it
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Validation Suite

MediGuide AI includes **79 automated unit and regression tests** verifying safety, language flow, zero-dosage enforcement, and offline resilience.

```bash
# Run all 79 tests (node native test runner with TypeScript strip-types)
npm test

# Run strict regulatory dataset integrity validation
npm run validate

# Run ESLint validation
npm run lint

# Run optimized production build (Next.js 16 App Router Turbopack)
npm run build
```

### Test Breakdown

| Suite | Tests | Purpose |
| :--- | :---: | :--- |
| `tests/agent-backend.test.ts` | **17** | Validates API routing, JSON validation, and error sanitization |
| `tests/language-selection.test.ts` | **8** | End-to-end language flow, prompt injection, and dictionary completeness |
| `tests/lm-studio-client.test.ts` | **13** | Loopback security, token optimization, and timeout resilience |
| `tests/medicine-search.test.ts` | **12** | Exact, brand, and ingredient lookup; typo tolerance; alias matching |
| `tests/medicine-validation.test.ts` | **8** | Regulatory schema compliance and zero-dosage integrity |
| `tests/end-to-end-integration.test.ts` | **11** | Failure recovery (offline server, aborted calls, malformed inputs) |
| `tests/frontend-workflow.test.ts` | **7** | Client state transitions, candidate picker, and UI safety notices |

---

## 🏗️ Architecture & Project Structure

```text
Ai-Agent-For-Drug-Indentification/
├── src/
│   ├── app/
│   │   ├── api/medicine/route.ts  # POST /api/medicine (Validated agent backend)
│   │   ├── globals.css            # Medical UI tokens & glassmorphism
│   │   ├── layout.tsx             # Zero-external-dependency root layout
│   │   └── page.tsx               # Reactive Multilingual Medical Dashboard
│   ├── components/
│   │   ├── AiExplanationCard.tsx  # Grounded LLM output card with language badges
│   │   ├── AmbiguousResultPanel.tsx # Interactive candidate resolution panel
│   │   ├── Header.tsx             # System status & offline indicator
│   │   ├── MedicineFactCard.tsx   # Verified clinical monograph viewer
│   │   ├── NotFoundResultPanel.tsx# Quarantine disclosure & typo suggestions
│   │   ├── SafetyDisclaimer.tsx   # Clinical disclaimer & emergency poison control
│   │   └── SearchForm.tsx         # Multilingual search form & quick chips
│   ├── config/
│   │   └── model.ts               # LM Studio configuration defaults
│   ├── data/
│   │   └── medicines.json         # Audited regulatory knowledge base
│   ├── lib/
│   │   ├── agent-backend.ts       # Central orchestration service
│   │   ├── i18n.ts                # Local UI dictionaries for 6+ languages
│   │   ├── lm-studio-client.ts    # Secure loopback client for MedGemma 4B IT
│   │   ├── medicine-search.ts     # Deterministic normalized search engine
│   │   └── medicine-validation.ts # Zero-dosage validator & schema checker
│   └── types/
│       ├── agent.ts               # Request/Response/I18n contracts
│       ├── index.ts               # Central export registry
│       └── medicine.ts            # Regulatory monograph interfaces
├── tests/                         # Comprehensive automated test suites
├── scripts/
│   ├── validate-medicines.ts      # Clinical integrity validation script
│   └── verify-e2e.ts              # Live local server integration verification
└── next.config.ts                 # Next.js 16 Turbopack configuration
```

---

## 🔬 Regulatory Provenance & Knowledge Base

Every medicine in MediGuide AI is verified against official regulatory source documentation:

| Generic Name | Jurisdiction | Primary Source | Document ID |
| :--- | :---: | :--- | :--- |
| **Cetirizine Hydrochloride** | US / IN | US FDA DailyMed / CDSCO | `NDA 019835` |
| **Paracetamol (US Formulation)** | US | US FDA DailyMed SPL | `Acetaminophen Tablet Label` |
| **Paracetamol (IN Formulation)** | IN | CDSCO National Formulary of India (NFI) | `NFI Monograph - Paracetamol` |
| **Amoxicillin** | US / IN | US FDA Approved Prescribing Information | `Amoxil FDA Label` |
| **Metformin Hydrochloride** | US / IN | US FDA Prescribing Information / CDSCO | `Glucophage Prescribing Info` |

---

## ⚠️ Medical Safety & Disclaimer

> [!CAUTION]
> **Educational & Informational Reference Only**
> 
> MediGuide AI is developed as a technical demonstration of air-gapped, on-device clinical AI. It does **not** provide medical diagnoses, treatment plans, or personalized prescribing advice.
> 
> - **Never alter, start, or stop medications** without consulting a licensed physician or pharmacist.
> - **In case of suspected overdose or adverse reaction**, immediately contact your national poison control center or emergency medical services.

---

## 👨‍💻 Author & Hackathon Project

- **Author:** S Gnan Charan
- **Project:** MediGuide AI — Local Offline Clinical Intelligence
- **Platform:** Windows 11 / Next.js 16 / MedGemma 4B IT Q8_0
- **License:** MIT License

⭐ *If you find this project helpful or inspiring, consider giving it a star on GitHub!*
