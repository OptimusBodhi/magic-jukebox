# Project Context: The Magic Jukebox (Dementia Music Medicine Platform)

## Core Architecture & Stack
- **Framework**: Next.js (App Router, `output: 'export'` static build for Netlify), React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Audio Engine**: HTML5 Audio + Web Audio API harmonic fallback connected directly to the public iTunes Search API (`https://itunes.apple.com/search?term=...&entity=song&limit=12`) so that EVERY song card and playlist track has a real, working 30-second audio preview stream (`previewUrl`) with zero authentication or paywall friction, plus 1-click full-length song launchers for Spotify, Apple Music, and YouTube.
- **State Persistence & Cross-Device Sharing**: `LocalStorage` persistence + self-contained `?share=...` URL state encoding (`src/lib/share-and-export.ts`), pre-seeded with demo patient "Arthur Pendelton" (born 1944, Reminiscence Bump 1954–1974) alongside a blank **Create Your Own** 6-question Guided Intake Interview.

## Clinical & UX Guardrails
1. **Dementia-Friendly & Caregiver-Simple UX**:
   - Open to the clean, low-word-count `Start Here` landing page (`src/components/LandingHomeView.tsx`) that clearly distinguishes **Create Your Own (Real Family Use)** from **Interactive Demo (Sample Patient: Arthur Pendelton)**.
   - Keep the primary Personal Jukebox view (`src/components/IsoJukeboxView.tsx`) simple, warm, and non-clinical by default: feature a 1-tap **`1. Mood Before Music → 2. Mood After Listening`** check-in bar, a clean vinyl player (*Relax & Listen* vs. *Sing-Along & Family Story*), and a simple playlist queue, while housing the **Emotional Compass**, **30-Minute BPM Curve**, and **3-Phase Neuro-Clinical Breakdown** inside the expandable bottom drawer (`Expand Sequencer & Clinical Details`).
2. **Branding Placement**:
   - Keep the Studio Wildwoods attribution at the very bottom footer of the page (`src/app/page.tsx`): *"This Magic Jukebox is being developed in partnership with Studio Wildwoods."*
3. **Never Render Silent Cards**:
   - Filter all iTunes API responses to guarantee `track.previewUrl` is a valid `http` audio URL before rendering in the Song Finder or Guided Interview synthesis.
4. **Enforce the Iso-Principle & Red Flag Quarantine**:
   - Sequence tracks across Phase 1 (State Match, 0–7m), Phase 2 (Acoustic Modulation Bridge, 8–18m), and Phase 3 (Target Therapeutic Resolution, 19–30m).
   - Any track marked "Skip & Never Play Again" (Red Flag Quarantine) must immediately halt audio playback, move to the quarantined exclusion list, and advance to the next safe track.
