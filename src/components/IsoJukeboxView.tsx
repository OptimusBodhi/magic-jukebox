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
} from 'lucide-react';
import {
  CURRENT_EMOTIONAL_STATES,
  TARGET_THERAPEUTIC_STATES,
  CurrentEmotionalStateId,
  TargetTherapeuticStateId,
  IsoTrajectoryResult,
  SequencedTrack,
  PatientProfile,
} from '@/lib/iso-sequencer';

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
}

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
}: IsoJukeboxViewProps) {
  const [patientSafeView, setPatientSafeView] = useState(false);
  const [quarantineToast, setQuarantineToast] = useState<string | null>(null);

  const currentTrack = activeTrack || trajectory.orderedTracks[0] || null;

  const handleRedFlag = (track: SequencedTrack) => {
    onQuarantineTrack(
      track,
      'Caregiver triggered instant Red Flag Quarantine during playback (autonomic or facial distress observed).'
    );
    setQuarantineToast(
      `"${track.title}" by ${track.artist} immediately halted & moved to Red Flag Quarantine. Smoothly advancing to next safe track.`
    );
    setTimeout(() => setQuarantineToast(null), 6000);
  };

  const formatSeconds = (sec: number) => {
    const clamped = Math.max(0, Math.floor(sec));
    const mins = Math.floor(clamped / 60);
    const rem = clamped % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Build SVG coordinates for the live BPM & Energy curve
  const chartTracks = trajectory.orderedTracks;
  const minBpm = 55;
  const maxBpm = 135;

  // If Patient Safe View is active, render an oversized, clutter-free tactile jukebox interface
  if (patientSafeView && currentTrack) {
    return (
      <div className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-wildwoods-sage/40 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-wildwoods-moss">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wildwoods-moss text-wildwoods-mint text-sm font-semibold">
              <Lock className="w-4 h-4" />
              Patient-Safe Tactile View (Zero Accidental Exit)
            </span>
            <span className="text-wildwoods-mint text-sm">
              Playing for {patient.preferredName} • {currentTrack.phaseName}
            </span>
          </div>
          <button
            onClick={() => setPatientSafeView(false)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-wildwoods-moss hover:bg-wildwoods-sage text-wildwoods-cream font-semibold text-sm transition"
          >
            <Unlock className="w-4 h-4" />
            Return to Caregiver Clinical View
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
              {currentTrack.year} • {currentTrack.epochLabel}
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
                Next Favorite Song
              </button>

              <button
                onClick={() => handleRedFlag(currentTrack)}
                className="min-h-[72px] px-6 py-5 rounded-2xl bg-red-900/80 hover:bg-red-700 text-white font-bold text-lg flex items-center gap-2 border border-red-400/50 transition"
              >
                <ShieldAlert className="w-6 h-6" />
                Stop & Skip (Red Flag)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quarantine Alert Toast */}
      {quarantineToast && (
        <div
          role="alert"
          className="bg-red-950 text-red-100 border-2 border-red-500 rounded-2xl p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
            <span className="font-medium text-base">{quarantineToast}</span>
          </div>
          <button
            onClick={() => setQuarantineToast(null)}
            className="text-xs underline px-3 py-1 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Patient Biographical Banner */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {isCustomProfile ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-extrabold uppercase tracking-wider">
                  ✓ Custom Family Jukebox Profile
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-wildwoods-amber/25 border border-wildwoods-amber text-wildwoods-gold text-xs font-extrabold uppercase tracking-wider">
                  Sample Demo Patient • Pre-Loaded Example
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-wildwoods-moss text-wildwoods-mint text-xs font-semibold">
                Born {patient.birthYear} (Age {2026 - patient.birthYear})
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
                Reminiscence Bump: {patient.birthYear + 10}–{patient.birthYear + 30} (Ages 10–30)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-wildwoods-cream">
              {patient.name} — Precision Iso-Principle Jukebox
            </h1>
            <p className="text-wildwoods-mint text-sm md:text-base max-w-3xl">
              {!isCustomProfile && (
                <strong className="text-wildwoods-gold mr-1.5">
                  [Interactive Demo Mode]
                </strong>
              )}
              {patient.hometown} • {patient.formerOccupation} • Preferred Palette:{' '}
              <span className="text-wildwoods-cream font-medium">{patient.musicalHeritage}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenGuidedInterview && (
              <button
                type="button"
                onClick={onOpenGuidedInterview}
                className="min-h-[52px] px-5 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition"
              >
                <Sparkles className="w-4 h-4" />
                {isCustomProfile
                  ? 'Edit Profile / Re-Run Interview'
                  : 'Create Your Own Jukebox (2-Min Setup)'}
              </button>
            )}
            <div className="bg-wildwoods-forest px-4 py-3 rounded-2xl border border-wildwoods-moss text-left">
              <div className="text-xs text-wildwoods-mint uppercase tracking-wider">
                Sundowning Shield (Gerdner IMIA)
              </div>
              <div className="text-sm font-bold text-wildwoods-gold flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4" />
                Auto-Dosing 4:00 PM (30m before {patient.sundowningPeakTime} peak)
              </div>
            </div>

            <div className="bg-wildwoods-forest px-4 py-3 rounded-2xl border border-wildwoods-moss text-left">
              <div className="text-xs text-wildwoods-mint uppercase tracking-wider">
                Red Flag Quarantine
              </div>
              <div className="text-sm font-bold text-red-300 flex items-center gap-1.5 mt-0.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                {quarantinedCount} Trigger {quarantinedCount === 1 ? 'Track' : 'Tracks'} Blocked
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Emotional Compass: Where We Are -> Where We Want To Be */}
      <section
        aria-label="The Emotional Compass"
        className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-wildwoods-sand"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-wildwoods-parchment">
          <div>
            <div className="inline-flex items-center gap-2 text-wildwoods-sage font-bold text-xs uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4" />
              Pillar 2 • The Emotional Compass (NCT04236557 Protocol)
            </div>
            <h2 className="text-2xl font-serif font-bold text-wildwoods-slate">
              Dynamic Emotional Transformation Sequencer
            </h2>
          </div>
          <div className="text-sm text-slate-600 bg-wildwoods-parchment px-4 py-2.5 rounded-xl border border-wildwoods-sand">
            Select <strong>Current State</strong> &amp; <strong>Target Outcome</strong> to
            dynamically re-order {patient.preferredName}’s songs along a 30-minute Iso-Principle
            slope.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Column 1: Where We Are (Current Emotional State) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-wildwoods-slate uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Where We Are Now (Current Emotional State)
              </h3>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                Phase 1 State Match (Minutes 0–7)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURRENT_EMOTIONAL_STATES.map((state) => {
                const isSelected = state.id === currentStateId;
                return (
                  <button
                    key={state.id}
                    type="button"
                    onClick={() => onSelectCurrentState(state.id)}
                    className={`min-h-[112px] text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-lg scale-[1.01]'
                        : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-base leading-snug">{state.label}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-wildwoods-gold shrink-0" />
                        )}
                      </div>
                      <p
                        className={`text-xs font-semibold mt-1 ${
                          isSelected ? 'text-wildwoods-gold' : 'text-amber-800'
                        }`}
                      >
                        {state.clinicalSubtitle}
                      </p>
                    </div>
                    <p
                      className={`text-xs mt-2 line-clamp-2 ${
                        isSelected ? 'text-wildwoods-mint' : 'text-slate-600'
                      }`}
                    >
                      {state.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Where We Want To Be (Target Therapeutic State) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-wildwoods-slate uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-wildwoods-sage text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Where We Want To Be (Target Therapeutic Goal)
              </h3>
              <span className="text-xs font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
                Phase 3 Resolution (Minutes 19–30)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {TARGET_THERAPEUTIC_STATES.map((target) => {
                const isSelected = target.id === targetStateId;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => onSelectTargetState(target.id)}
                    className={`min-h-[86px] text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-wildwoods-forest text-wildwoods-cream border-emerald-400 shadow-lg scale-[1.01]'
                        : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-base">{target.label}</span>
                        <span
                          className={`ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-emerald-900 text-emerald-200 border border-emerald-500/40'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {target.clinicalSubtitle}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    </div>
                    <p
                      className={`text-xs mt-1.5 ${
                        isSelected ? 'text-wildwoods-mint' : 'text-slate-600'
                      }`}
                    >
                      {target.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Dual-Mode Active Audio Player & Live Iso-Principle Acoustic Curve */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Dual-Mode Active Vinyl Jukebox Player */}
        <section
          aria-label="Dual-Mode Active Therapeutic Player"
          className="xl:col-span-7 bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss space-y-6"
        >
          {/* Mode Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-wildwoods-moss">
            <div className="flex items-center gap-2 bg-wildwoods-forest p-1.5 rounded-2xl border border-wildwoods-moss">
              <button
                type="button"
                onClick={() => onTogglePlayerMode('receptive')}
                className={`min-h-[48px] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
                  playerMode === 'receptive'
                    ? 'bg-wildwoods-amber text-wildwoods-slate shadow'
                    : 'text-wildwoods-mint hover:text-white'
                }`}
              >
                <Waves className="w-4 h-4" />
                Receptive Calm Mode
              </button>
              <button
                type="button"
                onClick={() => onTogglePlayerMode('duet')}
                className={`min-h-[48px] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
                  playerMode === 'duet'
                    ? 'bg-wildwoods-amber text-wildwoods-slate shadow'
                    : 'text-wildwoods-mint hover:text-white'
                }`}
              >
                <Mic2 className="w-4 h-4" />
                Caregiver Duet &amp; Story Mode
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPatientSafeView(true)}
              className="min-h-[48px] px-4 py-2 rounded-xl bg-wildwoods-moss hover:bg-wildwoods-sage text-wildwoods-cream text-xs font-bold flex items-center gap-2 transition"
              title="Lock into oversized, high-contrast Patient Safe View"
            >
              <Lock className="w-4 h-4 text-wildwoods-gold" />
              Patient Safe View
            </button>
          </div>

          {currentTrack && (
            <>
              {/* Active Track Vinyl & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 flex flex-col items-center">
                  <div
                    className={`relative w-44 h-44 rounded-full border-4 border-wildwoods-amber shadow-2xl overflow-hidden bg-wildwoods-forest flex items-center justify-center ${
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
                  <span className="mt-3 text-xs font-semibold text-wildwoods-mint flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    {currentTrack.previewUrl
                      ? 'Live iTunes 30s AAC Audio Stream Ready'
                      : 'Web Audio Harmonic Stream Ready'}
                  </span>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-wildwoods-amber text-wildwoods-slate text-xs font-extrabold uppercase">
                      {currentTrack.phaseName} ({currentTrack.phaseTimeWindow})
                    </span>
                    <span className="px-3 py-1 rounded-full bg-wildwoods-forest border border-wildwoods-sage text-wildwoods-mint text-xs font-bold">
                      {currentTrack.bpm} BPM • {currentTrack.mode} Mode
                    </span>
                    <span className="px-3 py-1 rounded-full bg-wildwoods-forest text-wildwoods-gold text-xs font-semibold">
                      {currentTrack.year} • {currentTrack.epochLabel}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-wildwoods-cream">
                    {currentTrack.title}
                  </h3>
                  <p className="text-lg text-wildwoods-mint font-medium">{currentTrack.artist}</p>

                  {/* Neuro-Target Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentTrack.neuroTargets.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold"
                      >
                        <Brain className="w-3.5 h-3.5 text-emerald-400" />
                        {badge}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-wildwoods-mint/90 italic bg-wildwoods-forest/70 px-3.5 py-2 rounded-xl border border-wildwoods-moss">
                    {currentTrack.clinicalRationale}
                  </p>
                </div>
              </div>

              {/* Scrubber & Primary Transport Controls (Minimum 48x48px touch targets) */}
              <div className="space-y-3 pt-2">
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onPrevTrack}
                      aria-label="Previous track"
                      className="min-w-[52px] min-h-[52px] p-3 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream flex items-center justify-center transition"
                    >
                      <SkipBack className="w-6 h-6" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onTogglePlay(currentTrack)}
                      className="min-h-[56px] px-7 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-base flex items-center gap-2.5 shadow-lg transition"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      {isPlaying ? 'Pause Stream' : 'Play 30s Hook'}
                    </button>

                    <button
                      type="button"
                      onClick={onNextTrack}
                      aria-label="Next track"
                      className="min-w-[52px] min-h-[52px] p-3 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream flex items-center justify-center transition"
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>

                    <button
                      type="button"
                      onClick={onToggleMute}
                      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                      className="min-w-[52px] min-h-[52px] p-3 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-mint flex items-center justify-center transition"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Instant Red Flag Quarantine Button */}
                  <button
                    type="button"
                    onClick={() => handleRedFlag(currentTrack)}
                    className="min-h-[52px] px-5 py-3 rounded-2xl bg-red-900/90 hover:bg-red-700 text-red-100 border border-red-400/50 font-bold text-sm flex items-center gap-2 shadow-md transition"
                  >
                    <ShieldAlert className="w-5 h-5 text-red-300" />
                    Red Flag Quarantine Track
                  </button>
                </div>
              </div>

              {/* Mode-Specific Panel: Receptive Calm vs. Caregiver Duet & Story Mode */}
              {playerMode === 'receptive' ? (
                <div className="bg-wildwoods-forest/90 rounded-2xl p-5 border border-wildwoods-moss space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-wildwoods-sage/30 border border-wildwoods-mint flex items-center justify-center ${
                          isPlaying ? 'animate-ping' : ''
                        }`}
                        style={{ animationDuration: '4s' }}
                      >
                        <Waves className="w-5 h-5 text-wildwoods-mint" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-wildwoods-cream">
                          Receptive Music Medicine Mode (JAMDA 2018 Protocol)
                        </h4>
                        <p className="text-xs text-wildwoods-mint">
                          Zero executive demand • Cross-faded autonomic pacing • Parasympathetic
                          breathing anchor
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-wildwoods-slate px-4 py-2.5 rounded-xl border border-wildwoods-moss">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-wildwoods-mint">
                          Gerdner 30-Min Session Timer
                        </div>
                        <div className="text-lg font-mono font-bold text-wildwoods-gold">
                          {formatSeconds(gerdnerTimerRemainingSec)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleGerdnerTimer}
                        className="min-h-[40px] px-3 py-1.5 rounded-lg bg-wildwoods-moss hover:bg-wildwoods-sage text-xs font-bold text-white transition"
                      >
                        {isGerdnerTimerRunning ? 'Pause Timer' : 'Start 30m Arc'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-wildwoods-slate/70 border border-wildwoods-moss/80 text-xs text-wildwoods-mint flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-wildwoods-gold shrink-0 mt-0.5" />
                    <span>
                      <strong>Family Memory Mirror Note:</strong> {currentTrack.memoryNote}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-wildwoods-forest rounded-2xl p-6 border-2 border-wildwoods-amber/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold">
                      <HeartHandshake className="w-4 h-4" />
                      Caregiver Duet &amp; Story Mode (Särkämö et al., 2014/2016 Dyad RCT)
                    </span>
                    <span className="text-xs text-wildwoods-mint">
                      Boosts Verbal Fluency &amp; Working Memory
                    </span>
                  </div>

                  {/* Large-Print Synchronized Chorus Cues */}
                  <div className="bg-wildwoods-slate p-5 rounded-2xl border border-wildwoods-moss space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-wildwoods-mint mb-1">
                      Large-Print Sing-Along Chorus Cues ({currentTrack.bpm} BPM)
                    </div>
                    {currentTrack.chorusLyrics.map((line, idx) => (
                      <p
                        key={idx}
                        className="text-xl md:text-2xl font-serif font-semibold text-wildwoods-cream leading-relaxed"
                      >
                        ♪ “{line}”
                      </p>
                    ))}
                  </div>

                  {/* Memory Mirror Conversation Starter */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-wildwoods-slate/80 p-4 rounded-xl border border-wildwoods-moss">
                      <div className="text-xs font-bold text-wildwoods-gold uppercase tracking-wider mb-1">
                        Biographical Memory Mirror
                      </div>
                      <p className="text-sm text-wildwoods-cream leading-relaxed">
                        {currentTrack.memoryNote}
                      </p>
                    </div>
                    <div className="bg-amber-950/60 p-4 rounded-xl border border-wildwoods-amber/50">
                      <div className="text-xs font-bold text-wildwoods-gold uppercase tracking-wider mb-1">
                        Caregiver Conversation Prompt
                      </div>
                      <p className="text-sm text-amber-100 leading-relaxed font-medium">
                        “{currentTrack.duetPrompt}”
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Right 5 Columns: Live Iso-Principle Acoustic Trajectory Curve */}
        <section
          aria-label="Iso-Principle Autonomic Slope Visualizer"
          className="xl:col-span-5 bg-white rounded-3xl p-6 md:p-8 shadow-md border border-wildwoods-sand space-y-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-wildwoods-sage">
                Live Acoustic Trajectory
              </span>
              <h3 className="text-xl font-serif font-bold text-wildwoods-slate">
                30-Minute Iso-Principle BPM &amp; Energy Curve
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-wildwoods-parchment text-wildwoods-slate text-xs font-bold border border-wildwoods-sand">
              {trajectory.currentState.targetBpm} BPM <ArrowRight className="inline w-3.5 h-3.5" />{' '}
              {trajectory.targetState.targetBpm} BPM
            </span>
          </div>

          {/* SVG Trajectory Curve */}
          <div className="bg-wildwoods-slate rounded-2xl p-4 border border-wildwoods-moss text-wildwoods-cream">
            <div className="flex justify-between text-[11px] text-wildwoods-mint font-semibold mb-2">
              <span>Phase 1: State Match (0–7m)</span>
              <span>Phase 2: Bridge (8–18m)</span>
              <span>Phase 3: Resolution (19–30m)</span>
            </div>

            <svg
              viewBox="0 0 450 160"
              className="w-full h-40 overflow-visible"
              role="img"
              aria-label="BPM trajectory curve across the three clinical phases"
            >
              {/* Phase background zones */}
              <rect x="0" y="10" width="145" height="125" rx="8" fill="#1D2D25" opacity="0.7" />
              <rect x="152" y="10" width="145" height="125" rx="8" fill="#2A4034" opacity="0.5" />
              <rect x="304" y="10" width="146" height="125" rx="8" fill="#1D2D25" opacity="0.7" />

              {/* Reference horizontal grid lines */}
              <line x1="0" y1="35" x2="450" y2="35" stroke="#4D7C5D" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="0" y1="75" x2="450" y2="75" stroke="#4D7C5D" strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="0" y1="115" x2="450" y2="115" stroke="#4D7C5D" strokeDasharray="3 3" strokeWidth="0.8" />

              {/* Polyline connecting sequenced tracks */}
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
                      const y = 122 - Math.max(0, Math.min(1, normalized)) * 96;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}

              {/* Nodes for each song */}
              {chartTracks.map((t, idx) => {
                const x = 25 + (idx * 400) / Math.max(1, chartTracks.length - 1);
                const normalized = (t.bpm - minBpm) / (maxBpm - minBpm);
                const y = 122 - Math.max(0, Math.min(1, normalized)) * 96;
                const isCurrent = currentTrack?.id === t.id;
                return (
                  <g
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => onTogglePlay(t)}
                  >
                    {isCurrent && (
                      <circle cx={x} cy={y} r="11" fill="#F59E0B" opacity="0.3" />
                    )}
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
                      {t.bpm}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="flex items-center justify-between text-xs text-wildwoods-mint pt-2 border-t border-wildwoods-moss">
              <span>Click any node on the curve to audition that point in the 30-min arc</span>
              <span className="text-wildwoods-gold font-bold">BPM (Tempo)</span>
            </div>
          </div>

          {/* Clinical Mechanism Summary Card */}
          <div className="bg-wildwoods-parchment rounded-2xl p-4 border border-wildwoods-sand space-y-2 text-xs text-slate-700">
            <div className="font-bold text-wildwoods-slate flex items-center gap-1.5 text-sm">
              <Activity className="w-4 h-4 text-wildwoods-sage" />
              Active Neuro-Clinical Prescription
            </div>
            <p>
              <strong>1. State Match ({trajectory.currentState.label}):</strong>{' '}
              {trajectory.currentState.clinicalMechanism}
            </p>
            <p>
              <strong>2. Target Resolution ({trajectory.targetState.label}):</strong>{' '}
              {trajectory.targetState.clinicalMechanism}
            </p>
          </div>
        </section>
      </div>

      {/* 3-Phase Sequenced Playlist Cards */}
      <section aria-label="3-Phase Sequenced Therapeutic Playlist" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-2xl font-serif font-bold text-wildwoods-slate">
            3-Phase Iso-Principle Therapeutic Sequence ({trajectory.orderedTracks.length} Tracks • 30
            Minutes)
          </h2>
          <span className="text-xs font-semibold text-slate-600">
            Every song below is pre-verified from {patient.preferredName}’s {patient.birthYear + 10}
            –{patient.birthYear + 30} Reminiscence Bump
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {trajectory.phases.map((phaseGroup) => (
            <div
              key={phaseGroup.phase}
              className="bg-white rounded-3xl p-6 shadow-md border-2 border-wildwoods-sand flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      phaseGroup.phase === 1
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : phaseGroup.phase === 2
                        ? 'bg-teal-100 text-teal-900 border border-teal-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {phaseGroup.timeWindow}
                  </span>
                  <span className="text-xs font-bold text-wildwoods-slate bg-wildwoods-parchment px-2.5 py-1 rounded-lg">
                    {phaseGroup.targetBpmRange}
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-wildwoods-slate">
                  {phaseGroup.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {phaseGroup.clinicalObjective}
                </p>
                <div className="text-[11px] font-semibold text-wildwoods-sage bg-wildwoods-parchment px-3 py-1.5 rounded-lg">
                  Neuro-Target: {phaseGroup.neuroMechanism}
                </div>

                <div className="space-y-3 pt-2">
                  {phaseGroup.tracks.map((track, idx) => {
                    const isTrackActive = currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isTrackActive
                            ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                            : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onTogglePlay(track)}
                            aria-label={`Play ${track.title} by ${track.artist}`}
                            className={`min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center font-bold transition shrink-0 ${
                              isTrackActive && isPlaying
                                ? 'bg-wildwoods-amber text-wildwoods-slate'
                                : 'bg-wildwoods-forest text-wildwoods-cream hover:bg-wildwoods-sage'
                            }`}
                          >
                            {isTrackActive && isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-sm truncate">
                                {idx + 1}. {track.title}
                              </span>
                              <span
                                className={`text-xs font-extrabold px-2 py-0.5 rounded shrink-0 ${
                                  isTrackActive
                                    ? 'bg-wildwoods-amber text-wildwoods-slate'
                                    : 'bg-wildwoods-sand/80 text-wildwoods-slate'
                                }`}
                              >
                                {track.bpm} BPM
                              </span>
                            </div>
                            <div
                              className={`text-xs truncate ${
                                isTrackActive ? 'text-wildwoods-mint' : 'text-slate-600'
                              }`}
                            >
                              {track.artist} ({track.year}) • {track.mode}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRedFlag(track)}
                            title="Quarantine as Red Flag trigger song"
                            aria-label={`Quarantine ${track.title} as Red Flag`}
                            className={`min-w-[40px] min-h-[40px] p-2 rounded-xl transition ${
                              isTrackActive
                                ? 'text-red-300 hover:bg-red-900/60'
                                : 'text-red-700 hover:bg-red-100'
                            }`}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Neuro Badges & Memory Snippet */}
                        <div className="mt-2.5 pt-2 border-t border-current/10 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                          <span className="font-semibold opacity-90">
                            {track.neuroTargets[0]}
                          </span>
                          <span className="opacity-75">Iso-Fit: {track.isoFitScore}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
