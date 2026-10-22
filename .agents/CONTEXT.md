# Project Context: The Magic Jukebox (Personalized Music Sequencing & Caregiver Support Platform)

> **North Star Charter:** Always read and follow [`docs/NORTH_STAR_CHARTER.md`](../docs/NORTH_STAR_CHARTER.md) before modifying UI copy, sequencing logic, or clinical/EHR exports.

## 1. North Star Positioning & Gatekeeper Safe-Harbor
- **What We Are:** An **evidence-informed personalized music sequencing, rhythmic pace-matching, and caregiver support tool** with standardized **observational documentation (`HL7 FHIR R4`)** that families and care teams can share with healthcare providers.
- **What We Are Not:** We are **not** a standalone clinical treatment or regulated medical device (SaMD), and we never claim to replace physicians or Board-Certified Music Therapists (MT-BCs). Our language must always be collaborative, warm, and grounded in peer-reviewed science without ruffling clinical or regulatory gatekeepers.
- **Modular Specialty Architecture:** A shared core audio/sequencing/EHR engine serving focused specialty tracks—starting with **Memory & Cognitive Care (Dementia / Alzheimer’s)** and **Movement & Pace Support (Parkinson’s / Rhythmic Pacing)**, plus **Calm & Restorative Support**.

## 2. Core Architecture & Stack
- **Framework**: Next.js (App Router, `output: 'export'` static build for Netlify), React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Audio & Tempo Engine**: HTML5 Audio (`preservesPitch = true` WSOLA time-stretching from `0.65x` to `1.35x` + gradual speed-up/slow-down ramp + Web Audio rhythmic beat pulse) connected to the public iTunes Search API (`https://itunes.apple.com/search?term=...&entity=song&limit=12`), plus 1-click full-length playlist export to Spotify (OAuth PKCE), Apple Music, YouTube, M3U, and CSV.
- **State Persistence & Cross-Device Sharing**: `LocalStorage` auto-save + self-contained `?share=...` URL state encoding (`src/lib/share-and-export.ts`), pre-seeded with sample profile "Arthur Pendelton" (born 1944, Youth Era 1954–1974) alongside a 3-step **Build My Playlist** onboarding flow covering `1940s`–`2020s` decades and genres.

## 3. UX & Copy Guardrails
1. **Dementia-Friendly & Caregiver-Simple UX**:
   - Open to the clean, low-word-count `Start Here` landing page (`src/components/LandingHomeView.tsx`).
   - Keep the primary Personal Jukebox view (`src/components/IsoJukeboxView.tsx`) simple, warm, and non-clinical by default: feature 1-tap listening modes (`🎵 Play All Songs`, `🌙 Just Relaxing & Peaceful`, `☀️ Just Upbeat & Cheerful`, `🌊 Gradual Mood-to-Calm Arc`), an **optional expandable** `Mood Before & After Check-In` drawer, a clean vinyl player with pitch-locked Tempo & Pace Matching, and an intuitive multi-song preview/add checklist.
   - House advanced sequencer controls and EHR/provider documentation in optional expandable drawers or dedicated caregiver tabs.
2. **Branding Placement**:
   - Keep the Studio Wildwoods attribution at the bottom footer of the page (`src/app/page.tsx`): *"This Magic Jukebox is being developed in partnership with Studio Wildwoods."*
3. **Never Render Silent Cards**:
   - Filter all iTunes API responses to guarantee `track.previewUrl` is a valid `http` audio URL before rendering in the Song Finder or Guided Onboarding checklist.
4. **Enforce the Iso-Principle & Skipped/Blocked Song Safety**:
   - Support both direct vibe filtering (*Just Relaxing*, *Just Upbeat*, *Play All*) and 3-phase Iso-Principle sequencing (Phase 1 State Match, Phase 2 Bridge, Phase 3 Calm Resolution).
   - Any track marked "Skip & Never Play Again" must immediately halt audio playback, move to the blocked exclusion list, and advance to the next song.
