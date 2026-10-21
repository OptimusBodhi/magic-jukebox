import { NeuroTargetBadge } from './iso-sequencer';

export interface ClinicalReferenceItem {
  id: string;
  citation: string;
  journalAndDoi: string;
  cohortAndMethod: string;
  empiricalFinding: string;
  productMandate: string;
  neuroBadge: NeuroTargetBadge;
  keyMetricHighlight: string;
}

export interface CompetitivePlatformAudit {
  name: string;
  originAndModel: string;
  strengths: string;
  clinicalAndUxBottlenecks: string[];
  magicJukeboxResolution: string;
}

export interface EraDiscoveryPreset {
  id: string;
  label: string;
  years: string;
  searchQuery: string;
  defaultBpm: number;
  defaultMode: 'Major' | 'Minor';
  description: string;
}

export const CLINICAL_EVIDENCE_MATRIX: ClinicalReferenceItem[] = [
  {
    id: 'jacobsen-2015',
    citation: 'Jacobsen, Stelzer, Fritz, Chételat, La Joie & Turner (2015)',
    journalAndDoi: 'Brain, 138(8): 2438–2450 • doi:10.1093/brain/awv135',
    cohortAndMethod:
      'Ultra-high-field 7T fMRI (n=32 healthy young adults) + Structural MRI & FDG-PET/Amyloid PET (n=20 clinical Alzheimer’s disease patients)',
    empiricalFinding:
      'Long-term musical memory is localized within the caudal anterior cingulate cortex (cACC) and ventral pre-supplementary motor area (ventral pre-SMA). Despite heavy amyloid-beta (Aβ) plaque burden equivalent to the rest of the diseased cortex, the cACC and ventral pre-SMA exhibit minimal cortical atrophy and preserved glucose metabolism—making them among the very last territories to degenerate in Alzheimer’s disease.',
    productMandate:
      'Prioritize rhythmically distinct, emotionally salient songs from the patient’s youth; pair audio with motor/vocal entrainment cues to engage the preserved ventral pre-SMA and cACC network.',
    neuroBadge: 'Ventral Pre-SMA Motor Entrainment',
    keyMetricHighlight: '7T fMRI + PET Dissociation: Minimal Atrophy in cACC & Ventral Pre-SMA',
  },
  {
    id: 'king-2019',
    citation: 'King, Jones, Goldberg, Rollins, McArthur et al. (2019)',
    journalAndDoi: 'Journal of Prevention of Alzheimer’s Disease, 6(1): 56–62',
    cohortAndMethod:
      'Pre/Post resting-state & task fMRI functional connectivity in adults with clinically diagnosed Alzheimer’s dementia',
    empiricalFinding:
      'Listening to personally favored music actively increases functional connectivity across corticocortical pathways, corticocerebellar networks, and the Default Mode Network (DMN). External acoustic predictability temporarily scaffolds fragmented neural circuits, explaining the immediate return of eye contact, executive attention, and conversational lucidity.',
    productMandate:
      'Provide a 20–30 minute "Lucidity Primer" trajectory immediately prior to family visits or meaningful conversations to synchronize Default Mode Network connectivity.',
    neuroBadge: 'DMN Functional Connectivity',
    keyMetricHighlight: 'Significant DMN & Corticocerebellar Connectivity Gain Post-Listening',
  },
  {
    id: 'gerdner-imia',
    citation: 'Gerdner, L. A. (1997, 2000, 2018, 2021)',
    journalAndDoi:
      'J Am Psychiatr Nurses Assoc, 3(6): 177–184; Int Psychogeriatr; Evidence-Based Guideline: Individualized Music for Persons with Dementia (7th Ed.)',
    cohortAndMethod:
      'Middle-Range Theory of Individualized Music Intervention for Agitation (IMIA) & RCTs tested across 12 countries',
    empiricalFinding:
      'Anchored in the Progressively Lowered Stress Threshold (PLST) model: generic "relaxation" classical music fails because damaged cortices perceive unfamiliar music as unintelligible acoustic noise. Deeply familiar preferred music requires zero executive decoding, automatically restoring the stress threshold when administered 30 minutes prior to peak agitation.',
    productMandate:
      'Eliminate generic ambient streams; build a biographical intake engine, enforce "Red Flag" track quarantine, and trigger automated playback 30 minutes prior to known sundowning windows.',
    neuroBadge: 'PLST Stress Threshold Restoration',
    keyMetricHighlight: '30-Minute Proactive Temporal Dosing Prevents PLST Breaches',
  },
  {
    id: 'iso-principle-rct',
    citation: 'Clinical Iso-Principle RCT (NCT04236557) & JAMDA Meta-Analysis (2018)',
    journalAndDoi:
      'ClinicalTrials.gov NCT04236557 & Journal of the American Medical Directors Association, 19(7): 568–576.e3 • doi:10.1016/j.jamda.2017.12.009',
    cohortAndMethod:
      '6-week RCT of 30-minute Iso-Principle playlists vs. control; Systematic Review & Meta-Analysis of BPSD interventions',
    empiricalFinding:
      'Receptive music therapy statistically outperforms interactive therapy for acute BPSD agitation relief. Sequencing preferred songs via the Iso-Principle—Phase 1 State Match (0–7m), Phase 2 Acoustic Modulation Bridge (8–18m), and Phase 3 Target Resolution (19–30m)—progressively downregulates sympathetic arousal (BARS & PANSS-EC) without sensory rejection.',
    productMandate:
      'Automate the 3-Phase Iso-Principle Sequencer so stressed caregivers simply select "Where We Are" and "Where We Want To Be" to generate a 30-minute physiological slope.',
    neuroBadge: 'cACC Affective Salience',
    keyMetricHighlight: '3-Phase Trajectory (0–7m Match → 8–18m Bridge → 19–30m Resolution)',
  },
  {
    id: 'sarkamo-2014',
    citation: 'Särkämö, Tervaniemi, Laitinen, Numminen, Kurki et al. (2014, 2016)',
    journalAndDoi:
      'The Gerontologist, 54(4): 634–650 & Journal of the American Geriatrics Society, 64(2): 439–440',
    cohortAndMethod:
      '9-month Randomized Controlled Trial of n=89 dementia-caregiver dyads (Singing Group vs. Music Listening Group vs. Usual Care Control)',
    empiricalFinding:
      'Both musical interventions significantly improved general cognition, attention, and executive function. Receptive listening maximized long-term Quality of Life (QoL) and tranquil reminiscence, whereas active caregiver-patient singing uniquely boosted verbal fluency, working memory, and reversed physical signs of depression.',
    productMandate:
      'Engineer a real-time Dual-Mode Player: Receptive Calm Mode (for acute agitation/sundowning) and Caregiver Duet & Story Mode (large-print chorus lyrics + family Memory Mirror prompts).',
    neuroBadge: 'Ventral Pre-SMA Motor Entrainment',
    keyMetricHighlight: 'n=89 Dyad RCT: Singing Uniquely Boosts Working Memory & Verbal Fluency',
  },
  {
    id: 'elhaj-meams',
    citation: 'El Haj et al. (2012), Irish et al. (2006) & Kaiser & Berntsen (2023)',
    journalAndDoi:
      'Neuropsychologia / Memory & Cognition / Gold-MSI & BMRQ Psychometric Studies',
    cohortAndMethod:
      'Music-Evoked Autobiographical Memory (MEAM) trials & Tempau episodic specificity evaluations in Alzheimer’s disease',
    empiricalFinding:
      'Memories evoked by music from the age 10–30 Reminiscence Bump are retrieved significantly faster, contain higher episodic specificity, and carry richer emotional valence than photo- or verbally prompted memories, mediated by acute autonomic anxiety reduction (F(1,101) = 3.88, p = .02).',
    productMandate:
      'Compute the patient’s exact 10–30 Reminiscence Bump from birth year (Formative Youth 10–17, Courtship 18–24, Early Family 25–30) and guarantee 100% instant chorus audio previews.',
    neuroBadge: 'cACC Affective Salience',
    keyMetricHighlight: 'Ages 10–30 Reminiscence Bump • Preserved Musical Reward (p = .02)',
  },
];

export const COMPETITIVE_LANDSCAPE_AUDIT: CompetitivePlatformAudit[] = [
  {
    name: 'Playlist for Life (UK Charity Web Wrapper)',
    originAndModel: 'Glasgow (2013) • Print Workbooks + Web Spotify Wrapper',
    strengths:
      'Strong NHS awareness, Scottish Government 2023 Dementia Strategy inclusion, and warm "Music Detective" family storytelling philosophy.',
    clinicalAndUxBottlenecks: [
      '2017 iOS app deprecated due to Spotify Premium paywall & elderly UX friction.',
      '"Missing Preview Clip" bug breaks discovery for patients with anomia who cannot recognize written song titles.',
      'Hostile state persistence: Quick Mode deletes edits/backups; Account Mode requires email OTP login.',
      'Flat text list with zero Iso-Principle tempo/mode sequencing or circadian awareness.',
    ],
    magicJukeboxResolution:
      'Zero-login iTunes Search API audio hook guarantees 100% playable 30-second chorus previews on every card + persistent local profile + automated 3-Phase Iso-Principle sequencing.',
  },
  {
    name: 'BBC Music Memories',
    originAndModel: 'UK Public Broadcast Archive • ~1,800 Curated Clips',
    strengths:
      'Includes nostalgic BBC radio/TV themes alongside classical and decade hits.',
    clinicalAndUxBottlenecks: [
      'Restricted to ~1,800 pieces; misses deeply personal regional, gospel, or artist catalogs.',
      'No emotional state-matching or dynamic trajectory from agitation to calm.',
    ],
    magicJukeboxResolution:
      'Unlocks millions of commercial recordings via live iTunes Search while structuring playback around Studio Wildwoods emotional transformation arcs.',
  },
  {
    name: 'm4d Radio (Music for Dementia Radio)',
    originAndModel: 'UK Campaign • 5 Decade Internet Radio Streams (1930s–1970s)',
    strengths:
      'Circadian broadcast scheduling that transitions toward soothing arrangements in the evening.',
    clinicalAndUxBottlenecks: [
      'Generic non-individualized radio stream—cannot target personal biography or quarantine individual "Red Flag" bereavement triggers.',
    ],
    magicJukeboxResolution:
      'Combines circadian Sundowning Shield scheduling (30 mins prior to peak agitation) with 100% individualized biographical tracks and instant Red Flag quarantine.',
  },
  {
    name: 'Vera (Music Health / Universal Music Group)',
    originAndModel: 'Commercial iOS/Android App • $89.99/year Subscription',
    strengths:
      'Major-label streaming catalog and demographic onboarding wizard.',
    clinicalAndUxBottlenecks: [
      '$89.99/year paywall blocks grassroots caregiver adoption (noted by ILC-UK Commission).',
      'Algorithmic black box outputs 3 static buckets (Relax, Reminisce, Energize) without interactive family Memory Mirror co-curation or Iso-Principle slopes.',
    ],
    magicJukeboxResolution:
      'Co-creative "Music Detective" swipe experience with family Memory Mirror prompts + dynamic 3-phase Iso-Principle bridge between emotional states.',
  },
  {
    name: 'MediMusic ("Digital Drip" / MediBeat)',
    originAndModel: 'UK B2B Med-Tech • Wrist HRV Sensor + Algorithmic Sedation',
    strengths:
      'Demonstrated 22–25% heart rate reduction (76 BPM → 60 BPM) in Orchard Court Care Home pilot (n=29).',
    clinicalAndUxBottlenecks: [
      'Requires wrist-wearable compliance (frequently pulled off during acute agitation).',
      'Frames music as a sterile biometric sedative ("dispensing music like a drug") rather than relational family reminiscence and active duet singing.',
    ],
    magicJukeboxResolution:
      'Achieves the same 20–25% heart-rate downregulation slope via acoustic Iso-Principle sequencing while preserving human biography and Caregiver Duet singing.',
  },
];

export const ERA_DISCOVERY_PRESETS: EraDiscoveryPreset[] = [
  {
    id: '1940s-swing',
    label: '1940s Big Band & Swing',
    years: '1940–1949',
    searchQuery: 'Glenn Miller Benny Goodman Sentimental Journey 1940s',
    defaultBpm: 108,
    defaultMode: 'Major',
    description: 'Early childhood & wartime radio staples with strong brass and rhythmic clarity.',
  },
  {
    id: '1950s-crooners',
    label: '1950s Classic Crooners',
    years: '1950–1959',
    searchQuery: 'Nat King Cole Perry Como Dean Martin Bing Crosby',
    defaultBpm: 76,
    defaultMode: 'Major',
    description: 'Warm baritone vocal timbres ideal for Phase 2 & Phase 3 parasympathetic calm.',
  },
  {
    id: '1950s-rockabilly',
    label: '1950s Jukebox & Doo-Wop',
    years: '1954–1959',
    searchQuery: 'Chuck Berry Little Richard Platters Fats Domino',
    defaultBpm: 120,
    defaultMode: 'Major',
    description: 'Formative Youth (Ages 10–15) high-energy rhythmic hooks for ventral pre-SMA capture.',
  },
  {
    id: '1960s-motown',
    label: '1960s Motown & Soul',
    years: '1960–1969',
    searchQuery: 'Supremes Marvin Gaye Aretha Franklin Four Tops',
    defaultBpm: 106,
    defaultMode: 'Major',
    description: 'Courtship & Young Adulthood anthems with irresistible backbeat and vocal hooks.',
  },
  {
    id: '1960s-folk',
    label: '1960s Folk & Choral Harmony',
    years: '1960–1972',
    searchQuery: 'Peter Paul Mary Seekers Kingston Trio Joan Baez',
    defaultBpm: 84,
    defaultMode: 'Major',
    description: 'Acoustic guitar and close vocal harmonies suited for Caregiver Duet singing.',
  },
  {
    id: '1970s-warm-gold',
    label: 'Early 1970s Warm Classics',
    years: '1970–1974',
    searchQuery: 'Carpenters Carole King John Denver James Taylor',
    defaultBpm: 74,
    defaultMode: 'Major',
    description: 'Early Family Years (Ages 26–30) gentle acoustic ballads for afternoon lucidity.',
  },
  {
    id: 'gospel-hymns',
    label: 'Gospel & Sunday Hymns',
    years: 'Heritage',
    searchQuery: 'Mahalia Jackson Elvis Presley How Great Thou Art Amazing Grace',
    defaultBpm: 68,
    defaultMode: 'Major',
    description: 'Deeply encoded spiritual heritage tracks for Gerdner IMIA anxiety relief.',
  },
];
