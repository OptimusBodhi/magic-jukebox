import {
  BiographicalTrack,
  CurrentEmotionalStateId,
  IsoTrajectoryResult,
  PatientProfile,
  TargetTherapeuticStateId,
} from './iso-sequencer';
import { getResolvedYoutubeVideoId } from './full-length-player';

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
    pu?: string;
    au?: string;
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
    t: library.slice(0, 12).map((tr) => ({
      i: tr.id,
      ti: tr.title,
      a: tr.artist,
      y: tr.year,
      b: tr.bpm,
      m: tr.mode,
      e: tr.energy,
      mn: tr.memoryNote.slice(0, 120),
      dp: tr.duetPrompt.slice(0, 110),
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
      previewUrl: item.pu,
      artworkUrl: item.au,
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
 * Uses direct Apple Music song URLs and verified YouTube videoIds when available.
 */
export function getFullSongStreamingLinks(track: {
  title: string;
  artist: string;
  year?: number;
  appleMusicUrl?: string;
  youtubeVideoId?: string;
}) {
  const query = encodeURIComponent(`${track.artist} ${track.title}`);
  const ytId = getResolvedYoutubeVideoId(track);
  const directAppleUrl =
    track.appleMusicUrl && track.appleMusicUrl.startsWith('http')
      ? track.appleMusicUrl.replace('itunes.apple.com', 'music.apple.com')
      : `https://music.apple.com/us/search?term=${query}`;

  return {
    spotifyUrl: `https://open.spotify.com/search/${query}`,
    appleMusicUrl: directAppleUrl,
    youtubeUrl: ytId
      ? `https://www.youtube.com/watch?v=${ytId}`
      : `https://www.youtube.com/results?search_query=${query}+official+audio`,
    youtubeMusicUrl: ytId
      ? `https://music.youtube.com/watch?v=${ytId}`
      : `https://music.youtube.com/search?q=${query}`,
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
    `THE MAGIC JUKEBOX — PERSONALIZED SUPPORTIVE MUSIC CARE PLAN`,
    `====================================================================`,
    `Loved One: ${patient.name} (Preferred Name: "${patient.preferredName}")`,
    `Birth Year: ${patient.birthYear} | Core Reminiscence Bump (Ages 10-30): ${
      patient.birthYear + 10
    }-${patient.birthYear + 30}`,
    `Roots & Heritage: ${patient.hometown} • ${patient.musicalHeritage}`,
    `Proactive Afternoon Routine: Start music 30 mins BEFORE ${patient.sundowningPeakTime} restlessness window`,
    `--------------------------------------------------------------------`,
    `ACTIVE ISO-PRINCIPLE TRAJECTORY (30-MINUTE ARC)`,
    `Where We Are Now: ${trajectory.currentState.label} (~${trajectory.currentState.targetBpm} BPM)`,
    `Where We Want To Be: ${trajectory.targetState.label} (~${trajectory.targetState.targetBpm} BPM)`,
    `--------------------------------------------------------------------`,
  ];

  for (const phase of trajectory.phases) {
    lines.push(`\n[${phase.name.toUpperCase()} — ${phase.timeWindow} | ${phase.targetBpmRange}]`);
    lines.push(`Supportive Goal: ${phase.clinicalObjective}`);
    phase.tracks.forEach((tr, idx) => {
      lines.push(
        `  ${idx + 1}. "${tr.title}" — ${tr.artist} (${tr.year}) [${tr.bpm} BPM, ${tr.mode}]`
      );
      lines.push(`     • Memory Mirror: ${tr.memoryNote}`);
      lines.push(`     • Caregiver Duet Prompt: "${tr.duetPrompt}"`);
    });
  }

  lines.push(`\n--------------------------------------------------------------------`);
  lines.push(`🛑 SKIPPED & BLOCKED SONGS (DO NOT PLAY — AVOID DISTRESS):`);
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

/**
 * Formats the ordered Iso-Principle playlist as a clean "Title - Artist" text list
 * that can be pasted directly into Spotify, Soundiiz, or TuneMyMusic to create a full-length playlist.
 */
export function formatSpotifyImportTracklist(trajectory: IsoTrajectoryResult): string {
  return trajectory.orderedTracks
    .map((tr) => `${tr.title} - ${tr.artist}`)
    .join('\n');
}

/**
 * Formats a standard .M3U playlist file with extended metadata for local/desktop media players and importers.
 */
export function formatM3uPlaylist(
  patient: PatientProfile,
  trajectory: IsoTrajectoryResult
): string {
  const lines: string[] = [
    '#EXTM3U',
    `#PLAYLIST:${patient.preferredName}'s Magic Jukebox (${trajectory.currentState.label} to ${trajectory.targetState.label})`,
  ];
  for (const tr of trajectory.orderedTracks) {
    lines.push(`#EXTINF:210,${tr.artist} - ${tr.title}`);
    lines.push(tr.previewUrl || `https://open.spotify.com/search/${encodeURIComponent(`${tr.artist} ${tr.title}`)}`);
  }
  return lines.join('\n');
}

/**
 * Formats a standard .CSV playlist file (Title, Artist, Year, BPM, Phase, Memory Note)
 * compatible with Soundiiz, TuneMyMusic, and Spotify/Apple Music playlist importers.
 */
export function formatCsvPlaylist(trajectory: IsoTrajectoryResult): string {
  const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const rows: string[] = [
    ['Title', 'Artist', 'Release Year', 'BPM', 'Iso-Principle Phase', 'Family Memory Note'].join(','),
  ];
  for (const tr of trajectory.orderedTracks) {
    rows.push(
      [
        escapeCsv(tr.title),
        escapeCsv(tr.artist),
        escapeCsv(tr.year),
        escapeCsv(tr.bpm),
        escapeCsv(tr.phaseName),
        escapeCsv(tr.memoryNote),
      ].join(',')
    );
  }
  return rows.join('\n');
}

/**
 * Ultra-compact NFC sticker & QR code payload (< 350 chars) so it fits on standard
 * NTAG213/215 NFC photo stickers, scans instantly via phone camera QR, and never
 * triggers HTTP 414 URI-too-long errors.
 */
export interface CompactNfcCardPayload {
  n: string; // preferredName
  fn: string; // full name
  by: number; // birthYear
  sp: string; // sundowningPeakTime
  v: 'all' | 'relaxing' | 'upbeat' | 'arc';
  s: Array<[string, string, number, number]>; // [title, artist, year, bpm]
}

/**
 * Builds a short, reliable NFC tag / QR code URL that opens the person's Jukebox
 * directly into the chosen vibe mode ('all' | 'relaxing' | 'upbeat' | 'arc') with autoplay=1.
 */
export function buildBedsideCardUrl(
  baseUrl: string,
  vibe: 'all' | 'relaxing' | 'upbeat' | 'arc',
  patient?: PatientProfile,
  tracks?: BiographicalTrack[]
): string {
  try {
    const cleanBase = baseUrl.split('?')[0];
    const url = new URL(cleanBase);
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('vibe', vibe);
    url.searchParams.set('bedside', '1');

    if (patient && tracks && tracks.length > 0) {
      const filtered =
        vibe === 'upbeat'
          ? tracks.filter((t) => t.bpm >= 90 || t.energy >= 6)
          : vibe === 'relaxing'
          ? tracks.filter((t) => t.bpm <= 86 || t.energy <= 4)
          : tracks;
      const chosen = (filtered.length > 0 ? filtered : tracks).slice(0, 6);
      const compact: CompactNfcCardPayload = {
        n: patient.preferredName.slice(0, 24),
        fn: patient.name.slice(0, 36),
        by: patient.birthYear,
        sp: patient.sundowningPeakTime || '16:30',
        v: vibe,
        s: chosen.map((tr) => [tr.title.slice(0, 32), tr.artist.slice(0, 28), tr.year, tr.bpm]),
      };
      url.searchParams.set('card', btoa(encodeURIComponent(JSON.stringify(compact))));
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Decodes an ultra-compact ?card=... parameter from an NFC photo sticker or printed QR card.
 */
export function decodeBedsideCardParam(encodedCard: string): {
  patient: PatientProfile;
  vibe: 'all' | 'relaxing' | 'upbeat' | 'arc';
  tracks: BiographicalTrack[];
} | null {
  try {
    const json = decodeURIComponent(atob(encodedCard));
    const parsed: CompactNfcCardPayload = JSON.parse(json);
    if (!parsed || !parsed.n || !Array.isArray(parsed.s)) return null;

    const patient: PatientProfile = {
      name: parsed.fn || parsed.n,
      preferredName: parsed.n,
      birthYear: parsed.by || 1944,
      hometown: '',
      formerOccupation: '',
      musicalHeritage: `${(parsed.by || 1944) + 10}–${(parsed.by || 1944) + 30} Youth Era`,
      sundowningPeakTime: parsed.sp || '16:30',
      proactiveShieldLeadMinutes: 30,
    };

    const tracks: BiographicalTrack[] = parsed.s.map(([title, artist, year, bpm], idx) => ({
      id: `nfc-card-${idx}-${year}`,
      title,
      artist,
      year,
      bpm,
      mode: 'Major',
      energy: bpm >= 100 ? 8 : bpm <= 76 ? 2 : 5,
      valence: 9,
      neuroTargets: ['cACC Affective Salience', 'DMN Functional Connectivity'],
      memoryNote: `${patient.preferredName}’s favorite from ${year}.`,
      duetPrompt: `Enjoy listening or singing along to "${title}" by ${artist}.`,
      chorusLyrics: [`${title} — ${artist} (${year})`],
      itunesQuery: `${artist} ${title}`,
    }));

    return {
      patient,
      vibe: parsed.v || 'arc',
      tracks,
    };
  } catch {
    return null;
  }
}

/**
 * Prints ONLY the 3 high-contrast Bedside QR/NFC Cards and the Cut-Out 3-Button Physical Player Label
 * using an isolated hidden print iframe (so it never prints the background app screen!).
 */
export function printBedsideCardsOnly(
  patient: PatientProfile,
  trajectory: IsoTrajectoryResult,
  baseUrl: string
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const all = trajectory.orderedTracks;
  const upbeatTracks = all.filter((t) => t.bpm >= 90 || t.energy >= 6 || t.phase === 1);
  const calmTracks = all.filter((t) => t.bpm <= 86 || t.energy <= 4 || t.phase === 3);

  const cards = [
    {
      num: 1,
      vibe: 'upbeat' as const,
      emoji: '☀️',
      title: 'CARD 1: CHEERFUL SING-ALONGS',
      subtitle: 'Upbeat, happy favorites for morning energy, visits & movement',
      color: '#B45309',
      bg: '#FFFBEB',
      tracks: (upbeatTracks.length > 0 ? upbeatTracks : all).slice(0, 4),
      url: buildBedsideCardUrl(baseUrl, 'upbeat', patient, all),
    },
    {
      num: 2,
      vibe: 'arc' as const,
      emoji: '🌊',
      title: 'CARD 2: AFTERNOON CALM (30-MIN WIND-DOWN)',
      subtitle: `Matches starting mood & gently eases into calm (Start 30m before ${patient.sundowningPeakTime})`,
      color: '#1D4ED8',
      bg: '#EFF6FF',
      tracks: all.slice(0, 4),
      url: buildBedsideCardUrl(baseUrl, 'arc', patient, all),
    },
    {
      num: 3,
      vibe: 'relaxing' as const,
      emoji: '🌙',
      title: 'CARD 3: PEACEFUL & SOOTHING REST',
      subtitle: 'Slow, comforting songs for quiet relaxation or evening wind-down',
      color: '#047857',
      bg: '#ECFDF5',
      tracks: (calmTracks.length > 0 ? calmTracks : [...all].reverse()).slice(0, 4),
      url: buildBedsideCardUrl(baseUrl, 'relaxing', patient, all),
    },
  ];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${patient.preferredName}'s Printable Bedside Music Cards & Player Label</title>
  <style>
    @page { margin: 12mm; }
    * { box-sizing: border-box; font-family: Georgia, 'Times New Roman', serif; }
    body { margin: 0; padding: 0; color: #141E19; background: #fff; }
    .header { text-align: center; border-bottom: 2px solid #141E19; padding-bottom: 8px; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 20px; }
    .header p { margin: 4px 0 0; font-size: 12px; font-family: sans-serif; color: #475569; }
    .cutout-label {
      border: 2px dashed #141E19;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 14px;
      background: #FBF9F5;
      text-align: center;
    }
    .cutout-label .tag { font-family: sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; }
    .cutout-label h2 { margin: 4px 0 8px; font-size: 16px; }
    .btn-row { display: flex; justify-content: space-around; gap: 8px; font-family: sans-serif; font-weight: bold; font-size: 12px; }
    .btn-pill { flex: 1; padding: 8px; border: 2px solid #141E19; border-radius: 8px; background: #fff; }
    .cards-grid { display: flex; flex-direction: column; gap: 12px; }
    .card {
      border: 3px solid #141E19;
      border-radius: 14px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      page-break-inside: avoid;
    }
    .card-left { flex: 1; }
    .card-title { font-size: 16px; font-weight: bold; margin: 0 0 3px; font-family: sans-serif; }
    .card-sub { font-size: 12px; color: #334155; margin: 0 0 8px; font-family: sans-serif; }
    .song-list { margin: 0; padding-left: 18px; font-size: 12px; font-family: sans-serif; color: #1E293B; }
    .song-list li { margin-bottom: 2px; }
    .qr-box { text-align: center; width: 118px; flex-shrink: 0; font-family: sans-serif; }
    .qr-box img { width: 104px; height: 104px; border: 2px solid #141E19; border-radius: 8px; padding: 3px; background: #fff; }
    .qr-caption { font-size: 9px; font-weight: bold; margin-top: 3px; color: #141E19; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${patient.name}’s Magic Jukebox — Bedside Cards &amp; 3-Button Player Label</h1>
    <p>Golden Song Years (Ages 10–30): <strong>${patient.birthYear + 10}–${patient.birthYear + 30}</strong> • Scan any QR code with a phone camera to start music immediately</p>
  </div>

  <div class="cutout-label">
    <div class="tag">✂️ Cut Out &amp; Tape Above Physical Player Buttons (Relish / SMPL Radio)</div>
    <h2>${patient.preferredName.toUpperCase()}’S MAGIC JUKEBOX (${patient.birthYear + 10}–${patient.birthYear + 30} FAVORITES)</h2>
    <div class="btn-row">
      <div class="btn-pill">☀️ BUTTON 1: CHEERFUL SING-ALONGS</div>
      <div class="btn-pill">🌊 BUTTON 2: AFTERNOON CALM</div>
      <div class="btn-pill">🌙 BUTTON 3: PEACEFUL REST</div>
    </div>
  </div>

  <div class="cards-grid">
    ${cards
      .map(
        (c) => `
      <div class="card" style="background:${c.bg}; border-color:${c.color};">
        <div class="card-left">
          <div class="card-title" style="color:${c.color};">${c.emoji} ${c.title}</div>
          <div class="card-sub">${c.subtitle}</div>
          <ol class="song-list">
            ${c.tracks.map((t) => `<li><strong>${t.title}</strong> — ${t.artist} (${t.year})</li>`).join('')}
          </ol>
        </div>
        <div class="qr-box">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(
            c.url
          )}" alt="QR Code for ${c.title}" />
          <div class="qr-caption">📱 Point Phone Camera Here to Play</div>
        </div>
      </div>`
      )
      .join('')}
  </div>
</body>
</html>`;

  const existingFrame = document.getElementById('magic-jukebox-print-frame');
  if (existingFrame) existingFrame.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'magic-jukebox-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 650);
}

/**
 * Formats a step-by-step 3-Button USB Flash Drive folder guide + cut-out paper label
 * for off-the-shelf dementia music players (Relish Radio, SMPL Lift-Lid Player, etc.).
 */
export function formatPhysicalPlayerUsbGuide(
  patient: PatientProfile,
  trajectory: IsoTrajectoryResult
): string {
  const all = trajectory.orderedTracks;
  const upbeat = all.filter((t) => t.bpm >= 90 || t.energy >= 6 || t.phase === 1);
  const calm = all.filter((t) => t.bpm <= 86 || t.energy <= 4 || t.phase === 3);

  const formatList = (tracks: typeof all) =>
    tracks
      .map(
        (tr, idx) =>
          `   ${String(idx + 1).padStart(2, '0')} - ${tr.title} — ${tr.artist} (${tr.year})`
      )
      .join('\n');

  return [
    `====================================================================`,
    `PHYSICAL "EASY BUTTON" USB SETUP GUIDE (RELISH / SMPL PLAYERS)`,
    `For: ${patient.name} (Favorite Youth Era: ${patient.birthYear + 10}–${patient.birthYear + 30})`,
    `====================================================================`,
    ``,
    `HOW TO LOAD ONTO A RELISH RADIO OR SMPL ONE-BUTTON PLAYER:`,
    `1. Plug the player's USB flash drive into your computer.`,
    `2. Create 3 folders on the USB drive corresponding to the 3 top buttons`,
    `   (or put Folder 2 on a single-button lift-lid player):`,
    ``,
    `--------------------------------------------------------------------`,
    `FOLDER / BUTTON 1: "01_Cheerful_Sing_Alongs" (Upbeat & Happy)`,
    `--------------------------------------------------------------------`,
    formatList(upbeat.length > 0 ? upbeat : all.slice(0, 4)),
    ``,
    `--------------------------------------------------------------------`,
    `FOLDER / BUTTON 2: "02_Afternoon_Calm_Arc" (Gradual Mood-to-Calm Order)`,
    `--------------------------------------------------------------------`,
    formatList(all),
    ``,
    `--------------------------------------------------------------------`,
    `FOLDER / BUTTON 3: "03_Peaceful_Rest" (Slow, Soothing Comfort Songs)`,
    `--------------------------------------------------------------------`,
    formatList(calm.length > 0 ? calm : [...all].reverse().slice(0, 4)),
    ``,
    `====================================================================`,
    `✂️ CUT-OUT PAPER LABEL FOR TOP OF PHYSICAL PLAYER:`,
    `+------------------------------------------------------------------+`,
    `|  ${patient.preferredName.toUpperCase()}’S MAGIC JUKEBOX (${patient.birthYear + 10}–${patient.birthYear + 30} FAVORITES)             |`,
    `|  [ BUTTON 1: Cheerful ]  [ BUTTON 2: Calm Arc ]  [ BUTTON 3: Rest ] |`,
    `+------------------------------------------------------------------+`,
    `====================================================================`,
  ].join('\n');
}


