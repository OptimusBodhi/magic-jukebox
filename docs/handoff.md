# Agent Handoff & Architecture Guide — The Magic Jukebox

**Last Updated**: 2026-10-21  
**GitHub Repository (Netlify Connected)**: `https://github.com/OptimusBodhi/magicjukebox.git` (`main` and `master` branches synced)  
**Secondary Mirror**: `https://github.com/OptimusBodhi/magic-jukebox.git`  
**Build & Test Verification**: `npm test` (4/4 passing) • `npm run build` (Next.js static export to `out/`)

---

## 1. Mission & Clinical Foundation

**The Magic Jukebox** (developed in partnership with **Studio Wildwoods**) is a precision music medicine web platform for Alzheimer's disease and related dementias. It bridges the gap between clinical neuroscience and frictionless family/caregiver UX by uniting four clinical mechanisms:

1. **Neuroanatomical Preservation (Jacobsen et al., 2015, *Brain*; King et al., 2019)**:
   - Long-term musical memory from the **Ages 10–30 Reminiscence Bump** is encoded in the **caudal anterior cingulate cortex (cACC)** (affective salience) and **ventral pre-supplementary motor area (ventral pre-SMA)** (rhythmic motor/vocal entrainment), which resist cortical atrophy and glucose hypometabolism in Alzheimer's disease and project into the **Default Mode Network (DMN)** to restore lucidity.
2. **The Clinical Iso-Principle (`NCT04236557` & `JAMDA` 2018 Meta-Analysis)**:
   - Sequences personalized tracks across a 30-minute, 3-phase trajectory:
     - **Phase 1: State Match (Minutes 0–7)** — Matches current sympathetic arousal (`110–125 BPM` for agitation/sundowning) or depressive withdrawal (`65–75 BPM` for apathy) to prevent sensory rejection.
     - **Phase 2: Acoustic Modulation Bridge (Minutes 8–18)** — Smoothly interpolates tempo and rhythmic density along a controlled slope.
     - **Phase 3: Target Therapeutic Resolution (Minutes 19–30)** — Settles into target acoustic parameters (`60–68 BPM` Major mode for parasympathetic calm; `75–92 BPM` for DMN lucidity; `105–120 BPM` for uplifted sing-along joy).
3. **Gerdner's Individualized Music Intervention for Agitation (IMIA / PLST Model)**:
   - Eliminates generic unfamiliar relaxation tracks; schedules proactive playback **30 minutes prior** to peak sundowning vulnerability; enforces instant **Red Flag Quarantine** for bereavement or distress triggers.
4. **Dual-Mode Playback (Särkämö et al., 2014/2016 Dyad RCT)**:
   - Switches between **Receptive Calm Mode** (zero executive demand + 30-min timer + lockable *Patient Safe View*) and **Caregiver Duet & Story Mode** (large-print chorus lyrics + family *Memory Mirror* stories + conversational prompts).

---

## 2. Repository Structure & Key Files

| File Path | Responsibility |
| :--- | :--- |
| [`.agents/CONTEXT.md`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/.agents/CONTEXT.md) | System-wide clinical, accessibility, and aesthetic guardrails. |
| [`.agents/skills/iso-sequencer/SKILL.md`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/.agents/skills/iso-sequencer/SKILL.md) | Declarative skill encoding the Reminiscence Bump (Epochs 1–3), 3-Phase Iso-Principle math, and BARS (1–7) telemetry. |
| [`src/app/page.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/app/page.tsx) | Master application state, HTML5 Audio + Web Audio API harmonic fallback controller, `?share=...` URL hydration, `LocalStorage` persistence, top navigation bar, and bottom Studio Wildwoods partnership footer. |
| [`src/components/LandingHomeView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/LandingHomeView.tsx) | Default `Start Here` landing page. Clean, low-word-count entry that clearly separates **Create Your Own (Real Family Use)** from **Explore Interactive Demo (Arthur Pendelton, Age 82)** and explains current pilot availability. |
| [`src/components/GuidedOnboardingView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/GuidedOnboardingView.tsx) | **6-Question Guided Clinical & Biographical Intake Interview**. Supports starting with a blank form (`Start Blank for My Loved One`) or testing 3 pre-filled sample personas (*Eleanor Vance b. 1938*, *Arthur Pendelton b. 1944*, *Mateo Morales b. 1950*). |
| [`src/components/IsoJukeboxView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/IsoJukeboxView.tsx) | **The Personal Jukebox Player**: Opens with a simple, warm, non-clinical everyday interface featuring a 1-tap **Mood Before Music → Mood After Listening** check-in bar, a clean Vinyl Player with inline **`✏️ Edit / Add Memory`**, and a living Playlist Queue with an inline **`+ Add Song / Memory`** drawer (plain-English 3-vibe selector: `🎵 Upbeat`, `🎶 Medium`, `🌙 Peaceful`). Includes an expandable **Advanced Emotional Transformation Sequencer, BPM Slope & Clinical Controls** drawer at the bottom for clinicians and power users. |
| [`src/components/MusicDetectiveView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/MusicDetectiveView.tsx) | **Song Finder / Co-Curation Studio**: Dynamic birth-year Reminiscence Bump calculator, live iTunes Search API audio discovery (strictly filtered for non-empty `previewUrl`), tactile reaction triage (*Spark*, *Skip*, *Red Flag*), and Red Flag Quarantine Vault. |
| [`src/components/ClinicalTelemetryView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/ClinicalTelemetryView.tsx) | **Care Log, Sundowning Shield & Epic / HL7 FHIR R4 Preview**: 5-second Pre/Post BARS (1–7) check-in widget, Gerdner 30-minute proactive sundowning scheduler, 6-week longitudinal chart, and an interactive **Epic Nursing Flowsheet & HL7 FHIR R4 Bundle JSON** viewer (`SNOMED CT 410260000`, `ICD-10-CM F03.911`, `LOINC 72170-4`). |
| [`src/lib/fhir-epic-adapter.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/fhir-epic-adapter.ts) | Standardized **HL7 FHIR R4 / Epic App Orchard (SMART on FHIR)** adapter generating `Patient`, `CarePlan`, `Flag` (Red Flag Contraindications), and `Observation` (BARS & PRN sparing) resources. |
| [`src/components/ClinicalEvidenceVaultView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/ClinicalEvidenceVaultView.tsx) | **Clinical Science Vault**: Interactive Jacobsen et al. (2015) neuroanatomy breakdown (`cACC`, `ventral pre-SMA`, `DMN`), peer-reviewed study matrix, and UK competitive audit (*Playlist for Life*, *BBC Music Memories*, *m4d Radio*, *Vera*, *MediMusic*). |
| [`src/lib/iso-sequencer.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/iso-sequencer.ts) | Core Reminiscence Bump & 3-Phase Iso-Principle sequencing engine + Arthur Pendelton seed data. |
| [`src/lib/onboarding-interview.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/onboarding-interview.ts) | Synthesizes the 6-Step Guided Interview answers into a live iTunes-hydrated 3-phase Jukebox. |
| [`src/lib/itunes-audio.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/itunes-audio.ts) | Public iTunes Search API client (`https://itunes.apple.com/search`) with Zero Silent Cards filtering and acoustic inference. |
| [`src/lib/share-and-export.ts`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/lib/share-and-export.ts) | Self-contained `?share=...` URL encoder/decoder, 1-click full-song streaming URL builder, and Caregiver Bedside Prescription formatter. |
| [`test/iso-sequencer.test.mjs`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/test/iso-sequencer.test.mjs) | Node test runner suite (`npm test`) verifying guardrails, live iTunes API streams, Guided Onboarding, and URL sharing utilities. |

---

## 3. UI & Branding Guardrails to Preserve

1. **Studio Wildwoods Attribution Placement**:
   - Keep the Studio Wildwoods credit at the very bottom footer of [`src/app/page.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/app/page.tsx): *"This Magic Jukebox is being developed in partnership with Studio Wildwoods."* Do not clutter upper headers with Studio Wildwoods text.
2. **Clear Demo vs. Custom Family Profile Delineation**:
   - Always open to the `Start Here` landing page (`activeTab === 'home'`) unless a `?share=...` URL parameter is present.
   - Clearly badge `Sample Demo Patient (Arthur Pendelton)` vs. `Custom Family Jukebox Profile` (`isCustomProfile`).
3. **Emotional Compass Delineation**:
   - Maintain the framed left container (`1. Where We Are Now`), center directional `Iso-Bridge →` arrow column, and framed right container (`2. Where We Want To Be`) in [`IsoJukeboxView.tsx`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/src/components/IsoJukeboxView.tsx).

---

## 4. Recommended Next Priorities for Incoming Agent (Phase 2)

1. **Embedded Full-Length Streaming OAuth (Spotify Web Playback SDK & Apple MusicKit JS)**:
   - Allow families with Spotify Premium or Apple Music to toggle from 30-second iTunes chorus hooks to continuous 30-minute in-browser full-track crossfading.
2. **Rights-Cleared Acoustic Sanctuary Catalog**:
   - Integrate an optional hosted library of rights-cleared acoustic guitar/piano/vocal arrangements (60–120 BPM) so care homes without consumer streaming accounts can run continuous 30-minute Iso-Principle arcs offline or online.
3. **Short-URL Cloud Sync (Supabase / Netlify Blobs)**:
   - Upgrade the current self-contained `?share=...` base64 URL parameter to an optional short link (`/j/eleanor-7f9a`) so real-time BARS logs and Red Flag quarantines sync automatically across all family and nursing devices.
