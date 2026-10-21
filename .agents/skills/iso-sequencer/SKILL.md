---
name: iso-sequencer
description: Implements the clinical Iso-Principle emotional trajectory algorithm, Reminiscence Bump calculator (ages 10-30), and BARS/CMAI clinical telemetry for the Studio Wildwoods Magic Jukebox.
---

# Clinical Iso-Principle & Dementia Music Medicine Skill

When building or updating the playlist sequencing engine and clinical telemetry components, enforce the following rules:

## 1. Reminiscence Bump Calculation
- Given `birthYear`, calculate `bumpStart = birthYear + 10` and `bumpEnd = birthYear + 30`.
- Subdivide into three developmental epochs:
  - **Epoch 1 (Ages 10–17)**: Formative Youth (`birthYear + 10` to `birthYear + 17`)
  - **Epoch 2 (Ages 18–24)**: Young Adulthood & Courtship (`birthYear + 18` to `birthYear + 24`)
  - **Epoch 3 (Ages 25–30)**: Early Family & Identity (`birthYear + 25` to `birthYear + 30`)

## 2. Iso-Principle 3-Phase Trajectory Sequencing
- Assign or infer acoustic metadata for each song in the patient's personal library: `bpm` (60–140), `mode` (`'Major'` or `'Minor'`), `energy` (1–10), `valence` (1–10), and `memoryNote` (string).
- Given `currentState` (e.g., `'Agitated / Sundowning'` [High BPM 115+, High Energy], `'Anxious / Restless'` [Mod-High BPM 100], `'Withdrawn / Sad'` [Low BPM 65, Low Energy], `'Care-Task Stress'` [PLST Breach, BPM 95–105]) and `targetState` (e.g., `'Deep Parasympathetic Calm'` [60–70 BPM, Major, Warm], `'Lucid Family Connection'` [75–90 BPM], `'Uplifted Sing-Along Joy'` [100–115 BPM, High Vocal Salience]):
- Sort and interpolate the patient's approved songs into:
  - **Phase 1 (State Match, Minutes 0–7)**: Songs closest to `currentState` BPM and energy to establish isomorphic resonance without jarring the patient.
  - **Phase 2 (Acoustic Modulation Bridge, Minutes 8–18)**: Songs that smoothly interpolate BPM and valence halfway toward `targetState`.
  - **Phase 3 (Target Therapeutic Resolution, Minutes 19–30)**: Songs matching `targetState` acoustic parameters to consolidate autonomic regulation.

## 3. Clinical Telemetry & Evidence Badges
- Include a 1-tap pre/post session check-in using the **Behavioural Activity Rating Scale (BARS 1–7)**:
  - `1` = Difficult or unable to rouse
  - `2` = Asleep, responds normally to verbal or physical contact
  - `3` = Drowsy, appears sedated
  - `4` = Quiet and awake (normal level of activity / calm & lucid)
  - `5` = Signs of overt (physical or verbal) activity, calms down with instructions
  - `6` = Extremely or continuously active, pacing/agitated, does not require restraint
  - `7` = Violent, requires restraint
- Display an interactive Evidence Drawer citing **Jacobsen et al. (2015)**, **King et al. (2019)**, **Gerdner (IMIA/PLST Protocol)**, **Särkämö et al. (2014, 2016)**, **El Haj et al. (2012)**, and **NCT04236557 / JAMDA (2018)**.
