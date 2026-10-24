# VECNAVERSE Real-Time SER & Cybercrime Triage — API Contract

## 1. Core Design Rules
- **No Login / No Signup:** Boot directly into the Live Investigator Triage Console.
- **Indicative Signal Mandate:** Every emotion output MUST display the `indicative_disclaimer` badge stating that predictions are indicative triage signals, not definitive proof of honesty or guilt.
- **Zero-Cost BYOK (Bring Your Own Key):** The UI provides a lightweight Settings drawer where the user can paste a free API key for **Groq**, **OpenRouter**, or **SiliconFlow**. If no key is provided, the backend automatically uses its built-in **100% Offline Acoustic + Rule-Based Cybercrime Triage Engine** so the app never crashes or fails.

---

## 2. Endpoints

### A. `POST /api/analyze-audio` (Recorded Call Forensic Mode)
- **Request:** `multipart/form-data` with `file` (`.wav`, `.mp3`, `.ogg`) and optional headers:
  - `X-Provider`: `groq` | `openrouter` | `siliconflow` | `offline`
  - `X-Api-Key`: `<user_supplied_free_api_key>`
- **Response (`200 OK`):** Returns the `TriagePayload` JSON object below.

### B. `WS /ws/live-call` (Real-Time Stream Mode)
- **Client Sends:** Raw PCM Float32 or Base64 WAV 2-second audio chunks (or `{"action": "simulate_call", "scenario": "digital_arrest" | "upi_fraud" | "distressed_victim"}` for instant demo testing).
- **Server Pushes:** Real-time `TriagePayload` JSON frames every 1.5–2.0 seconds.

### C. `GET /api/mock-scenarios` (Frontend Styling Helper)
- Returns 3 pre-computed multi-call queue payloads so the frontend developer can style waveforms, gauges, and priority queues offline.

---

## 3. Shared `TriagePayload` JSON Schema

```json
{
  "call_id": "CALL-2026-0891",
  "timestamp_ms": 1761286800000,
  "caller_tag": "Distressed Victim / Potential Active UPI Drain",
  "urgency_score": 92,
  "urgency_level": "CRITICAL",
  "dominant_emotion": "fear",
  "emotion_probabilities": {
    "fear": 0.48,
    "distress": 0.31,
    "nervousness": 0.14,
    "anger": 0.04,
    "neutral": 0.03
  },
  "acoustic_biomarkers": {
    "pitch_hz": 268.4,
    "jitter_tremor_pct": 3.8,
    "speech_rate_sps": 6.1,
    "rms_energy_db": -11.2,
    "vocal_anomaly": "High micro-tremor + rapid breathing detected"
  },
  "transcript": {
    "raw_redacted": "Sir please help, someone on video call said I am under digital arrest and made me transfer ₹45,000 from my SBI account ending [REDACTED-ACCT] and they are asking for my OTP [REDACTED-OTP] right now!",
    "pii_masked_count": 2,
    "detected_keywords": ["digital arrest", "transfer", "OTP", "video call"]
  },
  "triage_insights": {
    "crime_category": "Digital Arrest Extortion / Active Unauthorized Financial Transfer",
    "recommended_actions": [
      "1. Instruct caller to immediately disconnect the scammer's video call and NOT share the OTP.",
      "2. Initiate immediate 1930 NCRP financial hold using the transaction UTR.",
      "3. Reassure caller that police/CBI never conduct arrests over video calls."
    ],
    "explainability_summary": "Urgency 92/100 triggered by high vocal pitch tremor (3.8% jitter), elevated speech rate (6.1 syl/sec), and active extortion/OTP keywords.",
    "indicative_disclaimer": "INDICATIVE TRIAGE SIGNAL ONLY: Vocal emotion and urgency metrics assist call prioritization and are NOT definitive evidence of caller intent, honesty, or guilt."
  },
  "timeline_segments": [
    {"start_sec": 0.0, "end_sec": 2.5, "emotion": "nervousness", "urgency": 65},
    {"start_sec": 2.5, "end_sec": 5.0, "emotion": "fear", "urgency": 88},
    {"start_sec": 5.0, "end_sec": 7.5, "emotion": "distress", "urgency": 92}
  ]
}
```
---

### 3. The Master Prompt for OpenCode (1st Code Push Baseline)

Launch **OpenCode** in your `vecnaverse-ser` root directory. Turn on **Wispr Flow** (so these words count toward your WeMakeDevs *No Hands* challenge leaderboard!) or paste this prompt directly into OpenCode to build your **1st Code Push** (`12:00 PM – 03:00 PM`):

```text
We are building "VECNA-Pulse", a Real-Time Speech Emotion Recognition (SER) and Cybercrime Call Triage System for the VECNAVERSE hackathon. Read API_CONTRACT.md first and build the complete working 1st Code Push prototype in `backend/` and `frontend/` with zero heavy bloat so my machine stays fast.

STRICT ARCHITECTURAL REQUIREMENTS:
1. NO LOGIN OR SIGNUP: Boot directly into the main Investigator Triage Dashboard.
2. RESPONSIBLE AI GUARDRAIL: Every prediction response and UI panel must prominently include the indicative signal disclaimer stating that emotion predictions are indicative triage signals for prioritizing assistance, not definitive evidence of honesty, intentions, or guilt.
3. ZERO-COST BYOK + OFFLINE FALLBACK: Never hardcode paid developer API keys. Support user-supplied free API keys from Groq, OpenRouter, or SiliconFlow via request headers / UI settings modal, AND implement a 100% working local/offline fallback so the app works out-of-the-box with zero API keys configured.

BUILD PART 1: FASTAPI BACKEND (`backend/app/`)
- `emotion_engine.py`:
  - Use `librosa`, `scipy`, and `numpy` (and `soundfile`) to process uploaded `.wav` files or live PCM/WAV chunks.
  - Extract real acoustic biomarkers: Fundamental Frequency (F0 / Pitch Hz), Pitch Micro-Tremor/Jitter %, RMS Energy (dB), Zero-Crossing Rate, and Speech Rate estimation.
  - Map acoustic features + optional `sherpa-onnx` (if model present, otherwise deterministic acoustic DSP heuristic fusion) into probabilities for the 5 target classes: `fear`, `anger`, `distress`, `nervousness`, and `neutral`, plus a `timeline_segments` array across 2.5-second windows.
- `triage_agent.py`:
  - Implement automatic Regex PII Redaction on transcripts (mask 10-digit phone numbers, 12-digit Aadhaar numbers, 4-6 digit OTPs, and bank account numbers, returning `pii_masked_count`).
  - Compute a composite `urgency_score` (0-100) combining acoustic distress/fear/nervousness (60% weight) + cybercrime urgency keywords (40% weight: "OTP", "digital arrest", "UPI", "blackmail", "suicide", "hacked", "money deducted").
  - If a user supplies a `groq`, `openrouter`, or `siliconflow` API key, use `httpx` to call the respective free LLM endpoint (and Groq `whisper-large-v3-turbo` if Groq key is provided) to generate transcripts and dynamic Officer Recommended Actions. If in `offline` mode or no key is provided, use our built-in Cybercrime Playbook Rule Engine so it never fails.
- `mock_generator.py`:
  - Provide 4 realistic synthetic cybercrime call scenarios ("Digital Arrest Victim in Panic", "Active UPI Fraud Caller", "Nervous Informant Tip", "Angry Harassment Caller") and a script to auto-generate 3 sample `.wav` files with varying pitch/tremor tones so we can test file uploads immediately.
- `main.py`:
  - Enable CORS (`*`).
  - Implement `POST /api/analyze-audio`, `WS /ws/live-call`, `GET /api/mock-scenarios`, and `GET /api/health`.

BUILD PART 2: FUNCTIONAL SKELETON UI (`frontend/`)
- Create a clean, zero-bloat Vite + React + Tailwind CSS (or clean modular HTML/JS/CSS if faster) dashboard that my teammate can easily restyle.
- Include:
  1. Left Sidebar: "Multi-Call Priority Queue" showing incoming calls sorted automatically by Urgency Score (0-100) with color-coded badges (CRITICAL, HIGH, MEDIUM).
  2. Center Panel:
     - Mode Switcher: "Live Call Stream (Mic / Simulator)" vs. "Recorded Call Forensics (.wav Upload)".
     - Interactive Emotion Probability Bars (`Fear`, `Distress`, `Nervousness`, `Anger`, `Neutral`) + Timeline Segment strip.
     - Acoustic Biomarkers readout (`Pitch Hz`, `Voice Jitter/Tremor %`, `Speech Rate`, `Energy dB`).
     - Live Transcript box highlighting redacted PII (`[REDACTED-OTP]`) and detected threat keywords.
  3. Right Panel:
     - "Officer Decision-Support Playbook" with step-by-step actionable instructions + the mandatory "Indicative Signal Only" Responsible AI badge.
     - "Hands-Free Officer Dispatch Notes" textarea (specifically designed so I can click it and dictate incident notes hands-free using Wispr Flow during the demo).
  4. Top Bar:
     - "Mock Mode Toggle" (`?mock=true`) for frontend styling without backend.
     - "BYOK API Settings" button (Groq / OpenRouter / SiliconFlow key input + Offline Local Mode default).

After creating the files, run the sample `.wav` generator, verify `uvicorn app.main:app` boots cleanly on port 8000, and test `GET /api/health` and `GET /api/mock-scenarios`.
```