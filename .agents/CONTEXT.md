# Project Context: Studio Wildwoods Magic Jukebox (Dementia Music Medicine Platform)

## Core Architecture & Stack
- **Framework**: Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Audio Engine**: HTML5 Audio / Web Audio API connected directly to the public iTunes Search API (`https://itunes.apple.com/search?term=...&entity=song&limit=10`) so that EVERY song card and playlist track has a real, working 30-second audio preview stream (`previewUrl`) with zero authentication or Spotify paywall friction. Includes Web Audio API acoustic synthesis fallback if offline.
- **State Persistence**: LocalStorage with pre-seeded demo data for an 82-year-old patient ("Arthur Pendelton", born 1944, Reminiscence Bump 1954–1974) so the application works instantaneously during live demonstrations.

## Clinical & UX Guardrails
1. **Dementia-Friendly Accessibility**: High-contrast typography, generous touch targets (minimum 48x48px), warm tactile aesthetics (Studio Wildwoods organic palette: deep forest slate `#141E19`, warm cream `#FBF9F5`, amber gold `#D97706` / `#F59E0B`, and sage green `#4D7C5D`), and zero cluttered menus.
2. **Never Render Silent Cards**: Filter all iTunes API responses to guarantee `track.previewUrl` is a valid audio URL before rendering in the Music Detective swipe interface.
3. **Enforce the Iso-Principle**: All generated playlists must organize tracks into 3 visible clinical phases:
   - **Phase 1: State Match** (Minutes 0–7)
   - **Phase 2: Acoustic Modulation Bridge** (Minutes 8–18)
   - **Phase 3: Target Therapeutic Resolution** (Minutes 19–30)
   Displaying BPM, Musical Mode, and Neuro-Target badges (`cACC Affective Salience` and `Ventral Pre-SMA Motor Entrainment`).
4. **Red Flag Quarantine**: Any track marked as a "Red Flag" must immediately halt audio playback, move to a quarantined exclusion list, and smoothly advance to the next safe track.
