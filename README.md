# The Magic Jukebox
### Precision Music Medicine for Dementia & Emotional Transformation

**The Magic Jukebox** (being developed in partnership with **Studio Wildwoods**) unites peer-reviewed dementia neurobiology with an effortless, zero-login web application for families, caregivers, and clinicians.

---

## 1. User Experience & Core Modules

1. **`Start Here` Landing Page (`src/components/LandingHomeView.tsx`)**
   - Clean, low-word-count entry screen that separates two primary workflows:
     - **Create Your Own • Real Family Use**: Launches a blank 6-Question Guided Setup to build a custom Jukebox for a loved one in ~2 minutes.
     - **Interactive Demo • Sample Patient**: Opens the pre-loaded demo profile (**Arthur Pendelton, Born 1944**) clearly badged as sample demo data.
   - Displays a transparent **Current Pilot Status** summary explaining what works today in the browser vs. Phase 2 roadmap items.

2. **6-Question Guided Intake Interview (`src/components/GuidedOnboardingView.tsx` & `src/lib/onboarding-interview.ts`)**
   - Modeled on **Dr. Linda Gerdner’s Assessment of Individualized Personal Music (IMIA, 7th Ed.)** and the **Clinical Iso-Principle (`NCT04236557`)**:
     1. *Identity & Reminiscence Window* (Calculates the Ages 10–30 Bump across 3 epochs)
     2. *Formative Youth & Rhythm (Ages 10–17)* $\rightarrow$ Phase 1 High-Energy State Match (`110–125 BPM`)
     3. *Courtship & Heart Songs (Ages 18–25)* $\rightarrow$ Phase 2 Acoustic Modulation Bridge (`82–102 BPM`) & Caregiver Duet Prompts
     4. *Sanctuary, Faith & Deep Calm* $\rightarrow$ Phase 3 Parasympathetic Resolution (`60–70 BPM`)
     5. *Red Flag Trauma & Trigger Screen* $\rightarrow$ Pre-quarantines bereavement or overstimulating tracks
     6. *Circadian Shield & Starting Mood Calibration* $\rightarrow$ Arms playback 30 minutes prior to peak sundowning
   - Includes **Start Blank (For My Loved One)** as well as 3 pre-filled sample personas (*Eleanor Vance b. 1938*, *Arthur Pendelton b. 1944*, *Mateo Morales b. 1950*).

3. **Simple Personal Jukebox + Expandable Clinical Sequencer (`src/components/IsoJukeboxView.tsx`)**
   - **Default Everyday Interface**:
     - **1-Tap `1. Mood Before Music → 2. Mood After Listening` Bar**: Uses friendly, plain-English buttons (`😟 Restless or Pacing`, `😰 Worried or Tense`, `😔 Quiet or Low Energy`, `🤝 Ready to Visit or Care` $\rightarrow$ `😌 Calm & Peaceful`, `😊 Smiling & Present`, `🗣️ Singing / Chatting`, `😐 Still Restless`) to automatically tune the playlist and log the outcome in one tap.
     - **Tactile Vinyl Player & Living Playlist Queue**: Switch between **Relax & Listen** and **Sing-Along & Family Story**, click **`+ Add Song / Memory`** right at the top of the playlist queue to search and add new songs with a plain-English vibe (`🎵 Upbeat`, `🎶 Medium`, `🌙 Peaceful`), click **`✏️ Edit / Add Memory`** on any playing track or playlist row to capture a new family story on the spot, or block disliked songs with **Skip & Never Play Again**.
     - **1-Click Full-Length Song Launchers**: Open any track in **Spotify**, **Apple Music**, or **YouTube** for full-length playback.
     - **1-Click Shareable Family Link (`?share=...`)**: Encodes the custom profile, songs, *Memory Mirror* stories, and *Red Flag* exclusions into a self-contained URL so siblings, caregivers, or nurses can open the exact same Jukebox on any device without accounts or passwords.
   - **Collapsible Power-User & Clinical Drawer (`Expand Sequencer & Clinical Details`)**:
     - Expands at the bottom of the Jukebox to reveal the full **Emotional Compass (`1. Where We Are Now` $\rightarrow$ `Iso-Bridge` $\rightarrow$ `2. Where We Want To Be`)**, the **30-Minute BPM Trajectory SVG Curve**, the **3-Phase Neuro-Clinical Breakdown**, and **Copy Caregiver Sheet / Print Bedside Chart**.

4. **Song Finder / Music Detective Studio (`src/components/MusicDetectiveView.tsx`)**
   - Connects directly to the public **iTunes Search API** (`https://itunes.apple.com/search`) with a strict **Zero Silent Cards** guardrail (`track.previewUrl` verified before render) for instant 30-second chorus discovery.

5. **Care Log & Sundowning Shield (`src/components/ClinicalTelemetryView.tsx`)**
   - 5-second Pre/Post **Behavioural Activity Rating Scale (BARS 1–7)** check-in widget, Gerdner 30-minute proactive sundowning scheduler, 6-week longitudinal chart, and JSON clinical audit export.

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
