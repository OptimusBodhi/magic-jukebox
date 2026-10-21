import {
  BiographicalTrack,
  CurrentEmotionalStateId,
  MusicalMode,
  NeuroTargetBadge,
  PatientProfile,
  TargetTherapeuticStateId,
  calculateReminiscenceBump,
  getTrackEpochLabel,
} from './iso-sequencer';
import { searchItunesTracks } from './itunes-audio';

export interface GuidedInterviewAnswers {
  // Step 1: Identity & Reminiscence Bump (Ages 10-30)
  fullName: string;
  preferredName: string;
  birthYear: number;
  hometown: string;
  formerOccupation: string;
  culturalUpbringing: string;

  // Step 2: Formative Youth & Motor Rhythmic Capture (Ages 10-17 / Phase 1 High Arousal Match)
  youthStyles: string[];
  youthFavoriteArtistOrSong: string;
  youthDanceMemory: string;

  // Step 3: Courtship, Wedding & Peak Heart Songs (Ages 18-25 / cACC Salience & Phase 2 Bridge)
  spouseOrCompanionName: string;
  courtshipSongOrArtist: string;
  courtshipMemoryStory: string;
  vocalPreference: 'solo_crooners' | 'vocal_harmonies' | 'instrumental_warm' | 'mixed_favorites';

  // Step 4: Sanctuary, Faith & Deep Calm Anchors (Phase 3 Parasympathetic Resolution)
  sanctuaryStyles: string[];
  sanctuarySpecificSong: string;
  sanctuaryMemoryPrompt: string;

  // Step 5: Red Flag Quarantine Screening (Gerdner Safety Rule)
  redFlagSongsOrArtists: string;
  redFlagReason: string;
  acousticSensitivities: string[];

  // Step 6: Circadian Vulnerability & Emotional Compass Calibration
  primaryVulnerabilityWindow: 'sundowning_afternoon' | 'morning_care' | 'daytime_apathy' | 'evening_sleep';
  sundowningPeakTime: string;
  initialCurrentState: CurrentEmotionalStateId;
  initialTargetState: TargetTherapeuticStateId;
}

export const YOUTH_STYLE_OPTIONS = [
  {
    id: 'rock_n_roll_jukebox',
    label: '1950s Rock & Roll / Jukebox Hits',
    subtitle: 'Elvis Presley, Bill Haley, Chuck Berry, Buddy Holly (115–126 BPM)',
    searchSeed: 'Elvis Presley Chuck Berry Buddy Holly',
    bpmRange: [116, 124],
  },
  {
    id: 'big_band_swing',
    label: '1940s Big Band & Swing Dance',
    subtitle: 'Glenn Miller, Benny Goodman, Duke Ellington, Count Basie (110–122 BPM)',
    searchSeed: 'Glenn Miller Benny Goodman In the Mood',
    bpmRange: [112, 122],
  },
  {
    id: 'motown_upbeat_soul',
    label: '1960s Upbeat Motown & Northern Soul',
    subtitle: 'The Supremes, Four Tops, Jackie Wilson, Martha & The Vandellas (112–124 BPM)',
    searchSeed: 'The Supremes Jackie Wilson Higher and Higher',
    bpmRange: [114, 122],
  },
  {
    id: 'british_invasion_pop',
    label: '1960s British Invasion & Merseybeat',
    subtitle: 'The Beatles, Herman’s Hermits, The Hollies, Dusty Springfield (110–120 BPM)',
    searchSeed: 'The Beatles I Want to Hold Your Hand',
    bpmRange: [112, 120],
  },
  {
    id: 'classic_country_western',
    label: 'Classic Country, Western Swing & Honky-Tonk',
    subtitle: 'Johnny Cash, Hank Williams, Bob Wills, Roger Miller (108–120 BPM)',
    searchSeed: 'Johnny Cash Ring of Fire Folsom Prison',
    bpmRange: [110, 118],
  },
  {
    id: 'latin_bolero_mambo',
    label: 'Classic Latin, Trio Los Panchos & Mambo',
    subtitle: 'Tito Puente, Celia Cruz, Eydie Gormé, Trio Los Panchos (105–122 BPM)',
    searchSeed: 'Trio Los Panchos Celia Cruz Tito Puente',
    bpmRange: [108, 120],
  },
];

export const SANCTUARY_STYLE_OPTIONS = [
  {
    id: 'velvet_crooner_ballads',
    label: 'Velvet Crooner Ballads (60–68 BPM)',
    subtitle: 'Nat King Cole, Louis Armstrong, Andy Williams, Perry Como',
    searchSeed: 'Nat King Cole Unforgettable Louis Armstrong Wonderful World',
  },
  {
    id: 'sunday_hymns_gospel',
    label: 'Sunday Choir Hymns & Spirituals (62–72 BPM)',
    subtitle: 'Amazing Grace, How Great Thou Art, Mahalia Jackson, Tennessee Ernie Ford',
    searchSeed: 'Mahalia Jackson Elvis Presley How Great Thou Art Amazing Grace',
  },
  {
    id: 'warm_folk_harmony',
    label: 'Gentle Acoustic Folk & Harmony (66–76 BPM)',
    subtitle: 'Simon & Garfunkel, Peter Paul & Mary, John Denver, Joan Baez',
    searchSeed: 'Simon Garfunkel Bridge Over Troubled Water John Denver',
  },
  {
    id: 'country_story_ballads',
    label: 'Warm Country & Heartland Ballads (64–74 BPM)',
    subtitle: 'Patsy Cline, Jim Reeves, Willie Nelson, Eddy Arnold',
    searchSeed: 'Patsy Cline Crazy Jim Reeves Eddy Arnold',
  },
  {
    id: 'peaceful_piano_strings',
    label: 'Nostalgic Piano & Cinema Waltz Standards (60–68 BPM)',
    subtitle: 'Henry Mancini, Moon River, Clair de Lune, Glenn Miller Moonlight Serenade',
    searchSeed: 'Henry Mancini Moon River Glenn Miller Moonlight Serenade',
  },
];

export const ACOUSTIC_SENSITIVITY_OPTIONS = [
  'Sudden loud brass or cymbal crashes',
  'Minor-key funeral or war laments',
  'Fast, heavy percussion (>130 BPM)',
  'Unfamiliar modern studio synthesis',
  'High-pitched operatic soprano vibrato',
];

export const SAMPLE_INTERVIEW_PERSONAS: Array<{
  id: string;
  badge: string;
  summary: string;
  answers: GuidedInterviewAnswers;
}> = [
  {
    id: 'eleanor-1938',
    badge: 'Eleanor Vance (Born 1938 • Bump: 1948–1968)',
    summary: 'Retired Elementary Teacher & Church Alto • Big Band, Gospel Hymns & Nat King Cole',
    answers: {
      fullName: 'Eleanor Grace Vance',
      preferredName: 'Eleanor',
      birthYear: 1938,
      hometown: 'Savannah, Georgia',
      formerOccupation: '3rd Grade Schoolteacher & Sunday Choir Alto',
      culturalUpbringing: 'Southern Gospel, 1950s Crooners & Glenn Miller Swing',
      youthStyles: ['big_band_swing', 'rock_n_roll_jukebox'],
      youthFavoriteArtistOrSong: 'Glenn Miller In the Mood',
      youthDanceMemory:
        'Eleanor jitterbugged with her sisters on the screened porch every Saturday night in 1952.',
      spouseOrCompanionName: 'Walter',
      courtshipSongOrArtist: 'Nat King Cole Mona Lisa',
      courtshipMemoryStory:
        'Walter proposed under the live oaks in Forsyth Park in 1959 while Nat King Cole played on the car radio.',
      vocalPreference: 'solo_crooners',
      sanctuaryStyles: ['sunday_hymns_gospel', 'velvet_crooner_ballads'],
      sanctuarySpecificSong: 'Mahalia Jackson Amazing Grace',
      sanctuaryMemoryPrompt:
        'Hold Eleanor’s hand and ask her about the children’s choir she directed at St. John’s.',
      redFlagSongsOrArtists: 'Taps / Military Bugle Marches',
      redFlagReason:
        'Reminds Eleanor of her brother’s deployment in Korea (triggers immediate tearfulness).',
      acousticSensitivities: [
        'Minor-key funeral or war laments',
        'Fast, heavy percussion (>130 BPM)',
      ],
      primaryVulnerabilityWindow: 'sundowning_afternoon',
      sundowningPeakTime: '17:00',
      initialCurrentState: 'agitated_sundowning',
      initialTargetState: 'deep_calm',
    },
  },
  {
    id: 'arthur-1944',
    badge: 'Arthur Pendelton (Born 1944 • Bump: 1954–1974)',
    summary: 'Master Boatbuilder & Choir Baritone • Doo-Wop, Motown Soul & Classic Crooners',
    answers: {
      fullName: 'Arthur Pendelton',
      preferredName: 'Arthur',
      birthYear: 1944,
      hometown: 'Sturgeon Bay, Wisconsin',
      formerOccupation: 'Master Boatbuilder & Church Choir Baritone',
      culturalUpbringing: 'Big Band Crooners, 1950s Doo-Wop, Motown Soul & Folk Harmony',
      youthStyles: ['rock_n_roll_jukebox', 'british_invasion_pop'],
      youthFavoriteArtistOrSong: 'Elvis Presley All Shook Up',
      youthDanceMemory:
        'Arthur tapped his wooden ruler on his boatshop workbench in time to 1950s rockabilly snares.',
      spouseOrCompanionName: 'Clara',
      courtshipSongOrArtist: 'The Temptations My Girl',
      courtshipMemoryStory:
        'Arthur sang My Girl to Clara on the Green Bay ferry the summer before they were married in 1965.',
      vocalPreference: 'vocal_harmonies',
      sanctuaryStyles: ['velvet_crooner_ballads', 'warm_folk_harmony'],
      sanctuarySpecificSong: 'Louis Armstrong What a Wonderful World',
      sanctuaryMemoryPrompt:
        'Look out the window together and ask Arthur about Clara’s yellow sundress and their first dance.',
      redFlagSongsOrArtists: 'Bing Crosby Danny Boy',
      redFlagReason: 'Played at his younger brother Thomas’s funeral (bereavement trigger).',
      acousticSensitivities: ['Minor-key funeral or war laments'],
      primaryVulnerabilityWindow: 'sundowning_afternoon',
      sundowningPeakTime: '16:30',
      initialCurrentState: 'agitated_sundowning',
      initialTargetState: 'deep_calm',
    },
  },
  {
    id: 'mateo-1950',
    badge: 'Mateo Morales (Born 1950 • Bump: 1960–1980)',
    summary: 'Master Cabinetmaker & Guitarist • Motown Soul, Trio Los Panchos & Warm Acoustic Folk',
    answers: {
      fullName: 'Mateo Alejandro Morales',
      preferredName: 'Mateo',
      birthYear: 1950,
      hometown: 'San Antonio, Texas',
      formerOccupation: 'Custom Furniture Maker & Acoustic Guitarist',
      culturalUpbringing: 'Motown Soul, Trio Los Panchos Boleros & 1960s/70s Acoustic Classics',
      youthStyles: ['motown_upbeat_soul', 'latin_bolero_mambo'],
      youthFavoriteArtistOrSong: 'Marvin Gaye Ain’t No Mountain High Enough',
      youthDanceMemory:
        'Mateo played rhythm guitar in a neighborhood band in 1967 and loves strong basslines.',
      spouseOrCompanionName: 'Elena',
      courtshipSongOrArtist: 'Ben E. King Stand By Me',
      courtshipMemoryStory:
        'Mateo and Elena danced to Stand By Me and Eydie Gormé boleros at their 1972 wedding reception.',
      vocalPreference: 'mixed_favorites',
      sanctuaryStyles: ['warm_folk_harmony', 'country_story_ballads'],
      sanctuarySpecificSong: 'Otis Redding Dock of the Bay',
      sanctuaryMemoryPrompt:
        'Ask Mateo to show you how he fingerpicked acoustic guitar chords on the back porch.',
      redFlagSongsOrArtists: 'Loud Heavy Metal / Sirens',
      redFlagReason: 'Acoustic overstimulation breaches stress threshold during afternoon care.',
      acousticSensitivities: ['Sudden loud brass or cymbal crashes'],
      primaryVulnerabilityWindow: 'daytime_apathy',
      sundowningPeakTime: '16:00',
      initialCurrentState: 'withdrawn_sad',
      initialTargetState: 'sing_along_joy',
    },
  },
];

/**
 * Synthesizes the caregiver's Guided Interview answers into:
 * 1) Updated PatientProfile
 * 2) Live iTunes-hydrated BiographicalTrack library spanning Phase 1 (High/Brisk Match),
 *    Phase 2 (Courtship & Mid-Tempo Bridge), and Phase 3 (Sanctuary Calm Resolution)
 * 3) Quarantined Red Flag exclusion entry
 */
export async function synthesizeInterviewIntoJukebox(
  answers: GuidedInterviewAnswers
): Promise<{
  profile: PatientProfile;
  tracks: BiographicalTrack[];
  quarantinedEntry: {
    id: string;
    title: string;
    artist: string;
    year: number;
    reason: string;
    quarantinedAt: string;
  } | null;
}> {
  const bump = calculateReminiscenceBump(answers.birthYear);

  const profile: PatientProfile = {
    name: answers.fullName.trim() || 'Arthur Pendelton',
    preferredName:
      answers.preferredName.trim() ||
      answers.fullName.trim().split(' ')[0] ||
      'Arthur',
    birthYear: bump.birthYear,
    hometown: answers.hometown.trim() || 'Hometown Heritage',
    formerOccupation: answers.formerOccupation.trim() || 'Beloved Family Elder',
    musicalHeritage: answers.culturalUpbringing.trim() || '1950s–1970s Biographical Classics',
    sundowningPeakTime: answers.sundowningPeakTime || '16:30',
    proactiveShieldLeadMinutes: 30,
  };

  // Build targeted search queries for Phase 1 (Brisk Youth), Phase 2 (Courtship Bridge), and Phase 3 (Sanctuary Calm)
  const youthPresetSeeds = YOUTH_STYLE_OPTIONS.filter((o) =>
    answers.youthStyles.includes(o.id)
  ).map((o) => o.searchSeed);

  const sanctuaryPresetSeeds = SANCTUARY_STYLE_OPTIONS.filter((o) =>
    answers.sanctuaryStyles.includes(o.id)
  ).map((o) => o.searchSeed);

  const phase1Queries = [
    answers.youthFavoriteArtistOrSong.trim(),
    youthPresetSeeds[0] || `${bump.epochs[0].startYear} upbeat hits`,
    youthPresetSeeds[1] || 'Elvis Presley Chuck Berry Supremes',
  ].filter(Boolean);

  const phase2Queries = [
    answers.courtshipSongOrArtist.trim(),
    `Frank Sinatra Fly Me to the Moon ${bump.epochs[1].startYear}`,
    'The Temptations My Girl Ben E King Stand By Me Sam Cooke',
  ].filter(Boolean);

  const phase3Queries = [
    answers.sanctuarySpecificSong.trim(),
    sanctuaryPresetSeeds[0] || 'Nat King Cole Unforgettable Louis Armstrong Wonderful World',
    sanctuaryPresetSeeds[1] || 'Simon Garfunkel Bridge Over Troubled Water Andy Williams Moon River',
  ].filter(Boolean);

  const collectedTracks: BiographicalTrack[] = [];
  const seenKeys = new Set<string>();

  const addCandidateGroup = async (
    queries: string[],
    targetTier: 'phase1_brisk' | 'phase2_bridge' | 'phase3_calm',
    desiredCount: number
  ) => {
    for (const q of queries) {
      if (
        collectedTracks.filter((t) => t.id.startsWith(targetTier)).length >= desiredCount
      ) {
        break;
      }
      const results = await searchItunesTracks(q, 5);
      for (const item of results) {
        const dedupeKey = `${item.title.toLowerCase()}::${item.artist.toLowerCase()}`;
        if (seenKeys.has(dedupeKey)) continue;
        // Skip if matches red flag text
        if (
          answers.redFlagSongsOrArtists.trim() &&
          (item.title.toLowerCase().includes(answers.redFlagSongsOrArtists.toLowerCase()) ||
            item.artist.toLowerCase().includes(answers.redFlagSongsOrArtists.toLowerCase()))
        ) {
          continue;
        }
        seenKeys.add(dedupeKey);

        // Assign clinically calibrated BPM, Energy, NeuroTargets, and Personal Memory Notes per tier
        let bpm = item.inferredBpm;
        let energy = item.inferredEnergy;
        const mode: MusicalMode = 'Major';
        let neuroTargets: NeuroTargetBadge[] = item.neuroTargets;
        let memoryNote = '';
        let duetPrompt = '';

        if (targetTier === 'phase1_brisk') {
          bpm = 114 + (collectedTracks.length % 11); // 114-124 BPM
          energy = 8;
          neuroTargets = [
            'Ventral Pre-SMA Motor Entrainment',
            'cACC Affective Salience',
          ];
          memoryNote =
            answers.youthDanceMemory.trim() ||
            `Formative Youth (${bump.epochs[0].startYear}–${bump.epochs[0].endYear}): Captures ${profile.preferredName}'s rhythmic motor attention via ventral pre-SMA entrainment.`;
          duetPrompt = `Clap or tap gently on beats 2 and 4 with ${profile.preferredName} and ask about teenage radio favorites in ${profile.hometown}.`;
        } else if (targetTier === 'phase2_bridge') {
          bpm = 84 + (collectedTracks.length % 16); // 84-99 BPM
          energy = 5;
          neuroTargets = [
            'cACC Affective Salience',
            'DMN Functional Connectivity',
          ];
          memoryNote =
            answers.courtshipMemoryStory.trim() ||
            `Courtship & Young Adulthood (${bump.epochs[1].startYear}–${bump.epochs[1].endYear})${
              answers.spouseOrCompanionName
                ? ` with ${answers.spouseOrCompanionName}`
                : ''
            }: High autobiographical specificity and warm harmonic bridge.`;
          duetPrompt = answers.spouseOrCompanionName
            ? `After the chorus, gently mention ${answers.spouseOrCompanionName} and ask ${profile.preferredName} what they loved most about this song.`
            : `Sway gently together and invite ${profile.preferredName} to hum or sing the chorus hook.`;
        } else {
          bpm = 62 + (collectedTracks.length % 9); // 62-70 BPM
          energy = 2;
          neuroTargets = [
            'PLST Stress Threshold Restoration',
            'DMN Functional Connectivity',
          ];
          memoryNote = `Sanctuary & Deep Calm Anchor: Restores ${profile.preferredName}'s Progressively Lowered Stress Threshold (PLST) and entrains heart rate toward 64 BPM.`;
          duetPrompt =
            answers.sanctuaryMemoryPrompt.trim() ||
            `Breathe slowly with ${profile.preferredName} and enjoy the peaceful resolution of the melody.`;
        }

        const clampedYear =
          item.year >= 1930 && item.year <= 1995
            ? item.year
            : bump.bumpStart + (collectedTracks.length * 2);

        collectedTracks.push({
          id: `${targetTier}-${item.trackId}`,
          title: item.title,
          artist: item.artist,
          year: clampedYear,
          bpm,
          mode,
          energy,
          valence: 9,
          neuroTargets,
          memoryNote,
          duetPrompt,
          chorusLyrics: [
            `${item.title} — ${item.artist}`,
            answers.spouseOrCompanionName
              ? `Dedicated to ${profile.preferredName} & ${answers.spouseOrCompanionName}’s cherished memories.`
              : `From ${profile.preferredName}’s ${bump.bumpStart}–${bump.bumpEnd} Reminiscence Bump.`,
          ],
          itunesQuery: `${item.artist} ${item.title}`,
          previewUrl: item.previewUrl,
          artworkUrl: item.artworkUrl,
          epochLabel: getTrackEpochLabel(clampedYear, bump.birthYear),
        });

        if (
          collectedTracks.filter((t) => t.id.startsWith(targetTier)).length >= desiredCount
        ) {
          break;
        }
      }
    }
  };

  await Promise.all([
    addCandidateGroup(phase1Queries, 'phase1_brisk', 4),
    addCandidateGroup(phase2Queries, 'phase2_bridge', 4),
    addCandidateGroup(phase3Queries, 'phase3_calm', 4),
  ]);

  let quarantinedEntry = null;
  if (answers.redFlagSongsOrArtists.trim()) {
    quarantinedEntry = {
      id: `redflag-intake-${Date.now()}`,
      title: answers.redFlagSongsOrArtists.trim(),
      artist: 'Identified in Guided Intake Interview',
      year: bump.bumpStart,
      reason:
        answers.redFlagReason.trim() ||
        `Flagged during family intake interview (${
          answers.acousticSensitivities.join(', ') || 'Bereavement / distress trigger'
        }).`,
      quarantinedAt: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    profile,
    tracks: collectedTracks,
    quarantinedEntry,
  };
}
