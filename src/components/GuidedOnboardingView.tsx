'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Heart,
  ShieldAlert,
  Clock,
  Music,
  UserCheck,
  Brain,
  Radio,
  Compass,
  Wand2,
} from 'lucide-react';
import {
  ACOUSTIC_SENSITIVITY_OPTIONS,
  GuidedInterviewAnswers,
  SAMPLE_INTERVIEW_PERSONAS,
  SANCTUARY_STYLE_OPTIONS,
  YOUTH_STYLE_OPTIONS,
  synthesizeInterviewIntoJukebox,
} from '@/lib/onboarding-interview';
import {
  BiographicalTrack,
  CurrentEmotionalStateId,
  PatientProfile,
  TargetTherapeuticStateId,
  calculateReminiscenceBump,
  CURRENT_EMOTIONAL_STATES,
  TARGET_THERAPEUTIC_STATES,
} from '@/lib/iso-sequencer';

interface GuidedOnboardingViewProps {
  startBlank?: boolean;
  onCompleteInterview: (payload: {
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
    initialCurrentState: CurrentEmotionalStateId;
    initialTargetState: TargetTherapeuticStateId;
    isCustom: boolean;
  }) => void;
}

const INTERVIEW_STEPS = [
  {
    step: 1,
    title: 'Identity & Reminiscence Window',
    subtitle: 'Calculates the Ages 10–30 Neural Encoding Window',
    clinicalBadge: 'El Haj et al. (2012) • MEAMs',
  },
  {
    step: 2,
    title: 'Formative Youth & Rhythm (Ages 10–17)',
    subtitle: 'Phase 1 High-Energy Motor Capture (110–125 BPM)',
    clinicalBadge: 'Jacobsen et al. (2015) • Ventral Pre-SMA',
  },
  {
    step: 3,
    title: 'Courtship & Heart Songs (Ages 18–25)',
    subtitle: 'Peak Emotional Salience & Phase 2 Bridge (82–102 BPM)',
    clinicalBadge: 'Jacobsen et al. (2015) • Preserved cACC',
  },
  {
    step: 4,
    title: 'Sanctuary, Faith & Deep Calm',
    subtitle: 'Phase 3 Parasympathetic Resolution (60–70 BPM)',
    clinicalBadge: 'Gerdner IMIA / PLST Restoration',
  },
  {
    step: 5,
    title: 'Red Flag Trauma & Trigger Screen',
    subtitle: 'Pre-Quarantines Bereavement or Overstimulating Tracks',
    clinicalBadge: 'Gerdner Safety Quarantine Rule',
  },
  {
    step: 6,
    title: 'Circadian Shield & Compass Calibration',
    subtitle: 'Sets 30-Min Proactive Sundowning Lead & Starting Arc',
    clinicalBadge: 'Trial NCT04236557 Iso-Principle',
  },
];

const BLANK_FAMILY_ANSWERS: GuidedInterviewAnswers = {
  fullName: '',
  preferredName: '',
  birthYear: 1945,
  hometown: '',
  formerOccupation: '',
  culturalUpbringing: '',
  youthStyles: ['rock_n_roll_jukebox'],
  youthFavoriteArtistOrSong: '',
  youthDanceMemory: '',
  spouseOrCompanionName: '',
  courtshipSongOrArtist: '',
  courtshipMemoryStory: '',
  vocalPreference: 'solo_crooners',
  sanctuaryStyles: ['velvet_crooner_ballads'],
  sanctuarySpecificSong: '',
  sanctuaryMemoryPrompt: '',
  redFlagSongsOrArtists: '',
  redFlagReason: '',
  acousticSensitivities: [],
  primaryVulnerabilityWindow: 'sundowning_afternoon',
  sundowningPeakTime: '16:30',
  initialCurrentState: 'agitated_sundowning',
  initialTargetState: 'deep_calm',
};

export default function GuidedOnboardingView({
  startBlank = false,
  onCompleteInterview,
}: GuidedOnboardingViewProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activePersonaId, setActivePersonaId] = useState<string>(
    startBlank ? 'custom-blank' : 'eleanor-1938'
  );
  const [answers, setAnswers] = useState<GuidedInterviewAnswers>(
    startBlank ? BLANK_FAMILY_ANSWERS : SAMPLE_INTERVIEW_PERSONAS[0].answers
  );
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  const bump = calculateReminiscenceBump(answers.birthYear);

  const handleStartBlankCustom = () => {
    setActivePersonaId('custom-blank');
    setAnswers({ ...BLANK_FAMILY_ANSWERS });
    setCurrentStep(1);
  };

  const handleLoadPersona = (personaId: string) => {
    const found = SAMPLE_INTERVIEW_PERSONAS.find((p) => p.id === personaId);
    if (found) {
      setActivePersonaId(found.id);
      setAnswers({ ...found.answers });
    }
  };

  const toggleArrayItem = (list: string[], value: string): string[] => {
    return list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
  };

  const handleBuildPersonalizedJukebox = async () => {
    setIsSynthesizing(true);
    try {
      const effectiveAnswers: GuidedInterviewAnswers = {
        ...answers,
        fullName: answers.fullName.trim() || 'My Loved One',
        preferredName:
          answers.preferredName.trim() ||
          answers.fullName.trim().split(' ')[0] ||
          'My Loved One',
      };
      const result = await synthesizeInterviewIntoJukebox(effectiveAnswers);
      onCompleteInterview({
        ...result,
        initialCurrentState: effectiveAnswers.initialCurrentState,
        initialTargetState: effectiveAnswers.initialTargetState,
        isCustom: true,
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & 1-Click Sample Persona Presets */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wildwoods-amber/20 border border-wildwoods-amber text-wildwoods-gold text-xs font-bold uppercase tracking-wider">
              <Wand2 className="w-3.5 h-3.5" />
              Guided Clinical &amp; Biographical Intake Interview
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold">
              The 6-Question “Music Detective” Guided Interview
            </h1>
            <p className="text-wildwoods-mint text-sm md:text-base max-w-3xl">
              Eliminates the caregiver “Blank Search Bar” problem. Modeled on{' '}
              <strong className="text-wildwoods-cream">
                Dr. Linda Gerdner’s Assessment of Individualized Personal Music (IMIA)
              </strong>{' '}
              and the{' '}
              <strong className="text-wildwoods-gold">
                Studio Wildwoods Iso-Principle
              </strong>
              , each question targets a specific neural hub and phase of the 30-minute therapeutic
              arc.
            </p>
          </div>

          <button
            type="button"
            disabled={isSynthesizing}
            onClick={handleBuildPersonalizedJukebox}
            className="min-h-[56px] px-7 py-3.5 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-sm md:text-base flex items-center justify-center gap-2.5 shadow-xl shrink-0 transition"
          >
            <Sparkles className="w-5 h-5" />
            {isSynthesizing
              ? `Synthesizing ${answers.preferredName}’s Live iTunes Jukebox...`
              : `Instant-Build ${answers.preferredName}’s Jukebox Now`}
          </button>
        </div>

        {/* Clear Toggle: Blank Form for Your Own Loved One vs. Pre-Filled Demo Personas */}
        <div className="pt-4 border-t border-wildwoods-moss space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold uppercase tracking-wider text-wildwoods-gold flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Choose How to Start: Blank Form for Your Loved One — or Test with a Sample Demo Persona
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={handleStartBlankCustom}
              className={`text-left p-4 rounded-2xl border-2 transition ${
                activePersonaId === 'custom-blank'
                  ? 'bg-wildwoods-amber text-wildwoods-slate border-white shadow-lg'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss border-wildwoods-amber/60 text-wildwoods-cream'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-sm">
                  ✨ Start Blank (For My Loved One)
                </span>
                {activePersonaId === 'custom-blank' && (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
              </div>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  activePersonaId === 'custom-blank'
                    ? 'text-wildwoods-slate/90 font-medium'
                    : 'text-wildwoods-mint'
                }`}
              >
                Clear all demo fields and enter your own family member’s birth year and favorite
                music.
              </p>
            </button>

            {SAMPLE_INTERVIEW_PERSONAS.map((persona) => {
              const isSelected = activePersonaId === persona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handleLoadPersona(persona.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition ${
                    isSelected
                      ? 'bg-wildwoods-forest border-wildwoods-amber text-wildwoods-cream shadow-lg'
                      : 'bg-wildwoods-forest/50 hover:bg-wildwoods-forest border-wildwoods-moss text-wildwoods-mint'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-wildwoods-cream">
                      DEMO: {persona.badge}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-wildwoods-gold shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-wildwoods-mint mt-1 leading-relaxed">
                    {persona.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6-Step Progress Rail & Main Interview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 Columns: Interactive 6-Step Clinical Progress Map */}
        <aside className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-md border border-wildwoods-sand space-y-2.5">
          <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage px-2 pb-1">
            6 High-Impact Clinical Domains
          </div>
          {INTERVIEW_STEPS.map((item) => {
            const isCurrent = item.step === currentStep;
            const isDone = item.step < currentStep;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                    : isDone
                    ? 'bg-emerald-50/70 text-wildwoods-slate border-emerald-200'
                    : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-wildwoods-amber text-wildwoods-slate'
                      : isDone
                      ? 'bg-emerald-700 text-white'
                      : 'bg-wildwoods-sand text-wildwoods-slate'
                  }`}
                >
                  {item.step}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-snug">{item.title}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isCurrent ? 'text-wildwoods-mint' : 'text-slate-600'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                  <div
                    className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-wildwoods-forest text-wildwoods-gold'
                        : 'bg-wildwoods-parchment text-wildwoods-sage'
                    }`}
                  >
                    {item.clinicalBadge}
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right 8 Columns: Active Interview Step Form */}
        <section className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-wildwoods-sand space-y-6">
          {/* STEP 1: Identity & Reminiscence Window */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-wildwoods-slate text-wildwoods-cream border border-wildwoods-moss flex items-start gap-3">
                <Brain className="w-6 h-6 text-wildwoods-gold shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-wildwoods-gold uppercase tracking-wider block mb-0.5">
                    Why Question 1 Matters Clinically (Ages 10–30 Reminiscence Bump):
                  </strong>
                  Musical experiences between ages 10 and 30 are encoded with maximum neuroplastic
                  durability in the caudal anterior cingulate cortex (cACC). Knowing your loved
                  one’s exact birth year and hometown lets us target the exact 20-year window when
                  their lifelong musical identity formed.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Loved One’s Full Name
                  </label>
                  <input
                    type="text"
                    value={answers.fullName}
                    onChange={(e) => setAnswers({ ...answers, fullName: e.target.value })}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand font-semibold text-wildwoods-slate"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Preferred Name (Used in Duet Prompts)
                  </label>
                  <input
                    type="text"
                    value={answers.preferredName}
                    onChange={(e) => setAnswers({ ...answers, preferredName: e.target.value })}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand font-semibold text-wildwoods-slate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-wildwoods-parchment p-5 rounded-2xl border border-wildwoods-sand">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate mb-1">
                    Birth Year
                  </label>
                  <input
                    type="number"
                    min={1915}
                    max={2005}
                    value={answers.birthYear}
                    onChange={(e) =>
                      setAnswers({ ...answers, birthYear: Number(e.target.value) || 1944 })
                    }
                    className="w-full min-h-[52px] px-4 py-2 rounded-xl bg-wildwoods-slate text-wildwoods-gold font-serif font-bold text-2xl text-center"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-wildwoods-sage">
                    Computed 20-Year Core Reminiscence Bump:
                  </div>
                  <div className="text-xl font-serif font-bold text-wildwoods-slate">
                    {bump.bumpStart} – {bump.bumpEnd} (Ages 10 to 30 • Current Age: {bump.currentAge})
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {bump.epochs.map((ep) => (
                      <span
                        key={ep.id}
                        className="px-2.5 py-1 rounded-lg bg-white border border-wildwoods-sand font-semibold text-wildwoods-slate"
                      >
                        {ep.ageRange}: <strong>{ep.startYear}–{ep.endYear}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Hometown / Regional Roots (During Youth)
                  </label>
                  <input
                    type="text"
                    value={answers.hometown}
                    onChange={(e) => setAnswers({ ...answers, hometown: e.target.value })}
                    placeholder="e.g., Savannah, GA or Glasgow, Scotland"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Former Occupation, Craft, or Role
                  </label>
                  <input
                    type="text"
                    value={answers.formerOccupation}
                    onChange={(e) => setAnswers({ ...answers, formerOccupation: e.target.value })}
                    placeholder="e.g., Schoolteacher, Carpenter, Choir Singer"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Cultural, Ethnic, or Family Musical Heritage
                </label>
                <input
                  type="text"
                  value={answers.culturalUpbringing}
                  onChange={(e) => setAnswers({ ...answers, culturalUpbringing: e.target.value })}
                  placeholder="e.g., Southern Gospel, Big Band Swing, Motown Soul, Celtic Folk"
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Formative Youth & Motor Rhythmic Capture (Ages 10-17) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-wildwoods-slate text-wildwoods-cream border border-wildwoods-moss flex items-start gap-3">
                <Radio className="w-6 h-6 text-wildwoods-gold shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-wildwoods-gold uppercase tracking-wider block mb-0.5">
                    Why Question 2 Matters Clinically (Phase 1 Iso-Principle State Match • 110–125 BPM):
                  </strong>
                  When {answers.preferredName} is experiencing high-energy agitation or late-afternoon
                  pacing, playing a slow lullaby immediately causes psychological rejection. We need
                  brisk, rhythmically unmistakable songs from their teen years ({bump.epochs[0].startYear}–
                  {bump.epochs[0].endYear}) to engage the preserved{' '}
                  <strong>ventral pre-SMA motor hub</strong> first, matching their internal energy
                  before stepping tempo downward.
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate">
                  What upbeat styles played on the radio or at dances during {answers.preferredName}’s
                  teen years ({bump.epochs[0].startYear}–{bump.epochs[0].endYear})?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {YOUTH_STYLE_OPTIONS.map((opt) => {
                    const selected = answers.youthStyles.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            youthStyles: toggleArrayItem(answers.youthStyles, opt.id),
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left transition ${
                          selected
                            ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                            : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm">{opt.label}</span>
                          {selected && (
                            <CheckCircle2 className="w-4 h-4 text-wildwoods-gold shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            selected ? 'text-wildwoods-mint' : 'text-slate-600'
                          }`}
                        >
                          {opt.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Specific Teenage Upbeat Artist or Song (We will fetch the real 30s chorus stream):
                </label>
                <input
                  type="text"
                  value={answers.youthFavoriteArtistOrSong}
                  onChange={(e) =>
                    setAnswers({ ...answers, youthFavoriteArtistOrSong: e.target.value })
                  }
                  placeholder="e.g., Glenn Miller In the Mood, Elvis Presley All Shook Up, The Supremes"
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Youth Rhythm or Dance Memory (Displayed in Caregiver Duet Mode):
                </label>
                <input
                  type="text"
                  value={answers.youthDanceMemory}
                  onChange={(e) => setAnswers({ ...answers, youthDanceMemory: e.target.value })}
                  placeholder="e.g., Used to jitterbug on the porch or tap a ruler on the workbench..."
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Courtship, Wedding & Peak Heart Songs (Ages 18-25) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-wildwoods-slate text-wildwoods-cream border border-wildwoods-moss flex items-start gap-3">
                <Heart className="w-6 h-6 text-wildwoods-gold shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-wildwoods-gold uppercase tracking-wider block mb-0.5">
                    Why Question 3 Matters Clinically (cACC Affective Salience &amp; Phase 2 Bridge):
                  </strong>
                  Songs from young adulthood and courtship ({bump.epochs[1].startYear}–
                  {bump.epochs[1].endYear}) trigger the fastest, most vivid Music-Evoked
                  Autobiographical Memories (MEAMs). In our Iso-Principle Sequencer, these mid-tempo
                  heart songs (80–102 BPM) form <strong>Phase 2: The Acoustic Modulation Bridge</strong>,
                  guiding the nervous system smoothly from restlessness toward calm connection.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Spouse, Partner, or Closest Companion’s Name
                  </label>
                  <input
                    type="text"
                    value={answers.spouseOrCompanionName}
                    onChange={(e) =>
                      setAnswers({ ...answers, spouseOrCompanionName: e.target.value })
                    }
                    placeholder="e.g., Clara, Walter, Elena"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    “Their Song” (Wedding Dance, Courtship Song, or Favorite Crooner)
                  </label>
                  <input
                    type="text"
                    value={answers.courtshipSongOrArtist}
                    onChange={(e) =>
                      setAnswers({ ...answers, courtshipSongOrArtist: e.target.value })
                    }
                    placeholder="e.g., Nat King Cole Mona Lisa, The Temptations My Girl, Frank Sinatra"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  The Story Behind This Song (Becomes a Caregiver Duet Conversation Prompt):
                </label>
                <textarea
                  rows={2}
                  value={answers.courtshipMemoryStory}
                  onChange={(e) =>
                    setAnswers({ ...answers, courtshipMemoryStory: e.target.value })
                  }
                  placeholder="e.g., Sang this on the ferry in the summer of 1964 before getting engaged..."
                  className="w-full px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Vocal vs. Instrumental Timbre Preference (Gerdner IMIA Assessment Item):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'solo_crooners',
                      label: 'Warm Solo Crooners (Sinatra, Nat King Cole, Patsy Cline)',
                    },
                    {
                      id: 'vocal_harmonies',
                      label: 'Close Vocal Harmonies (Temptations, Beatles, Choir Duets)',
                    },
                    {
                      id: 'instrumental_warm',
                      label: 'Lush Big Band, Acoustic Guitar & Piano Standards',
                    },
                    {
                      id: 'mixed_favorites',
                      label: 'Balanced Mix of Vocal Classics & Melodic Standards',
                    },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          vocalPreference: v.id as GuidedInterviewAnswers['vocalPreference'],
                        })
                      }
                      className={`p-3.5 rounded-xl border text-left text-xs font-bold transition ${
                        answers.vocalPreference === v.id
                          ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber'
                          : 'bg-wildwoods-cream text-wildwoods-slate border-wildwoods-sand'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Sanctuary, Faith & Deep Calm Anchors (Phase 3 Resolution) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-wildwoods-slate text-wildwoods-cream border border-wildwoods-moss flex items-start gap-3">
                <Music className="w-6 h-6 text-wildwoods-gold shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-wildwoods-gold uppercase tracking-wider block mb-0.5">
                    Why Question 4 Matters Clinically (Phase 3 Therapeutic Resolution • 60–70 BPM):
                  </strong>
                  Dr. Linda Gerdner proved that generic “relaxation” music fails in dementia because
                  an overwhelmed cortex treats unfamiliar melodies as cognitive noise. To entrain
                  heart rate downward by 20–25% during minutes 19–30, we need deeply familiar,
                  slow-tempo songs (60–70 BPM, Major mode) that require <strong>zero executive decoding</strong>.
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate">
                  Which comforting, slow-tempo styles make {answers.preferredName} feel safest and
                  most at home?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SANCTUARY_STYLE_OPTIONS.map((opt) => {
                    const selected = answers.sanctuaryStyles.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            sanctuaryStyles: toggleArrayItem(answers.sanctuaryStyles, opt.id),
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left transition ${
                          selected
                            ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                            : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm">{opt.label}</span>
                          {selected && (
                            <CheckCircle2 className="w-4 h-4 text-wildwoods-gold shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            selected ? 'text-wildwoods-mint' : 'text-slate-600'
                          }`}
                        >
                          {opt.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Signature Sanctuary Song, Hymn, or Lullaby (Phase 3 Anchor Track):
                </label>
                <input
                  type="text"
                  value={answers.sanctuarySpecificSong}
                  onChange={(e) =>
                    setAnswers({ ...answers, sanctuarySpecificSong: e.target.value })
                  }
                  placeholder="e.g., Louis Armstrong What a Wonderful World, Mahalia Jackson Amazing Grace"
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Peaceful Sensory Cue or Conversation Prompt for Caregivers:
                </label>
                <input
                  type="text"
                  value={answers.sanctuaryMemoryPrompt}
                  onChange={(e) =>
                    setAnswers({ ...answers, sanctuaryMemoryPrompt: e.target.value })
                  }
                  placeholder="e.g., Look out at the trees together and breathe slowly during the chorus..."
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Red Flag Trauma & Trigger Screen */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-red-950 text-red-100 border border-red-500/40 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-red-300 uppercase tracking-wider block mb-0.5">
                    Why Question 5 Matters Clinically (Gerdner Red Flag Quarantine Rule):
                  </strong>
                  Even a beloved song from the 1950s can trigger acute distress if it was played at
                  a spouse’s or sibling’s funeral, or if its acoustic profile overstimulates the
                  listener. Pre-quarantining known triggers ensures no visiting nurse or family
                  member ever plays a distress-linked track.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Any Specific Song or Artist Linked to Grief, Bereavement, or Distress?
                </label>
                <input
                  type="text"
                  value={answers.redFlagSongsOrArtists}
                  onChange={(e) =>
                    setAnswers({ ...answers, redFlagSongsOrArtists: e.target.value })
                  }
                  placeholder="e.g., Danny Boy, Taps, or leave blank if none known"
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Reason for Red Flag Quarantine (Logged in Care Team Safety Vault):
                </label>
                <input
                  type="text"
                  value={answers.redFlagReason}
                  onChange={(e) => setAnswers({ ...answers, redFlagReason: e.target.value })}
                  placeholder="e.g., Played at brother's funeral — triggers facial sadness cues."
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate">
                  Acoustic Sensitivities to Avoid:
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACOUSTIC_SENSITIVITY_OPTIONS.map((sens) => {
                    const active = answers.acousticSensitivities.includes(sens);
                    return (
                      <button
                        key={sens}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            acousticSensitivities: toggleArrayItem(
                              answers.acousticSensitivities,
                              sens
                            ),
                          })
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                          active
                            ? 'bg-red-900 text-white border-red-700'
                            : 'bg-wildwoods-cream text-wildwoods-slate border-wildwoods-sand'
                        }`}
                      >
                        {sens}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Circadian Vulnerability & Starting Emotional Compass Calibration */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-wildwoods-slate text-wildwoods-cream border border-wildwoods-moss flex items-start gap-3">
                <Compass className="w-6 h-6 text-wildwoods-gold shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-wildwoods-gold uppercase tracking-wider block mb-0.5">
                    Why Question 6 Matters Clinically (30-Min Proactive Dosing &amp; Iso-Principle Arc):
                  </strong>
                  Waiting until agitation reaches BARS 6–7 often results in headphone or speaker
                  rejection. Setting {answers.preferredName}’s typical daily stress window arms the{' '}
                  <strong>Sundowning Shield 30 minutes prior</strong> and calibrates the starting
                  Emotional Compass.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-wildwoods-parchment p-5 rounded-2xl border border-wildwoods-sand">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate mb-1">
                    Typical Peak Agitation / Sundowning Time
                  </label>
                  <input
                    type="time"
                    value={answers.sundowningPeakTime}
                    onChange={(e) =>
                      setAnswers({ ...answers, sundowningPeakTime: e.target.value })
                    }
                    className="w-full min-h-[48px] px-4 py-2 rounded-xl bg-wildwoods-slate text-wildwoods-gold font-mono font-bold text-lg"
                  />
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-wildwoods-slate flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-wildwoods-sage" />
                    Gerdner 30-Minute Proactive Shield Armed
                  </div>
                  <p>
                    The Magic Jukebox will prompt or initiate {answers.preferredName}’s 30-minute
                    Iso-Principle arc <strong>30 minutes prior</strong> to peak vulnerability.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Starting Emotional State (“Where We Are”)
                  </label>
                  <select
                    value={answers.initialCurrentState}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        initialCurrentState: e.target.value as CurrentEmotionalStateId,
                      })
                    }
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand font-bold text-xs text-wildwoods-slate"
                  >
                    {CURRENT_EMOTIONAL_STATES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.targetBpm} BPM)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Target Therapeutic Goal (“Where We Want To Be”)
                  </label>
                  <select
                    value={answers.initialTargetState}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        initialTargetState: e.target.value as TargetTherapeuticStateId,
                      })
                    }
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand font-bold text-xs text-wildwoods-slate"
                  >
                    {TARGET_THERAPEUTIC_STATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} ({t.targetBpm} BPM)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-wildwoods-parchment">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-wildwoods-parchment hover:bg-wildwoods-sand disabled:opacity-40 text-wildwoods-slate font-bold text-sm flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Question
            </button>

            <div className="flex items-center gap-3">
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
                  className="min-h-[52px] px-6 py-3 rounded-2xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-cream font-bold text-sm flex items-center gap-2 shadow-md transition"
                >
                  Next Impact Question (Step {currentStep + 1} of 6)
                  <ArrowRight className="w-4 h-4 text-wildwoods-gold" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSynthesizing}
                  onClick={handleBuildPersonalizedJukebox}
                  className="min-h-[54px] px-8 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-base flex items-center gap-2.5 shadow-xl transition"
                >
                  <Sparkles className="w-5 h-5" />
                  {isSynthesizing
                    ? 'Fetching Live iTunes Streams & Sequencing...'
                    : `Generate ${answers.preferredName}’s Iso-Principle Jukebox`}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
