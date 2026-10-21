'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ShieldAlert,
  Sparkles,
  HeartHandshake,
  Activity,
  Clock,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Music,
  CheckCircle2,
  ArrowRight,
  Compass,
  Brain,
  Mic2,
  Waves,
  Share2,
  ExternalLink,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  Sliders,
  Smile,
  Plus,
  Search,
  Pencil,
  Check,
  X,
  Gauge,
  TrendingUp,
  TrendingDown,
  HelpCircle,
} from 'lucide-react';
import {
  CURRENT_EMOTIONAL_STATES,
  TARGET_THERAPEUTIC_STATES,
  CurrentEmotionalStateId,
  TargetTherapeuticStateId,
  IsoTrajectoryResult,
  SequencedTrack,
  PatientProfile,
  BarsSessionLog,
  BiographicalTrack,
  getTrackEpochLabel,
} from '@/lib/iso-sequencer';
import { getFullSongStreamingLinks } from '@/lib/share-and-export';
import { ItunesCandidateTrack, searchItunesTracks } from '@/lib/itunes-audio';
import FullLengthExportModal from '@/components/FullLengthExportModal';

interface IsoJukeboxViewProps {
  patient: PatientProfile;
  currentStateId: CurrentEmotionalStateId;
  targetStateId: TargetTherapeuticStateId;
  onSelectCurrentState: (id: CurrentEmotionalStateId) => void;
  onSelectTargetState: (id: TargetTherapeuticStateId) => void;
  trajectory: IsoTrajectoryResult;
  activeTrack: SequencedTrack | null;
  isPlaying: boolean;
  progressSec: number;
  durationSec: number;
  isMuted: boolean;
  playerMode: 'receptive' | 'duet';
  onTogglePlay: (track?: SequencedTrack) => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (sec: number) => void;
  onToggleMute: () => void;
  onTogglePlayerMode: (mode: 'receptive' | 'duet') => void;
  onQuarantineTrack: (track: SequencedTrack, reason?: string) => void;
  quarantinedCount: number;
  gerdnerTimerRemainingSec: number;
  isGerdnerTimerRunning: boolean;
  onToggleGerdnerTimer: () => void;
  onOpenGuidedInterview?: () => void;
  isCustomProfile?: boolean;
  onCopyShareLink?: () => void;
  onCopyCaregiverSheet?: () => void;
  onQuickMoodLog?: (log: BarsSessionLog) => void;
  onAddTrackToLibrary?: (track: BiographicalTrack) => void;
  onUpdateTrackInLibrary?: (
    trackId: string,
    updates: Partial<
      Pick<BiographicalTrack, 'memoryNote' | 'duetPrompt' | 'bpm' | 'energy' | 'previewUrl'>
    >
  ) => void;
  playbackRate?: number;
  onChangePlaybackRate?: (rate: number) => void;
  rampMode?: 'off' | 'speed_up' | 'slow_down';
  onChangeRampMode?: (mode: 'off' | 'speed_up' | 'slow_down') => void;
  rasPulseEnabled?: boolean;
  onToggleRasPulse?: () => void;
  onOpenTutorial?: () => void;
}

const SIMPLE_MOOD_BEFORE: Array<{
  id: CurrentEmotionalStateId;
  emoji: string;
  label: string;
  sublabel: string;
  defaultTarget: TargetTherapeuticStateId;
  barsScore: number;
}> = [
  {
    id: 'agitated_sundowning',
    emoji: '😟',
    label: 'Restless or Pacing',
    sublabel: 'Needs gentle calming',
    defaultTarget: 'deep_calm',
    barsScore: 6,
  },
  {
    id: 'anxious_restless',
    emoji: '😰',
    label: 'Worried or Tense',
    sublabel: 'Needs reassurance',
    defaultTarget: 'deep_calm',
    barsScore: 5,
  },
  {
    id: 'withdrawn_sad',
    emoji: '😔',
    label: 'Quiet or Low Energy',
    sublabel: 'Needs an uplifting boost',
    defaultTarget: 'sing_along_joy',
    barsScore: 3,
  },
  {
    id: 'care_task_stress',
    emoji: '🤝',
    label: 'Ready to Visit or Care',
    sublabel: 'Daily routine / family time',
    defaultTarget: 'lucid_connection',
    barsScore: 5,
  },
];

const SIMPLE_MOOD_AFTER: Array<{
  id: string;
  emoji: string;
  label: string;
  barsScore: number;
  valence: number;
}> = [
  {
    id: 'calm_peaceful',
    emoji: '😌',
    label: 'Calm & Peaceful',
    barsScore: 4,
    valence: 5,
  },
  {
    id: 'smiling_engaged',
    emoji: '😊',
    label: 'Smiling & Present',
    barsScore: 4,
    valence: 5,
  },
  {
    id: 'singing_chatting',
    emoji: '🗣️',
    label: 'Singing / Chatting',
    barsScore: 4,
    valence: 5,
  },
  {
    id: 'still_restless',
    emoji: '😐',
    label: 'Still Restless',
    barsScore: 5,
    valence: 2,
  },
];

export default function IsoJukeboxView({
  patient,
  currentStateId,
  targetStateId,
  onSelectCurrentState,
  onSelectTargetState,
  trajectory,
  activeTrack,
  isPlaying,
  progressSec,
  durationSec,
  isMuted,
  playerMode,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onToggleMute,
  onTogglePlayerMode,
  onQuarantineTrack,
  quarantinedCount,
  gerdnerTimerRemainingSec,
  isGerdnerTimerRunning,
  onToggleGerdnerTimer,
  onOpenGuidedInterview,
  isCustomProfile = false,
  onCopyShareLink,
  onCopyCaregiverSheet,
  onQuickMoodLog,
  onAddTrackToLibrary,
  onUpdateTrackInLibrary,
  playbackRate = 1.0,
  onChangePlaybackRate,
  rampMode = 'off',
  onChangeRampMode,
  rasPulseEnabled = false,
  onToggleRasPulse,
  onOpenTutorial,
}: IsoJukeboxViewProps) {
  const [patientSafeView, setPatientSafeView] = useState(false);
  const [showAdvancedSequencer, setShowAdvancedSequencer] = useState(false);
  const [isFullLengthExportOpen, setIsFullLengthExportOpen] = useState(false);
  const [selectedAfterMoodId, setSelectedAfterMoodId] = useState<string | null>(null);
  const [moodLoggedToast, setMoodLoggedToast] = useState<string | null>(null);
  const [quarantineToast, setQuarantineToast] = useState<string | null>(null);

  // Living Playlist: Inline Quick-Add Song & Memory state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [quickSearchResults, setQuickSearchResults] = useState<ItunesCandidateTrack[]>([]);
  const [isQuickSearching, setIsQuickSearching] = useState(false);
  const [quickMemoryDraft, setQuickMemoryDraft] = useState('');
  const [quickVibe, setQuickVibe] = useState<'upbeat' | 'warm' | 'peaceful'>('warm');

  // Living Playlist: Inline Edit Memory state for active song
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const [editMemoryText, setEditMemoryText] = useState('');
  const [editPromptText, setEditPromptText] = useState('');
  const [editVibe, setEditVibe] = useState<'upbeat' | 'warm' | 'peaceful'>('warm');

  const currentTrack = activeTrack || trajectory.orderedTracks[0] || null;

  const openMemoryEditor = (track: SequencedTrack) => {
    setEditMemoryText(track.memoryNote);
    setEditPromptText(track.duetPrompt);
    setEditVibe(track.bpm >= 108 ? 'upbeat' : track.bpm >= 80 ? 'warm' : 'peaceful');
    setIsEditingMemory(true);
  };

  const handleSaveMemoryEdit = () => {
    if (!currentTrack || !onUpdateTrackInLibrary) {
      setIsEditingMemory(false);
      return;
    }
    const newBpm =
      editVibe === 'upbeat'
        ? Math.max(112, currentTrack.bpm)
        : editVibe === 'peaceful'
        ? Math.min(68, currentTrack.bpm)
        : 88;
    const newEnergy = editVibe === 'upbeat' ? 8 : editVibe === 'peaceful' ? 2 : 5;

    onUpdateTrackInLibrary(currentTrack.id, {
      memoryNote: editMemoryText.trim() || currentTrack.memoryNote,
      duetPrompt: editPromptText.trim() || currentTrack.duetPrompt,
      bpm: newBpm,
      energy: newEnergy,
    });
    setIsEditingMemory(false);
    setMoodLoggedToast(`✓ Saved memory & notes for "${currentTrack.title}"!`);
    setTimeout(() => setMoodLoggedToast(null), 4000);
  };

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchQuery.trim()) return;
    setIsQuickSearching(true);
    const results = await searchItunesTracks(quickSearchQuery, 6);
    setQuickSearchResults(results);
    setIsQuickSearching(false);
  };

  const handleQuickAddTrack = (cand: ItunesCandidateTrack) => {
    if (!onAddTrackToLibrary) return;
    const bpm =
      quickVibe === 'upbeat' ? 116 : quickVibe === 'peaceful' ? 66 : cand.inferredBpm || 88;
    const energy = quickVibe === 'upbeat' ? 8 : quickVibe === 'peaceful' ? 2 : 5;

    const newTrack: BiographicalTrack = {
      id: cand.trackId,
      title: cand.title,
      artist: cand.artist,
      year: cand.year,
      bpm,
      mode: 'Major',
      energy,
      valence: 9,
      neuroTargets: cand.neuroTargets,
      memoryNote:
        quickMemoryDraft.trim() ||
        `Added to ${patient.preferredName}’s living Jukebox (${getTrackEpochLabel(
          cand.year,
          patient.birthYear
        )}).`,
      duetPrompt: `Ask ${patient.preferredName} what memories or stories come to mind when ${cand.artist} sings "${cand.title}".`,
      chorusLyrics: [
        `${cand.title} — ${cand.artist} (${cand.year})`,
        'Sing or hum along together with the chorus hook.',
      ],
      itunesQuery: `${cand.artist} ${cand.title}`,
      previewUrl: cand.previewUrl,
      artworkUrl: cand.artworkUrl,
      epochLabel: getTrackEpochLabel(cand.year, patient.birthYear),
    };

    onAddTrackToLibrary(newTrack);
    setQuickMemoryDraft('');
    setMoodLoggedToast(
      `✨ Added "${cand.title}" by ${cand.artist} to ${patient.preferredName}’s Jukebox!`
    );
    setTimeout(() => setMoodLoggedToast(null), 5000);
  };

  const handleRedFlag = (track: SequencedTrack) => {
    onQuarantineTrack(
      track,
      'Skipped & blocked via Jukebox player (avoiding distress or disliked song).'
    );
    setQuarantineToast(
      `Removed "${track.title}" from ${patient.preferredName}’s Jukebox and skipped to the next song.`
    );
    setTimeout(() => setQuarantineToast(null), 5000);
  };

  const handleSelectSimpleBeforeMood = (item: (typeof SIMPLE_MOOD_BEFORE)[number]) => {
    onSelectCurrentState(item.id);
    onSelectTargetState(item.defaultTarget);
    setSelectedAfterMoodId(null);
  };

  const handleSelectSimpleAfterMood = (afterItem: (typeof SIMPLE_MOOD_AFTER)[number]) => {
    setSelectedAfterMoodId(afterItem.id);
    const beforeItem =
      SIMPLE_MOOD_BEFORE.find((b) => b.id === currentStateId) || SIMPLE_MOOD_BEFORE[0];

    if (onQuickMoodLog) {
      onQuickMoodLog({
        id: `quick-mood-${Date.now()}`,
        date: 'Today',
        time: new Date().toTimeString().slice(0, 5),
        triggerContext: `Jukebox Check-In: ${beforeItem.label} → ${afterItem.label}`,
        currentStateLabel: trajectory.currentState.label,
        targetStateLabel: trajectory.targetState.label,
        preBars: beforeItem.barsScore,
        postBars: afterItem.barsScore,
        moodValencePre: 2,
        moodValencePost: afterItem.valence,
        prnAvoided: afterItem.barsScore === 4,
        notes: `${patient.preferredName} shifted from "${beforeItem.label}" before music to "${afterItem.label}" after listening.`,
      });
    }

    setMoodLoggedToast(
      `✓ Mood Check-In Saved: ${patient.preferredName} went from "${beforeItem.label}" → "${afterItem.label}".`
    );
    setTimeout(() => setMoodLoggedToast(null), 5000);
  };

  const formatSeconds = (sec: number) => {
    const clamped = Math.max(0, Math.floor(sec));
    const mins = Math.floor(clamped / 60);
    const rem = clamped % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const chartTracks = trajectory.orderedTracks;
  const minBpm = 55;
  const maxBpm = 135;

  // Oversized Patient-Safe Lock View
  if (patientSafeView && currentTrack) {
    return (
      <div className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-wildwoods-sage/40 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-wildwoods-moss">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wildwoods-moss text-wildwoods-mint text-sm font-semibold">
              <Lock className="w-4 h-4" />
              Simple Full-Screen Player for {patient.preferredName}
            </span>
          </div>
          <button
            onClick={() => setPatientSafeView(false)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-wildwoods-moss hover:bg-wildwoods-sage text-wildwoods-cream font-semibold text-sm transition"
          >
            <Unlock className="w-4 h-4" />
            Exit Full-Screen View
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8">
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-wildwoods-amber/70 shadow-2xl overflow-hidden bg-wildwoods-forest flex items-center justify-center ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '14s' }}
            >
              {currentTrack.artworkUrl ? (
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <Music className="w-24 h-24 text-wildwoods-amber" />
              )}
              <div className="absolute w-16 h-16 rounded-full bg-wildwoods-slate border-4 border-wildwoods-amber" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-wildwoods-amber/20 border border-wildwoods-amber text-wildwoods-gold font-semibold text-base">
              {currentTrack.year} Favorite
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-wildwoods-cream">
              {currentTrack.title}
            </h2>
            <p className="text-2xl text-wildwoods-mint font-medium">{currentTrack.artist}</p>

            <div className="bg-wildwoods-forest/90 p-6 rounded-2xl border border-wildwoods-sage/40 space-y-2">
              <p className="text-xs uppercase tracking-wider text-wildwoods-gold font-bold">
                Sing-Along Chorus
              </p>
              {currentTrack.chorusLyrics.map((line, i) => (
                <p
                  key={i}
                  className="text-2xl md:text-3xl font-serif text-wildwoods-cream leading-relaxed"
                >
                  “{line}”
                </p>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4">
              <button
                onClick={() => onTogglePlay(currentTrack)}
                className="min-h-[72px] px-10 py-5 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-bold text-2xl flex items-center gap-4 shadow-xl transition"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                {isPlaying ? 'Pause Music' : 'Play Music'}
              </button>

              <button
                onClick={onNextTrack}
                className="min-h-[72px] px-8 py-5 rounded-2xl bg-wildwoods-moss hover:bg-wildwoods-sage text-wildwoods-cream font-bold text-xl flex items-center gap-3 transition"
              >
                <SkipForward className="w-7 h-7" />
                Next Song
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toasts */}
      {quarantineToast && (
        <div
          role="alert"
          className="bg-red-950 text-red-100 border-2 border-red-500 rounded-2xl p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span className="font-medium text-sm">{quarantineToast}</span>
          </div>
          <button
            onClick={() => setQuarantineToast(null)}
            className="text-xs underline px-3 py-1 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {moodLoggedToast && (
        <div
          role="status"
          className="bg-emerald-950 text-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Smile className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-sm">{moodLoggedToast}</span>
          </div>
          <button
            onClick={() => setMoodLoggedToast(null)}
            className="text-xs underline px-3 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Simple, Friendly Jukebox Header */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-7 shadow-xl border border-wildwoods-moss">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {isCustomProfile ? (
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold">
                  ✓ Custom Family Jukebox
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-wildwoods-amber/25 border border-wildwoods-amber text-wildwoods-gold text-xs font-bold">
                  Sample Demo Jukebox (Arthur Pendelton, Age 82)
                </span>
              )}
              <span className="text-xs text-wildwoods-mint">
                Favorite Era: {patient.birthYear + 10}–{patient.birthYear + 30}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-wildwoods-cream">
              {patient.preferredName}’s Personal Jukebox
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenGuidedInterview && (
              <button
                type="button"
                onClick={onOpenGuidedInterview}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow transition"
              >
                <Sparkles className="w-4 h-4" />
                {isCustomProfile ? 'Edit Profile' : 'Create Your Own Jukebox'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullLengthExportOpen(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/50 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow transition"
            >
              <ExternalLink className="w-4 h-4 text-emerald-200" />
              Export to Spotify / Full Songs
            </button>

            {onCopyShareLink && (
              <button
                type="button"
                onClick={onCopyShareLink}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream border border-wildwoods-sage/40 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
              >
                <Share2 className="w-4 h-4 text-wildwoods-gold" />
                Share Link
              </button>
            )}

            <button
              type="button"
              onClick={() => setPatientSafeView(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream border border-wildwoods-sage/40 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
            >
              <Lock className="w-4 h-4 text-wildwoods-gold" />
              Simple Full-Screen View
            </button>

            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-gold border border-wildwoods-amber/50 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
              >
                <HelpCircle className="w-4 h-4 text-wildwoods-gold" />
                How to Use
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Quick & Easy Mood Check-In: Mood Before -> Mood After */}
      <section
        aria-label="Quick Mood Before and After Check-In"
        className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-wildwoods-sand"
      >
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
          {/* Left Half: Mood Before Music */}
          <div className="lg:col-span-5 bg-amber-50/50 rounded-2xl p-4 md:p-5 border-2 border-amber-200/90 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-wildwoods-slate flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Mood Before Music
              </h2>
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Auto-Tunes Playlist
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SIMPLE_MOOD_BEFORE.map((item) => {
                const isSelected = currentStateId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSimpleBeforeMood(item)}
                    className={`min-h-[72px] p-3 rounded-xl border-2 text-left transition flex flex-col justify-center ${
                      isSelected
                        ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                        : 'bg-white hover:bg-wildwoods-cream text-wildwoods-slate border-amber-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-lg">{item.emoji}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-wildwoods-gold shrink-0" />
                      )}
                    </div>
                    <div className="font-bold text-xs sm:text-sm mt-1 leading-tight">
                      {item.label}
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        isSelected ? 'text-wildwoods-mint' : 'text-slate-500'
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Directional Arrow */}
          <div className="lg:col-span-1 flex flex-row lg:flex-col items-center justify-center py-1 lg:py-0">
            <div className="w-10 h-10 rounded-full bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center shadow-md border-2 border-wildwoods-slate">
              <ArrowRight className="w-5 h-5 stroke-[2.5] rotate-90 lg:rotate-0" />
            </div>
          </div>

          {/* Right Half: Mood After Listening (1-Tap Log) */}
          <div className="lg:col-span-5 bg-emerald-50/50 rounded-2xl p-4 md:p-5 border-2 border-emerald-200/90 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-wildwoods-slate flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-wildwoods-sage text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Mood After Listening
              </h2>
              <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                1-Tap Save to Log
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SIMPLE_MOOD_AFTER.map((item) => {
                const isSelected = selectedAfterMoodId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSimpleAfterMood(item)}
                    className={`min-h-[72px] p-3 rounded-xl border-2 text-left transition flex flex-col justify-center ${
                      isSelected
                        ? 'bg-wildwoods-forest text-wildwoods-cream border-emerald-400 shadow-md'
                        : 'bg-white hover:bg-wildwoods-cream text-wildwoods-slate border-emerald-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-lg">{item.emoji}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="font-bold text-xs sm:text-sm mt-1 leading-tight">
                      {item.label}
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        isSelected ? 'text-emerald-200' : 'text-slate-500'
                      }`}
                    >
                      {isSelected ? 'Saved!' : 'Tap to record'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Everyday Jukebox Player & Clean Song Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Simple Tactile Vinyl Player */}
        <section
          aria-label="Jukebox Music Player"
          className="lg:col-span-7 bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss space-y-6"
        >
          {/* Simple Listening Mode Switch */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-wildwoods-moss">
            <div className="flex items-center gap-2 bg-wildwoods-forest p-1.5 rounded-2xl border border-wildwoods-moss">
              <button
                type="button"
                onClick={() => onTogglePlayerMode('receptive')}
                className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                  playerMode === 'receptive'
                    ? 'bg-wildwoods-amber text-wildwoods-slate shadow'
                    : 'text-wildwoods-mint hover:text-white'
                }`}
              >
                <Waves className="w-4 h-4" />
                Relax &amp; Listen
              </button>
              <button
                type="button"
                onClick={() => onTogglePlayerMode('duet')}
                className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                  playerMode === 'duet'
                    ? 'bg-wildwoods-amber text-wildwoods-slate shadow'
                    : 'text-wildwoods-mint hover:text-white'
                }`}
              >
                <Mic2 className="w-4 h-4" />
                Sing-Along &amp; Family Story
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-wildwoods-mint">
              <Clock className="w-4 h-4 text-wildwoods-gold" />
              <span>30-Min Timer: {formatSeconds(gerdnerTimerRemainingSec)}</span>
              <button
                type="button"
                onClick={onToggleGerdnerTimer}
                className="px-2.5 py-1 rounded-lg bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream font-semibold"
              >
                {isGerdnerTimerRunning ? 'Pause' : 'Start'}
              </button>
            </div>
          </div>

          {currentTrack && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-4 flex flex-col items-center">
                  <div
                    className={`relative w-40 h-40 rounded-full border-4 border-wildwoods-amber shadow-2xl overflow-hidden bg-wildwoods-forest flex items-center justify-center ${
                      isPlaying ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '12s' }}
                  >
                    {currentTrack.artworkUrl ? (
                      <img
                        src={currentTrack.artworkUrl}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-16 h-16 text-wildwoods-gold" />
                    )}
                    <div className="absolute w-10 h-10 rounded-full bg-wildwoods-slate border-2 border-wildwoods-amber" />
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-2.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wildwoods-forest text-wildwoods-gold text-xs font-bold">
                    {currentTrack.year} • {currentTrack.epochLabel}
                  </div>

                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-wildwoods-cream">
                    {currentTrack.title}
                  </h3>
                  <p className="text-lg text-wildwoods-mint font-medium">{currentTrack.artist}</p>

                  {/* Family Memory Story with 1-Click Inline Edit / Add Memory */}
                  <div className="p-3.5 rounded-2xl bg-wildwoods-forest/90 border border-wildwoods-moss text-left text-xs sm:text-sm text-wildwoods-cream leading-relaxed space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-wildwoods-gold font-bold text-xs uppercase tracking-wider">
                        Family Memory &amp; Note for This Song:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          isEditingMemory ? setIsEditingMemory(false) : openMemoryEditor(currentTrack)
                        }
                        className="px-2.5 py-1 rounded-lg bg-wildwoods-slate hover:bg-wildwoods-moss text-wildwoods-mint hover:text-white text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <Pencil className="w-3 h-3 text-wildwoods-gold" />
                        {isEditingMemory ? 'Cancel' : 'Edit / Add Memory'}
                      </button>
                    </div>

                    {isEditingMemory ? (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-wildwoods-mint mb-1">
                            Why {patient.preferredName} loves this song (or memory it sparked):
                          </label>
                          <textarea
                            rows={2}
                            value={editMemoryText}
                            onChange={(e) => setEditMemoryText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-wildwoods-slate border border-wildwoods-amber text-wildwoods-cream text-xs"
                            placeholder={`e.g., "${patient.preferredName} smiled and remembered dancing to this in 1962..."`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-wildwoods-mint mb-1">
                            Conversation Starter (What to ask {patient.preferredName}):
                          </label>
                          <input
                            type="text"
                            value={editPromptText}
                            onChange={(e) => setEditPromptText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-wildwoods-slate border border-wildwoods-moss text-wildwoods-cream text-xs"
                            placeholder={`e.g., "Ask ${patient.preferredName} about his first car..."`}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-wildwoods-mint font-semibold">
                              Song Vibe:
                            </span>
                            {(
                              [
                                { id: 'upbeat', label: '🎵 Upbeat' },
                                { id: 'warm', label: '🎶 Medium' },
                                { id: 'peaceful', label: '🌙 Peaceful' },
                              ] as const
                            ).map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setEditVibe(v.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                  editVibe === v.id
                                    ? 'bg-wildwoods-amber text-wildwoods-slate border-wildwoods-amber'
                                    : 'bg-wildwoods-slate text-wildwoods-mint border-wildwoods-moss'
                                }`}
                              >
                                {v.label}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleSaveMemoryEdit}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save Memory
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{currentTrack.memoryNote}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sing-Along Lyrics & Conversation Starter when Duet Mode is active */}
              {playerMode === 'duet' && (
                <div className="bg-wildwoods-forest rounded-2xl p-5 border-2 border-wildwoods-amber/60 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-wildwoods-gold flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    Sing-Along Chorus &amp; Conversation Starter
                  </div>
                  <div className="bg-wildwoods-slate p-4 rounded-xl border border-wildwoods-moss space-y-1.5">
                    {currentTrack.chorusLyrics.map((line, idx) => (
                      <p
                        key={idx}
                        className="text-lg md:text-xl font-serif font-semibold text-wildwoods-cream"
                      >
                        ♪ “{line}”
                      </p>
                    ))}
                  </div>
                  <div className="text-xs sm:text-sm text-amber-100 bg-amber-950/60 p-3.5 rounded-xl border border-wildwoods-amber/40">
                    <strong>Ask {patient.preferredName}:</strong> “{currentTrack.duetPrompt}”
                  </div>
                </div>
              )}

              {/* Audio Scrubber & Big Simple Transport Buttons */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-wildwoods-mint w-10">
                    {formatSeconds(progressSec)}
                  </span>
                  <input
                    type="range"
                    aria-label="Audio playback progress"
                    min={0}
                    max={Math.max(1, durationSec || 30)}
                    value={Math.min(progressSec, durationSec || 30)}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="w-full h-2.5 bg-wildwoods-forest rounded-lg appearance-none cursor-pointer accent-wildwoods-amber"
                  />
                  <span className="text-xs font-mono text-wildwoods-mint w-10 text-right">
                    {formatSeconds(durationSec || 30)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onPrevTrack}
                      aria-label="Previous song"
                      className="min-w-[50px] min-h-[50px] p-3 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream flex items-center justify-center transition"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onTogglePlay(currentTrack)}
                      className="min-h-[56px] px-8 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-base flex items-center gap-2.5 shadow-lg transition"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      {isPlaying ? 'Pause' : 'Play Song'}
                    </button>

                    <button
                      type="button"
                      onClick={onNextTrack}
                      aria-label="Next song"
                      className="min-w-[50px] min-h-[50px] p-3 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream flex items-center justify-center transition"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={onToggleMute}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                      className="min-w-[50px] min-h-[50px] p-3 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-mint flex items-center justify-center transition"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRedFlag(currentTrack)}
                    className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-red-900/80 hover:bg-red-700 text-red-100 border border-red-400/40 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-300" />
                    Skip &amp; Never Play Again
                  </button>
                </div>

                {/* Pitch-Locked Tempo & Pace Controller (Parkinson's RAS & Motor Entrainment) */}
                {onChangePlaybackRate && (
                  <div className="mt-3 p-4 rounded-2xl bg-wildwoods-forest/95 border border-wildwoods-moss space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-wildwoods-gold" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-cream">
                          Tempo &amp; Pace Matcher
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          🔒 Pitch Preserved (Original Key)
                        </span>
                      </div>

                      <div className="text-xs font-mono font-bold text-wildwoods-gold">
                        {Math.round(currentTrack.bpm * playbackRate)} BPM ({Math.round(playbackRate * 100)}% Pace)
                      </div>
                    </div>

                    {/* Slider & Quick Step Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onChangePlaybackRate(playbackRate - 0.05)}
                        className="px-3 py-1.5 rounded-xl bg-wildwoods-slate hover:bg-wildwoods-moss text-wildwoods-mint font-bold text-xs border border-wildwoods-moss transition"
                      >
                        -5% Slower
                      </button>

                      <input
                        type="range"
                        aria-label="Adjust tempo without changing pitch"
                        min={0.65}
                        max={1.35}
                        step={0.01}
                        value={playbackRate}
                        onChange={(e) => onChangePlaybackRate(Number(e.target.value))}
                        className="flex-1 min-w-[120px] h-2 bg-wildwoods-slate rounded-lg appearance-none cursor-pointer accent-wildwoods-amber"
                      />

                      <button
                        type="button"
                        onClick={() => onChangePlaybackRate(playbackRate + 0.05)}
                        className="px-3 py-1.5 rounded-xl bg-wildwoods-slate hover:bg-wildwoods-moss text-wildwoods-mint font-bold text-xs border border-wildwoods-moss transition"
                      >
                        +5% Faster
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangePlaybackRate(1.0)}
                        className="px-3 py-1.5 rounded-xl bg-wildwoods-slate hover:bg-wildwoods-moss text-wildwoods-gold font-bold text-xs border border-wildwoods-amber/40 transition"
                      >
                        100% Reset
                      </button>
                    </div>

                    {/* Gradual Speed-Up (Parkinson's RAS) / Slow-Down & Beat Cue Toggles */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-wildwoods-moss/70 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {onChangeRampMode && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onChangeRampMode(rampMode === 'speed_up' ? 'off' : 'speed_up')
                              }
                              className={`px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 border transition ${
                                rampMode === 'speed_up'
                                  ? 'bg-wildwoods-amber text-wildwoods-slate border-wildwoods-amber shadow'
                                  : 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-moss hover:bg-wildwoods-moss'
                              }`}
                              title="Match patient's starting pace, then gradually speed up tempo without changing vocal pitch (Parkinson's Rhythmic Auditory Stimulation)"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              {rampMode === 'speed_up'
                                ? 'Gradually Speeding Up... (Stop)'
                                : 'Gradual Speed-Up (Parkinson’s / Gait Pace)'}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onChangeRampMode(rampMode === 'slow_down' ? 'off' : 'slow_down')
                              }
                              className={`px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 border transition ${
                                rampMode === 'slow_down'
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                                  : 'bg-wildwoods-slate text-wildwoods-mint border-wildwoods-moss hover:bg-wildwoods-moss'
                              }`}
                              title="Gradually slow the song's tempo down without dropping pitch"
                            >
                              <TrendingDown className="w-3.5 h-3.5" />
                              {rampMode === 'slow_down'
                                ? 'Gradually Slowing Down... (Stop)'
                                : 'Gradual Slow-Down'}
                            </button>
                          </>
                        )}
                      </div>

                      {onToggleRasPulse && (
                        <button
                          type="button"
                          onClick={onToggleRasPulse}
                          className={`px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 border transition ${
                            rasPulseEnabled
                              ? 'bg-wildwoods-amber text-wildwoods-slate border-wildwoods-amber'
                              : 'bg-wildwoods-slate text-wildwoods-mint border-wildwoods-moss hover:bg-wildwoods-moss'
                          }`}
                          title="Layer a gentle rhythmic beat cue synced to the song's live BPM for Parkinson's walking or movement entrainment"
                        >
                          🥁 {rasPulseEnabled ? 'Beat Cue: ON' : 'Beat Pulse Cue (RAS)'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 1-Click Full Song Links */}
                {(() => {
                  const fullLinks = getFullSongStreamingLinks(currentTrack);
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-wildwoods-moss/80 text-xs">
                      <span className="text-wildwoods-mint">Open Full-Length Song:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={fullLinks.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-500/40 font-bold inline-flex items-center gap-1 transition"
                        >
                          Spotify <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={fullLinks.appleMusicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream border border-wildwoods-sage/50 font-bold inline-flex items-center gap-1 transition"
                        >
                          Apple Music <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={fullLinks.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-gold border border-wildwoods-amber/40 font-bold inline-flex items-center gap-1 transition"
                        >
                          YouTube <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </section>

        {/* Right 5 Columns: Living Playlist Queue + Inline "+ Add a Song or Memory" */}
        <section
          aria-label="Up Next Playlist Queue"
          className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-md border border-wildwoods-sand space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wildwoods-parchment pb-3">
            <div>
              <h2 className="text-xl font-serif font-bold text-wildwoods-slate">
                {patient.preferredName}’s Playlist ({trajectory.orderedTracks.length} Songs)
              </h2>
              <p className="text-xs text-slate-500">
                A living playlist — add new songs or family memories anytime
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullLengthExportOpen(true)}
                className="min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Export to Spotify
              </button>

              <button
                type="button"
                onClick={() => setShowQuickAdd((prev) => !prev)}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition ${
                  showQuickAdd
                    ? 'bg-wildwoods-slate text-wildwoods-cream'
                    : 'bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate'
                }`}
              >
                {showQuickAdd ? (
                  <>
                    <X className="w-4 h-4" />
                    Close Add Song
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Song / Memory
                  </>
                )}
              </button>
            </div>
          </div>

          <FullLengthExportModal
            isOpen={isFullLengthExportOpen}
            onClose={() => setIsFullLengthExportOpen(false)}
            patient={patient}
            trajectory={trajectory}
            onAttachFullAudioFile={(trackId, fileUrl, fileName) => {
              if (onUpdateTrackInLibrary) {
                onUpdateTrackInLibrary(trackId, { previewUrl: fileUrl });
              }
              setMoodLoggedToast(
                `🎵 Attached full-length audio file "${fileName}"! Press Play and use the Tempo & Pace Matcher.`
              );
              setTimeout(() => setMoodLoggedToast(null), 5500);
            }}
          />

          {/* Inline Quick-Add Song & Memory Drawer right inside the simple Jukebox */}
          {showQuickAdd && (
            <div className="p-4 rounded-2xl bg-wildwoods-cream border-2 border-wildwoods-amber space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate">
                Quick-Add a Song &amp; Family Memory to {patient.preferredName}’s Jukebox
              </div>

              <form onSubmit={handleQuickSearch} className="flex gap-2">
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  placeholder="Type song or artist (e.g., Patsy Cline, Moon River)..."
                  className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-wildwoods-sand text-xs font-medium text-wildwoods-slate"
                />
                <button
                  type="submit"
                  disabled={isQuickSearching}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-cream font-bold text-xs flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-wildwoods-gold" />
                  {isQuickSearching ? '...' : 'Find'}
                </button>
              </form>

              <div>
                <input
                  type="text"
                  value={quickMemoryDraft}
                  onChange={(e) => setQuickMemoryDraft(e.target.value)}
                  placeholder={`Optional memory note (e.g., "Dad sang this on road trips")...`}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-wildwoods-sand text-xs text-wildwoods-slate"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-600">How does this song feel?</span>
                <div className="flex gap-1.5">
                  {(
                    [
                      { id: 'upbeat', label: '🎵 Upbeat' },
                      { id: 'warm', label: '🎶 Medium' },
                      { id: 'peaceful', label: '🌙 Peaceful' },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setQuickVibe(v.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                        quickVibe === v.id
                          ? 'bg-wildwoods-slate text-wildwoods-gold border-wildwoods-slate'
                          : 'bg-white text-slate-600 border-wildwoods-sand'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {quickSearchResults.length > 0 && (
                <div className="space-y-1.5 max-h-[210px] overflow-y-auto pt-1">
                  {quickSearchResults.map((cand) => (
                    <div
                      key={cand.trackId}
                      className="p-2.5 rounded-xl bg-white border border-wildwoods-sand flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-wildwoods-slate truncate">
                          {cand.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {cand.artist} ({cand.year})
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickAddTrack(cand)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {trajectory.orderedTracks.map((track, idx) => {
              const isTrackActive = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onTogglePlay(track)}
                  className={`p-3 rounded-2xl border cursor-pointer transition space-y-1.5 ${
                    isTrackActive
                      ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                      : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePlay(track);
                        }}
                        aria-label={`Play ${track.title}`}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                          isTrackActive && isPlaying
                            ? 'bg-wildwoods-amber text-wildwoods-slate'
                            : 'bg-wildwoods-forest text-wildwoods-cream'
                        }`}
                      >
                        {isTrackActive && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">
                          {idx + 1}. {track.title}
                        </div>
                        <div
                          className={`text-xs truncate ${
                            isTrackActive ? 'text-wildwoods-mint' : 'text-slate-600'
                          }`}
                        >
                          {track.artist} ({track.year})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePlay(track);
                          openMemoryEditor(track);
                        }}
                        title="Edit or add a family memory for this song"
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 ${
                          isTrackActive
                            ? 'bg-wildwoods-forest text-wildwoods-gold hover:bg-wildwoods-moss'
                            : 'bg-white text-slate-600 hover:bg-wildwoods-sand border border-wildwoods-sand'
                        }`}
                      >
                        <Pencil className="w-3 h-3" />
                        Memory
                      </button>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                          track.phase === 1
                            ? 'bg-amber-100 text-amber-900'
                            : track.phase === 2
                            ? 'bg-teal-100 text-teal-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {track.phase === 1 ? 'Match' : track.phase === 2 ? 'Bridge' : 'Calm'}
                      </span>
                    </div>
                  </div>

                  {/* Preview of the saved family memory note right under the song title */}
                  {track.memoryNote && (
                    <p
                      className={`text-[11px] line-clamp-1 pl-13 ${
                        isTrackActive ? 'text-wildwoods-mint/90' : 'text-slate-500'
                      }`}
                    >
                      💬 {track.memoryNote}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 4. Expandable Drawer: Advanced & Clinical Controls (Transformation Sequencer, BPM Curve, 3-Phase Breakdown) */}
      <section className="bg-white rounded-3xl shadow-md border-2 border-wildwoods-sand overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvancedSequencer((prev) => !prev)}
          className="w-full p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 text-left hover:bg-wildwoods-cream/60 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-wildwoods-slate text-wildwoods-gold flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
                Optional Power Tools • For Caregivers &amp; Clinicians
              </div>
              <h2 className="text-lg md:text-xl font-serif font-bold text-wildwoods-slate">
                Advanced Emotional Transformation Sequencer, BPM Slope &amp; Clinical Controls
              </h2>
            </div>
          </div>

          <span className="px-4 py-2 rounded-xl bg-wildwoods-parchment text-wildwoods-slate font-bold text-xs sm:text-sm flex items-center gap-2 border border-wildwoods-sand">
            {showAdvancedSequencer ? (
              <>
                Hide Advanced Controls <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Expand Sequencer &amp; Clinical Details <ChevronDown className="w-4 h-4" />
              </>
            )}
          </span>
        </button>

        {showAdvancedSequencer && (
          <div className="p-6 md:p-8 border-t border-wildwoods-sand space-y-8 bg-wildwoods-cream/40">
            {/* Caregiver Export & Print Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-wildwoods-sand">
              <div className="text-xs text-slate-600 flex items-center gap-4">
                <span>
                  <strong>Proactive Sundowning Shield:</strong> Auto-dosing 30m prior to{' '}
                  {patient.sundowningPeakTime}
                </span>
                <span>•</span>
                <span>
                  <strong>Red Flag Quarantine:</strong> {quarantinedCount} blocked
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onCopyCaregiverSheet && (
                  <button
                    type="button"
                    onClick={onCopyCaregiverSheet}
                    className="px-3.5 py-2 rounded-xl bg-wildwoods-slate text-wildwoods-cream font-bold text-xs flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-wildwoods-gold" />
                    Copy Caregiver Sheet
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-wildwoods-parchment text-wildwoods-slate border border-wildwoods-sand font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Bedside Chart
                </button>
              </div>
            </div>

            {/* Full Emotional Compass: Where We Are Now -> Iso-Bridge -> Where We Want To Be */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-wildwoods-sand space-y-5">
              <div>
                <div className="inline-flex items-center gap-2 text-wildwoods-sage font-bold text-xs uppercase tracking-widest mb-1">
                  <Compass className="w-4 h-4" />
                  The Emotional Compass (NCT04236557 Iso-Principle Protocol)
                </div>
                <h3 className="text-xl font-serif font-bold text-wildwoods-slate">
                  Fine-Tune Current State &amp; Target Therapeutic Goal
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 lg:gap-5 items-stretch">
                {/* Module Half 1: Where We Are Now */}
                <div className="lg:col-span-5 bg-amber-50/40 rounded-3xl p-5 border-2 border-amber-300/80 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/80">
                    <h4 className="text-sm font-extrabold text-wildwoods-slate uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-extrabold">
                        1
                      </span>
                      Where We Are Now
                    </h4>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                      Phase 1 Match (0–7m)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    {CURRENT_EMOTIONAL_STATES.map((state) => {
                      const isSelected = state.id === currentStateId;
                      return (
                        <button
                          key={state.id}
                          type="button"
                          onClick={() => onSelectCurrentState(state.id)}
                          className={`min-h-[100px] text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                              : 'bg-white hover:bg-wildwoods-cream text-wildwoods-slate border-amber-200/90'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-sm leading-snug">{state.label}</span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-wildwoods-gold shrink-0" />
                              )}
                            </div>
                            <p
                              className={`text-[11px] font-semibold mt-1 ${
                                isSelected ? 'text-wildwoods-gold' : 'text-amber-800'
                              }`}
                            >
                              {state.clinicalSubtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Center Directional Right-Arrow Bridge Connector */}
                <div className="lg:col-span-1 flex flex-row lg:flex-col items-center justify-center py-2 lg:py-0">
                  <div className="hidden lg:block w-0.5 flex-1 bg-gradient-to-b from-amber-300 via-wildwoods-amber to-emerald-400 opacity-60" />
                  <div className="my-2 px-3 py-3 rounded-2xl bg-wildwoods-slate text-wildwoods-cream border-2 border-wildwoods-amber shadow-lg flex flex-col items-center justify-center text-center gap-1 min-w-[92px]">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-wildwoods-gold">
                      Iso-Bridge
                    </span>
                    <div className="w-10 h-10 rounded-full bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center shadow">
                      <ArrowRight className="w-6 h-6 stroke-[2.5] rotate-90 lg:rotate-0 transition-transform" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-wildwoods-mint">
                      {trajectory.currentState.targetBpm}→{trajectory.targetState.targetBpm}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-wildwoods-mint/80">
                      BPM Slope
                    </span>
                  </div>
                  <div className="hidden lg:block w-0.5 flex-1 bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-60" />
                </div>

                {/* Module Half 2: Where We Want To Be */}
                <div className="lg:col-span-5 bg-emerald-50/40 rounded-3xl p-5 border-2 border-emerald-300/80 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-200/80">
                    <h4 className="text-sm font-extrabold text-wildwoods-slate uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-wildwoods-sage text-white text-xs flex items-center justify-center font-extrabold">
                        2
                      </span>
                      Where We Want To Be
                    </h4>
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      Phase 3 Goal (19–30m)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 flex-1">
                    {TARGET_THERAPEUTIC_STATES.map((target) => {
                      const isSelected = target.id === targetStateId;
                      return (
                        <button
                          key={target.id}
                          type="button"
                          onClick={() => onSelectTargetState(target.id)}
                          className={`min-h-[76px] text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-wildwoods-forest text-wildwoods-cream border-emerald-400 shadow-md'
                              : 'bg-white hover:bg-wildwoods-cream text-wildwoods-slate border-emerald-200/90'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm">{target.label}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p
                            className={`text-xs mt-1 ${
                              isSelected ? 'text-wildwoods-mint' : 'text-slate-600'
                            }`}
                          >
                            {target.clinicalSubtitle}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Live BPM & Energy SVG Curve + 3-Phase Clinical Breakdown */}
            <div className="bg-wildwoods-slate rounded-3xl p-6 border border-wildwoods-moss text-wildwoods-cream space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-wildwoods-gold">
                    Autonomic Entrainment Curve
                  </span>
                  <h3 className="text-lg font-serif font-bold">
                    30-Minute Iso-Principle BPM Trajectory ({trajectory.currentState.targetBpm} BPM →{' '}
                    {trajectory.targetState.targetBpm} BPM)
                  </h3>
                </div>
                <span className="text-xs text-wildwoods-mint">
                  Click any node to audition that phase
                </span>
              </div>

              <svg
                viewBox="0 0 450 150"
                className="w-full h-36 overflow-visible"
                role="img"
                aria-label="BPM trajectory curve across the three clinical phases"
              >
                <rect x="0" y="10" width="145" height="120" rx="8" fill="#1D2D25" opacity="0.7" />
                <rect x="152" y="10" width="145" height="120" rx="8" fill="#2A4034" opacity="0.5" />
                <rect x="304" y="10" width="146" height="120" rx="8" fill="#1D2D25" opacity="0.7" />

                {chartTracks.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartTracks
                      .map((t, idx) => {
                        const x = 25 + (idx * 400) / Math.max(1, chartTracks.length - 1);
                        const normalized = (t.bpm - minBpm) / (maxBpm - minBpm);
                        const y = 118 - Math.max(0, Math.min(1, normalized)) * 92;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {chartTracks.map((t, idx) => {
                  const x = 25 + (idx * 400) / Math.max(1, chartTracks.length - 1);
                  const normalized = (t.bpm - minBpm) / (maxBpm - minBpm);
                  const y = 118 - Math.max(0, Math.min(1, normalized)) * 92;
                  const isCurrent = currentTrack?.id === t.id;
                  return (
                    <g key={t.id} className="cursor-pointer" onClick={() => onTogglePlay(t)}>
                      {isCurrent && <circle cx={x} cy={y} r="11" fill="#F59E0B" opacity="0.3" />}
                      <circle
                        cx={x}
                        cy={y}
                        r={isCurrent ? 6.5 : 4.5}
                        fill={isCurrent ? '#F59E0B' : '#A3C9B0'}
                        stroke="#141E19"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill={isCurrent ? '#F59E0B' : '#FBF9F5'}
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {t.bpm} BPM
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 3-Phase Clinical Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {trajectory.phases.map((phaseGroup) => (
                <div
                  key={phaseGroup.phase}
                  className="bg-white rounded-2xl p-5 border border-wildwoods-sand space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
                      {phaseGroup.timeWindow}
                    </span>
                    <span className="text-xs font-bold bg-wildwoods-parchment px-2.5 py-0.5 rounded">
                      {phaseGroup.targetBpmRange}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-wildwoods-slate">
                    {phaseGroup.name}
                  </h4>
                  <p className="text-xs text-slate-600">{phaseGroup.clinicalObjective}</p>
                  <div className="text-[11px] font-semibold text-wildwoods-sage bg-wildwoods-parchment px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 shrink-0" />
                    {phaseGroup.neuroMechanism}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
