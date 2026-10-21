# The Magic Jukebox — In Partnership with Studio Wildwoods
### Precision Music Medicine for Dementia & Emotional Transformation

**The Magic Jukebox** unites peer-reviewed dementia neurobiology with Studio Wildwoods' core mission—*using music to transform difficult emotions*—into an intuitive, zero-login digital therapeutic platform for families, care homes, and clinicians.

---

## 1. Core Neuro-Clinical Architecture (The 4 Functional Pillars)

1. **Pillar 1: Zero-Friction "Music Detective" Co-Curation Studio**
   - Automatically calculates the patient's 20-year **Reminiscence Bump** (ages 10–30) from birth year across three developmental epochs:
     - **Epoch 1 (Ages 10–17)**: *Formative Youth* (Ventral pre-SMA sensorimotor encoding)
     - **Epoch 2 (Ages 18–24)**: *Young Adulthood & Courtship* (Maximum cACC affective salience)
     - **Epoch 3 (Ages 25–30)**: *Early Family & Identity* (Default Mode Network domestic scaffolding)
   - Connects directly to the public **iTunes Search API** (`https://itunes.apple.com/search`) with a strict **Zero Silent Cards** guardrail (`track.previewUrl` verified before render), eliminating the UK *Playlist for Life* "Missing Preview Clip" and Spotify paywall/login bottlenecks.
   - Includes **Tactile Reaction Triage** (*Spark / Add to Jukebox*, *Neutral / Skip*, *Red Flag Quarantine*) and inline **Memory Mirror** journaling.

2. **Pillar 2: The Studio Wildwoods Iso-Principle Sequencer**
   - Maps **Where We Are (Current Emotional State)** to **Where We Want To Be (Target Therapeutic Goal)** across a 30-minute, 3-phase acoustic trajectory (`NCT04236557` clinical trial protocol):
     - **Phase 1: State Match (Minutes 0–7)** — Matches current sympathetic arousal or depressive withdrawal to capture attention without sensory rejection.
     - **Phase 2: Acoustic Modulation Bridge (Minutes 8–18)** — Smoothly interpolates BPM, rhythmic density, and harmonic mode along a controlled slope.
     - **Phase 3: Target Therapeutic Resolution (Minutes 19–30)** — Consolidates parasympathetic calm (`60–68 BPM`, Major mode), Default Mode Network lucidity (`75–92 BPM`), or uplifted sing-along joy (`105–120 BPM`).

3. **Pillar 3: Dual-Mode Playback (Receptive Calm vs. Caregiver Duet & Story Mode)**
   - Grounded in **Särkämö et al. (2014, 2016)** ($n=89$ dementia-caregiver dyad RCT) and the **JAMDA (2018)** meta-analysis:
     - **Receptive Calm Mode**: Engineered for acute agitation and sundowning relief with zero executive demand, a 30-minute Gerdner session timer, and a lockable **Patient Safe View**.
     - **Caregiver Duet & Story Mode**: Displays large-print chorus lyrics alongside the family's saved **Memory Mirror** story and conversational prompts to boost verbal fluency and working memory.

4. **Pillar 4: Circadian Sundowning Shield & BARS (1–7) Clinical Telemetry**
   - Operationalizes **Dr. Linda Gerdner's Individualized Music Intervention for Agitation (IMIA)** and **Progressively Lowered Stress Threshold (PLST)** protocol by scheduling playback **30 minutes prior** to the patient's peak late-afternoon sundowning window.
   - Provides a 5-second **Pre/Post Behavioural Activity Rating Scale (BARS 1–7)** check-in widget and longitudinal 6-week agitation & PRN psychotropic reduction tracking.

---

## 2. Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to explore the live prototype pre-seeded with **Arthur Pendelton** (Born 1944, Reminiscence Bump: 1954–1974).
