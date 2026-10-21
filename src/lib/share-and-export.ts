import {
  BiographicalTrack,
  CurrentEmotionalStateId,
  IsoTrajectoryResult,
  PatientProfile,
  TargetTherapeuticStateId,
} from './iso-sequencer';

export interface CompactSharedPayload {
  v: 1;
  p: PatientProfile;
  cs: CurrentEmotionalStateId;
  ts: TargetTherapeuticStateId;
  t: Array<{
    i: string;
    ti: string;
    a: string;
    y: number;
    b: number;
    m: 'Major' | 'Minor';
    e: number;
    mn: string;
    dp: string;
  }>;
  rf: Array<{
    i: string;
    ti: string;
    a: string;
    y: number;
    r: string;
  }>;
}

/**
 * Encodes the patient profile, custom tracks, and Red Flag Quarantine list into a
 * self-contained, de-identified URL share link (?share=...) so families and care teams
 * can open the exact same custom Jukebox on any phone, tablet, or computer without logins.
 */
export function encodeShareableJukeboxUrl(
  baseUrl: string,
  patient: PatientProfile,
  library: BiographicalTrack[],
  quarantinedList: Array<{ id: string; title: string; artist: string; year: number; reason: string }>,
  currentStateId: CurrentEmotionalStateId,
  targetStateId: TargetTherapeuticStateId
): string {
  const payload: CompactSharedPayload = {
    v: 1,
    p: patient,
    cs: currentStateId,
    ts: targetStateId,
    t: library.slice(0, 15).map((tr) => ({
      i: tr.id,
      ti: tr.title,
      a: tr.artist,
      y: tr.year,
      b: tr.bpm,
      m: tr.mode,
      e: tr.energy,
      mn: tr.memoryNote.slice(0, 180),
      dp: tr.duetPrompt.slice(0, 160),
    })),
    rf: quarantinedList.slice(0, 8).map((q) => ({
      i: q.id,
      ti: q.title,
      a: q.artist,
      y: q.year,
      r: q.reason.slice(0, 140),
    })),
  };

  try {
    const json = JSON.stringify(payload);
    const encoded = btoa(encodeURIComponent(json));
    const url = new URL(baseUrl);
    url.searchParams.set('share', encoded);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Decodes a ?share=... URL parameter back into a PatientProfile, BiographicalTrack[], and Red Flag list.
 */
export function decodeShareableJukeboxParam(encodedParam: string): {
  patient: PatientProfile;
  currentStateId: CurrentEmotionalStateId;
  targetStateId: TargetTherapeuticStateId;
  tracks: BiographicalTrack[];
  quarantinedList: Array<{
    id: string;
    title: string;
    artist: string;
    year: number;
    reason: string;
    quarantinedAt: string;
  }>;
} | null {
  try {
    const json = decodeURIComponent(atob(encodedParam));
    const parsed: CompactSharedPayload = JSON.parse(json);
    if (!parsed || !parsed.p || !Array.isArray(parsed.t)) return null;

    const tracks: BiographicalTrack[] = parsed.t.map((item) => ({
      id: item.i,
      title: item.ti,
      artist: item.a,
      year: item.y,
      bpm: item.b,
      mode: item.m,
      energy: item.e,
      valence: 8,
      neuroTargets:
        item.b >= 105
          ? ['Ventral Pre-SMA Motor Entrainment', 'cACC Affective Salience']
          : item.b >= 80
          ? ['cACC Affective Salience', 'DMN Functional Connectivity']
          : ['PLST Stress Threshold Restoration', 'DMN Functional Connectivity'],
      memoryNote: item.mn,
      duetPrompt: item.dp,
      chorusLyrics: [`${item.ti} — ${item.a} (${item.y})`],
      itunesQuery: `${item.a} ${item.ti}`,
    }));

    const quarantinedList = (parsed.rf || []).map((q) => ({
      id: q.i,
      title: q.ti,
      artist: q.a,
      year: q.y,
      reason: q.r,
      quarantinedAt: new Date().toISOString().slice(0, 10),
    }));

    return {
      patient: parsed.p,
      currentStateId: parsed.cs || 'agitated_sundowning',
      targetStateId: parsed.ts || 'deep_calm',
      tracks,
      quarantinedList,
    };
  } catch {
    return null;
  }
}

/**
 * Generates 1-click full-length song links for Spotify, Apple Music, and YouTube Music.
 */
export function getFullSongStreamingLinks(track: { title: string; artist: string; year?: number }) {
  const query = encodeURIComponent(`${track.artist} ${track.title}`);
  return {
    spotifyUrl: `https://open.spotify.com/search/${query}`,
    appleMusicUrl: `https://music.apple.com/us/search?term=${query}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${query}+official+audio`,
    youtubeMusicUrl: `https://music.youtube.com/search?q=${query}`,
  };
}

/**
 * Formats the complete 3-Phase Iso-Principle Prescription & Caregiver Sheet as clean text
 * for 1-click copying or downloading.
 */
export function formatCaregiverPrescriptionText(
  patient: PatientProfile,
  trajectory: IsoTrajectoryResult,
  quarantinedList: Array<{ title: string; artist: string; year: number; reason: string }>
): string {
  const lines: string[] = [
    `====================================================================`,
    `THE MAGIC JUKEBOX — PERSONALIZED CAREGIVER MUSIC PRESCRIPTION`,
    `====================================================================`,
    `Loved One: ${patient.name} (Preferred Name: "${patient.preferredName}")`,
    `Birth Year: ${patient.birthYear} | Core Reminiscence Bump (Ages 10-30): ${
      patient.birthYear + 10
    }-${patient.birthYear + 30}`,
    `Roots & Heritage: ${patient.hometown} • ${patient.musicalHeritage}`,
    `Proactive Sundowning Shield: Start music 30 mins BEFORE ${patient.sundowningPeakTime} peak`,
    `--------------------------------------------------------------------`,
    `ACTIVE ISO-PRINCIPLE TRAJECTORY (30-MINUTE ARC)`,
    `Where We Are Now: ${trajectory.currentState.label} (~${trajectory.currentState.targetBpm} BPM)`,
    `Where We Want To Be: ${trajectory.targetState.label} (~${trajectory.targetState.targetBpm} BPM)`,
    `--------------------------------------------------------------------`,
  ];

  for (const phase of trajectory.phases) {
    lines.push(`\n[${phase.name.toUpperCase()} — ${phase.timeWindow} | ${phase.targetBpmRange}]`);
    lines.push(`Clinical Goal: ${phase.clinicalObjective}`);
    phase.tracks.forEach((tr, idx) => {
      lines.push(
        `  ${idx + 1}. "${tr.title}" — ${tr.artist} (${tr.year}) [${tr.bpm} BPM, ${tr.mode}]`
      );
      lines.push(`     • Memory Mirror: ${tr.memoryNote}`);
      lines.push(`     • Caregiver Duet Prompt: "${tr.duetPrompt}"`);
    });
  }

  lines.push(`\n--------------------------------------------------------------------`);
  lines.push(`🛑 RED FLAG QUARANTINE LIST (DO NOT PLAY — DISTRESS TRIGGERS):`);
  if (quarantinedList.length === 0) {
    lines.push(`  • None recorded yet.`);
  } else {
    quarantinedList.forEach((q) => {
      lines.push(`  • DO NOT PLAY: "${q.title}" — ${q.artist} (${q.year}) | Reason: ${q.reason}`);
    });
  }
  lines.push(`====================================================================`);

  return lines.join('\n');
}
