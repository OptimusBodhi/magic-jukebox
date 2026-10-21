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
  Search,
  Play,
  Plus,
  Check,
  Calendar,
  Music,
} from 'lucide-react';
import {
  ACOUSTIC_SENSITIVITY_OPTIONS,
  DECADE_GUESS_OPTIONS,
  GuidedInterviewAnswers,
  SAMPLE_INTERVIEW_PERSONAS,
  SIMPLE_GENRE_OPTIONS,
  synthesizeInterviewIntoJukebox,
} from '@/lib/onboarding-interview';
import {
  BiographicalTrack,
  CurrentEmotionalStateId,
  PatientProfile,
  TargetTherapeuticStateId,
  calculateReminiscenceBump,
  getTrackEpochLabel,
} from '@/lib/iso-sequencer';
import { ItunesCandidateTrack, searchItunesTracks } from '@/lib/itunes-audio';

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
  selectedDecades: ['decade_1950s', 'decade_1960s'],
  handPickedTracks: [],
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
        fullName: initialSavedAnswers.fullName || existingPatient?.name || '',
        preferredName:
          initialSavedAnswers.preferredName || existingPatient?.preferredName || '',
        birthYear: initialSavedAnswers.birthYear || existingPatient?.birthYear || 1945,
        selectedDecades: initialSavedAnswers.selectedDecades || ['decade_1950s', 'decade_1960s'],
        handPickedTracks: initialSavedAnswers.handPickedTracks || [],
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
    return startBlank
      ? BLANK_FAMILY_ANSWERS
      : {
          ...SAMPLE_INTERVIEW_PERSONAS[0].answers,
          selectedDecades: ['decade_1950s', 'decade_1960s'],
          handPickedTracks: [],
        };
  });

  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [autoSavedToast, setAutoSavedToast] = useState<boolean>(false);

  // Instant Audio Sample Player state (used in both Step 2 Genres/Decades & Step 3 Song Picker)
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Step 3 Multi-Song Visual Picker State
  const [suggestedCandidates, setSuggestedCandidates] = useState<ItunesCandidateTrack[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [songSearchQuery, setSongSearchQuery] = useState<string>('');
  const [isSearchingSongs, setIsSearchingSongs] = useState<boolean>(false);

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
    setPlayingPreviewId(null);
    setLoadingPreviewId(null);
  };

  // Update answers and immediately sync to parent + LocalStorage
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

  // Whenever the user enters Step 3, automatically fetch a checklist of popular songs matching their chosen genres & decades!
  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;

    const loadStep3SongChecklist = async () => {
      setIsLoadingSuggestions(true);
      try {
        const selectedGenreIds = [...answers.youthStyles, ...answers.sanctuaryStyles];
        const genreSeeds = SIMPLE_GENRE_OPTIONS.filter((g) =>
          selectedGenreIds.includes(g.id)
        ).map((g) => g.searchSeed);

        const decadeSeeds = DECADE_GUESS_OPTIONS.filter((d) =>
          (answers.selectedDecades || []).includes(d.id)
        ).map((d) => d.searchSeed);

        const queries = [
          ...genreSeeds.slice(0, 2),
          ...decadeSeeds.slice(0, 2),
          `${bump.bumpStart + 5} greatest hits`,
        ].filter(Boolean);

        const merged: ItunesCandidateTrack[] = [];
        const seen = new Set<string>();

        for (const q of queries.slice(0, 3)) {
          const batch = await searchItunesTracks(q, 5);
          for (const item of batch) {
            const key = `${item.title.toLowerCase()}::${item.artist.toLowerCase()}`;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }
        }
        if (!cancelled) {
          setSuggestedCandidates(merged.slice(0, 12));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSuggestions(false);
        }
      }
    };

    loadStep3SongChecklist();
    return () => {
      cancelled = true;
    };
  }, [step, answers.youthStyles, answers.sanctuaryStyles, answers.selectedDecades, bump.bumpStart]);

  const handleToggleSeedAudioSample = async (
    id: string,
    searchSeed: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (playingPreviewId === id) {
      stopSampleAudio();
      return;
    }

    stopSampleAudio();
    setLoadingPreviewId(id);
    try {
      const results = await searchItunesTracks(searchSeed, 3);
      const trackWithPreview = results.find((r) => r.previewUrl);
      if (trackWithPreview && sampleAudioRef.current) {
        sampleAudioRef.current.src = trackWithPreview.previewUrl;
        await sampleAudioRef.current.play();
        setPlayingPreviewId(id);
      }
    } catch {
      // Ignore preview error
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const handleToggleDirectUrlPreview = async (
    id: string,
    previewUrl: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (playingPreviewId === id) {
      stopSampleAudio();
      return;
    }
    stopSampleAudio();
    if (!previewUrl || !sampleAudioRef.current) return;
    try {
      sampleAudioRef.current.src = previewUrl;
      await sampleAudioRef.current.play();
      setPlayingPreviewId(id);
    } catch {
      // Ignore preview error
    }
  };

  const handleSearchMoreSongsStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songSearchQuery.trim()) return;
    setIsSearchingSongs(true);
    try {
      const results = await searchItunesTracks(songSearchQuery.trim(), 8);
      setSuggestedCandidates((prev) => {
        const existingKeys = new Set(
          results.map((r) => `${r.title.toLowerCase()}::${r.artist.toLowerCase()}`)
        );
        const filteredPrev = prev.filter(
          (p) => !existingKeys.has(`${p.title.toLowerCase()}::${p.artist.toLowerCase()}`)
        );
        return [...results, ...filteredPrev].slice(0, 16);
      });
    } finally {
      setIsSearchingSongs(false);
    }
  };

  const isCandidatePicked = (cand: ItunesCandidateTrack): boolean => {
    const picked = answers.handPickedTracks || [];
    return picked.some(
      (t) =>
        t.id === cand.trackId ||
        (t.title.toLowerCase() === cand.title.toLowerCase() &&
          t.artist.toLowerCase() === cand.artist.toLowerCase())
    );
  };

  const handleTogglePickSong = (cand: ItunesCandidateTrack) => {
    const currentPicked = answers.handPickedTracks || [];
    const exists = isCandidatePicked(cand);
    let nextPicked: BiographicalTrack[];

    if (exists) {
      nextPicked = currentPicked.filter(
        (t) =>
          t.id !== cand.trackId &&
          !(
            t.title.toLowerCase() === cand.title.toLowerCase() &&
            t.artist.toLowerCase() === cand.artist.toLowerCase()
          )
      );
    } else {
      const newTrack: BiographicalTrack = {
        id: cand.trackId,
        title: cand.title,
        artist: cand.artist,
        year: cand.year,
        bpm: cand.inferredBpm || 88,
        mode: 'Major',
        energy: cand.inferredEnergy || 5,
        valence: 9,
        neuroTargets: cand.neuroTargets,
        memoryNote:
          answers.courtshipMemoryStory.trim() ||
          `Hand-picked favorite (${getTrackEpochLabel(cand.year, answers.birthYear)}).`,
        duetPrompt: `Ask what memories come to mind when ${cand.artist} sings "${cand.title}".`,
        chorusLyrics: [
          `${cand.title} — ${cand.artist} (${cand.year})`,
          'Sing or hum along together with the chorus.',
        ],
        itunesQuery: `${cand.artist} ${cand.title}`,
        previewUrl: cand.previewUrl,
        artworkUrl: cand.artworkUrl,
        epochLabel: getTrackEpochLabel(cand.year, answers.birthYear),
      };
      nextPicked = [newTrack, ...currentPicked];
    }

    updateAnswersAndSync({
      ...answers,
      handPickedTracks: nextPicked,
    });
  };

  const toggleGenreSelection = (genreOption: (typeof SIMPLE_GENRE_OPTIONS)[number]) => {
    if (genreOption.category === 'upbeat') {
      const exists = answers.youthStyles.includes(genreOption.id);
      const nextYouth = exists
        ? answers.youthStyles.filter((id) => id !== genreOption.id)
        : [...answers.youthStyles, genreOption.id];
      updateAnswersAndSync({ ...answers, youthStyles: nextYouth });
    } else {
      const exists = answers.sanctuaryStyles.includes(genreOption.id);
      const nextSanctuary = exists
        ? answers.sanctuaryStyles.filter((id) => id !== genreOption.id)
        : [...answers.sanctuaryStyles, genreOption.id];
      updateAnswersAndSync({ ...answers, sanctuaryStyles: nextSanctuary });
    }
  };

  const toggleDecadeSelection = (decadeId: string) => {
    const current = answers.selectedDecades || [];
    const next = current.includes(decadeId)
      ? current.filter((d) => d !== decadeId)
      : [...current, decadeId];
    updateAnswersAndSync({ ...answers, selectedDecades: next });
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
      updateAnswersAndSync({
        ...found.answers,
        selectedDecades: ['decade_1950s', 'decade_1960s'],
        handPickedTracks: [],
      });
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

  const totalCheckedGenresAndDecades =
    answers.youthStyles.length +
    answers.sanctuaryStyles.length +
    (answers.selectedDecades || []).length;

  const pickedSongsCount = (answers.handPickedTracks || []).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <audio ref={sampleAudioRef} onEnded={() => setPlayingPreviewId(null)} />

      {/* Simple Top Progress Indicator (Step 1, 2, 3) */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-wildwoods-sand flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { num: 1, label: '1. Name & Year' },
            { num: 2, label: '2. Genres & Decades' },
            { num: 3, label: '3. Pick Songs' },
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
                className={`min-h-[40px] px-3 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-wildwoods-slate text-wildwoods-gold shadow'
                    : isComplete
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-wildwoods-cream text-slate-600 border border-wildwoods-sand'
                }`}
              >
                {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
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
              className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-xs flex items-center gap-1"
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
        <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border-2 border-wildwoods-sand space-y-6">
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
                  onChange={(e) => {
                    const yr = Number(e.target.value) || 1945;
                    const bumpStartDecade = Math.floor((yr + 12) / 10) * 10;
                    const bumpSecondDecade = bumpStartDecade + 10;
                    updateAnswersAndSync({
                      ...answers,
                      birthYear: yr,
                      selectedDecades: [
                        `decade_${bumpStartDecade}s`,
                        `decade_${bumpSecondDecade}s`,
                      ],
                    });
                  }}
                  className="w-full min-h-[60px] px-5 py-3 rounded-2xl bg-wildwoods-slate text-wildwoods-gold font-serif font-bold text-3xl text-center"
                />

                <div className="p-4 rounded-2xl bg-wildwoods-parchment border border-wildwoods-sand">
                  <div className="text-xs font-bold text-wildwoods-sage uppercase tracking-wider">
                    Golden Song Years (Ages 10–30):
                  </div>
                  <div className="text-2xl font-serif font-bold text-wildwoods-slate mt-0.5">
                    {bump.bumpStart} – {bump.bumpEnd}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full min-h-[60px] px-6 py-4 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl transition"
            >
              Next: Pick Genres &amp; Decades
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
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-500 font-bold'
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
      {/* STEP 2 OF 3: SIMPLE GENRES + DECADE GUESSES (WITH CLEAR CHECKBOXES) */}
      {/* =================================================================== */}
      {step === 2 && (
        <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border-2 border-wildwoods-sand space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
                Step 2 of 3 • Check As Many As You Like
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-slate">
                Pick Music Genres or Decades
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tap any card to check or uncheck it (<strong>✓ Selected</strong>). You can pick by{' '}
                <strong>Genre</strong>, or guess by <strong>Decade</strong> below!
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-extrabold">
              ✓ {totalCheckedGenresAndDecades} Checked
            </span>
          </div>

          {/* SECTION A: SIMPLE HIGH-LEVEL GENRES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-wildwoods-slate">
              <Music className="w-4 h-4 text-wildwoods-amber" />
              1. Favorite Music Genres (Tap to Check / Uncheck):
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {SIMPLE_GENRE_OPTIONS.map((opt) => {
                const isChecked =
                  answers.youthStyles.includes(opt.id) ||
                  answers.sanctuaryStyles.includes(opt.id);
                const isPlayingSample = playingPreviewId === opt.id;
                const isLoadingSample = loadingPreviewId === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleGenreSelection(opt)}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleGenreSelection(opt);
                      }
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-wildwoods-cream border-wildwoods-sand'
                    }`}
                  >
                    {/* Left: Clear Visual Checkbox + Genre Label */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-400 text-transparent'
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-wildwoods-slate">
                            {opt.label}
                          </span>
                          {isChecked ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                              ✓ Selected
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">
                              Tap to select
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                          {opt.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Sample Audio Button */}
                    <button
                      type="button"
                      onClick={(e) =>
                        handleToggleSeedAudioSample(opt.id, opt.searchSeed, e)
                      }
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition ${
                        isPlayingSample
                          ? 'bg-wildwoods-amber text-wildwoods-slate shadow'
                          : 'bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate border border-wildwoods-sand'
                      }`}
                    >
                      {isPlayingSample ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          {isLoadingSample ? '...' : 'Hear Sample'}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: DECADES / YEAR RANGES (FOR GUESSING ON BEHALF OF A LOVED ONE) */}
          <div className="space-y-3 pt-4 border-t border-wildwoods-parchment">
            <div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-wildwoods-slate">
                <Calendar className="w-4 h-4 text-wildwoods-amber" />
                2. Or Pick by Decade (Great When Guessing by Birth Year {answers.birthYear}):
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Not sure which genres they liked? Check the decades from when they were 10 to 30
                years old ({bump.bumpStart}–{bump.bumpEnd}).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DECADE_GUESS_OPTIONS.map((dec) => {
                const isChecked = (answers.selectedDecades || []).includes(dec.id);
                const isGoldenEraMatch =
                  dec.decadeStart + 9 >= bump.bumpStart && dec.decadeStart <= bump.bumpEnd;
                const isPlayingSample = playingPreviewId === dec.id;
                const isLoadingSample = loadingPreviewId === dec.id;

                return (
                  <div
                    key={dec.id}
                    onClick={() => toggleDecadeSelection(dec.id)}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDecadeSelection(dec.id);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between gap-2.5 ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-wildwoods-cream border-wildwoods-sand'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-400 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-sm text-wildwoods-slate">
                            {dec.label}
                          </span>
                          {isGoldenEraMatch && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-400 text-amber-950 text-[10px] font-extrabold">
                              ★ Youth Era
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {dec.subtitle}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) =>
                        handleToggleSeedAudioSample(dec.id, dec.searchSeed, e)
                      }
                      className="min-h-[36px] px-2.5 py-1 rounded-xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate text-[11px] font-extrabold flex items-center gap-1 shrink-0 border border-wildwoods-sand"
                    >
                      {isPlayingSample ? (
                        <Square className="w-3 h-3 fill-current" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      {isLoadingSample ? '...' : isPlayingSample ? 'Stop' : 'Hear'}
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
              className="w-full sm:w-auto min-h-[50px] px-5 py-3 rounded-2xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-sm sm:text-base flex items-center justify-center gap-2"
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
              className="w-full sm:flex-1 min-h-[58px] px-6 py-4 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xl transition"
            >
              Next: Preview &amp; Pick Songs
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* STEP 3 OF 3: VISUAL MULTI-SONG PICKER (PREVIEW & CHECK MULTIPLE!)   */}
      {/* =================================================================== */}
      {step === 3 && (
        <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border-2 border-wildwoods-sand space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
                Step 3 of 3 • Preview &amp; Check Individual Songs
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-slate">
                Tap Songs to Preview &amp; Add to Playlist
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We already build a full playlist from your Genres &amp; Decades—plus you can{' '}
                <strong>preview (`▶️`) and check (`+ Add`) as many specific songs</strong> below as
                you want!
              </p>
            </div>

            {pickedSongsCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-sm">
                ✓ {pickedSongsCount} Specific Song{pickedSongsCount === 1 ? '' : 's'} Added
              </span>
            )}
          </div>

          {/* Search Box to Find & Add Any Song or Singer */}
          <form onSubmit={handleSearchMoreSongsStep3} className="flex gap-2">
            <input
              type="text"
              value={songSearchQuery}
              onChange={(e) => setSongSearchQuery(e.target.value)}
              placeholder="Search any song or singer (e.g., Frank Sinatra, Patsy Cline, My Girl)..."
              className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-cream border-2 border-wildwoods-sand text-sm font-bold text-wildwoods-slate"
            />
            <button
              type="submit"
              disabled={isSearchingSongs}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-gold font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shrink-0"
            >
              <Search className="w-4 h-4" />
              {isSearchingSongs ? 'Searching...' : 'Find Songs'}
            </button>
          </form>

          {/* Interactive Multi-Song Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
              <span>Suggested Songs (Tap ▶️ to Hear, Tap + Add to Include):</span>
              {isLoadingSuggestions && <span>Loading songs...</span>}
            </div>

            <div className="divide-y divide-wildwoods-parchment border-2 border-wildwoods-sand rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto">
              {suggestedCandidates.map((cand) => {
                const picked = isCandidatePicked(cand);
                const isPlayingThis = playingPreviewId === cand.trackId;
                return (
                  <div
                    key={cand.trackId}
                    className={`p-3 flex items-center justify-between gap-2.5 transition ${
                      picked ? 'bg-emerald-50' : 'bg-white hover:bg-wildwoods-cream/60'
                    }`}
                  >
                    {/* Left: Play Preview Button + Song Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) =>
                          handleToggleDirectUrlPreview(cand.trackId, cand.previewUrl, e)
                        }
                        title={isPlayingThis ? 'Stop Preview' : 'Play 30-Second Preview'}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm transition ${
                          isPlayingThis
                            ? 'bg-wildwoods-amber text-wildwoods-slate'
                            : 'bg-wildwoods-slate text-wildwoods-gold hover:bg-wildwoods-forest'
                        }`}
                      >
                        {isPlayingThis ? (
                          <Square className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="font-bold text-sm text-wildwoods-slate truncate">
                          {cand.title}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {cand.artist} ({cand.year})
                        </div>
                      </div>
                    </div>

                    {/* Right: Clear + Add / ✓ Added Multi-Select Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePickSong(cand)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 border-2 transition ${
                        picked
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white hover:bg-emerald-50 text-wildwoods-slate border-wildwoods-sand'
                      }`}
                    >
                      {picked ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Song
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Build & Play Button */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              disabled={isSynthesizing}
              onClick={handleBuildPersonalizedJukebox}
              className="w-full min-h-[62px] px-6 py-4 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-base sm:text-xl flex items-center justify-center gap-2.5 shadow-xl transition"
            >
              <Sparkles className="w-6 h-6 shrink-0" />
              <span>
                {isSynthesizing
                  ? 'Building Your Jukebox Playlist...'
                  : `Open ${displayName === 'My' ? 'My' : `${displayName}’s`} Jukebox & Play Music`}
              </span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => {
                stopSampleAudio();
                setStep(2);
              }}
              className="w-full min-h-[46px] px-4 py-2 rounded-xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Genres &amp; Decades
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
                : 'More Options: Add a family memory note or block a sad song'}
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
                    Special Family Memory Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={answers.courtshipMemoryStory}
                    onChange={(e) =>
                      updateAnswersAndSync({ ...answers, courtshipMemoryStory: e.target.value })
                    }
                    placeholder="e.g., Danced to this at their 1965 wedding..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-wildwoods-sand text-sm"
                  />
                </div>

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
