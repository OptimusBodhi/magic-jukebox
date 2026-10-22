# Agent Handoff & Architecture Guide — The Magic Jukebox

**Last Updated**: 2026-10-22  
**North Star Charter**: [`docs/NORTH_STAR_CHARTER.md`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/docs/NORTH_STAR_CHARTER.md)  
**GitHub Repository (Netlify Connected)**: `https://github.com/OptimusBodhi/magicjukebox.git` (`main` and `master` branches synced)  
**Secondary Mirror**: `https://github.com/OptimusBodhi/magic-jukebox.git`  
**Build & Test Verification**: `npm test` (11/11 passing) • `npm run build` (Next.js static export to `out/` + Netlify Functions in `netlify/functions/`)

---

## 1. Mission, North Star Positioning & Scientific Foundation

**The Magic Jukebox** (developed in partnership with **Studio Wildwoods**) is an **evidence-informed personalized music sequencing, rhythmic pace-matching, caregiver support, and observational EHR documentation platform**.

### Gatekeeper Safe-Harbor & Collaborative Scope ([`docs/NORTH_STAR_CHARTER.md`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/docs/NORTH_STAR_CHARTER.md))
- **What We Are:** A personalized therapeutic music sequencing, pace-matching, and caregiver support tool that formats caregiver-reported session observations into standardized **HL7 FHIR R4 (`intent: 'plan'`)** summaries to share with healthcare providers and **Board-Certified Music Therapists (MT-BCs)**.
- **What We Are Not:** We are **not** a standalone clinical treatment or regulated medical device (SaMD), and we never claim to diagnose, treat, prescribe, or replace clinicians or medications.
- **Modular Specialty Architecture:** One shared core audio/sequencing/EHR engine powering three focused specialty tracks:
  1. **Memory & Cognitive Care (Dementia, Alzheimer’s & Afternoon Restlessness)** — *Reminiscence Bump (Ages 10–30) + Mood-to-Calm Arc + Family Memory Prompts.*
  2. **Movement, Gait & Pace Support (Parkinson’s & Motor Rhythm)** — *Pitch-Locked Tempo Matcher (`0.65x–1.35x`) + Gradual Speed-Up + Beat Pulse Cue (RAS).*
  3. **Calm, Routine & Provider Documentation Support** — *1-tap "Just Relaxing & Peaceful" playlists + Caregiver Observation Log & HL7 FHIR R4 Provider Summary.*

### Four Core Evidence Mechanisms
1. **Neuroanatomical Preservation (Jacobsen et al., 2015, *Brain*; King et al., 2019)**:
   - Long-term musical memory from the **Ages 10–30 Reminiscence Bump** is encoded in the **caudal anterior cingulate cortex (cACC)** (affective salience) and **ventral pre-supplementary motor area (ventral pre-SMA)** (rhythmic motor/vocal entrainment), which resist cortical atrophy in Alzheimer’s disease and project into the **Default Mode Network (DMN)** to support connection and lucidity.
2. **Flexible Vibe Modes + The Iso-Principle (`NCT04236557` & `JAMDA` 2018 Meta-Analysis)**:
   - Supports direct 1-tap listening modes (`🎵 Play All Songs`, `🌙 Just Relaxing & Peaceful`, `☀️ Just Upbeat & Cheerful`) alongside the 3-phase **Gradual Mood-to-Calm Arc** (*Phase 1: State Match [0–7m]* $\rightarrow$ *Phase 2: Bridge [8–18m]* $\rightarrow$ *Phase 3: Calm Resolution [19–30m]*).
3. **Gerdner’s Individualized Music Guidelines (IMIA / PLST Model)**:
   - Prioritizes familiar personal music over generic tracks; supports a proactive listening schedule **30 minutes prior** to typical late-afternoon restlessness; enforces instant **Skip & Never Play Again** filtering for disliked or distressing songs.
4. **Pitch-Preserving Pace Matching & Dual-Mode Playback (Thaut RAS & Särkämö Dyad RCT)**:
   - Locks original vocal pitch and key (`preservesPitch = true`) while adjusting tempo from `65%` to `135%` with gradual speed-up/slow-down ramping for Parkinson’s gait/pace support, and switches between **Relax & Listen** and **Sing-Along & Family Story** modes.

---

## 2. Repository Structure & Key Files

| File Path | Responsibility |
| :--- | :--- |
| [`docs/NORTH_STAR_CHARTER.md`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/docs/NORTH_STAR_CHARTER.md) | **Governing North Star Charter**: Codifies modular specialty tracks, FDA/gatekeeper safe-harbor positioning, MT-BC collaboration, and the "Say This, Not That" copy matrix. |
| [`.agents/CONTEXT.md`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/.agents/CONTEXT.md) | System-wide UX, positioning, accessibility, and branding guardrails. |
| [`.agents/skills/iso-sequencer/SKILL.md`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/.agents/skills/iso-sequencer/SKILL.md) | Declarative skill encoding North Star positioning, Reminiscence Bump (Epochs 1–3), Iso-Principle sequencing, and BARS (1–7) observation logging. |
| [`src/app/page.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/app/page.tsx) | Master application state, HTML5 Audio (`preservesPitch = true`) + Web Audio API controller, `?share=...` URL hydration, `LocalStorage` mount-safe auto-save, unified mobile-fitted top header (`Play Jukebox` + `Menu ▾`), and bottom Studio Wildwoods partnership footer. |
| [`src/components/LandingHomeView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/LandingHomeView.tsx) | Default `Start Here` landing page. Clean, low-word-count entry with two primary actions (**Build My Playlist** and **Play Jukebox**), a 1-click button for the **4-Step Visual Tutorial**, and a collapsible Caregiver/Song Finder/Provider tools bar. |
| [`src/components/SimpleTutorialModal.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/SimpleTutorialModal.tsx) | **Mobile-Scaled 4-Step Visual Tutorial Modal (`How to Build & Use`)**: Fits cleanly on mobile phone screens (`overflow-x-hidden`) and guides users through building a playlist, playing music, adding songs/memories, and using the speed/pace matcher. |
| [`src/components/GuidedOnboardingView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/GuidedOnboardingView.tsx) | **3-Step Playlist Builder**: (1) *Name & Birth Year*, (2) *Genres & Decades (`1940s`–`2020s`)* with unmistakable emerald-green `[✓] Selected` checkboxes, `★ Youth Era` badges, and `🔊 Hear Sample` buttons, and (3) *Pick Specific Songs* featuring an automatic **Suggested Songs Checklist** + live search where users can tap `▶️` to preview and `+ Add Song` / `✓ Added` to check off multiple songs. Auto-saves every change to `LocalStorage`. |
| [`src/components/IsoJukeboxView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/IsoJukeboxView.tsx) | **The Personal Jukebox Player**: Features 1-tap **Playlist Vibe Mode Pills** (`🎵 Play All Songs`, `🌙 Just Relaxing & Peaceful`, `☀️ Just Upbeat & Cheerful`, `🌊 Gradual Mood-to-Calm Arc`), a 1-tap **In-App Continuous Full-Length Player** (`Play Full-Length Songs (In-App)` vs. clearly labeled `30s Sample & Pace Slider`), an **Optional Expandable `Mood Before & After Check-In` Drawer**, inline `Quick Edit Name / Year`, a Vinyl Player with **Pitch-Preserving Tempo & Pace Matcher**, and a living Playlist Queue with an inline **`+ Add Songs / Memory`** drawer (`▶️` preview + multi-song `+ Add Song`). |
| [`src/components/MusicDetectiveView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/MusicDetectiveView.tsx) | **Song Finder / Co-Curation Studio**: Dynamic birth-year Reminiscence Bump calculator, live iTunes Search API audio discovery, reaction triage, and Skipped/Blocked Songs vault. |
| [`src/components/ClinicalTelemetryView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/ClinicalTelemetryView.tsx) & [`src/lib/fhir-epic-adapter.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/fhir-epic-adapter.ts) | **Caregiver Observation Log, Afternoon Calm Scheduler & Provider EHR Summary (`HL7 FHIR R4`)**: 5-second Pre/Post BARS (1–7) observation log, 6 observable behavioral connection signs (`OBSERVED_BEHAVIORAL_SIGNS`), Caregiver Dyad Stress Relief (1–5), Gerdner 30-minute afternoon routine scheduler, and shareable **HL7 FHIR R4 Bundle JSON (`intent: 'plan'`)** for Epic / clinical care teams and MT-BCs. |
| [`src/components/ClinicalEvidenceVaultView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/ClinicalEvidenceVaultView.tsx) | **Research & Science Vault**: Includes the **North Star Scope & Provider Collaboration Banner**, interactive Jacobsen et al. (2015) neuroanatomy breakdown (`cACC`, `ventral pre-SMA`, `DMN`), peer-reviewed study matrix, and UK ecosystem comparison. |
| [`src/lib/spotify-export.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/spotify-export.ts), [`src/lib/full-length-player.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/full-length-player.ts) & [`src/components/FullLengthExportModal.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/FullLengthExportModal.tsx) | **1-Tap Full-Length Playlist Launcher, Central Spotify Service & Scannable QR Modal**: Generates instant zero-login Spotify playlists via the Central Magic Jukebox account (`public: false` unlisted, de-identified), renders scannable Phone QR Codes + embedded Spotify player, constructs anonymous multi-song full-length playlist URLs (`watch_videos?video_ids=...`), deep-links directly to Apple Music (`music.apple.com`), and hides legacy `.CSV`/`.M3U`/clipboard tools inside a collapsed *Advanced Options* drawer. |
| [`netlify/functions/spotify-central-playlist.mjs`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/netlify/functions/spotify-central-playlist.mjs) & [`netlify/functions/youtube-playlist.mjs`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/netlify/functions/youtube-playlist.mjs) | **Serverless Playlist & Audio Resolvers**: `spotify-central-playlist.mjs` uses `SPOTIFY_CENTRAL_CLIENT_ID` and `SPOTIFY_CENTRAL_REFRESH_TOKEN` to mint unlisted (`public: false`), de-identified Spotify playlists using Spotify's Feb 2026 `/v1/me/playlists` & `/items` endpoints. `youtube-playlist.mjs` resolves custom song queries into official YouTube `videoId`s for instant multi-song playlists and continuous in-app playback. |
| [`src/components/BetaFeedbackModal.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/BetaFeedbackModal.tsx), [`src/lib/feedback.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/feedback.ts) & [`public/__forms.html`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/public/__forms.html) | **In-App Public Beta Feedback System**: Obvious, non-intrusive feedback pills (top bar, bottom-right floating corner, and post-session check-in toast) opening a 2-tap emoji + quick-tag feedback modal wired to Netlify Forms (`data-netlify="true"`) with local history & clipboard backup. |
| [`test/iso-sequencer.test.mjs`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/test/iso-sequencer.test.mjs) | Automated test suite (`npm test` — 11/11 passing) verifying guardrails, live iTunes API streams, Guided Onboarding, Central Spotify & Full-Length Playlist resolvers, FHIR adapters, pitch-preserving pace matcher, North Star Charter, Gerontechnology Tactile UI & Multi-Dimensional Efficacy Telemetry, and Public Beta Feedback/Wake-Lock reliability. |

---

## 3. Central Spotify Service & Netlify Environment Variables

The live deployment uses a single central **Magic Jukebox** Spotify account via [`netlify/functions/spotify-central-playlist.mjs`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/netlify/functions/spotify-central-playlist.mjs) so families and caregivers never have to log in, download CSVs, or hit Spotify's 25-user OAuth cap:
- **Configured Netlify Environment Variables**:
  - `SPOTIFY_CENTRAL_CLIENT_ID`: Spotify Developer App Client ID.
  - `SPOTIFY_CENTRAL_REFRESH_TOKEN`: OAuth 2.0 Refresh Token for the central Magic Jukebox account (can be regenerated anytime via the in-app **Central Spotify Account Setup** helper inside `Spotify & QR`).
  - `SPOTIFY_CENTRAL_CLIENT_SECRET`: Optional Client Secret for confidential token refresh.
- **Privacy & Legal Safe-Harbor**:
  - Server-minted playlists never include patient names or medical conditions in Spotify metadata (titled e.g. `Magic Jukebox • 1954–1974 Era (Deep Parasympathetic Calm #A8F21)`).
  - Always created with `public: false` (unlisted) via `POST /v1/me/playlists` and populated via `POST /v1/playlists/{id}/items` (per Spotify's Feb 2026 Web API specification).
