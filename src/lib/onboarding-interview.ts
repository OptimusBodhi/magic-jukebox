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

  // Optional Decades & Hand-Picked Songs
  selectedDecades?: string[];
  handPickedTracks?: BiographicalTrack[];
}

export const SIMPLE_GENRE_OPTIONS = [
  {
    id: 'rock_n_roll_jukebox',
    category: 'upbeat' as const,
    label: 'Rock & Roll & Classic Rock',
    subtitle: 'Elvis Presley, The Beatles, Fleetwood Mac, Eagles, Tom Petty, Queen',
    searchSeed: 'Fleetwood Mac Dreams',
    seedQueries: [
      'Fleetwood Mac Dreams',
      'The Beatles Here Comes the Sun',
      'Tom Petty Free Fallin',
      'Eagles Peaceful Easy Feeling',
      'Queen Crazy Little Thing Called Love',
      'Elvis Presley Can’t Help Falling in Love',
      'Creedence Clearwater Revival Have You Ever Seen the Rain',
      'Elton John Bennie and the Jets',
    ],
  },
  {
    id: 'alt_90s_2000s_rock',
    category: 'upbeat' as const,
    label: '90s & 2000s Rock, Alternative & Indie',
    subtitle: 'R.E.M., Pearl Jam, Coldplay, Foo Fighters, U2, Green Day, Counting Crows',
    searchSeed: 'Coldplay Yellow',
    seedQueries: [
      'Coldplay Yellow',
      'R.E.M. Losing My Religion',
      'Counting Crows Mr. Jones',
      'Foo Fighters Learn to Fly',
      'U2 Beautiful Day',
      'Goo Goo Dolls Iris',
      'Green Day Good Riddance Time of Your Life',
      'Matchbox Twenty 3AM',
    ],
  },
  {
    id: 'classic_country_western',
    category: 'upbeat' as const,
    label: 'Country, Americana & Heartland',
    subtitle: 'Johnny Cash, Willie Nelson, Dolly Parton, Garth Brooks, Shania Twain, Chris Stapleton',
    searchSeed: 'Dolly Parton Jolene',
    seedQueries: [
      'Dolly Parton Jolene',
      'Willie Nelson On the Road Again',
      'Johnny Cash Ring of Fire',
      'George Strait Check Yes or No',
      'Chris Stapleton Tennessee Whiskey',
      'Shania Twain You’re Still the One',
      'John Denver Take Me Home Country Roads',
      'Alison Krauss When You Say Nothing at All',
    ],
  },
  {
    id: 'pop_singer_songwriter',
    category: 'peaceful' as const,
    label: 'Pop, Singer-Songwriter & Feel-Good Hits',
    subtitle: 'Billy Joel, Whitney Houston, Sheryl Crow, Norah Jones, Adele, Jack Johnson',
    searchSeed: 'Billy Joel Just the Way You Are',
    seedQueries: [
      'Billy Joel Just the Way You Are',
      'Norah Jones Don’t Know Why',
      'Jack Johnson Better Together',
      'Adele Make You Feel My Love',
      'Sheryl Crow Soak Up the Sun',
      'Whitney Houston I Wanna Dance with Somebody',
      'Carole King You’ve Got a Friend',
      'Elton John Your Song',
    ],
  },
  {
    id: 'motown_upbeat_soul',
    category: 'upbeat' as const,
    label: 'Motown, R&B, Soul & Hip-Hop Classics',
    subtitle: 'Stevie Wonder, Marvin Gaye, Temptations, Lauryn Hill, Alicia Keys, Boyz II Men',
    searchSeed: 'The Temptations My Girl',
    seedQueries: [
      'Stevie Wonder Signed Sealed Delivered',
      'The Temptations My Girl',
      'Marvin Gaye Ain’t No Mountain High Enough',
      'Alicia Keys If I Ain’t Got You',
      'Bill Withers Lovely Day',
      'Aretha Franklin Respect',
      'Otis Redding Dock of the Bay',
      'Earth Wind & Fire September',
    ],
  },
  {
    id: 'velvet_crooner_ballads',
    category: 'peaceful' as const,
    label: 'Warm Crooners, Jazz & Big Band Swing',
    subtitle: 'Frank Sinatra, Nat King Cole, Louis Armstrong, Ella Fitzgerald, Michael Bublé',
    searchSeed: 'Frank Sinatra Fly Me to the Moon',
    seedQueries: [
      'Frank Sinatra Fly Me to the Moon',
      'Nat King Cole Unforgettable',
      'Louis Armstrong What a Wonderful World',
      'Ella Fitzgerald Dream a Little Dream of Me',
      'Michael Bublé Feeling Good',
      'Dean Martin That’s Amore',
      'Bobby Darin Beyond the Sea',
      'Tony Bennett I Left My Heart in San Francisco',
    ],
  },
  {
    id: 'warm_folk_harmony',
    category: 'peaceful' as const,
    label: 'Acoustic Folk, Guitar & Harmony',
    subtitle: 'Simon & Garfunkel, James Taylor, John Denver, Tracy Chapman, Alison Krauss',
    searchSeed: 'James Taylor Fire and Rain',
    seedQueries: [
      'James Taylor How Sweet It Is',
      'Simon & Garfunkel Bridge Over Troubled Water',
      'John Denver Annie’s Song',
      'Tracy Chapman Fast Car',
      'America Sister Golden Hair',
      'Crosby Stills Nash Teach Your Children',
      'Cat Stevens Morning Has Broken',
      'Jim Croce Time in a Bottle',
    ],
  },
  {
    id: 'peaceful_piano_strings',
    category: 'peaceful' as const,
    label: 'Peaceful Piano, Classical, Ambient & Hymns',
    subtitle: 'Clair de Lune, Enya, Ludovico Einaudi, Yo-Yo Ma, Moon River, Amazing Grace',
    searchSeed: 'Henry Mancini Moon River',
    seedQueries: [
      'Henry Mancini Moon River',
      'Enya Only Time',
      'Ludovico Einaudi Nuvole Bianche',
      'Yo-Yo Ma Cello Suite No. 1 Prelude',
      'Claude Debussy Clair de Lune',
      'Andy Williams Moon River',
      'Judy Collins Amazing Grace',
      'Vince Guaraldi Cast Your Fate to the Wind',
    ],
  },
];

export const DECADE_GUESS_OPTIONS = [
  {
    id: 'decade_1940s',
    decadeStart: 1940,
    label: '1940s Music',
    subtitle: 'Big Band Swing, Glenn Miller, Bing Crosby, Ella Fitzgerald',
    searchSeed: 'Glenn Miller In the Mood',
    seedQueries: [
      'Glenn Miller In the Mood',
      'Glenn Miller Moonlight Serenade',
      'Bing Crosby Swinging on a Star',
      'Ella Fitzgerald Dream a Little Dream of Me',
      'Duke Ellington Take the A Train',
      'Nat King Cole Nature Boy',
    ],
  },
  {
    id: 'decade_1950s',
    decadeStart: 1950,
    label: '1950s Music',
    subtitle: 'Elvis Presley, Nat King Cole, Patsy Cline, Doo-Wop & Early Rock',
    searchSeed: 'Elvis Presley All Shook Up',
    seedQueries: [
      'Elvis Presley All Shook Up',
      'Nat King Cole Unforgettable',
      'Patsy Cline Walkin’ After Midnight',
      'Chuck Berry Johnny B. Goode',
      'Buddy Holly Everyday',
      'Sam Cooke You Send Me',
    ],
  },
  {
    id: 'decade_1960s',
    decadeStart: 1960,
    label: '1960s Music',
    subtitle: 'The Beatles, Motown, Frank Sinatra, Johnny Cash, Simon & Garfunkel',
    searchSeed: 'The Beatles Hey Jude',
    seedQueries: [
      'The Beatles Here Comes the Sun',
      'The Temptations My Girl',
      'Van Morrison Brown Eyed Girl',
      'Aretha Franklin Respect',
      'Otis Redding Dock of the Bay',
      'Ben E. King Stand By Me',
    ],
  },
  {
    id: 'decade_1970s',
    decadeStart: 1970,
    label: '1970s Music',
    subtitle: 'Fleetwood Mac, John Denver, Stevie Wonder, Eagles, Carole King',
    searchSeed: 'Fleetwood Mac Dreams',
    seedQueries: [
      'Fleetwood Mac Dreams',
      'Stevie Wonder Superstition',
      'John Denver Take Me Home Country Roads',
      'Carole King It’s Too Late',
      'Elton John Rocket Man',
      'Bill Withers Lean on Me',
    ],
  },
  {
    id: 'decade_1980s',
    decadeStart: 1980,
    label: '1980s Music',
    subtitle: 'Whitney Houston, Billy Joel, Tom Petty, U2, Lionel Richie, Journey',
    searchSeed: 'Whitney Houston I Wanna Dance with Somebody',
    seedQueries: [
      'Whitney Houston I Wanna Dance with Somebody',
      'Billy Joel Uptown Girl',
      'Toto Africa',
      'Journey Don’t Stop Believin’',
      'Lionel Richie All Night Long',
      'Cyndi Lauper Time After Time',
    ],
  },
  {
    id: 'decade_1990s',
    decadeStart: 1990,
    label: '1990s Music',
    subtitle: 'R.E.M., Pearl Jam, Shania Twain, Mariah Carey, Alanis Morissette, Santana',
    searchSeed: 'R.E.M. Losing My Religion',
    seedQueries: [
      'R.E.M. Losing My Religion',
      'Shania Twain You’re Still the One',
      'Goo Goo Dolls Iris',
      'Santana Smooth',
      'Hootie & the Blowfish Only Wanna Be With You',
      'Mariah Carey Always Be My Baby',
    ],
  },
  {
    id: 'decade_2000s',
    decadeStart: 2000,
    label: '2000s Music',
    subtitle: 'Coldplay, Norah Jones, Alicia Keys, Jack Johnson, John Mayer, Beyoncé',
    searchSeed: 'Coldplay Viva La Vida',
    seedQueries: [
      'Coldplay Viva La Vida',
      'Norah Jones Come Away With Me',
      'Alicia Keys If I Ain’t Got You',
      'Jack Johnson Better Together',
      'Train Drops of Jupiter',
      'Jason Mraz I’m Yours',
    ],
  },
  {
    id: 'decade_2010s',
    decadeStart: 2010,
    label: '2010s & 2020s Music',
    subtitle: 'Adele, Ed Sheeran, Chris Stapleton, Kacey Musgraves, Bruno Mars, Taylor Swift',
    searchSeed: 'Adele Rolling in the Deep',
    seedQueries: [
      'Adele Rolling in the Deep',
      'Ed Sheeran Thinking Out Loud',
      'Chris Stapleton Tennessee Whiskey',
      'Bruno Mars Treasure',
      'Kacey Musgraves Golden Hour',
      'The Lumineers Ho Hey',
    ],
  },
];

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
 * Builds an interleaved list of individual song/artist queries strictly from the user's
 * checked genres and checked decades (with zero hard-coded oldies fallbacks when the user
 * has selected modern genres or decades).
 */
export function buildSeedQueriesForSelections(answers: GuidedInterviewAnswers): string[] {
  const bump = calculateReminiscenceBump(answers.birthYear);
  const selectedGenreIds = new Set([...answers.youthStyles, ...answers.sanctuaryStyles]);

  const matchedGenres = SIMPLE_GENRE_OPTIONS.filter((g) => selectedGenreIds.has(g.id));
  const matchedDecades = DECADE_GUESS_OPTIONS.filter((d) =>
    (answers.selectedDecades || []).includes(d.id)
  );

  // Interleave queries across every selected genre and decade so all checked options are represented
  const queryLists: string[][] = [];

  for (const g of matchedGenres) {
    queryLists.push(g.seedQueries);
  }
  for (const d of matchedDecades) {
    queryLists.push(d.seedQueries);
  }

  // Fallback only if user unchecked everything: derive the decade from their birthYear
  if (queryLists.length === 0) {
    const rawStartDecade = Math.floor((bump.birthYear + 14) / 10) * 10;
    const clampedDecade = Math.max(1940, Math.min(2010, rawStartDecade));
    const fallbackDecade =
      DECADE_GUESS_OPTIONS.find((d) => d.decadeStart === clampedDecade) ||
      DECADE_GUESS_OPTIONS[3]; // 1970s neutral fallback
    queryLists.push(fallbackDecade.seedQueries);
  }

  const interleaved: string[] = [
    answers.youthFavoriteArtistOrSong.trim(),
    answers.courtshipSongOrArtist.trim(),
    answers.sanctuarySpecificSong.trim(),
  ].filter(Boolean);

  const maxLen = Math.max(...queryLists.map((l) => l.length));
  for (let i = 0; i < maxLen; i++) {
    for (const list of queryLists) {
      if (list[i] && !interleaved.includes(list[i])) {
        interleaved.push(list[i]);
      }
    }
  }

  return interleaved;
}

/**
 * Synthesizes the caregiver's Guided Interview answers into:
 * 1) Updated PatientProfile
 * 2) Live iTunes-hydrated BiographicalTrack library spanning Phase 1 (High/Brisk Match),
 *    Phase 2 (Courtship & Mid-Tempo Bridge), and Phase 3 (Sanctuary Calm Resolution)
 *    strictly using the genres, decades, and songs selected by the user.
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
  const selectedGenreLabels = SIMPLE_GENRE_OPTIONS.filter(
    (g) => answers.youthStyles.includes(g.id) || answers.sanctuaryStyles.includes(g.id)
  ).map((g) => g.label);

  const profile: PatientProfile = {
    name: answers.fullName.trim() || 'Arthur Pendelton',
    preferredName:
      answers.preferredName.trim() ||
      answers.fullName.trim().split(' ')[0] ||
      'Arthur',
    birthYear: bump.birthYear,
    hometown: answers.hometown.trim() || 'Hometown Heritage',
    formerOccupation: answers.formerOccupation.trim() || 'Beloved Family Elder',
    musicalHeritage:
      answers.culturalUpbringing.trim() ||
      selectedGenreLabels.join(', ') ||
      `${bump.bumpStart}–${bump.bumpEnd} Personal Favorites`,
    sundowningPeakTime: answers.sundowningPeakTime || '16:30',
    proactiveShieldLeadMinutes: 30,
  };

  const collectedTracks: BiographicalTrack[] = [];
  const seenKeys = new Set<string>();

  // 1. Include all songs the user explicitly checked/added in Step 3 first!
  if (Array.isArray(answers.handPickedTracks) && answers.handPickedTracks.length > 0) {
    for (const picked of answers.handPickedTracks) {
      const dedupeKey = `${picked.title.toLowerCase()}::${picked.artist.toLowerCase()}`;
      if (!seenKeys.has(dedupeKey)) {
        seenKeys.add(dedupeKey);
        collectedTracks.push(picked);
      }
    }
  }

  // 2. Fill remaining slots up to 12 tracks strictly from the user's selected genres & decades
  const targetTotalCount = Math.max(12, collectedTracks.length);
  if (collectedTracks.length < targetTotalCount) {
    const candidateQueries = buildSeedQueriesForSelections(answers).slice(0, 14);
    const rawItems = await Promise.all(
      candidateQueries.map((q) => searchItunesTracks(q, 2))
    );

    const candidatePool = rawItems.flat();
    // Sort pool by inferredBpm descending so we assign brisk, bridge, and calm tiers naturally within the chosen genres
    candidatePool.sort((a, b) => b.inferredBpm - a.inferredBpm);

    for (let idx = 0; idx < candidatePool.length; idx++) {
      if (collectedTracks.length >= targetTotalCount) break;
      const item = candidatePool[idx];
      const dedupeKey = `${item.title.toLowerCase()}::${item.artist.toLowerCase()}`;
      if (seenKeys.has(dedupeKey)) continue;

      if (
        answers.redFlagSongsOrArtists.trim() &&
        (item.title.toLowerCase().includes(answers.redFlagSongsOrArtists.toLowerCase()) ||
          item.artist.toLowerCase().includes(answers.redFlagSongsOrArtists.toLowerCase()))
      ) {
        continue;
      }
      seenKeys.add(dedupeKey);

      const third = Math.max(1, Math.floor((targetTotalCount - (answers.handPickedTracks?.length || 0)) / 3));
      const addedSoFar = collectedTracks.length - (answers.handPickedTracks?.length || 0);
      const targetTier: 'phase1_brisk' | 'phase2_bridge' | 'phase3_calm' =
        addedSoFar < third
          ? 'phase1_brisk'
          : addedSoFar < third * 2
          ? 'phase2_bridge'
          : 'phase3_calm';

      let bpm = item.inferredBpm;
      let energy = item.inferredEnergy;
      const mode: MusicalMode = 'Major';
      let neuroTargets: NeuroTargetBadge[] = item.neuroTargets;
      let memoryNote = '';
      let duetPrompt = '';

      if (targetTier === 'phase1_brisk') {
        bpm = Math.max(108, item.inferredBpm || 116);
        energy = 8;
        neuroTargets = [
          'Ventral Pre-SMA Motor Entrainment',
          'cACC Affective Salience',
        ];
        memoryNote =
          answers.youthDanceMemory.trim() ||
          `Upbeat Favorite (${item.year}): Captures ${profile.preferredName}'s rhythmic motor attention via ventral pre-SMA entrainment.`;
        duetPrompt = `Clap or tap gently on beats 2 and 4 with ${profile.preferredName} and ask what memories come to mind when this song plays.`;
      } else if (targetTier === 'phase2_bridge') {
        bpm = Math.min(102, Math.max(82, item.inferredBpm || 90));
        energy = 5;
        neuroTargets = [
          'cACC Affective Salience',
          'DMN Functional Connectivity',
        ];
        memoryNote =
          answers.courtshipMemoryStory.trim() ||
          `Heart & Story Song (${item.year})${
            answers.spouseOrCompanionName
              ? ` with ${answers.spouseOrCompanionName}`
              : ''
          }: High autobiographical specificity and warm harmonic bridge.`;
        duetPrompt = answers.spouseOrCompanionName
          ? `After the chorus, gently mention ${answers.spouseOrCompanionName} and ask ${profile.preferredName} what they loved most about this song.`
          : `Sway gently together and invite ${profile.preferredName} to hum or sing the chorus hook.`;
      } else {
        bpm = Math.min(76, item.inferredBpm || 68);
        energy = 2;
        neuroTargets = [
          'PLST Stress Threshold Restoration',
          'DMN Functional Connectivity',
        ];
        memoryNote = `Peaceful Sanctuary Anchor (${item.year}): Restores ${profile.preferredName}'s Progressively Lowered Stress Threshold (PLST) and settles heart rate toward 64 BPM.`;
        duetPrompt =
          answers.sanctuaryMemoryPrompt.trim() ||
          `Breathe slowly with ${profile.preferredName} and enjoy the peaceful resolution of the melody.`;
      }

      const clampedYear =
        item.year >= 1920 && item.year <= 2030
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
        appleMusicUrl: item.appleMusicUrl,
        appleTrackId: item.appleTrackId,
        epochLabel: getTrackEpochLabel(clampedYear, bump.birthYear),
      });
    }
  }

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
