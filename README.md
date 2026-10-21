# The Magic Jukebox
### Precision Music Medicine for Dementia & Emotional Transformation

**The Magic Jukebox** (being developed in partnership with **Studio Wildwoods**) unites peer-reviewed dementia neurobiology with an effortless, zero-login web application for families, caregivers, and clinicians.

---

## 1. User Experience & Core Modules

1. **`Start Here` Landing Page & Beginner-Friendly 4-Step Visual Tutorial (`src/components/LandingHomeView.tsx` & `src/components/SimpleTutorialModal.tsx`)**
   - Clean, low-word-count entry screen that separates two primary workflows:
     - **Create Your Own • Easy Family Setup**: Launches the **60-Second 3-Step Express Builder** (or full 6-question setup) to build a custom Jukebox for a loved one right away.
     - **Interactive Demo • Sample Patient**: Opens the pre-loaded demo profile (**Arthur Pendelton, Born 1944**) clearly badged as sample demo data.
   - **Interactive 4-Step Visual Tutorial (`❓ How It Works`)**: Accessible anytime from the top navigation bar, the `Start Here` hero, the Playlist Builder, and the Jukebox Player. Walks non-technical family members through building a playlist, playing music & tapping moods, adding new songs/memories, and using the speed/pace matcher.

2. **60-Second 3-Step Express Playlist Builder & 6-Question Story Setup (`src/components/GuidedOnboardingView.tsx` & `src/lib/onboarding-interview.ts`)**
   - **Default 3-Step Express Mode (For Non-Technical Users)**:
     1. *Who is this Jukebox for?* — Enter their name and birth year (automatically computes their **Ages 10–30 Golden Song Years**).
     2. *Tap a Few Music Styles They Enjoy* — Big tactile cards for upbeat teen styles and peaceful comfort styles, each with an inline **`🔊 Hear Sample`** button to audition a real song right inside setup!
     3. *Any Special Song, Singer, or Memory? (Optional)* — Add a wedding song or family story, or click **Build & Open Jukebox Now** immediately.
   - **Detailed 6-Step Family Story Mode (With Optional Clinical Notes Toggle)**:
     - Modeled on **Dr. Linda Gerdner’s Assessment of Individualized Personal Music (IMIA, 7th Ed.)** and the **Clinical Iso-Principle (`NCT04236557`)**, written in warm everyday family language by default with an optional **`Show Clinical Science Notes`** toggle for clinicians.
   - Includes **Start Blank (For My Loved One)** as well as 3 pre-filled sample personas (*Eleanor Vance b. 1938*, *Arthur Pendelton b. 1944*, *Mateo Morales b. 1950*).

3. **Simple Personal Jukebox + Expandable Clinical Sequencer (`src/components/IsoJukeboxView.tsx`)**
   - **Default Everyday Interface**:
     - **1-Tap `1. Mood Before Music → 2. Mood After Listening` Bar**: Uses friendly, plain-English buttons (`😟 Restless or Pacing`, `😰 Worried or Tense`, `😔 Quiet or Low Energy`, `🤝 Ready to Visit or Care` $\rightarrow$ `😌 Calm & Peaceful`, `😊 Smiling & Present`, `🗣️ Singing / Chatting`, `😐 Still Restless`) to automatically tune the playlist and log the outcome in one tap.
     - **Tactile Vinyl Player & Living Playlist Queue**: Switch between **Relax & Listen** and **Sing-Along & Family Story**, click **`+ Add Song / Memory`** right at the top of the playlist queue to search and add new songs with a plain-English vibe (`🎵 Upbeat`, `🎶 Medium`, `🌙 Peaceful`), click **`✏️ Edit / Add Memory`** on any playing track or playlist row to capture a new family story on the spot, or block disliked songs with **Skip & Never Play Again**.
     - **Pitch-Preserving Tempo & Pace Matcher (Parkinson’s RAS & Motor Entrainment)**: Adjust playback tempo (`65%` to `135%`) with **original vocal pitch and musical key locked** (`preservesPitch = true`). Includes 1-click **`Gradual Speed-Up (Parkinson’s / Gait Pace)`**, **`Gradual Slow-Down`**, and an optional **`🥁 Beat Pulse Cue (RAS)`** synced to the live effective BPM.
     - **1-Click Full-Length Song Launchers**: Open any track in **Spotify**, **Apple Music**, or **YouTube** for full-length playback.
     - **1-Click Shareable Family Link (`?share=...`)**: Encodes the custom profile, songs, *Memory Mirror* stories, and *Red Flag* exclusions into a self-contained URL so siblings, caregivers, or nurses can open the exact same Jukebox on any device without accounts or passwords.
   - **Collapsible Power-User & Clinical Drawer (`Expand Sequencer & Clinical Details`)**:
     - Expands at the bottom of the Jukebox to reveal the full **Emotional Compass (`1. Where We Are Now` $\rightarrow$ `Iso-Bridge` $\rightarrow$ `2. Where We Want To Be`)**, the **30-Minute BPM Trajectory SVG Curve**, the **3-Phase Neuro-Clinical Breakdown**, and **Copy Caregiver Sheet / Print Bedside Chart**.

4. **Song Finder / Music Detective Studio (`src/components/MusicDetectiveView.tsx`)**
   - Connects directly to the public **iTunes Search API** (`https://itunes.apple.com/search`) with a strict **Zero Silent Cards** guardrail (`track.previewUrl` verified before render) for instant 30-second chorus discovery.

5. **Care Log, Sundowning Shield & Epic / HL7 FHIR R4 Medical Record View (`src/components/ClinicalTelemetryView.tsx` & `src/lib/fhir-epic-adapter.ts`)**
   - 5-second Pre/Post **Behavioural Activity Rating Scale (BARS 1–7)** check-in widget, Gerdner 30-minute proactive sundowning scheduler, and 6-week longitudinal chart.
   - **Standardized EHR / Epic Medical Record Preview**: Click **`Preview Epic / HL7 FHIR Medical Record`** to inspect the patient's profile as a standardized **Epic Nursing Flowsheet Order** (`SNOMED CT 410260000` Music Therapy, `ICD-10-CM F03.911` Dementia with Agitation, `LOINC 72170-4` BARS, `CMS NQF #0680` Antipsychotic Sparing) or copy the live **HL7 FHIR R4 Bundle JSON** (`Patient`, `CarePlan`, `Flag` Contraindications, `Observation`).

6. **Clinical Science & Evidence Vault (`src/components/ClinicalEvidenceVaultView.tsx`)**
   - Interactive **Jacobsen et al. (2015)** neuroanatomical breakdown (`cACC`, `ventral pre-SMA`, `DMN`), peer-reviewed clinical reference matrix, and UK competitive ecosystem audit (*Playlist for Life*, *BBC Music Memories*, *m4d Radio*, *Vera*, *MediMusic*).

---

## 2. Quick Start & Verification

```bash
npm install
npm test
npm run dev
```

* **Live Local Development**: `http://localhost:3000`
* **Production Static Export (Netlify)**: `npm run build` (outputs static bundle to `out/` configured via [`netlify.toml`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/netlify.toml)).
* **Agent Handoff Guide**: See [`docs/handoff.md`](file:///d:/Jon%20Brouchoud/Outside%20Collaborations/Magic%20Jukebox/docs/handoff.md).
