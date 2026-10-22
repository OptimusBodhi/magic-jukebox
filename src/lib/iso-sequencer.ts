export type MusicalMode = 'Major' | 'Minor';

export type NeuroTargetBadge =
  | 'cACC Affective Salience'
  | 'Ventral Pre-SMA Motor Entrainment'
  | 'DMN Functional Connectivity'
  | 'PLST Stress Threshold Restoration';

export interface BiographicalTrack {
  id: string;
  title: string;
  artist: string;
  year: number;
  bpm: number;
  mode: MusicalMode;
  energy: number; // 1-10
  valence: number; // 1-10
  neuroTargets: NeuroTargetBadge[];
  memoryNote: string;
  duetPrompt: string;
  chorusLyrics: string[];
  itunesQuery: string;
  previewUrl?: string;
  artworkUrl?: string;
  appleMusicUrl?: string;
  appleTrackId?: string;
  youtubeVideoId?: string;
  epochLabel?: string;
}

export type CurrentEmotionalStateId =
  | 'agitated_sundowning'
  | 'anxious_restless'
  | 'withdrawn_sad'
  | 'care_task_stress';

export type TargetTherapeuticStateId =
  | 'deep_calm'
  | 'lucid_connection'
  | 'sing_along_joy';

export interface EmotionalStateConfig {
  id: CurrentEmotionalStateId;
  label: string;
  clinicalSubtitle: string;
  barsBaseline: number;
  targetBpm: number;
  targetEnergy: number;
  preferredMode?: MusicalMode;
  description: string;
  clinicalMechanism: string;
}

export interface TargetStateConfig {
  id: TargetTherapeuticStateId;
  label: string;
  clinicalSubtitle: string;
  targetBars: number;
  targetBpm: number;
  targetEnergy: number;
  preferredMode: MusicalMode;
  description: string;
  clinicalMechanism: string;
}

export interface ReminiscenceEpoch {
  id: 'epoch_1' | 'epoch_2' | 'epoch_3';
  name: string;
  ageRange: string;
  startYear: number;
  endYear: number;
  description: string;
}

export interface ReminiscenceBumpResult {
  birthYear: number;
  currentAge: number;
  bumpStart: number;
  bumpEnd: number;
  epochs: ReminiscenceEpoch[];
}

export interface SequencedTrack extends BiographicalTrack {
  phase: 1 | 2 | 3;
  phaseName: string;
  phaseTimeWindow: string;
  targetBpmForPhase: number;
  isoFitScore: number;
  clinicalRationale: string;
}

export interface IsoPhaseGroup {
  phase: 1 | 2 | 3;
  name: string;
  timeWindow: string;
  targetBpmRange: string;
  clinicalObjective: string;
  neuroMechanism: string;
  tracks: SequencedTrack[];
}

export interface IsoTrajectoryResult {
  currentState: EmotionalStateConfig;
  targetState: TargetStateConfig;
  phases: IsoPhaseGroup[];
  orderedTracks: SequencedTrack[];
}

export type ObservedBehavioralSignId =
  | 'smiling_calm'
  | 'singing_humming'
  | 'tapping_dancing'
  | 'shared_memory'
  | 'pacing_settled'
  | 'smooth_routine';

export const OBSERVED_BEHAVIORAL_SIGNS: Array<{
  id: ObservedBehavioralSignId;
  emoji: string;
  label: string;
  clinicalDomain: string;
}> = [
  {
    id: 'smiling_calm',
    emoji: '😊',
    label: 'Smiled or Relaxed Face',
    clinicalDomain: 'Affective Valence & Facial Relaxation',
  },
  {
    id: 'singing_humming',
    emoji: '🎤',
    label: 'Sang or Hummed Along',
    clinicalDomain: 'Ventral Pre-SMA Vocal Recruitment',
  },
  {
    id: 'tapping_dancing',
    emoji: '🥁',
    label: 'Tapped Feet or Hands to Beat',
    clinicalDomain: 'Rhythmic Motor Entrainment (RAS)',
  },
  {
    id: 'shared_memory',
    emoji: '💬',
    label: 'Shared a Story or Conversation',
    clinicalDomain: 'DMN Autobiographical Lucidity',
  },
  {
    id: 'pacing_settled',
    emoji: '🪑',
    label: 'Sat Down / Stopped Pacing',
    clinicalDomain: 'Sympathetic Arousal Reduction (BARS)',
  },
  {
    id: 'smooth_routine',
    emoji: '🛁',
    label: 'Easier Daily Care / Visit',
    clinicalDomain: 'PLST Care-Task Cooperation',
  },
];

export interface BarsSessionLog {
  id: string;
  date: string;
  time: string;
  triggerContext: string;
  currentStateLabel: string;
  targetStateLabel: string;
  preBars: number;
  postBars: number;
  moodValencePre: number; // 1-5
  moodValencePost: number; // 1-5
  prnAvoided: boolean;
  notes: string;
  observedSigns?: ObservedBehavioralSignId[];
  caregiverStressBefore?: number; // 1-5 (5 = high stress, 1 = calm/relieved)
  caregiverStressAfter?: number; // 1-5
  sessionDurationMinutes?: number;
  topResonantTracks?: string[];
}

export interface PatientProfile {
  name: string;
  preferredName: string;
  birthYear: number;
  hometown: string;
  formerOccupation: string;
  musicalHeritage: string;
  sundowningPeakTime: string; // e.g. "16:30"
  proactiveShieldLeadMinutes: number; // 30 minutes per Gerdner protocol
}

export const BARS_SCALE_DEFINITIONS: Array<{
  score: number;
  label: string;
  clinicalDescription: string;
  colorClass: string;
}> = [
  {
    score: 1,
    label: '1 — Unarousable',
    clinicalDescription: 'Difficult or unable to rouse',
    colorClass: 'bg-slate-600 text-white',
  },
  {
    score: 2,
    label: '2 — Asleep / Withdrawn',
    clinicalDescription: 'Asleep or deeply withdrawn; responds slowly to verbal/physical contact',
    colorClass: 'bg-indigo-700 text-white',
  },
  {
    score: 3,
    label: '3 — Drowsy / Apathetic',
    clinicalDescription: 'Drowsy, flat affect, or appears sedated/under-stimulated',
    colorClass: 'bg-blue-700 text-white',
  },
  {
    score: 4,
    label: '4 — Quiet, Awake & Lucid (Target)',
    clinicalDescription: 'Normal, calm level of physiological activity and conversational readiness',
    colorClass: 'bg-emerald-700 text-white',
  },
  {
    score: 5,
    label: '5 — Restless / Overt Activity',
    clinicalDescription: 'Signs of overt physical or verbal restlessness; calms with redirection',
    colorClass: 'bg-amber-600 text-white',
  },
  {
    score: 6,
    label: '6 — Agitated / Pacing / Sundowning',
    clinicalDescription: 'Extremely or continuously active, pacing, vocal tension; no restraint required',
    colorClass: 'bg-orange-700 text-white',
  },
  {
    score: 7,
    label: '7 — Acute Distress / Aggressive',
    clinicalDescription: 'Violent or severe autonomic dysregulation requiring immediate clinical intervention',
    colorClass: 'bg-red-800 text-white',
  },
];

export const CURRENT_EMOTIONAL_STATES: EmotionalStateConfig[] = [
  {
    id: 'agitated_sundowning',
    label: 'Agitated / Pacing / Sundowning',
    clinicalSubtitle: 'BARS 5–6 • High Sympathetic Arousal',
    barsBaseline: 6,
    targetBpm: 118,
    targetEnergy: 8,
    description:
      'Late-afternoon restlessness, pacing, repetitive questioning, or elevated motor tension.',
    clinicalMechanism:
      'Matches brisk internal motor energy (110–125 BPM) via ventral pre-SMA rhythmic capture before stepping tempo downward.',
  },
  {
    id: 'anxious_restless',
    label: 'Anxious / Searching / Worried',
    clinicalSubtitle: 'BARS 5 • Autonomic Hypervigilance',
    barsBaseline: 5,
    targetBpm: 102,
    targetEnergy: 6,
    description:
      'Anomia frustration, searching for home/family, shadow anxiety, or environmental disorientation.',
    clinicalMechanism:
      'Engages cACC emotional familiarity at moderate-brisk tempo (95–108 BPM) to lower defensive autonomic anxiety.',
  },
  {
    id: 'care_task_stress',
    label: 'Care-Task Stress (PLST Breach)',
    clinicalSubtitle: 'BARS 5 • Personal Care / Bathing / Dressing',
    barsBaseline: 5,
    targetBpm: 98,
    targetEnergy: 6,
    preferredMode: 'Major',
    description:
      'Pre-empts defensive resistance during bathing, dressing, or medication routines (Gerdner IMIA Protocol).',
    clinicalMechanism:
      'Replaces unintelligible environmental noise with zero-decoding-effort favorites to restore the Progressively Lowered Stress Threshold.',
  },
  {
    id: 'withdrawn_sad',
    label: 'Withdrawn / Apathetic / Flat Affect',
    clinicalSubtitle: 'BARS 2–3 • Low Arousal & Depressive Withdrawal',
    barsBaseline: 3,
    targetBpm: 68,
    targetEnergy: 3,
    description:
      'Daytime disengagement, slumped posture, minimal eye contact, or depressive silence.',
    clinicalMechanism:
      'Starts with gentle, empathetic timbres (64–75 BPM) without sensory shock, then inflects upward in tempo and harmonic brightness.',
  },
];

export const TARGET_THERAPEUTIC_STATES: TargetStateConfig[] = [
  {
    id: 'deep_calm',
    label: 'Deep Parasympathetic Calm',
    clinicalSubtitle: 'Target: 60–68 BPM • Major Mode • BARS 4',
    targetBars: 4,
    targetBpm: 65,
    targetEnergy: 2,
    preferredMode: 'Major',
    description:
      'Settles heart rate downward by 20–25%, resolves sundowning pacing, and prepares for restful evening or sleep.',
    clinicalMechanism:
      'Vagal parasympathetic entrainment via warm vocal timbres, predictable phrasing, and resolved Major harmonies.',
  },
  {
    id: 'lucid_connection',
    label: 'Lucid Family Connection',
    clinicalSubtitle: 'Target: 75–92 BPM • DMN Scaffolding • BARS 4',
    targetBars: 4,
    targetBpm: 84,
    targetEnergy: 5,
    preferredMode: 'Major',
    description:
      '20–30 minute "Lucidity Primer" prior to family visits to restore eye contact, autobiographical recall, and conversation.',
    clinicalMechanism:
      'Increases Default Mode Network (DMN) and corticocerebellar functional connectivity (King et al., 2019).',
  },
  {
    id: 'sing_along_joy',
    label: 'Uplifted Sing-Along Joy',
    clinicalSubtitle: 'Target: 105–120 BPM • Caregiver Duet • BARS 4',
    targetBars: 4,
    targetBpm: 112,
    targetEnergy: 8,
    preferredMode: 'Major',
    description:
      'Energizes daytime mood, stimulates verbal fluency and working memory, and fosters joyful caregiver-patient duets.',
    clinicalMechanism:
      'Activates vocal motor planning in ventral pre-SMA and mesolimbic reward circuitry (Särkämö et al., 2014/2016).',
  },
];

export const DEFAULT_PATIENT_PROFILE: PatientProfile = {
  name: 'Arthur Pendelton',
  preferredName: 'Arthur',
  birthYear: 1944,
  hometown: 'Sturgeon Bay, Wisconsin',
  formerOccupation: 'Master Boatbuilder & Church Choir Baritone',
  musicalHeritage: 'Big Band Crooners, 1950s Doo-Wop, Motown Soul & Folk Harmony',
  sundowningPeakTime: '16:30',
  proactiveShieldLeadMinutes: 30,
};

export const ARTHUR_SEED_TRACKS: BiographicalTrack[] = [
  {
    id: 'track-rock-around-clock',
    title: 'Rock Around the Clock',
    artist: 'Bill Haley & His Comets',
    year: 1954,
    bpm: 124,
    mode: 'Major',
    energy: 9,
    valence: 9,
    neuroTargets: ['Ventral Pre-SMA Motor Entrainment', 'cACC Affective Salience'],
    memoryNote:
      'Arthur was 10 when this hit the radio in 1954. He used to tap his wooden ruler on his workbench in time to the snare drum.',
    duetPrompt:
      'Watch Arthur’s right foot—ask him about the jukebox at Peterson’s Pharmacy in 1955.',
    chorusLyrics: [
      'One, two, three o’clock, four o’clock, rock!',
      'Five, six, seven o’clock, eight o’clock, rock!',
      'Nine, ten, eleven o’clock, twelve o’clock, rock!',
      'We’re gonna rock around the clock tonight!',
    ],
    itunesQuery: 'Bill Haley Rock Around the Clock',
  },
  {
    id: 'track-hound-dog',
    title: 'All Shook Up',
    artist: 'Elvis Presley',
    year: 1957,
    bpm: 118,
    mode: 'Major',
    energy: 8,
    valence: 9,
    neuroTargets: ['Ventral Pre-SMA Motor Entrainment', 'cACC Affective Salience'],
    memoryNote:
      'Age 13 (Formative Youth). Arthur saved lawn-mowing money to buy this 45 RPM single and played it until the grooves wore thin.',
    duetPrompt:
      'Clap along on the backbeat (beats 2 and 4) and ask Arthur if he remembers his first transistor radio.',
    chorusLyrics: [
      'A-well-a bless my soul, what’s wrong with me?',
      'I’m itching like a man on a fuzzy tree!',
      'My friends say I’m actin’ wild as a bug,',
      'I’m in love, I’m all shook up!',
    ],
    itunesQuery: 'Elvis Presley All Shook Up',
  },
  {
    id: 'track-twist-and-shout',
    title: 'I Want to Hold Your Hand',
    artist: 'The Beatles',
    year: 1964,
    bpm: 115,
    mode: 'Major',
    energy: 8,
    valence: 9,
    neuroTargets: ['Ventral Pre-SMA Motor Entrainment', 'DMN Functional Connectivity'],
    memoryNote:
      'Age 20 (Young Adulthood). Arthur watched The Beatles on The Ed Sullivan Show with Clara in her parents’ parlor.',
    duetPrompt:
      'Hold Arthur’s hand gently during the chorus—this track reliably brings out a warm smile and eye contact.',
    chorusLyrics: [
      'Oh please, say to me, you’ll let me be your man,',
      'And please, say to me, you’ll let me hold your hand,',
      'Now let me hold your hand,',
      'I want to hold your hand!',
    ],
    itunesQuery: 'The Beatles I Want to Hold Your Hand',
  },
  {
    id: 'track-my-girl',
    title: 'My Girl',
    artist: 'The Temptations',
    year: 1964,
    bpm: 104,
    mode: 'Major',
    energy: 6,
    valence: 10,
    neuroTargets: ['cACC Affective Salience', 'DMN Functional Connectivity'],
    memoryNote:
      'Age 20 (Courtship). Arthur sang this to Clara on the ferry across Green Bay the summer before they got engaged.',
    duetPrompt:
      'Hum the famous bassline ("da-da-da-da-da-da") before the vocals enter and ask Arthur about Clara’s yellow sundress.',
    chorusLyrics: [
      'I’ve got sunshine on a cloudy day,',
      'When it’s cold outside, I’ve got the month of May,',
      'I guess you’d say, what can make me feel this way?',
      'My girl, talkin’ ’bout my girl!',
    ],
    itunesQuery: 'The Temptations My Girl',
  },
  {
    id: 'track-fly-me-to-the-moon',
    title: 'Fly Me to the Moon',
    artist: 'Frank Sinatra',
    year: 1964,
    bpm: 98,
    mode: 'Major',
    energy: 6,
    valence: 8,
    neuroTargets: ['Ventral Pre-SMA Motor Entrainment', 'PLST Stress Threshold Restoration'],
    memoryNote:
      'Age 20. Played at Arthur and Clara’s rehearsal dinner. Works wonders as a bridge track when stepping down from afternoon restlessness.',
    duetPrompt:
      'Sway gently left and right with Arthur and invite him to sing the baritone line "In other words, hold my hand."',
    chorusLyrics: [
      'Fly me to the moon, let me play among the stars,',
      'Let me see what spring is like on Jupiter and Mars,',
      'In other words, hold my hand,',
      'In other words, baby, kiss me.',
    ],
    itunesQuery: 'Frank Sinatra Fly Me to the Moon',
  },
  {
    id: 'track-stand-by-me',
    title: 'Stand By Me',
    artist: 'Ben E. King',
    year: 1961,
    bpm: 92,
    mode: 'Major',
    energy: 5,
    valence: 8,
    neuroTargets: ['cACC Affective Salience', 'PLST Stress Threshold Restoration'],
    memoryNote:
      'Age 17. One of Arthur’s favorite baritone harmony pieces from high school choir days.',
    duetPrompt:
      'Reassuring lyrics that directly lower anxiety during care transitions. Sing "Darlin’, darlin’, stand by me" softly together.',
    chorusLyrics: [
      'So darlin’, darlin’, stand by me, oh stand by me,',
      'Oh stand, stand by me, stand by me.',
      'Whenever you’re in trouble, won’t you stand by me,',
      'Oh stand by me.',
    ],
    itunesQuery: 'Ben E King Stand By Me',
  },
  {
    id: 'track-cupid',
    title: 'Twistin’ the Night Away',
    artist: 'Sam Cooke',
    year: 1962,
    bpm: 86,
    mode: 'Major',
    energy: 5,
    valence: 8,
    neuroTargets: ['cACC Affective Salience', 'DMN Functional Connectivity'],
    memoryNote:
      'Age 18. Sam Cooke’s warm vocal timbre immediately relaxes Arthur’s shoulders while keeping his attention engaged.',
    duetPrompt:
      'Ask Arthur about the Friday night dances at the Sturgeon Bay boatyard hall.',
    chorusLyrics: [
      'Let’s twist awhile, let’s twist awhile,',
      'Shimmy, shimmy, ko-ko-bop,',
      'Twistin’ the night away!',
    ],
    itunesQuery: 'Sam Cooke Twistin the Night Away',
  },
  {
    id: 'track-dock-of-the-bay',
    title: '(Sittin’ On) The Dock of the Bay',
    artist: 'Otis Redding',
    year: 1968,
    bpm: 78,
    mode: 'Major',
    energy: 4,
    valence: 7,
    neuroTargets: ['PLST Stress Threshold Restoration', 'DMN Functional Connectivity'],
    memoryNote:
      'Age 24 (Early Family & Boatshop). Arthur listened to this every morning while varnishing cedar hulls by the harbor.',
    duetPrompt:
      'Whistle along with the final chorus and ask Arthur about the smell of cedar shavings down at the dock.',
    chorusLyrics: [
      'Sittin’ on the dock of the bay,',
      'Watchin’ the tide roll away,',
      'Ooo, I’m just sittin’ on the dock of the bay,',
      'Wastin’ time.',
    ],
    itunesQuery: 'Otis Redding Dock of the Bay',
  },
  {
    id: 'track-bridge-troubled-water',
    title: 'Bridge Over Troubled Water',
    artist: 'Simon & Garfunkel',
    year: 1970,
    bpm: 72,
    mode: 'Major',
    energy: 4,
    valence: 7,
    neuroTargets: ['cACC Affective Salience', 'PLST Stress Threshold Restoration'],
    memoryNote:
      'Age 26 (Early Family Years). Arthur and Clara sang this duet in the church choir the year their daughter Sarah was born.',
    duetPrompt:
      'Ideal empathetic State Match when Arthur feels quiet or sad; validates his mood before gently lifting his spirits.',
    chorusLyrics: [
      'When you’re weary, feeling small,',
      'When tears are in your eyes, I’ll dry them all,',
      'I’m on your side, oh, when times get rough,',
      'Like a bridge over troubled water, I will lay me down.',
    ],
    itunesQuery: 'Simon Garfunkel Bridge Over Troubled Water',
  },
  {
    id: 'track-unforgettable',
    title: 'Unforgettable',
    artist: 'Nat King Cole',
    year: 1954,
    bpm: 66,
    mode: 'Major',
    energy: 2,
    valence: 8,
    neuroTargets: ['PLST Stress Threshold Restoration', 'cACC Affective Salience'],
    memoryNote:
      'Arthur and Clara’s wedding first dance song. Slows Arthur’s breathing to a deep, steady rhythm within 60 seconds.',
    duetPrompt:
      'Speak softly after the piano outro: "Clara loved how you danced to Nat King Cole, Arthur."',
    chorusLyrics: [
      'Unforgettable, that’s what you are,',
      'Unforgettable, though near or far,',
      'Like a song of love that clings to me,',
      'How the thought of you does things to me.',
    ],
    itunesQuery: 'Nat King Cole Unforgettable',
  },
  {
    id: 'track-wonderful-world',
    title: 'What a Wonderful World',
    artist: 'Louis Armstrong',
    year: 1967,
    bpm: 62,
    mode: 'Major',
    energy: 2,
    valence: 9,
    neuroTargets: ['PLST Stress Threshold Restoration', 'DMN Functional Connectivity'],
    memoryNote:
      'Age 23. Our gold-standard Phase 3 Therapeutic Resolution track—entrains heart rate down to 62 BPM and leaves Arthur serene and lucid.',
    duetPrompt:
      'Look out the window together at the trees and sing "And I think to myself, what a wonderful world."',
    chorusLyrics: [
      'I see trees of green, red roses too,',
      'I see them bloom for me and you,',
      'And I think to myself,',
      'What a wonderful world.',
    ],
    itunesQuery: 'Louis Armstrong What a Wonderful World',
  },
  {
    id: 'track-moon-river',
    title: 'Moon River',
    artist: 'Andy Williams',
    year: 1962,
    bpm: 64,
    mode: 'Major',
    energy: 2,
    valence: 8,
    neuroTargets: ['PLST Stress Threshold Restoration', 'cACC Affective Salience'],
    memoryNote:
      'Age 18. Gentle waltz meter (3/4 time) that rocks the autonomic nervous system into parasympathetic calm.',
    duetPrompt:
      'Use for evening wind-down or post-sundowning resolution. Hum the opening fifth interval together.',
    chorusLyrics: [
      'Moon river, wider than a mile,',
      'I’m crossing you in style some day,',
      'Oh, dream maker, you heart breaker,',
      'Wherever you’re goin’, I’m goin’ your way.',
    ],
    itunesQuery: 'Andy Williams Moon River',
  },
];

export const INITIAL_QUARANTINED_TRACKS: Array<{
  id: string;
  title: string;
  artist: string;
  year: number;
  reason: string;
  quarantinedAt: string;
}> = [
  {
    id: 'redflag-danny-boy',
    title: 'Danny Boy',
    artist: 'Bing Crosby',
    year: 1952,
    reason:
      'Played at Arthur’s younger brother Thomas’s funeral (bereavement trigger — facial electromyography sadness cue observed).',
    quarantinedAt: '2026-09-14',
  },
];

export const INITIAL_BARS_LOGS: BarsSessionLog[] = [
  {
    id: 'log-w1',
    date: 'Week 1 (Sep 12)',
    time: '16:15',
    triggerContext: 'Late-Afternoon Sundowning Pacing',
    currentStateLabel: 'Agitated / Pacing / Sundowning',
    targetStateLabel: 'Deep Parasympathetic Calm',
    preBars: 6,
    postBars: 4,
    moodValencePre: 2,
    moodValencePost: 4,
    prnAvoided: true,
    notes: 'Matched pacing with Bill Haley (124 BPM), stepped down via Sinatra to Louis Armstrong (62 BPM). Pacing resolved at minute 16.',
    observedSigns: ['pacing_settled', 'smiling_calm'],
    caregiverStressBefore: 4,
    caregiverStressAfter: 2,
    sessionDurationMinutes: 30,
    topResonantTracks: ['What a Wonderful World', 'Fly Me to the Moon'],
  },
  {
    id: 'log-w2',
    date: 'Week 2 (Sep 19)',
    time: '09:30',
    triggerContext: 'Morning Bathing & Personal Care (PLST)',
    currentStateLabel: 'Care-Task Stress (PLST Breach)',
    targetStateLabel: 'Deep Parasympathetic Calm',
    preBars: 5,
    postBars: 4,
    moodValencePre: 2,
    moodValencePost: 5,
    prnAvoided: true,
    notes: 'Initiated Gerdner IMIA protocol 20 mins prior to shower. Zero verbal resistance; sang along to Ben E. King.',
    observedSigns: ['smooth_routine', 'singing_humming', 'smiling_calm'],
    caregiverStressBefore: 4,
    caregiverStressAfter: 1,
    sessionDurationMinutes: 25,
    topResonantTracks: ['Stand By Me', 'Unforgettable'],
  },
  {
    id: 'log-w3',
    date: 'Week 3 (Sep 26)',
    time: '14:00',
    triggerContext: 'Pre-Visit Lucidity Primer (Daughter Sarah Visiting)',
    currentStateLabel: 'Withdrawn / Apathetic / Flat Affect',
    targetStateLabel: 'Uplifted Sing-Along Joy',
    preBars: 3,
    postBars: 4,
    moodValencePre: 2,
    moodValencePost: 5,
    prnAvoided: false,
    notes: 'Started gently with Simon & Garfunkel (72 BPM), bridged to Temptations (104 BPM). Recalled 1964 Green Bay ferry story clearly.',
    observedSigns: ['shared_memory', 'smiling_calm', 'tapping_dancing'],
    caregiverStressBefore: 3,
    caregiverStressAfter: 1,
    sessionDurationMinutes: 30,
    topResonantTracks: ['My Girl', 'Bridge Over Troubled Water'],
  },
  {
    id: 'log-w4',
    date: 'Week 4 (Oct 03)',
    time: '16:00',
    triggerContext: 'Proactive Sundowning Shield (Auto-Triggered)',
    currentStateLabel: 'Anxious / Searching / Worried',
    targetStateLabel: 'Deep Parasympathetic Calm',
    preBars: 5,
    postBars: 4,
    moodValencePre: 2,
    moodValencePost: 4,
    prnAvoided: true,
    notes: '30-min proactive dosing prevented typical 4:30 PM agitation spike entirely. PRN lorazepam not needed.',
    observedSigns: ['pacing_settled', 'smiling_calm'],
    caregiverStressBefore: 4,
    caregiverStressAfter: 1,
    sessionDurationMinutes: 30,
    topResonantTracks: ['Moon River', 'What a Wonderful World'],
  },
  {
    id: 'log-w5',
    date: 'Week 5 (Oct 10)',
    time: '16:05',
    triggerContext: 'Proactive Sundowning Shield (Auto-Triggered)',
    currentStateLabel: 'Agitated / Pacing / Sundowning',
    targetStateLabel: 'Deep Parasympathetic Calm',
    preBars: 6,
    postBars: 4,
    moodValencePre: 1,
    moodValencePost: 4,
    prnAvoided: true,
    notes: 'Rainy afternoon increased shadow anxiety. Iso-Principle arc settled breathing and restored eye contact by Phase 3.',
    observedSigns: ['pacing_settled', 'smiling_calm', 'shared_memory'],
    caregiverStressBefore: 5,
    caregiverStressAfter: 2,
    sessionDurationMinutes: 30,
    topResonantTracks: ['Unforgettable', 'What a Wonderful World'],
  },
  {
    id: 'log-w6',
    date: 'Week 6 (Oct 18)',
    time: '11:00',
    triggerContext: 'Sunday Morning Choir Reminiscence Duet',
    currentStateLabel: 'Withdrawn / Apathetic / Flat Affect',
    targetStateLabel: 'Lucid Family Connection',
    preBars: 3,
    postBars: 4,
    moodValencePre: 3,
    moodValencePost: 5,
    prnAvoided: true,
    notes: 'Caregiver Duet Mode used with large-print lyrics. Verbal fluency noticeably improved for 2 hours post-session.',
    observedSigns: ['singing_humming', 'shared_memory', 'smiling_calm', 'tapping_dancing'],
    caregiverStressBefore: 3,
    caregiverStressAfter: 1,
    sessionDurationMinutes: 35,
    topResonantTracks: ['How Great Thou Art', 'Stand By Me'],
  },
];

/**
 * Calculates the clinical Reminiscence Bump (ages 10-30) and its 3 developmental epochs.
 */
export function calculateReminiscenceBump(
  birthYear: number,
  referenceYear: number = 2026
): ReminiscenceBumpResult {
  const safeBirthYear = Math.max(1910, Math.min(referenceYear - 10, Math.round(birthYear)));
  const bumpStart = safeBirthYear + 10;
  const bumpEnd = safeBirthYear + 30;

  return {
    birthYear: safeBirthYear,
    currentAge: referenceYear - safeBirthYear,
    bumpStart,
    bumpEnd,
    epochs: [
      {
        id: 'epoch_1',
        name: 'Epoch 1: Formative Youth',
        ageRange: 'Ages 10–17',
        startYear: safeBirthYear + 10,
        endYear: safeBirthYear + 17,
        description:
          'Peak sensorimotor encoding in the ventral pre-SMA; early radio hits, school dances, and adolescent identity formation.',
      },
      {
        id: 'epoch_2',
        name: 'Epoch 2: Young Adulthood & Courtship',
        ageRange: 'Ages 18–24',
        startYear: safeBirthYear + 18,
        endYear: safeBirthYear + 24,
        description:
          'Maximum cACC affective salience; courtship anthems, first car, wedding dances, and intense autobiographical specificity.',
      },
      {
        id: 'epoch_3',
        name: 'Epoch 3: Early Family & Identity',
        ageRange: 'Ages 25–30',
        startYear: safeBirthYear + 25,
        endYear: safeBirthYear + 30,
        description:
          'Household songs, early career milestones, and calming domestic anchors that reinforce Default Mode Network (DMN) connectivity.',
      },
    ],
  };
}

/**
 * Determines which developmental epoch a song release year belongs to for a given birth year.
 */
export function getTrackEpochLabel(trackYear: number, birthYear: number): string {
  const ageAtRelease = trackYear - birthYear;
  if (ageAtRelease >= 10 && ageAtRelease <= 17) {
    return `Formative Youth (Age ${ageAtRelease})`;
  }
  if (ageAtRelease >= 18 && ageAtRelease <= 24) {
    return `Courtship & Young Adulthood (Age ${ageAtRelease})`;
  }
  if (ageAtRelease >= 25 && ageAtRelease <= 30) {
    return `Early Family Years (Age ${ageAtRelease})`;
  }
  if (ageAtRelease > 0 && ageAtRelease < 10) {
    return `Early Childhood Heritage (Age ${ageAtRelease})`;
  }
  return `Lifelong Favorite (${trackYear})`;
}

/**
 * Sequences the patient's approved biographical tracks into a 3-Phase Iso-Principle Trajectory
 * (Phase 1: State Match [0-7m], Phase 2: Acoustic Modulation Bridge [8-18m], Phase 3: Target Resolution [19-30m]),
 * excluding any Red Flag quarantined tracks.
 */
export function sequenceIsoPlaylist(
  library: BiographicalTrack[],
  currentStateId: CurrentEmotionalStateId,
  targetStateId: TargetTherapeuticStateId,
  quarantinedIds: string[] = [],
  birthYear: number = 1944
): IsoTrajectoryResult {
  const currentState =
    CURRENT_EMOTIONAL_STATES.find((s) => s.id === currentStateId) || CURRENT_EMOTIONAL_STATES[0];
  const targetState =
    TARGET_THERAPEUTIC_STATES.find((t) => t.id === targetStateId) || TARGET_THERAPEUTIC_STATES[0];

  const safeTracks = library.filter((t) => !quarantinedIds.includes(t.id));

  const startBpm = currentState.targetBpm;
  const endBpm = targetState.targetBpm;
  const midBpm = Math.round((startBpm + endBpm) / 2);

  const startEnergy = currentState.targetEnergy;
  const endEnergy = targetState.targetEnergy;
  const midEnergy = Math.round((startEnergy + endEnergy) / 2);

  const usedIds = new Set<string>();

  const pickBestTracksForPhase = (
    phaseNum: 1 | 2 | 3,
    phaseTargetBpm: number,
    phaseTargetEnergy: number,
    count: number
  ): SequencedTrack[] => {
    const candidates = safeTracks
      .filter((t) => !usedIds.has(t.id))
      .map((track) => {
        const bpmDiff = Math.abs(track.bpm - phaseTargetBpm);
        const energyDiff = Math.abs(track.energy - phaseTargetEnergy) * 4;
        const modeBonus =
          phaseNum === 3 && track.mode === targetState.preferredMode ? -5 : 0;
        const distance = bpmDiff + energyDiff + modeBonus;
        const isoFitScore = Math.max(68, Math.min(99, Math.round(100 - distance * 0.65)));

        return {
          track,
          distance,
          isoFitScore,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);

    // Sort within the phase so BPM flows smoothly from startBpm toward endBpm
    const direction = endBpm <= startBpm ? 'descending' : 'ascending';
    candidates.sort((a, b) =>
      direction === 'descending' ? b.track.bpm - a.track.bpm : a.track.bpm - b.track.bpm
    );

    return candidates.map(({ track, isoFitScore }) => {
      usedIds.add(track.id);
      const phaseName =
        phaseNum === 1
          ? 'Phase 1: State Match'
          : phaseNum === 2
          ? 'Phase 2: Acoustic Modulation Bridge'
          : 'Phase 3: Target Therapeutic Resolution';
      const phaseTimeWindow =
        phaseNum === 1
          ? 'Minutes 0–7'
          : phaseNum === 2
          ? 'Minutes 8–18'
          : 'Minutes 19–30';

      const clinicalRationale =
        phaseNum === 1
          ? `Isomorphic match (${track.bpm} BPM) captures attention at current arousal state (${currentState.label}) without acoustic friction.`
          : phaseNum === 2
          ? `Gradual autonomic bridge (${track.bpm} BPM, ${track.mode} mode) guides sympathetic tone along a controlled slope toward ${endBpm} BPM.`
          : `Consolidates ${targetState.label} (${track.bpm} BPM, ${track.mode} mode) via preserved cACC & DMN functional scaffolding.`;

      return {
        ...track,
        epochLabel: getTrackEpochLabel(track.year, birthYear),
        phase: phaseNum,
        phaseName,
        phaseTimeWindow,
        targetBpmForPhase: phaseTargetBpm,
        isoFitScore,
        clinicalRationale,
      };
    });
  };

  const phase1Tracks = pickBestTracksForPhase(1, startBpm, startEnergy, 3);
  const phase2Tracks = pickBestTracksForPhase(2, midBpm, midEnergy, 3);
  const phase3Tracks = pickBestTracksForPhase(3, endBpm, endEnergy, 3);

  const phases: IsoPhaseGroup[] = [
    {
      phase: 1,
      name: 'Phase 1: State Match (Isomorphic Capture)',
      timeWindow: 'Minutes 0–7',
      targetBpmRange: `${Math.max(55, startBpm - 8)}–${startBpm + 8} BPM`,
      clinicalObjective: `Match ${currentState.label} to validate internal state and prevent sensory rejection.`,
      neuroMechanism: 'Ventral pre-SMA motor capture & cACC familiarity tagging',
      tracks: phase1Tracks,
    },
    {
      phase: 2,
      name: 'Phase 2: Acoustic Modulation Bridge',
      timeWindow: 'Minutes 8–18',
      targetBpmRange: `${Math.min(startBpm, endBpm)}–${Math.max(startBpm, endBpm)} BPM Slope`,
      clinicalObjective:
        endBpm < startBpm
          ? 'Stepwise tempo & percussive density reduction to entrain heart rate downward.'
          : 'Gradual upward inflection in tempo and harmonic brightness to lift apathy.',
      neuroMechanism: 'Autonomic slope modulation & corticocerebellar synchronization',
      tracks: phase2Tracks,
    },
    {
      phase: 3,
      name: 'Phase 3: Target Therapeutic Resolution',
      timeWindow: 'Minutes 19–30',
      targetBpmRange: `${Math.max(58, endBpm - 6)}–${endBpm + 6} BPM (${targetState.preferredMode})`,
      clinicalObjective: `Consolidate ${targetState.label} and restore Progressively Lowered Stress Threshold (PLST).`,
      neuroMechanism: 'Default Mode Network (DMN) lucidity & vagal parasympathetic stabilization',
      tracks: phase3Tracks,
    },
  ];

  return {
    currentState,
    targetState,
    phases,
    orderedTracks: [...phase1Tracks, ...phase2Tracks, ...phase3Tracks],
  };
}
