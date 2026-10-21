'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Volume2,
  Square,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Save,
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
} from '@/lib/iso-sequencer';
import { searchItunesTracks } from '@/lib/itunes-audio';

interface GuidedOnboardingViewProps {
  startBlank?: boolean;
  existingPatient?: PatientProfile;
  isCustomProfile?: boolean;
  initialSavedAnswers?: Partial<GuidedInterviewAnswers> | null;
  onLiveUpdateProfile?: (
    updatedProfile: Partial<PatientProfile>,
    latestAnswers: GuidedInterviewAnswers
  ) => void;
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
    answers: GuidedInterviewAnswers;
  }) => void;
}

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
  existingPatient,
  isCustomProfile = false,
  initialSavedAnswers,
  onLiveUpdateProfile,
  onOpenTutorial,
  onCompleteInterview,
}: GuidedOnboardingViewProps) {
  // Single, calm 3-step wizard (1 card at a time on screen!)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showSampleLoader, setShowSampleLoader] = useState<boolean>(false);
  const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);
  const [activePersonaId, setActivePersonaId] = useState<string>(
    isCustomProfile ? 'custom-saved' : startBlank ? 'custom-blank' : 'eleanor-1938'
  );
  const [answers, setAnswers] = useState<GuidedInterviewAnswers>(() => {
    if (initialSavedAnswers) {
      return {
        ...BLANK_FAMILY_ANSWERS,
        ...initialSavedAnswers,
        fullName:
          initialSavedAnswers.fullName ||
          existingPatient?.name ||
          '',
        preferredName:
          initialSavedAnswers.preferredName ||
          existingPatient?.preferredName ||
          '',
        birthYear:
          initialSavedAnswers.birthYear ||
          existingPatient?.birthYear ||
          1945,
      };
    }
    if (isCustomProfile && existingPatient) {
      return {
        ...BLANK_FAMILY_ANSWERS,
        fullName: existingPatient.name,
        preferredName: existingPatient.preferredName,
        birthYear: existingPatient.birthYear,
        hometown: existingPatient.hometown,
        formerOccupation: existingPatient.formerOccupation,
        culturalUpbringing: existingPatient.musicalHeritage,
        sundowningPeakTime: existingPatient.sundowningPeakTime,
      };
    }
    return startBlank ? BLANK_FAMILY_ANSWERS : SAMPLE_INTERVIEW_PERSONAS[0].answers;
  });
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [autoSavedToast, setAutoSavedToast] = useState<boolean>(false);

  // Immediately persist any edits to Name, Birth Year, Hometown, etc. so changes are never lost if user clicks "Play Jukebox" in the top bar!
  const updateAnswersAndSync = (nextAnswers: GuidedInterviewAnswers) => {
    setAnswers(nextAnswers);
    if (onLiveUpdateProfile) {
      const cleanName =
        nextAnswers.fullName.trim() ||
        nextAnswers.preferredName.trim() ||
        existingPatient?.name ||
        'My Loved One';
      const cleanPref =
        nextAnswers.preferredName.trim() ||
        cleanName.split(' ')[0] ||
        'My Loved One';
      onLiveUpdateProfile(
        {
          name: cleanName,
          preferredName: cleanPref,
          birthYear: nextAnswers.birthYear,
          hometown: nextAnswers.hometown || existingPatient?.hometown || '',
          formerOccupation:
            nextAnswers.formerOccupation || existingPatient?.formerOccupation || '',
          musicalHeritage:
            nextAnswers.culturalUpbringing || existingPatient?.musicalHeritage || '',
          sundowningPeakTime:
            nextAnswers.sundowningPeakTime || existingPatient?.sundowningPeakTime || '16:30',
        },
        nextAnswers
      );
      setAutoSavedToast(true);
    }
  };

  useEffect(() => {
    if (!autoSavedToast) return;
    const t = setTimeout(() => setAutoSavedToast(false), 2500);
    return () => clearTimeout(t);
  }, [autoSavedToast]);

  // Instant Audio Style Sample Player state
  const [playingStyleId, setPlayingStyleId] = useState<string | null>(null);
  const [loadingStyleId, setLoadingStyleId] = useState<string | null>(null);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  const bump = calculateReminiscenceBump(answers.birthYear);
  const displayName =
    answers.preferredName.trim() ||
    answers.fullName.trim().split(' ')[0] ||
    'My';

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
    updateAnswersAndSync({ ...BLANK_FAMILY_ANSWERS });
    setStep(1);
    setShowSampleLoader(false);
  };

  const handleLoadPersona = (personaId: string) => {
    stopSampleAudio();
    const found = SAMPLE_INTERVIEW_PERSONAS.find((p) => p.id === personaId);
    if (found) {
      setActivePersonaId(found.id);
      updateAnswersAndSync({ ...found.answers });
      setShowSampleLoader(false);
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
        fullName: answers.fullName.trim() || answers.preferredName.trim() || 'My Jukebox',
        preferredName:
          answers.preferredName.trim() ||
          answers.fullName.trim().split(' ')[0] ||
          'My',
      };
      const result = await synthesizeInterviewIntoJukebox(effectiveAnswers);
      onCompleteInterview({
        ...result,
        initialCurrentState: effectiveAnswers.initialCurrentState,
        initialTargetState: effectiveAnswers.initialTargetState,
        isCustom: true,
        answers: effectiveAnswers,
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <audio ref={sampleAudioRef} onEnded={() => setPlayingStyleId(null)} />

      {/* Simple Top Progress Indicator (Step 1, 2, 3) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-wildwoods-sand flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: '1. Name & Year' },
            { num: 2, label: '2. Favorite Styles' },
            { num: 3, label: '3. Special Songs' },
          ].map((item) => {
            const isActive = step === item.num;
            const isComplete = step > item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => {
                  stopSampleAudio();
                  setStep(item.num as 1 | 2 | 3);
                }}
                className={`min-h-[42px] px-3.5 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-wildwoods-slate text-wildwoods-gold shadow'
                    : isComplete
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-wildwoods-cream text-slate-600 border border-wildwoods-sand'
                }`}
              >
                {isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {autoSavedToast && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-extrabold">
              <Save className="w-3.5 h-3.5 text-emerald-700" />
              Saved!
            </span>
          )}
          <button
            type="button"
            disabled={isSynthesizing}
            onClick={handleBuildPersonalizedJukebox}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSynthesizing ? 'Saving...' : 'Save & Open Jukebox'}
          </button>
          {onOpenTutorial && (
            <button
              type="button"
              onClick={onOpenTutorial}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-xs flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-wildwoods-amber" />
              Help
            </button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* STEP 1 OF 3: NAME & BIRTH YEAR (ONE FOCUSED CARD)                   */}
      {/* =================================================================== */}
      {step === 1 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-wildwoods-sand space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
              Step 1 of 3 • Easy Setup
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-slate">
              What is your name, and what year were you born?
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Enter your own info—or your loved one’s info if you are setting this up for family.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="setup-first-name"
                className="block text-sm font-extrabold text-wildwoods-slate mb-2"
              >
                First Name or Nickname
              </label>
              <input
                id="setup-first-name"
                type="text"
                value={answers.preferredName || answers.fullName}
                onChange={(e) =>
                  updateAnswersAndSync({
                    ...answers,
                    preferredName: e.target.value,
                    fullName: e.target.value,
                  })
                }
                placeholder="Type name here (e.g., Arthur, Eleanor, Mom)"
                className="w-full min-h-[58px] px-5 py-3 rounded-2xl bg-wildwoods-cream border-2 border-wildwoods-sand focus:border-wildwoods-slate font-bold text-lg sm:text-xl text-wildwoods-slate"
              />
            </div>

            <div>
              <label
                htmlFor="setup-birth-year"
                className="block text-sm font-extrabold text-wildwoods-slate mb-2"
              >
                Year Born (for example, 1945)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <input
                  id="setup-birth-year"
                  type="number"
                  min={1915}
                  max={2005}
                  value={answers.birthYear}
                  onChange={(e) =>
                    updateAnswersAndSync({
                      ...answers,
                      birthYear: Number(e.target.value) || 1945,
                    })
                  }
                  className="w-full min-h-[60px] px-5 py-3 rounded-2xl bg-wildwoods-slate text-wildwoods-gold font-serif font-bold text-3xl text-center"
                />

                <div className="p-4 rounded-2xl bg-wildwoods-parchment border border-wildwoods-sand">
                  <div className="text-xs font-bold text-wildwoods-sage uppercase tracking-wider">
                    Favorite Youth Era (Ages 10–30):
                  </div>
                  <div className="text-2xl font-serif font-bold text-wildwoods-slate mt-0.5">
                    {bump.bumpStart} – {bump.bumpEnd}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Single Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full min-h-[62px] px-6 py-4 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl transition"
            >
              Next: Pick Music Styles
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Quiet Collapsible Link for Demo / Sample Profiles */}
          <div className="pt-3 border-t border-wildwoods-parchment">
            <button
              type="button"
              onClick={() => setShowSampleLoader((prev) => !prev)}
              className="text-xs font-bold text-wildwoods-sage hover:text-wildwoods-slate flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              {showSampleLoader
                ? 'Hide Sample Profiles'
                : 'Just testing? Load a pre-filled sample person instead'}
              {showSampleLoader ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showSampleLoader && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={handleStartBlankCustom}
                  className="p-3.5 rounded-xl border-2 border-wildwoods-amber bg-amber-50/70 text-left text-xs font-bold text-wildwoods-slate"
                >
                  ✨ Clear Form (Start Blank)
                </button>
                {SAMPLE_INTERVIEW_PERSONAS.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleLoadPersona(persona.id)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition ${
                      activePersonaId === persona.id
                        ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber font-bold'
                        : 'bg-wildwoods-cream text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    <div>{persona.badge}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* STEP 2 OF 3: TAP FAVORITE MUSIC STYLES (WITH BIG LISTEN BUTTONS)    */}
      {/* =================================================================== */}
      {step === 2 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-wildwoods-sand space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
              Step 2 of 3 • Tap What Sounds Good
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-slate">
              Which music styles do you enjoy most?
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tap any box to select it. Tap <strong>🔊 Hear Sample</strong> to listen first!
            </p>
          </div>

          {/* Upbeat Styles */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-wildwoods-sage">
              Lively &amp; Upbeat Music ({bump.bumpStart}–{bump.bumpEnd}):
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {YOUTH_STYLE_OPTIONS.map((opt) => {
                const selected = answers.youthStyles.includes(opt.id);
                const isPlayingSample = playingStyleId === opt.id;
                const isLoadingSample = loadingStyleId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() =>
                      updateAnswersAndSync({
                        ...answers,
                        youthStyles: toggleArrayItem(answers.youthStyles, opt.id),
                      })
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        updateAnswersAndSync({
                          ...answers,
                          youthStyles: toggleArrayItem(answers.youthStyles, opt.id),
                        });
                      }
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selected
                        ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                        : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {selected && (
                          <CheckCircle2 className="w-5 h-5 text-wildwoods-gold shrink-0" />
                        )}
                        <span className="font-bold text-base sm:text-lg">{opt.label}</span>
                      </div>
                      <p
                        className={`text-xs sm:text-sm ${
                          selected ? 'text-wildwoods-mint' : 'text-slate-600'
                        }`}
                      >
                        {opt.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) =>
                        handleToggleStyleAudioSample(opt.id, opt.searchSeed, e)
                      }
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition ${
                        isPlayingSample
                          ? 'bg-wildwoods-amber text-wildwoods-slate'
                          : selected
                          ? 'bg-wildwoods-forest text-wildwoods-gold border border-wildwoods-gold/40'
                          : 'bg-white text-wildwoods-slate border border-wildwoods-sand'
                      }`}
                    >
                      {isPlayingSample ? (
                        <>
                          <Square className="w-4 h-4 fill-current" />
                          Stop Music
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          {isLoadingSample ? 'Loading...' : 'Hear Sample'}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Peaceful Styles */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-wildwoods-sage">
              Peaceful &amp; Relaxing Music:
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {SANCTUARY_STYLE_OPTIONS.map((opt) => {
                const selected = answers.sanctuaryStyles.includes(opt.id);
                const isPlayingSample = playingStyleId === opt.id;
                const isLoadingSample = loadingStyleId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() =>
                      updateAnswersAndSync({
                        ...answers,
                        sanctuaryStyles: toggleArrayItem(answers.sanctuaryStyles, opt.id),
                      })
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        updateAnswersAndSync({
                          ...answers,
                          sanctuaryStyles: toggleArrayItem(answers.sanctuaryStyles, opt.id),
                        });
                      }
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selected
                        ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                        : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {selected && (
                          <CheckCircle2 className="w-5 h-5 text-wildwoods-gold shrink-0" />
                        )}
                        <span className="font-bold text-base sm:text-lg">{opt.label}</span>
                      </div>
                      <p
                        className={`text-xs sm:text-sm ${
                          selected ? 'text-wildwoods-mint' : 'text-slate-600'
                        }`}
                      >
                        {opt.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) =>
                        handleToggleStyleAudioSample(opt.id, opt.searchSeed, e)
                      }
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition ${
                        isPlayingSample
                          ? 'bg-wildwoods-amber text-wildwoods-slate'
                          : selected
                          ? 'bg-wildwoods-forest text-wildwoods-gold border border-wildwoods-gold/40'
                          : 'bg-white text-wildwoods-slate border border-wildwoods-sand'
                      }`}
                    >
                      {isPlayingSample ? (
                        <>
                          <Square className="w-4 h-4 fill-current" />
                          Stop Music
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          {isLoadingSample ? 'Loading...' : 'Hear Sample'}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-wildwoods-parchment">
            <button
              type="button"
              onClick={() => {
                stopSampleAudio();
                setStep(1);
              }}
              className="w-full sm:w-auto min-h-[52px] px-5 py-3 rounded-2xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-base flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <button
              type="button"
              onClick={() => {
                stopSampleAudio();
                setStep(3);
              }}
              className="w-full sm:flex-1 min-h-[60px] px-6 py-4 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-lg flex items-center justify-center gap-2.5 shadow-xl transition"
            >
              Next: Final Step
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* STEP 3 OF 3: OPTIONAL FAVORITE SONG + BIG "OPEN MY JUKEBOX" BUTTON  */}
      {/* =================================================================== */}
      {step === 3 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-wildwoods-sand space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
              Step 3 of 3 • Almost Done!
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-slate">
              Any special song or singer you want to include?
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              This is optional—you can leave it blank and click the big gold button below to start
              listening right away!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="setup-special-song"
                className="block text-sm font-extrabold text-wildwoods-slate mb-1.5"
              >
                Favorite Singer or Special Song (Optional)
              </label>
              <input
                id="setup-special-song"
                type="text"
                value={answers.courtshipSongOrArtist}
                onChange={(e) =>
                  updateAnswersAndSync({ ...answers, courtshipSongOrArtist: e.target.value })
                }
                placeholder="e.g., Frank Sinatra, Nat King Cole, Amazing Grace"
                className="w-full min-h-[54px] px-4 py-3 rounded-2xl bg-wildwoods-cream border-2 border-wildwoods-sand text-base font-bold text-wildwoods-slate"
              />
            </div>

            <div>
              <label
                htmlFor="setup-special-memory"
                className="block text-sm font-extrabold text-wildwoods-slate mb-1.5"
              >
                Special Memory Note (Optional)
              </label>
              <input
                id="setup-special-memory"
                type="text"
                value={answers.courtshipMemoryStory}
                onChange={(e) =>
                  updateAnswersAndSync({ ...answers, courtshipMemoryStory: e.target.value })
                }
                placeholder="e.g., Our wedding song in 1965..."
                className="w-full min-h-[54px] px-4 py-3 rounded-2xl bg-wildwoods-cream border-2 border-wildwoods-sand text-base text-wildwoods-slate"
              />
            </div>
          </div>

          {/* Primary Build & Play Button */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              disabled={isSynthesizing}
              onClick={handleBuildPersonalizedJukebox}
              className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl transition"
            >
              <Sparkles className="w-6 h-6" />
              {isSynthesizing
                ? 'Building Your Jukebox Playlist...'
                : `Open ${displayName === 'My' ? 'My' : `${displayName}’s`} Jukebox & Play Music`}
              <ArrowRight className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Music Styles
            </button>
          </div>

          {/* Quiet Expandable Caregiver Options (Songs to Avoid, Hometown, etc.) */}
          <div className="pt-3 border-t border-wildwoods-parchment">
            <button
              type="button"
              onClick={() => setShowExtraDetails((prev) => !prev)}
              className="text-xs font-bold text-wildwoods-sage hover:text-wildwoods-slate flex items-center gap-1.5"
            >
              {showExtraDetails
                ? 'Hide Extra Family & Caregiver Options'
                : 'More Options: Block a sad song, add hometown, or set daily schedule'}
              {showExtraDetails ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showExtraDetails && (
              <div className="mt-4 p-4 rounded-2xl bg-wildwoods-parchment/70 border border-wildwoods-sand space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1">
                    Any Song to Block / Never Play? (Optional)
                  </label>
                  <input
                    type="text"
                    value={answers.redFlagSongsOrArtists}
                    onChange={(e) =>
                      updateAnswersAndSync({ ...answers, redFlagSongsOrArtists: e.target.value })
                    }
                    placeholder="e.g., Danny Boy, or leave blank"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-wildwoods-sand text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1">
                      Hometown (Optional)
                    </label>
                    <input
                      type="text"
                      value={answers.hometown}
                      onChange={(e) =>
                        updateAnswersAndSync({ ...answers, hometown: e.target.value })
                      }
                      placeholder="e.g., Savannah, GA"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-wildwoods-sand text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate mb-1">
                      Spouse or Companion Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={answers.spouseOrCompanionName}
                      onChange={(e) =>
                        updateAnswersAndSync({
                          ...answers,
                          spouseOrCompanionName: e.target.value,
                        })
                      }
                      placeholder="e.g., Clara, Walter"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-wildwoods-sand text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-wildwoods-slate">
                    Sounds to Avoid:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACOUSTIC_SENSITIVITY_OPTIONS.map((sens) => {
                      const active = answers.acousticSensitivities.includes(sens);
                      return (
                        <button
                          key={sens}
                          type="button"
                          onClick={() =>
                            updateAnswersAndSync({
                              ...answers,
                              acousticSensitivities: toggleArrayItem(
                                answers.acousticSensitivities,
                                sens
                              ),
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                            active
                              ? 'bg-red-900 text-white border-red-700'
                              : 'bg-white text-wildwoods-slate border-wildwoods-sand'
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
          </div>
        </section>
      )}
    </div>
  );
}
