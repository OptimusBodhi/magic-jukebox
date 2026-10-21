'use client';

import React, { useState, useRef } from 'react';
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
  Volume2,
  Square,
  HelpCircle,
  Zap,
  SlidersHorizontal,
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
import { searchItunesTracks } from '@/lib/itunes-audio';

interface GuidedOnboardingViewProps {
  startBlank?: boolean;
  onOpenTutorial?: () => void;
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
    title: '1. Name & Birth Year',
    subtitle: 'Finds their golden teenage & young-adult song years (ages 10–30)',
    clinicalBadge: 'El Haj et al. (2012) • MEAMs',
  },
  {
    step: 2,
    title: '2. Upbeat Teen Favorites',
    subtitle: 'Lively radio & dance songs from ages 10–17',
    clinicalBadge: 'Jacobsen et al. (2015) • Ventral Pre-SMA',
  },
  {
    step: 3,
    title: '3. Wedding & Heart Songs',
    subtitle: 'Special love songs & favorite singers from ages 18–25',
    clinicalBadge: 'Jacobsen et al. (2015) • Preserved cACC',
  },
  {
    step: 4,
    title: '4. Peaceful & Comfort Songs',
    subtitle: 'Slow, soothing favorites, hymns, or ballads for calm',
    clinicalBadge: 'Gerdner IMIA / PLST Restoration',
  },
  {
    step: 5,
    title: '5. Songs to Avoid (Optional)',
    subtitle: 'Hide any sad or stressful songs so they never play',
    clinicalBadge: 'Gerdner Safety Quarantine Rule',
  },
  {
    step: 6,
    title: '6. Daily Routine & Mood',
    subtitle: 'Pick when you usually listen and how you want to feel',
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
  onOpenTutorial,
  onCompleteInterview,
}: GuidedOnboardingViewProps) {
  // Default to Easy 3-Step Express Builder so non-technical users can finish in 60 seconds!
  const [setupMode, setSetupMode] = useState<'express' | 'detailed'>('express');
  const [showClinicalScience, setShowClinicalScience] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activePersonaId, setActivePersonaId] = useState<string>(
    startBlank ? 'custom-blank' : 'eleanor-1938'
  );
  const [answers, setAnswers] = useState<GuidedInterviewAnswers>(
    startBlank ? BLANK_FAMILY_ANSWERS : SAMPLE_INTERVIEW_PERSONAS[0].answers
  );
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Instant Audio Style Sample Player state
  const [playingStyleId, setPlayingStyleId] = useState<string | null>(null);
  const [loadingStyleId, setLoadingStyleId] = useState<string | null>(null);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  const bump = calculateReminiscenceBump(answers.birthYear);
  const displayName =
    answers.preferredName.trim() ||
    answers.fullName.trim().split(' ')[0] ||
    'Your Loved One';

  const stopSampleAudio = () => {
    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      sampleAudioRef.current.currentTime = 0;
    }
    setPlayingStyleId(null);
    setLoadingStyleId(null);
  };

  const handleToggleStyleAudioSample = async (
    styleId: string,
    searchSeed: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (playingStyleId === styleId) {
      stopSampleAudio();
      return;
    }

    stopSampleAudio();
    setLoadingStyleId(styleId);
    try {
      const results = await searchItunesTracks(searchSeed, 3);
      const trackWithPreview = results.find((r) => r.previewUrl);
      if (trackWithPreview && sampleAudioRef.current) {
        sampleAudioRef.current.src = trackWithPreview.previewUrl;
        await sampleAudioRef.current.play();
        setPlayingStyleId(styleId);
      }
    } catch {
      // Ignore audio preview errors
    } finally {
      setLoadingStyleId(null);
    }
  };

  const handleStartBlankCustom = () => {
    stopSampleAudio();
    setActivePersonaId('custom-blank');
    setAnswers({ ...BLANK_FAMILY_ANSWERS });
    setCurrentStep(1);
  };

  const handleLoadPersona = (personaId: string) => {
    stopSampleAudio();
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
    stopSampleAudio();
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
      <audio
        ref={sampleAudioRef}
        onEnded={() => setPlayingStyleId(null)}
      />

      {/* Friendly Non-Technical Header & Mode Switcher */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wildwoods-amber/20 border border-wildwoods-amber text-wildwoods-gold text-xs font-bold uppercase tracking-wider">
                <Wand2 className="w-3.5 h-3.5" />
                Easy Playlist Builder • Takes 60 Seconds
              </span>
              {onOpenTutorial && (
                <button
                  type="button"
                  onClick={onOpenTutorial}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wildwoods-forest hover:bg-wildwoods-moss border border-wildwoods-gold/50 text-wildwoods-cream text-xs font-bold transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-wildwoods-gold" />
                  Need Help? Open 4-Step Visual Tutorial
                </button>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold">
              Let’s Build {displayName}’s Personal Jukebox
            </h1>
            <p className="text-wildwoods-mint text-sm md:text-base max-w-3xl leading-relaxed">
              You don’t need to remember every song they loved. Just enter their{' '}
              <strong className="text-wildwoods-cream">name and birth year</strong>, tap a few{' '}
              <strong className="text-wildwoods-gold">music styles</strong> (tap the speaker icon to
              hear a sample!), and click <strong className="text-wildwoods-cream">Build Jukebox</strong>.
              You can always add or change songs later right inside the player.
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
              ? `Building ${displayName}’s Playlist...`
              : `Build ${displayName}’s Jukebox Now`}
          </button>
        </div>

        {/* Mode Bar: 60-Second Express Builder vs. Full 6-Question Story Interview */}
        <div className="pt-4 border-t border-wildwoods-moss flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSetupMode('express')}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition ${
                setupMode === 'express'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow-md'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream'
              }`}
            >
              <Zap className="w-4 h-4" />
              ⚡ Easy 3-Step Express Setup (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setSetupMode('detailed')}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                setupMode === 'detailed'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow-md'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Full 6-Question Family Story Setup
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowClinicalScience((prev) => !prev)}
            className="text-xs font-bold text-wildwoods-mint hover:text-wildwoods-gold underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Brain className="w-3.5 h-3.5 text-wildwoods-gold" />
            {showClinicalScience
              ? 'Hide Clinical Neuroscience Notes'
              : 'Show Clinical Science Notes (Optional)'}
          </button>
        </div>

        {/* Clear Toggle: Blank Form for Your Own Loved One vs. Pre-Filled Demo Personas */}
        <div className="pt-4 border-t border-wildwoods-moss/70 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-wildwoods-gold flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Start Fresh for Your Loved One — or Try a Pre-Filled Sample Person:
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
                      SAMPLE: {persona.badge}
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

      {/* ===================================================================== */}
      {/* MODE A: 60-SECOND 3-STEP EXPRESS BUILDER (DEFAULT FOR NON-TECH USERS) */}
      {/* ===================================================================== */}
      {setupMode === 'express' && (
        <div className="space-y-6">
          {/* Express Card 1: Name & Birth Year */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-wildwoods-sand space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-wildwoods-amber text-wildwoods-slate font-extrabold text-lg flex items-center justify-center shadow-sm">
                1
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-wildwoods-slate">
                  Who is this Jukebox for?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Their birth year tells us which decades of music they grew up listening to (ages 10 to 30).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  First Name or Nickname
                </label>
                <input
                  type="text"
                  value={answers.preferredName || answers.fullName}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      preferredName: e.target.value,
                      fullName: answers.fullName || e.target.value,
                    })
                  }
                  placeholder="e.g., Mom, Arthur, Eleanor"
                  className="w-full min-h-[52px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand font-bold text-base text-wildwoods-slate"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Year They Were Born
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

              <div className="p-4 rounded-2xl bg-wildwoods-parchment border border-wildwoods-sand">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-wildwoods-sage">
                  Their Golden Song Years (Ages 10–30):
                </div>
                <div className="text-xl font-serif font-bold text-wildwoods-slate mt-0.5">
                  {bump.bumpStart} – {bump.bumpEnd}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Songs from these years spark the strongest happy memories.
                </div>
              </div>
            </div>
          </section>

          {/* Express Card 2: Tap Music Styles (With Instant Audio Preview Buttons!) */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-wildwoods-sand space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-wildwoods-amber text-wildwoods-slate font-extrabold text-lg flex items-center justify-center shadow-sm">
                  2
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-wildwoods-slate">
                    Tap a Few Music Styles They Enjoy
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Pick 1 or 2 upbeat styles and 1 or 2 peaceful styles. Tap{' '}
                    <strong className="text-wildwoods-slate">🔊 Hear Sample</strong> on any card to listen!
                  </p>
                </div>
              </div>
            </div>

            {/* Upbeat Youth Styles */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
                A. Lively &amp; Upbeat Favorites (From Their Teen &amp; Young Adult Years):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {YOUTH_STYLE_OPTIONS.map((opt) => {
                  const selected = answers.youthStyles.includes(opt.id);
                  const isPlayingSample = playingStyleId === opt.id;
                  const isLoadingSample = loadingStyleId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          youthStyles: toggleArrayItem(answers.youthStyles, opt.id),
                        })
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setAnswers({
                            ...answers,
                            youthStyles: toggleArrayItem(answers.youthStyles, opt.id),
                          });
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                        selected
                          ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                          : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-sm">{opt.label}</span>
                          {selected && (
                            <CheckCircle2 className="w-5 h-5 text-wildwoods-gold shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            selected ? 'text-wildwoods-mint' : 'text-slate-600'
                          }`}
                        >
                          {opt.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-current/10">
                        <span className="text-[11px] font-bold">
                          {selected ? '✓ Selected for Playlist' : 'Tap card to select'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) =>
                            handleToggleStyleAudioSample(opt.id, opt.searchSeed, e)
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition ${
                            isPlayingSample
                              ? 'bg-wildwoods-amber text-wildwoods-slate'
                              : selected
                              ? 'bg-wildwoods-forest text-wildwoods-gold hover:bg-wildwoods-moss'
                              : 'bg-white text-wildwoods-slate border border-wildwoods-sand hover:bg-wildwoods-parchment'
                          }`}
                        >
                          {isPlayingSample ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              Stop Sample
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              {isLoadingSample ? 'Loading...' : 'Hear Sample'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Peaceful & Calming Styles */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
                B. Peaceful, Comforting &amp; Slow Favorites (For Relaxation &amp; Calm):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SANCTUARY_STYLE_OPTIONS.map((opt) => {
                  const selected = answers.sanctuaryStyles.includes(opt.id);
                  const isPlayingSample = playingStyleId === opt.id;
                  const isLoadingSample = loadingStyleId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          sanctuaryStyles: toggleArrayItem(answers.sanctuaryStyles, opt.id),
                        })
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setAnswers({
                            ...answers,
                            sanctuaryStyles: toggleArrayItem(answers.sanctuaryStyles, opt.id),
                          });
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                        selected
                          ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                          : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-sm">{opt.label}</span>
                          {selected && (
                            <CheckCircle2 className="w-5 h-5 text-wildwoods-gold shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            selected ? 'text-wildwoods-mint' : 'text-slate-600'
                          }`}
                        >
                          {opt.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-current/10">
                        <span className="text-[11px] font-bold">
                          {selected ? '✓ Selected for Playlist' : 'Tap card to select'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) =>
                            handleToggleStyleAudioSample(opt.id, opt.searchSeed, e)
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition ${
                            isPlayingSample
                              ? 'bg-wildwoods-amber text-wildwoods-slate'
                              : selected
                              ? 'bg-wildwoods-forest text-wildwoods-gold hover:bg-wildwoods-moss'
                              : 'bg-white text-wildwoods-slate border border-wildwoods-sand hover:bg-wildwoods-parchment'
                          }`}
                        >
                          {isPlayingSample ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              Stop Sample
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              {isLoadingSample ? 'Loading...' : 'Hear Sample'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Express Card 3: Any Specific Song or Family Memory? (Optional) + Big Build Button */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-2 border-wildwoods-sand space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-wildwoods-amber text-wildwoods-slate font-extrabold text-lg flex items-center justify-center shadow-sm">
                3
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-wildwoods-slate">
                  Any Special Song, Singer, or Memory to Include? (Optional)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Leave blank if you aren’t sure—you can easily add songs and memories later inside the Jukebox!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  Favorite Singer or Wedding / Family Song (Optional)
                </label>
                <input
                  type="text"
                  value={answers.courtshipSongOrArtist}
                  onChange={(e) =>
                    setAnswers({ ...answers, courtshipSongOrArtist: e.target.value })
                  }
                  placeholder="e.g., Nat King Cole, Frank Sinatra, My Girl, Amazing Grace"
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold text-wildwoods-slate"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                  A Happy Memory or Story to Show While Playing (Optional)
                </label>
                <input
                  type="text"
                  value={answers.courtshipMemoryStory}
                  onChange={(e) =>
                    setAnswers({ ...answers, courtshipMemoryStory: e.target.value })
                  }
                  placeholder="e.g., Danced to this at their 1965 wedding reception..."
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm text-wildwoods-slate"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-wildwoods-parchment flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setSetupMode('detailed')}
                className="text-xs sm:text-sm font-bold text-wildwoods-sage hover:text-wildwoods-slate underline"
              >
                Want to add more details (hometown, songs to avoid, daily schedule)? Switch to 6-Step Setup →
              </button>

              <button
                type="button"
                disabled={isSynthesizing}
                onClick={handleBuildPersonalizedJukebox}
                className="w-full sm:w-auto min-h-[58px] px-8 py-4 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xl transition"
              >
                <Sparkles className="w-6 h-6" />
                {isSynthesizing
                  ? `Building ${displayName}’s Playlist...`
                  : `Build & Open ${displayName}’s Jukebox Now →`}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE B: DETAILED 6-STEP FAMILY STORY INTERVIEW                        */}
      {/* ===================================================================== */}
      {setupMode === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 4 Columns: Interactive 6-Step Progress Map */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-md border border-wildwoods-sand space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage px-2 pb-1">
              6 Easy Family Story Steps
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
                    {showClinicalScience && (
                      <div
                        className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${
                          isCurrent
                            ? 'bg-wildwoods-forest text-wildwoods-gold'
                            : 'bg-wildwoods-parchment text-wildwoods-sage'
                        }`}
                      >
                        {item.clinicalBadge}
                      </div>
                    )}
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
                <div className="p-4 rounded-2xl bg-wildwoods-parchment text-wildwoods-slate border border-wildwoods-sand flex items-start gap-3">
                  <Brain className="w-6 h-6 text-wildwoods-amber shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <strong className="text-wildwoods-slate block mb-0.5">
                      Why We Ask for Their Birth Year:
                    </strong>
                    Songs we hear between <strong>ages 10 and 30</strong> stay deeply rooted in our
                    memory for life. Entering your loved one’s birth year lets us automatically find
                    the music from their golden teenage and young-adult years.
                    {showClinicalScience && (
                      <span className="block mt-1.5 text-xs text-slate-600">
                        <em>Clinical Note:</em> Musical experiences between ages 10 and 30 are
                        encoded with maximum durability in the caudal anterior cingulate cortex
                        (cACC).
                      </span>
                    )}
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
                      placeholder="e.g., Eleanor Grace Vance"
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand font-semibold text-wildwoods-slate"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                      Preferred Name or Nickname
                    </label>
                    <input
                      type="text"
                      value={answers.preferredName}
                      onChange={(e) => setAnswers({ ...answers, preferredName: e.target.value })}
                      placeholder="e.g., Eleanor, Mom, Grandpa"
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
                      Their Golden Memory Years (Ages 10 to 30):
                    </div>
                    <div className="text-xl font-serif font-bold text-wildwoods-slate">
                      {bump.bumpStart} – {bump.bumpEnd} (Age Today: ~{bump.currentAge})
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
                      Hometown Where They Grew Up (Optional)
                    </label>
                    <input
                      type="text"
                      value={answers.hometown}
                      onChange={(e) => setAnswers({ ...answers, hometown: e.target.value })}
                      placeholder="e.g., Savannah, GA or Sturgeon Bay, WI"
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                      Former Job, Hobby, or Role (Optional)
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
              </div>
            )}

            {/* STEP 2: Formative Youth & Rhythm (Ages 10-17) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-wildwoods-parchment text-wildwoods-slate border border-wildwoods-sand flex items-start gap-3">
                  <Radio className="w-6 h-6 text-wildwoods-amber shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <strong className="text-wildwoods-slate block mb-0.5">
                      Upbeat Teen Years ({bump.epochs[0].startYear}–{bump.epochs[0].endYear}):
                    </strong>
                    When {displayName} feels restless, starting with an upbeat, familiar song from
                    their teen years helps catch their attention before gently slowing the pace down.
                    Tap any style below—or tap <strong>🔊 Hear Sample</strong> to listen!
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate">
                    What upbeat styles played on the radio during {displayName}’s teen years (
                    {bump.epochs[0].startYear}–{bump.epochs[0].endYear})?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {YOUTH_STYLE_OPTIONS.map((opt) => {
                      const selected = answers.youthStyles.includes(opt.id);
                      const isPlayingSample = playingStyleId === opt.id;
                      const isLoadingSample = loadingStyleId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() =>
                            setAnswers({
                              ...answers,
                              youthStyles: toggleArrayItem(answers.youthStyles, opt.id),
                            })
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setAnswers({
                                ...answers,
                                youthStyles: toggleArrayItem(answers.youthStyles, opt.id),
                              });
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                            selected
                              ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                              : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                          }`}
                        >
                          <div>
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
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={(e) =>
                                handleToggleStyleAudioSample(opt.id, opt.searchSeed, e)
                              }
                              className="px-2.5 py-1 rounded-lg bg-white/90 text-wildwoods-slate text-[11px] font-bold flex items-center gap-1 border border-wildwoods-sand"
                            >
                              {isPlayingSample ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  Stop
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  {isLoadingSample ? 'Loading...' : 'Hear Sample'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Specific Upbeat Song or Singer (Optional):
                  </label>
                  <input
                    type="text"
                    value={answers.youthFavoriteArtistOrSong}
                    onChange={(e) =>
                      setAnswers({ ...answers, youthFavoriteArtistOrSong: e.target.value })
                    }
                    placeholder="e.g., Glenn Miller In the Mood, Elvis Presley, The Supremes"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Fun Teen or Dance Memory (Optional):
                  </label>
                  <input
                    type="text"
                    value={answers.youthDanceMemory}
                    onChange={(e) => setAnswers({ ...answers, youthDanceMemory: e.target.value })}
                    placeholder="e.g., Jitterbugged on the porch with her sisters..."
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Courtship, Wedding & Peak Heart Songs (Ages 18-25) */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-wildwoods-parchment text-wildwoods-slate border border-wildwoods-sand flex items-start gap-3">
                  <Heart className="w-6 h-6 text-wildwoods-amber shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <strong className="text-wildwoods-slate block mb-0.5">
                      Wedding &amp; Heart Songs ({bump.epochs[1].startYear}–{bump.epochs[1].endYear}):
                    </strong>
                    Love songs and favorite singers from young adulthood spark the warmest smiles and
                    conversations.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                      Spouse, Partner, or Best Friend’s Name (Optional)
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
                      “Their Song” or Favorite Singer (Optional)
                    </label>
                    <input
                      type="text"
                      value={answers.courtshipSongOrArtist}
                      onChange={(e) =>
                        setAnswers({ ...answers, courtshipSongOrArtist: e.target.value })
                      }
                      placeholder="e.g., Nat King Cole Mona Lisa, My Girl, Frank Sinatra"
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    The Story Behind This Song (Shown on the Player for Family Visits):
                  </label>
                  <textarea
                    rows={2}
                    value={answers.courtshipMemoryStory}
                    onChange={(e) =>
                      setAnswers({ ...answers, courtshipMemoryStory: e.target.value })
                    }
                    placeholder="e.g., Danced to this at their wedding reception in 1965..."
                    className="w-full px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Sanctuary, Faith & Deep Calm Anchors */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-wildwoods-parchment text-wildwoods-slate border border-wildwoods-sand flex items-start gap-3">
                  <Music className="w-6 h-6 text-wildwoods-amber shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <strong className="text-wildwoods-slate block mb-0.5">
                      Peaceful &amp; Comforting Favorites:
                    </strong>
                    Familiar slow ballads, hymns, or gentle acoustic songs help your loved one relax
                    and feel safe.
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate">
                    Which peaceful styles make {displayName} feel most at home?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SANCTUARY_STYLE_OPTIONS.map((opt) => {
                      const selected = answers.sanctuaryStyles.includes(opt.id);
                      const isPlayingSample = playingStyleId === opt.id;
                      const isLoadingSample = loadingStyleId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() =>
                            setAnswers({
                              ...answers,
                              sanctuaryStyles: toggleArrayItem(answers.sanctuaryStyles, opt.id),
                            })
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setAnswers({
                                ...answers,
                                sanctuaryStyles: toggleArrayItem(answers.sanctuaryStyles, opt.id),
                              });
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                            selected
                              ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                              : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                          }`}
                        >
                          <div>
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
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={(e) =>
                                handleToggleStyleAudioSample(opt.id, opt.searchSeed, e)
                              }
                              className="px-2.5 py-1 rounded-lg bg-white/90 text-wildwoods-slate text-[11px] font-bold flex items-center gap-1 border border-wildwoods-sand"
                            >
                              {isPlayingSample ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  Stop
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  {isLoadingSample ? 'Loading...' : 'Hear Sample'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Favorite Peaceful Song or Hymn (Optional):
                  </label>
                  <input
                    type="text"
                    value={answers.sanctuarySpecificSong}
                    onChange={(e) =>
                      setAnswers({ ...answers, sanctuarySpecificSong: e.target.value })
                    }
                    placeholder="e.g., Louis Armstrong What a Wonderful World, Amazing Grace"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: Red Flag Songs to Avoid */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-red-50 text-red-950 border border-red-200 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <strong className="text-red-900 block mb-0.5">
                      Songs to Avoid (Optional):
                    </strong>
                    If there is a song that reminds your loved one of a sad loss or makes them feel
                    upset, enter it here so nobody accidentally plays it.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Any Song or Singer to Block? (Leave blank if none)
                  </label>
                  <input
                    type="text"
                    value={answers.redFlagSongsOrArtists}
                    onChange={(e) =>
                      setAnswers({ ...answers, redFlagSongsOrArtists: e.target.value })
                    }
                    placeholder="e.g., Danny Boy, Taps, or leave blank"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                    Why should we avoid this song? (Optional note for family):
                  </label>
                  <input
                    type="text"
                    value={answers.redFlagReason}
                    onChange={(e) => setAnswers({ ...answers, redFlagReason: e.target.value })}
                    placeholder="e.g., Played at a funeral — brings up sad memories."
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate">
                    Sounds They Dislike (Tap any that apply):
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

            {/* STEP 6: Daily Routine & Starting Mood */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-wildwoods-parchment text-wildwoods-slate border border-wildwoods-sand flex items-start gap-3">
                  <Compass className="w-6 h-6 text-wildwoods-amber shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <strong className="text-wildwoods-slate block mb-0.5">
                      Daily Listening Time &amp; Starting Mood:
                    </strong>
                    Playing music <strong>30 minutes before</strong> a time of day when your loved
                    one usually gets tired or restless works best.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-wildwoods-parchment p-5 rounded-2xl border border-wildwoods-sand">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate mb-1">
                      Time of Day They Usually Feel Restless
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
                      Helpful Tip: Start 30 Minutes Early
                    </div>
                    <p>
                      Starting {displayName}’s music 30 minutes before restlessness usually begins
                      helps keep the afternoon peaceful.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                      How They Usually Feel Before Music
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
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1.5">
                      How We Hope They Feel After Listening
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
                          {t.label}
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
                Back
              </button>

              <div className="flex items-center gap-3">
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
                    className="min-h-[52px] px-6 py-3 rounded-2xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-cream font-bold text-sm flex items-center gap-2 shadow-md transition"
                  >
                    Next Step ({currentStep + 1} of 6)
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
                      ? 'Building Playlist...'
                      : `Build & Open ${displayName}’s Jukebox`}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
