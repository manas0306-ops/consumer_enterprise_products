# KINETIC — AI-Powered Consumer & Enterprise Products
## Global Multilingual Voice-First Business Operating System for MSMEs

> **IndustrySolve Hackathon 2026 | IIIT Delhi**  
> **Problem Statement #4: AI-Powered Consumer & Enterprise Products**  
> *Author & Developer:* **Maanas Pandey** ([@manas0306-ops](https://github.com/manas0306-ops))  
> *Live Deployment:* [https://manas0306-ops.github.io/consumer_enterprise_products/](https://manas0306-ops.github.io/consumer_enterprise_products/)  
> *Repository:* [https://github.com/manas0306-ops/consumer_enterprise_products](https://github.com/manas0306-ops/consumer_enterprise_products)

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://manas0306-ops.github.io/consumer_enterprise_products/)
[![Next.js 14](https://img.shields.io/badge/Built%20With-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Indian Rangoli UI](https://img.shields.io/badge/Design-Traditional%20Rangoli%20%C3%97%20Modern%20AI-D49B35?style=for-the-badge)](https://github.com/manas0306-ops/consumer_enterprise_products)

---

## 🌟 Executive Summary & Vision

**KINETIC** is an autonomous, multilingual, voice-first AI Business Operating System designed ground-up for micro and small businesses (MSMEs, Kirana stores, vendors, and local traders).

### Core Thesis
> **Language is a core architectural component, not a translation layer.**  
> A shopkeeper in Punjab should be able to speak Hindi, read the dashboard in Punjabi, and get answers in Punjabi plus English, without English ever being mandatory.

- **Your Language. Your Voice. Your Business.**
- **Voice & Conversational NLP First**: Natural language understanding across Hindi, Hinglish, Punjabi, Tamil, English, Arabic, and 38 launch languages (*"Ramesh ko 5 kilo chawal 600 rupaye mein udhaar diya"*).
- **Deterministic Business Engine**: AI proposes; code executes. Relational transactions atomically update stock, customer ledgers, receivables, and audit logs.
- **Human Confirmation Gate**: Structured Understanding Card prevents blind writes with 8-second Undo grace period.
- **Three Language States**: Decouples UI interface language, spoken input language, and response languages.
- **Traditional Indian Rangoli × Modern AI Aesthetics**: Fine golden linework (`#B8862B`), radial mandalas, warm ivory canvas (`#FAF6EC`), and high-contrast WCAG AA readability. Passes the strict *Rangoli Removal Test*.

---

## 🌐 The Three Language States (PRD §5)

Language is never treated as a single monolithic variable:

| State | Variable | Meaning | Example |
| :--- | :--- | :--- | :--- |
| **Application Language** | `ui_language` | Language of the whole interface, navigation, numbers, and dates | `pa-IN` (Punjabi) |
| **Input Language** | `input_language` | Auto-detected from audio voice or typed input with confidence score | `hi-IN` (Hindi 96%) |
| **Response Languages** | `response_languages` | Languages in which business responses and summaries are delivered | `pa-IN`, `en-US` |

### Three-Representation Display Trio (PRD §6.4)
For each voice or text interaction, KINETIC displays:
1. **Original Input**: Spoken or typed utterance + detected language and confidence (e.g., `Hindi — 96%`).
2. **Selected Application Language**: Localized version in current UI language.
3. **English Normalized Representation**: Canonical English record for universal auditability.

---

## 🌍 38 Launch Languages Catalogue & Capability Matrix

KINETIC ships with an extensible, configuration-driven language catalogue (`lib/i18n/locales.config.ts`) with an honest capability matrix (UI, Text, ASR, TTS, OCR):

### 16 International Languages
English (`en-US`), Spanish (`es-ES`), French (`fr-FR`), German (`de-DE`), Portuguese (`pt-BR`), Italian (`it-IT`), Dutch (`nl-NL`), Arabic (`ar-SA`, RTL), Mandarin Chinese (`zh-CN`), Japanese (`ja-JP`), Korean (`ko-KR`), Russian (`ru-RU`), Turkish (`tr-TR`), Indonesian (`id-ID`), Vietnamese (`vi-VN`), Thai (`th-TH`).

### 22 Indian Scheduled Languages
Assamese (`as-IN`), Bengali (`bn-IN`), Bodo (`brx-IN`), Dogri (`doi-IN`), Gujarati (`gu-IN`), Hindi (`hi-IN`), Kannada (`kn-IN`), Kashmiri (`ks-IN`, RTL), Konkani (`kok-IN`), Maithili (`mai-IN`), Malayalam (`ml-IN`), Manipuri / Meitei (`mni-IN`), Marathi (`mr-IN`), Nepali (`ne-IN`), Odia (`or-IN`), Punjabi (`pa-IN`), Sanskrit (`sa-IN`), Santali (`sat-IN`), Sindhi (`sd-IN`, RTL), Tamil (`ta-IN`), Telugu (`te-IN`), Urdu (`ur-IN`, RTL).

*Full RTL (Right-to-Left) support is natively integrated for Arabic, Urdu, Sindhi, and Kashmiri.*

---

## 🎨 Indian Rangoli Design System

Built on a visual language inspired by Indian rangoli (radial symmetry, floral geometry, fine golden linework, ivory negative space):

- **Palette**:
  - `Rangoli Gold`: `#B8862B` (Brand, active nav, primary CTAs)
  - `Deep Gold`: `#7A5410` (WCAG AA text-safe on ivory)
  - `Deep Earth Brown`: `#3B2A1E` (Headings, primary typography)
  - `Soft Brown`: `#6B5848` (Secondary text)
  - `Warm Ivory`: `#FAF6EC` (Canvas layer S0)
  - `Warm White`: `#FFFDF8` (Surface layer S1)
  - `Sand`: `#E8DFCB` (Dividers, outlines)
- **Layered Surfaces**:
  - **S0 Canvas**: Ivory + translucent Rangoli watermark.
  - **S1 Solid**: Warm white card surfaces with 1px sand border.
  - **S2 Glass**: `rgba(255, 253, 248, 0.72)` with 12px blur and 1px golden border.
- **Vector SVG Kit**:
  - `Mandala Large` (16-fold radial lattice) for canvas backgrounds.
  - `Mandala Medium` (12-fold radial) for AI Assistant.
  - `Corner Floral` (Quarter-mandala) for customer and invoice cards.
  - `Rangoli Core` (8-petal symbol) for logo mark, active indicators, and loaders.
  - `Signature Visualizer`: Radial pattern driving 6 states (`idle`, `listening`, `detecting`, `processing`, `reasoning`, `complete`).
- **The Rangoli Removal Test**: Verified via Settings toggle. The UI remains clean, legible, and structurally robust even with the motif removed.

---

## ⚡ Technical Architecture & Business Engine

```
                             USER INTERACTION
                (72px Voice Button / Natural Text / Parchi Scan)
                                     │
                                     ▼
                     SPEECH & LANGUAGE IDENTIFICATION
             (MediaRecorder → Energy VAD → Language ID [96%])
                                     │
                                     ▼
                      HYBRID NLP & INTENT RESOLUTION
                 (Lightweight Local NLP ↔ Google Gemini)
                                     │
                                     ▼
                      STRUCTURED UNDERSTANDING CARD
                (Customer Ramesh, Rice P021, 5kg, ₹600, Credit)
                                     │
                       [EDIT] ◄──────┴──────► [CONFIRM]
                                                 │
                                                 ▼
                        ATOMIC BUSINESS ENGINE (RPC)
            ┌────────────────────────────────────────────────────────┐
            │ 1. Resolve Customer & Alias (pg_trgm fuzzy match)      │
            │ 2. Deduct Inventory & write inventory_movements        │
            │ 3. Create Udhar Receivable (Aging: Current 0-30d)      │
            │ 4. Write Language Metadata (original/translated/en)    │
            │ 5. Trigger 8-Second Undo Grace Window                  │
            └────────────────────────────────────────────────────────┘
```

---

## 🚀 Hero Flow Demonstration (PRD §8.1)

1. **Set UI to Punjabi**: Switch application language to Punjabi (`pa-IN`); the entire interface seamlessly adapts without reloading.
2. **Speak in Hindi**: Tap the 72px Voice Button and say: *"Ramesh ko 5 kilo chawal 600 rupaye mein udhaar diya."*
3. **Auto-Detection**: Visualizer transitions `Listening` → `Detected: Hindi — 96%` → `Transcribing` → `Understanding`.
4. **Three-Representation Display**:
   - Original: *"Ramesh ko 5 kilo chawal 600 rupaye mein udhaar diya"*
   - Punjabi UI: *"ਰਮੇਸ਼ ਨੂੰ 5 ਕਿਲੋ ਚੌਲ 600 ਰੁਪਏ ਉਧਾਰ ਦਿੱਤੇ"*
   - English: *"Sold 5 kg of rice to Ramesh for ₹600 on credit"*
5. **Human Confirmation**: Confirm structured card: Customer Ramesh, Product Rice (P021), 5 kg, ₹600, Credit.
6. **Live Ledger Update**: Inventory decrements from 100 kg to 95 kg, receivables increase by ₹600, and Ramesh's khata is updated.

---

## 🛠️ Local Development & Build

```bash
# Clone the repository
git clone https://github.com/manas0306-ops/consumer_enterprise_products.git
cd consumer_enterprise_products

# Install dependencies
npm install

# Start local Next.js development server
npm run dev

# Build static production bundle
npm run build
```

---

## 👥 Author & Hackathon Submission
- **Author**: Maanas Pandey ([@manas0306-ops](https://github.com/manas0306-ops))
- **Event**: IndustrySolve Hackathon 2026 | IIIT Delhi
- **Track**: Problem Statement #4: AI-Powered Consumer & Enterprise Products
