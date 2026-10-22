---
name: iso-sequencer
description: Implements the evidence-informed Iso-Principle emotional trajectory algorithm, Reminiscence Bump calculator (ages 10-30), pitch-preserving pace matcher, and caregiver/EHR observation summaries for the Studio Wildwoods Magic Jukebox.
---

# Evidence-Informed Iso-Principle, Modular Specialty & Caregiver Support Skill

When building or updating the playlist sequencing engine, pace-matching controls, and caregiver/EHR documentation components, enforce [`docs/NORTH_STAR_CHARTER.md`](../../../docs/NORTH_STAR_CHARTER.md) and the following rules:

## 0. North Star Positioning & Gatekeeper Safe-Harbor
- **Evidence-Informed Support, Not a Standalone Medical Treatment**: Always position the platform as **personalized therapeutic music sequencing, rhythmic pace support, caregiver support, and standardized observational EHR documentation (`HL7 FHIR R4`)** to share with healthcare providers and Board-Certified Music Therapists (MT-BCs).
- **Collaborative Language**: Never claim the software autonomously diagnoses, treats, prescribes, or replaces clinicians/medications. Use `intent: 'plan'` (Supportive Music Care Plan) rather than `intent: 'order'` in FHIR exports, and frame session logs as **Caregiver-Reported Observations**.

## 1. Reminiscence Bump Calculation
- Given `birthYear`, calculate `bumpStart = birthYear + 10` and `bumpEnd = birthYear + 30`.
- Subdivide into three developmental epochs:
  - **Epoch 1 (Ages 10–17)**: Formative Youth (`birthYear + 10` to `birthYear + 17`)
  - **Epoch 2 (Ages 18–24)**: Young Adulthood & Courtship (`birthYear + 18` to `birthYear + 24`)
  - **Epoch 3 (Ages 25–30)**: Early Family & Identity (`birthYear + 25` to `birthYear + 30`)

## 2. Iso-Principle 3-Phase Trajectory Sequencing & Direct Vibe Modes
- Assign or infer acoustic metadata for each song in the person's library: `bpm` (60–140), `mode` (`'Major'` or `'Minor'`), `energy` (1–10), `valence` (1–10), and `memoryNote` (string).
- Support both **direct 1-tap listening modes** (`🎵 Play All Songs`, `🌙 Just Relaxing & Peaceful`, `☀️ Just Upbeat & Cheerful`) and the **3-phase Iso-Principle Mood-to-Calm Arc**:
  - **Phase 1 (State Match, Minutes 0–7)**: Songs closest to `currentState` BPM and energy to establish isomorphic resonance without jarring the listener.
  - **Phase 2 (Acoustic Modulation Bridge, Minutes 8–18)**: Songs that smoothly interpolate BPM and valence halfway toward `targetState`.
  - **Phase 3 (Target Therapeutic Resolution, Minutes 19–30)**: Songs matching `targetState` acoustic parameters to consolidate calm or connection.

## 3. Caregiver Observation Logging & Scientific Evidence Vault
- Include an optional 1-tap pre/post session check-in alongside the **Behavioural Activity Rating Scale (BARS 1–7)** for caregiver/provider observation sharing:
  - `1` = Difficult or unable to rouse
  - `2` = Asleep, responds normally to verbal or physical contact
  - `3` = Drowsy, appears sedated
  - `4` = Quiet and awake (normal level of activity / calm & lucid)
  - `5` = Signs of overt (physical or verbal) activity, calms down with instructions
  - `6` = Extremely or continuously active, pacing/agitated, does not require restraint
  - `7` = Violent, requires restraint
- Display an interactive Evidence Drawer citing **Jacobsen et al. (2015)**, **King et al. (2019)**, **Gerdner (IMIA/PLST Protocol)**, **Särkämö et al. (2014, 2016)**, **El Haj et al. (2012)**, and **NCT04236557 / JAMDA (2018)**.
