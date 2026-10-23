# CareView AI — Smart Hospital TV Assistant for Elderly Patients

> **Amazon Fire TV Hackathon Track**  
> AI-powered, accessible hospital television assistant designed for elderly patients, bedside care, and individuals who struggle with traditional small-text TV remotes.

---

## 1. Product Vision & Overview

In hospital environments, elderly patients and recovering individuals frequently struggle with small on-screen text, labyrinthine cable TV menus, language barriers, and difficulty finding basic hospital information (such as visiting hours, cafeteria schedules, or pharmacy locations).

**CareView AI** transforms the in-room hospital television into an empathetic, ultra-accessible bedside assistant:
- **10-Foot Viewing Experience**: High-contrast, large-typography UI designed for viewing comfortably from a hospital bed (1920×1080 optimized, fully responsive on laptops and tablets).
- **Voice & Text Q&A**: Patients can press the prominent microphone button or use their remote control to ask natural questions in **English** or **Hindi (हिंदी)** and receive clear, spoken, and visual responses.
- **Hospital Knowledge Grounding**: Answers are strictly grounded in an editable hospital knowledge base (visiting hours, cafeteria, reception, pharmacy, wing navigation, emergency protocols). It never invents policies or medical advice.
- **Clinical Safety Guardrails & Emergency Triage**: Queries mentioning acute pain (e.g. chest pain, breathless, bleeding, falling) immediately trigger high-priority alerts with an explicit instruction to use the physical bedside red nurse call cord.
- **Assistance Request Queue & Staff Board**: Patients can log non-emergency bedside requests (water, blanket, nurse check, mobility aid) that stream to an interactive nursing staff portal where staff acknowledge and mark requests resolved.
- **Fire TV Remote Navigation & Virtual Simulator**: Complete D-pad arrow key, Enter/Select, Back/Escape, and Mic shortcut navigation, accompanied by an on-screen **Virtual Fire TV Remote Controller** for desktop/laptop evaluation without physical hardware.

---

## 2. Key Features Implemented

| Module | Features |
|---|---|
| **Accessible TV Home Screen** | 10-foot layout, patient & room orientation header (`Room 402 • Eleanor Vance`), live clock, huge voice push-to-talk button, high-contrast action cards, keyboard & D-pad remote support. |
| **Voice & Text Assistant** | Web Speech API voice recognition (`en-US` & `hi-IN`), animated active soundwave indicator, safety timeout to prevent infinite listening, text fallback input, audio readout using `SpeechSynthesis` with Play/Pause/Resume/Stop controls. |
| **Hospital Knowledge Base** | Single source of truth for Visiting Hours, Cafeteria & Meal delivery, Reception & Help Desk, Floor & Wing Directory, Patient Amenities & Wi-Fi (`Hospital-Guest`), and Emergency protocols in both English and Hindi. |
| **Safety & Hallucination Guardrails** | Automatic detection of acute medical symptoms triggers emergency redirection. Clinical diagnostic questions are deferred to medical staff. Unknown queries redirect to reception rather than hallucinating answers. |
| **Assistance Request System** | One-touch requests for "Need a Nurse", "Water or Ice", "Bathroom / Mobility Help", "Extra Blanket / Pillow", "Pain Relief Notification", with audio/voice notes and unique reference IDs (`REQ-xxxx`). |
| **Nursing Staff Dashboard** | Floor dashboard displaying live incoming requests, status badges (`Pending`, `Acknowledged`, `Resolved`), counter metrics, status filters, staff update notes, and demo reset tool. |
| **Accessibility & Settings** | English / Hindi toggle, 3-tier text scaling (`Standard`, `Large 125%`, `Extra Large 150%`), High Contrast Mode (pure black background with high-visibility yellow/cyan), Speech Rate control (0.75x to 1.25x), Audio volume, and microphone diagnostic tool. |
| **Fire TV Remote Simulator** | On-screen virtual remote with D-pad directional arrows, Select, Back, Home, and Alexa Voice Remote Mic button. |

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom 10-foot TV utility tokens, High Contrast modes, and accessibility focus rings
- **Icons**: Lucide React
- **Voice Recognition**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with graceful fallback to accessible text input
- **Voice Output (TTS)**: Web Speech Synthesis API with multilingual voice matching, rate, and volume controls
- **Audio Feedback**: Web Audio API synthesized cues for remote navigation and focus shifts
- **AI Service Abstraction**: Multi-provider client (`lib/assistant.ts`) supporting:
  - **Built-in Deterministic Knowledge Engine (Demo Mode)**: Zero external credentials required; operates offline with strict hospital facts and triage logic.
  - **OpenAI** (`gpt-4o-mini`, `gpt-4o`)
  - **Google Gemini** (`gemini-1.5-flash`)
  - **Anthropic Claude** (`claude-3-5-haiku-20241022`)

---

## 4. Getting Started & Setup

### Prerequisites
- Node.js `v18.17+` or `v20+` (tested on Node `v24.21.0`)
- npm `v9+` or `v10+`

### Installation
```bash
# Clone or navigate to the project directory
cd "project for amazon"

# Install dependencies
npm install
```

### Running Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### Running Production Build & Verification
```bash
# Build production bundle
npm run build

# Start production server
npm run start

# Run end-to-end automated integration tests
npm test
```

---

## 5. AI Provider & Demo Mode Configuration

### Demo Mode (Default — Zero Keys Required)
CareView AI works **out of the box without any external API keys**.
When no LLM keys are configured in `.env`, the system automatically activates its **Built-in Hospital Knowledge Base Engine**. This engine:
- Uses configured facts from `lib/hospitalKnowledge.ts`.
- Runs natural language pattern matching for hospital services, visiting hours, dining, and navigation.
- Strictly executes safety guardrails for acute symptoms (e.g. chest pain) and medication disclaimers.
- Clearly displays the badge `Built-in Hospital Knowledge Base (Demo Mode)` on answers.

### Configuring Live AI Providers (Optional)
To enable live generative LLM responses, copy `.env.example` to `.env.local` and configure your preferred provider:

```bash
cp .env.example .env.local
```

#### Option A: OpenAI
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

#### Option B: Google Gemini
```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
```

#### Option C: Anthropic Claude
```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
```

---

## 6. Amazon Fire TV Compatibility Notes

> **Disclaimer**: This project is currently a Next.js web application designed to run on a 10-foot TV viewing display. It has been tested in modern Chromium/WebKit browsers and optimized for TV remote D-pad input. It is not currently compiled as a native Fire OS Android APK or Vega OS binary.

### 10-Foot Viewing Architecture
- **Distance-first typography**: Default font sizes are scaled up (`text-xl` to `text-4xl`) with comfortable line spacing so patients can read from 8 to 12 feet away in a hospital bed.
- **Zero reliance on mouse hover**: All interactive cards and buttons have visible high-contrast `:focus-visible` rings (`4px #38bdf8` or `5px #facc15`).
- **Remote D-Pad Navigation**:
  - `↑`, `↓`, `←`, `→`: Move focus between cards and controls.
  - `Enter` / `Space`: Select highlighted action.
  - `Esc` / `Backspace`: Return to Home Screen.
  - `[M]`: Activate voice microphone input.
  - `[C]`: Toggle High Contrast Mode.
  - `[L]`: Toggle Language (English <-> Hindi).
- **Virtual Fire TV Remote Controller**: Click the **"TV Remote"** button in the header or footer to open an on-screen Fire TV remote overlay with D-pad, OK, Back, Home, and Alexa Voice Mic buttons.

### Fire TV Deployment Roadmap
To package CareView AI for Amazon Fire TV / Fire OS devices:
1. **Amazon Silk Browser**:
   - CareView AI can be deployed on Vercel or AWS Amplify and accessed via the Fire TV Silk browser.
   - Note on Silk: Auto-play audio requires an initial user interaction (e.g. pressing Select on remote) to initialize the Web Audio / SpeechSynthesis context.
2. **Fire TV Web App (PWA) / Amazon Appstore**:
   - Wrap the application using the Amazon Web App Starter Kit (WASK) or Apache Cordova / Capacitor with the Amazon Fire OS webview container.
   - Configure `manifest.json` with `"display": "fullscreen"` and `"orientation": "landscape"`.
3. **Microphone Permissions on Fire OS**:
   - When packaged as an Android/Fire OS Web App wrapper, add `<uses-permission android:name="android.permission.RECORD_AUDIO" />` in `AndroidManifest.xml`.
   - On Fire TV devices with the Alexa Voice Remote, native Alexa skill intents can be connected via AWS Lambda to the `/api/ask` route.

---

## 7. Step-by-Step Patient Demo Script

Follow this journey to demonstrate the complete patient experience:

### Step 1: Patient Opens CareView AI
- The patient sees the welcome screen: **"Hello, Eleanor Vance — Room 402 (Maple Pavilion)"**.
- Notice the live clock, high-contrast buttons, and calm navy hospital color palette.

### Step 2: Patient Asks "Where is the cafeteria?"
- **Via Voice**: Click the large **"PRESS TO TALK"** microphone button (or press `[M]`). Say *"Where is the cafeteria?"*
- **Via Text / Preset**: Alternatively, click the quick preset chip **"Where is the cafeteria?"** or type it in the text fallback.
- **Result**:
  - The recognized question appears on screen.
  - CareView AI displays the answer in extra-large text: *"The cafeteria is located on the Ground Floor, Wing B (near the garden courtyard). It is open daily from 7:00 AM to 9:30 PM..."*
  - The voice synthesizer speaks the answer aloud.
  - Controls allow the patient to Pause, Resume, or Stop audio.

### Step 3: Emergency Escalation Test (Safety Guardrail)
- Ask: *"I have severe chest pain right now"*
- **Result**:
  - CareView AI triggers **Emergency Triage**: A bright flashing red alert appears:
    > **"CRITICAL ALERT: This requires immediate medical attention. Press the RED emergency nurse call button right beside your pillow..."**
  - The app explicitly warns that it is not an emergency dispatch system and provides a one-click button to log an urgent nurse alert.

### Step 4: Patient Requests Bedside Assistance
- Click **"Request Assistance"** on the home screen.
- Notice the clear emergency notice at the top.
- Select **"Water or Ice"** or **"Need a Nurse"**.
- Add an optional voice or text note: *"Extra blanket and drinking water pitcher requested"*.
- Click **"Send Assistance Request"**.
- A confirmation screen appears with generated Reference ID (e.g. `REQ-4021`), confirming the request has been logged to the hospital board.

### Step 5: Nursing Staff Reviews & Updates the Request
- Click **"View on Staff Dashboard"** (or select **Staff Dashboard** from the Home screen).
- The nursing staff board shows the live queue of requests.
- Locate `Room 402` with status **Pending** in amber.
- Click **"Acknowledge"** — status updates to **Acknowledged** with an automated timestamp.
- Enter a staff note: *"Nurse Priya en route with blanket"*.
- Click **"Mark Resolved"** — status updates to **Resolved** in green with resolution timestamp.

### Step 6: Accessibility & Language Customization
- Click **"Language"** or press `[L]` to switch the entire app into **हिंदी (Hindi)**.
- Press `[C]` to toggle **High Contrast Mode** (black background with bright yellow text).
- Open **Settings** to test the **Microphone Diagnostic** or adjust speech speed to **0.75x Slow**.

---

## 8. Automated Testing & Verification Report

The application includes an automated end-to-end integration test suite (`scripts/test-server.mjs`) that spins up the Next.js production server and verifies all core flows via HTTP:

| Test Case | Description | Result |
|---|---|---|
| **Test 1** | Delivery of Home Page HTML with CareView brand markup | ✅ PASS |
| **Test 2** | `POST /api/ask` — Cafeteria query returns Ground Floor location & audio text | ✅ PASS |
| **Test 3** | `POST /api/ask` — Hindi visiting hours query returns Hindi response | ✅ PASS |
| **Test 4** | `POST /api/ask` — Acute chest pain query triggers emergency escalation flag | ✅ PASS |
| **Test 5** | `GET /api/requests` — Retrieval of seeded hospital request queue | ✅ PASS |
| **Test 6** | `POST /api/requests` — Patient creates request with generated ID and Pending status | ✅ PASS |
| **Test 7** | `PATCH /api/requests` — Staff acknowledges request and updates timestamp & notes | ✅ PASS |
| **Test 8** | `PATCH /api/requests` — Staff marks request Resolved with final timestamp | ✅ PASS |

To run the test suite:
```bash
npm test
```

---

## 9. Known Limitations & Next Steps

1. **Fire OS Native Packaging**: Currently runs as a web application; packaging into an Amazon Web App (WASK) or Android APK wrapper is required for native Amazon Appstore submission.
2. **Physical Hospital EHR Integration**: The assistance request system currently uses an internal server memory queue. Integration with HL7/FHIR hospital communication systems (e.g. Epic, Cerner) is the logical production step.
3. **Hardware Red Call Button Interfacing**: CareView AI deliberately instructs patients to use physical bedside cords for emergencies. A hardware integration with nurse call systems (e.g. Rauland Responder) would further bridge the gap.
