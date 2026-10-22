# The Magic Jukebox — North Star Product, Modular & Regulatory Charter

> **Purpose of This Document:** This charter is the governing "North Star" for all product design, software architecture, clinical copywriting, and external positioning for **The Magic Jukebox** (developed in partnership with **Studio Wildwoods**). Every feature, UI label, and documentation update must align with these principles.

---

## 1. Core Identity: What We Are (and What We Are Not)

### What We Are
**The Magic Jukebox** is an **evidence-informed personalized music sequencing, rhythmic pacing, and caregiver support platform** with standardized **observational documentation (HL7 FHIR R4)** that families and care teams can share with healthcare providers.

We translate peer-reviewed neuroscience and musicology—such as the **Reminiscence Bump (ages 10–30)**, the **Iso-Principle (gradual mood-to-calm tempo matching)**, **Dr. Linda Gerdner’s Individualized Music guidelines (30 minutes prior to afternoon restlessness)**, and **pitch-preserving rhythmic pace matching**—into a warm, effortless everyday tool that anyone can set up in minutes.

### What We Are Not
- **Not a Regulated Medical Device or Standalone Clinical Treatment:** We do not diagnose, treat, cure, or prevent any disease, nor do we issue medical prescriptions or replace physician-directed care.
- **Not a Replacement for Board-Certified Music Therapists (MT-BCs):** Music therapy is an established allied health profession delivered by credentialed specialists. The Magic Jukebox is designed to **empower families at home and support professional care teams between visits**—giving MT-BCs, geriatricians, neurologists, physical therapists, and nurses better biographical discovery tools and cleaner session observation logs.

---

## 2. Why Gatekeeper-Friendly Positioning Matters

In healthcare, senior living, and neurology, three groups of gatekeepers evaluate tools like ours:
1. **Clinicians & Allied Health Professionals (Neurologists, Geriatricians, Nurses, PTs, SLPs, and MT-BCs):**
   - *What ruffles feathers:* Overclaiming that an app "automates music therapy," "prescribes music medicine," or "replaces clinical judgment."
   - *What wins their trust:* Citing the exact peer-reviewed literature accurately, providing practical tools families can actually use at home, and formatting caregiver observations into clean, standards-based summaries (`HL7 FHIR R4`) that respect the clinician's workflow.
2. **Healthcare Compliance, Legal & Regulatory Officers (FDA General Wellness / CDS Boundary):**
   - *What ruffles feathers:* Using regulated medical-device terminology (*"Dosing," "Clinical Prescription," "Medical Order," "Treats Alzheimer’s agitation," "Replaces antipsychotic drugs"*).
   - *What wins their trust:* Clear positioning within the **FDA General Wellness & Low-Risk Caregiver/Provider Support** framework—supporting emotional well-being, reminiscence, daily care routines, rhythmic movement pacing, and caregiver-reported observation logging.
3. **Patients & Family Caregivers:**
   - *What ruffles feathers:* Intimidating medical jargon (*"BARS 6 Sympathetic Autonomic Dysregulation," "Quarantine Contraindication"*) or cluttered controls.
   - *What wins their trust:* Warm, plain-English human language (*"Just Relaxing & Peaceful," "Skip & Never Play Again," "Favorite Youth Years"*).

---

## 3. Terminology & Copy Guardrails ("Say This, Not That")

All UI labels, exports, and marketing copy across the platform must follow this language matrix:

| Avoid (Ruffles Gatekeepers / Implies SaMD) | Use Instead (Evidence-Informed, Collaborative & Safe-Harbor) |
| :--- | :--- |
| "Precision Music Medicine Platform" / "Clinical Treatment" | **"Evidence-Informed Personalized Music Sequencing & Caregiver Support"** |
| "Musical Prescription" / "Active Clinical Order" (`intent: 'order'`) | **"Personalized Music Care Plan"** / **"Supportive Listening Guide"** (`intent: 'plan'`) |
| "Proactive Dosing" / "Automated Dosing Rule" | **"Proactive Afternoon Routine (30 Mins Before Restlessness)"** |
| "Treats Sundowning / BPSD / Bradykinesia" | **"Supports Calm During Afternoon Restlessness / Supports Comfortable Walking Pace"** |
| "PRN Psychotropic Sparing Rate" (as a medical claim) | **"Caregiver Observation: Settled Calmly Without Extra (PRN) Intervention"** |
| "Red Flag Clinical Contraindication / Quarantine" (in family UI) | **"Skipped & Blocked Songs (Songs to Avoid)"** |
| "Automated Music Therapy" | **"Individualized Music Support (Grounded in Neuroscience & Music Therapy Research)"** |

---

## 4. Modular Specialty Architecture ("Core Engine + Specialty Care Tracks")

The Magic Jukebox is architected as a **modular platform**: a single shared core engine powering focused **Specialty Care Tracks** so each user community gets a tailored experience without cluttering the interface.

### A. The Shared Core Engine
1. **Biographical & Preference Profiler:** Reminiscence Bump calculator (ages 10–30), genre/decade discovery (`1940s`–`2020s`), and multi-song preview/selection checklist.
2. **Adaptive Audio & Tempo Engine:** Pitch-locked time-stretching (`0.65x–1.35x` via WSOLA `preservesPitch`), gradual speed-up/slow-down ramping, optional rhythmic beat cues (`🥁`), and 1-click full-length playlist export (Spotify PKCE, Apple Music, YouTube, M3U/CSV).
3. **Flexible Sequencing Modes:** Direct 1-tap listening filters (*Play All*, *Just Relaxing*, *Just Upbeat*) alongside the 3-phase **Iso-Principle Mood-to-Calm Arc** (*Match → Bridge → Calm*).
4. **Caregiver Observation & EHR Interoperability Layer:** Optional 1-tap `Mood Before → Mood After` check-ins and standardized **HL7 FHIR R4** summaries for sharing with providers (Epic, Oracle Health, NHS Digital).

### B. Focused Specialty Care Tracks
1. **Track 1: Memory & Cognitive Care (Dementia, Alzheimer’s & Afternoon Restlessness)** *(Primary Launch Track)*
   - **Focus:** Autobiographical reminiscence (ages 10–30), family memory prompts, sing-along lyrics, 30-minute afternoon wind-down timer (Gerdner guideline), and optional mood check-ins.
2. **Track 2: Movement, Gait & Pace Support (Parkinson’s & Motor Rhythm)**
   - **Focus:** Pitch-preserving **Tempo & Pace Matcher** (matching a listener's natural cadence and gradually speeding up or slowing down without altering vocal pitch) plus optional rhythmic beat cues inspired by Rhythmic Auditory Stimulation (RAS) research.
3. **Track 3: Calm, Routine & Restorative Support (Caregiver Relief, Daily Care & Stress Recovery)**
   - **Focus:** Direct 1-tap *"Just Relaxing & Peaceful"* (`60–70 BPM`) playlists to support calm during daily routines, visits, or restful wind-down.

### C. UX Rule for Modularity
- **Never overwhelm the primary player.** Keep the everyday Jukebox clean and immediate (*Play All*, *Just Relaxing*, *Just Upbeat*, *Mood-to-Calm Arc*), while housing optional mood check-ins, pace-matching controls, and provider EHR summaries in progressive, expandable drawers.
