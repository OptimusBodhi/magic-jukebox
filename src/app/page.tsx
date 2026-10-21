'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Disc3,
  Search,
  Activity,
  BookOpen,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  ShieldAlert,
  Wand2,
  CheckCircle2,
  Home,
} from 'lucide-react';
import {
  ARTHUR_SEED_TRACKS,
  DEFAULT_PATIENT_PROFILE,
  INITIAL_BARS_LOGS,
  INITIAL_QUARANTINED_TRACKS,
  BiographicalTrack,
  CurrentEmotionalStateId,
  TargetTherapeuticStateId,
  PatientProfile,
  BarsSessionLog,
  SequencedTrack,
  MusicalMode,
  sequenceIsoPlaylist,
} from '@/lib/iso-sequencer';
import { hydrateSeedTracksWithItunes } from '@/lib/itunes-audio';
import {
  decodeShareableJukeboxParam,
  encodeShareableJukeboxUrl,
  formatCaregiverPrescriptionText,
} from '@/lib/share-and-export';
import IsoJukeboxView from '@/components/IsoJukeboxView';
import MusicDetectiveView from '@/components/MusicDetectiveView';
import ClinicalTelemetryView from '@/components/ClinicalTelemetryView';
import ClinicalEvidenceVaultView from '@/components/ClinicalEvidenceVaultView';
import GuidedOnboardingView from '@/components/GuidedOnboardingView';
import LandingHomeView from '@/components/LandingHomeView';

type ActiveTab = 'home' | 'jukebox' | 'interview' | 'detective' | 'telemetry' | 'science';

const STORAGE_KEY = 'magic_jukebox_wildwoods_state_v1';

export default function MagicJukeboxApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_PATIENT_PROFILE);
  const [isCustomProfile, setIsCustomProfile] = useState<boolean>(false);
  const [interviewStartBlank, setInterviewStartBlank] = useState<boolean>(false);
  const [library, setLibrary] = useState<BiographicalTrack[]>(ARTHUR_SEED_TRACKS);
  const [quarantinedList, setQuarantinedList] = useState(INITIAL_QUARANTINED_TRACKS);
  const [barsLogs, setBarsLogs] = useState<BarsSessionLog[]>(INITIAL_BARS_LOGS);

  // Emotional Compass state
  const [currentStateId, setCurrentStateId] =
    useState<CurrentEmotionalStateId>('agitated_sundowning');
  const [targetStateId, setTargetStateId] =
    useState<TargetTherapeuticStateId>('deep_calm');

  // Audio player state
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(30);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playerMode, setPlayerMode] = useState<'receptive' | 'duet'>('receptive');

  // Music Detective standalone preview state
  const [previewingUrl, setPreviewingUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);

  // Gerdner 30-Minute Sundowning Timer state
  const [gerdnerTimerRemainingSec, setGerdnerTimerRemainingSec] = useState<number>(1800);
  const [isGerdnerTimerRunning, setIsGerdnerTimerRunning] = useState<boolean>(false);
  const [interviewCompleteBanner, setInterviewCompleteBanner] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const detectiveAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load shared URL (?share=...) or persisted state from LocalStorage on mount, then hydrate iTunes audio previews
  useEffect(() => {
    let initialTracks = ARTHUR_SEED_TRACKS;
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedParam = params.get('share');
      if (sharedParam) {
        const decoded = decodeShareableJukeboxParam(sharedParam);
        if (decoded) {
          setPatient(decoded.patient);
          setIsCustomProfile(true);
          setCurrentStateId(decoded.currentStateId);
          setTargetStateId(decoded.targetStateId);
          if (decoded.tracks.length > 0) {
            initialTracks = decoded.tracks;
            setLibrary(decoded.tracks);
          }
          if (decoded.quarantinedList.length > 0) {
            setQuarantinedList(decoded.quarantinedList);
          }
          setActiveTab('jukebox');
          setInterviewCompleteBanner(
            `🔗 Loaded Shared Family Jukebox for ${decoded.patient.name} (Reminiscence Bump: ${
              decoded.patient.birthYear + 10
            }–${decoded.patient.birthYear + 30}).`
          );
          hydrateSeedTracksWithItunes(initialTracks).then((hydrated) => {
            setLibrary(hydrated);
          });
          return;
        }
      }

      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed.patient) setPatient(parsed.patient);
        if (typeof parsed.isCustomProfile === 'boolean') {
          setIsCustomProfile(parsed.isCustomProfile);
        }
        if (Array.isArray(parsed.library) && parsed.library.length > 0) {
          initialTracks = parsed.library;
          setLibrary(parsed.library);
        }
        if (Array.isArray(parsed.quarantinedList)) setQuarantinedList(parsed.quarantinedList);
        if (Array.isArray(parsed.barsLogs)) setBarsLogs(parsed.barsLogs);
      }
    } catch {
      // Ignore storage parse error
    }

    // Hydrate all library tracks with live iTunes 30-second AAC preview streams
    hydrateSeedTracksWithItunes(initialTracks).then((hydrated) => {
      setLibrary(hydrated);
    });
  }, []);

  // Save state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          patient,
          isCustomProfile,
          library,
          quarantinedList,
          barsLogs,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [patient, isCustomProfile, library, quarantinedList, barsLogs]);

  // Compute the 3-Phase Iso-Principle Trajectory whenever library, compass, or quarantine changes
  const trajectory = useMemo(() => {
    const quarantinedIds = quarantinedList.map((q) => q.id);
    return sequenceIsoPlaylist(
      library,
      currentStateId,
      targetStateId,
      quarantinedIds,
      patient.birthYear
    );
  }, [library, currentStateId, targetStateId, quarantinedList, patient.birthYear]);

  const activeTrack: SequencedTrack | null = useMemo(() => {
    if (!trajectory.orderedTracks.length) return null;
    if (activeTrackId) {
      const found = trajectory.orderedTracks.find((t) => t.id === activeTrackId);
      if (found) return found;
    }
    return trajectory.orderedTracks[0];
  }, [trajectory.orderedTracks, activeTrackId]);

  // Gerdner 30-minute countdown timer effect
  useEffect(() => {
    if (!isGerdnerTimerRunning) return;
    const timer = setInterval(() => {
      setGerdnerTimerRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isGerdnerTimerRunning]);

  // Stop Web Audio fallback synthesizer
  const stopWebAudioFallback = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  // Start warm Web Audio API tempo-synced harmonic chord progression if stream is offline/blocked
  const startWebAudioFallback = (bpm: number = 76, mode: MusicalMode = 'Major') => {
    stopWebAudioFallback();
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const beatMs = Math.max(400, Math.round((60 / Math.max(55, bpm)) * 1000));
      const rootFreqs = mode === 'Major' ? [261.63, 329.63, 392.0] : [220.0, 261.63, 329.63];

      const playPulse = () => {
        if (isMuted) return;
        const now = ctx.currentTime;
        rootFreqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.04, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + beatMs / 1000);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + beatMs / 1000);
        });
        setProgressSec((prev) => (prev < 29 ? prev + beatMs / 1000 : 0));
      };

      playPulse();
      synthIntervalRef.current = setInterval(playPulse, beatMs);
    } catch {
      // Ignore Web Audio errors
    }
  };

  const stopAllAudio = () => {
    stopWebAudioFallback();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (detectiveAudioRef.current) {
      detectiveAudioRef.current.pause();
    }
    setIsPlaying(false);
    setIsPreviewPlaying(false);
  };

  // Play or pause a track in the main Iso-Jukebox
  const handleTogglePlay = async (requestedTrack?: SequencedTrack) => {
    // Stop any detective preview first
    if (detectiveAudioRef.current) {
      detectiveAudioRef.current.pause();
      setIsPreviewPlaying(false);
    }

    const target = requestedTrack || activeTrack;
    if (!target) return;

    const isSameTrack = activeTrack?.id === target.id;
    setActiveTrackId(target.id);

    if (isSameTrack && isPlaying) {
      stopWebAudioFallback();
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // Attempt to play live iTunes previewUrl; if unavailable yet, query iTunes on the fly
    let streamUrl = target.previewUrl;
    if (!streamUrl) {
      const hydrated = await hydrateSeedTracksWithItunes([target]);
      if (hydrated[0]?.previewUrl) {
        streamUrl = hydrated[0].previewUrl;
        setLibrary((prev) =>
          prev.map((item) => (item.id === target.id ? { ...item, ...hydrated[0] } : item))
        );
      }
    }

    if (audioRef.current && streamUrl) {
      try {
        stopWebAudioFallback();
        if (audioRef.current.src !== streamUrl) {
          audioRef.current.src = streamUrl;
          setProgressSec(0);
        }
        audioRef.current.muted = isMuted;
        await audioRef.current.play();
        setIsPlaying(true);
        setIsGerdnerTimerRunning(true);
        return;
      } catch {
        // Fallback to Web Audio harmonic synthesizer if browser or network blocks external stream
      }
    }

    // Fallback Web Audio synthesis at exact BPM and Mode
    setIsPlaying(true);
    setIsGerdnerTimerRunning(true);
    startWebAudioFallback(target.bpm, target.mode);
  };

  const handleNextTrack = () => {
    if (!trajectory.orderedTracks.length || !activeTrack) return;
    const currentIndex = trajectory.orderedTracks.findIndex((t) => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % trajectory.orderedTracks.length;
    const nextTrack = trajectory.orderedTracks[nextIndex];
    setActiveTrackId(nextTrack.id);
    if (isPlaying) {
      setTimeout(() => handleTogglePlay(nextTrack), 50);
    }
  };

  const handlePrevTrack = () => {
    if (!trajectory.orderedTracks.length || !activeTrack) return;
    const currentIndex = trajectory.orderedTracks.findIndex((t) => t.id === activeTrack.id);
    const prevIndex =
      (currentIndex - 1 + trajectory.orderedTracks.length) % trajectory.orderedTracks.length;
    const prevTrack = trajectory.orderedTracks[prevIndex];
    setActiveTrackId(prevTrack.id);
    if (isPlaying) {
      setTimeout(() => handleTogglePlay(prevTrack), 50);
    }
  };

  const handleSeek = (sec: number) => {
    setProgressSec(sec);
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = sec;
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
    if (detectiveAudioRef.current) {
      detectiveAudioRef.current.muted = nextMuted;
    }
  };

  // Instant Red Flag Quarantine from active player or playlist
  const handleQuarantineTrack = (track: SequencedTrack, reason?: string) => {
    // 1. Immediately halt audio playback
    stopAllAudio();

    // 2. Add to Red Flag Quarantine list
    setQuarantinedList((prev) => [
      {
        id: track.id,
        title: track.title,
        artist: track.artist,
        year: track.year,
        reason:
          reason ||
          'Caregiver triggered Red Flag Quarantine (autonomic or emotional distress cue observed).',
        quarantinedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev.filter((item) => item.id !== track.id),
    ]);

    // 3. Advance activeTrackId to the next safe track in the trajectory
    const remaining = trajectory.orderedTracks.filter((t) => t.id !== track.id);
    if (remaining.length > 0) {
      setActiveTrackId(remaining[0].id);
    }
  };

  // Music Detective 30-second preview handler
  const handleTogglePreviewUrl = async (
    url: string,
    fallbackBpm: number = 84,
    fallbackMode: MusicalMode = 'Major'
  ) => {
    // Pause main player if running
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    stopWebAudioFallback();

    if (previewingUrl === url && isPreviewPlaying) {
      detectiveAudioRef.current?.pause();
      setIsPreviewPlaying(false);
      return;
    }

    setPreviewingUrl(url);
    if (detectiveAudioRef.current && url) {
      try {
        detectiveAudioRef.current.src = url;
        detectiveAudioRef.current.muted = isMuted;
        await detectiveAudioRef.current.play();
        setIsPreviewPlaying(true);
        return;
      } catch {
        // Fallback to Web Audio harmonic synthesizer
      }
    }
    setIsPreviewPlaying(true);
    startWebAudioFallback(fallbackBpm, fallbackMode);
  };

  const handleStopDetectivePreview = () => {
    stopWebAudioFallback();
    if (detectiveAudioRef.current) {
      detectiveAudioRef.current.pause();
    }
    setIsPreviewPlaying(false);
  };

  const handleCopyShareLink = async () => {
    const shareUrl = encodeShareableJukeboxUrl(
      window.location.origin + window.location.pathname,
      patient,
      library,
      quarantinedList,
      currentStateId,
      targetStateId
    );
    try {
      window.history.replaceState({}, '', shareUrl);
      await navigator.clipboard.writeText(shareUrl);
      setInterviewCompleteBanner(
        `🔗 Shareable Family & Care-Team Link copied to clipboard! Anyone opening this link on any phone or tablet will load ${patient.name}’s custom Jukebox.`
      );
      setTimeout(() => setInterviewCompleteBanner(null), 8000);
    } catch {
      setInterviewCompleteBanner(`Shareable Link ready in your browser address bar: ${shareUrl}`);
    }
  };

  const handleCopyCaregiverSheet = async () => {
    const text = formatCaregiverPrescriptionText(patient, trajectory, quarantinedList);
    try {
      await navigator.clipboard.writeText(text);
      setInterviewCompleteBanner(
        `📋 Copied ${patient.name}’s 3-Phase Iso-Principle Prescription, Memory Mirror notes & Red Flag list to clipboard!`
      );
      setTimeout(() => setInterviewCompleteBanner(null), 7000);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleResetDemoState = () => {
    stopAllAudio();
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setPatient(DEFAULT_PATIENT_PROFILE);
    setIsCustomProfile(false);
    setQuarantinedList(INITIAL_QUARANTINED_TRACKS);
    setBarsLogs(INITIAL_BARS_LOGS);
    setCurrentStateId('agitated_sundowning');
    setTargetStateId('deep_calm');
    hydrateSeedTracksWithItunes(ARTHUR_SEED_TRACKS).then((hydrated) => {
      setLibrary(hydrated);
      setActiveTrackId(null);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-wildwoods-cream text-wildwoods-slate">
      {/* Hidden HTML5 Audio Elements for Main Jukebox & Music Detective */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgressSec(audioRef.current.currentTime);
            setDurationSec(audioRef.current.duration || 30);
          }
        }}
        onEnded={handleNextTrack}
      />
      <audio
        ref={detectiveAudioRef}
        onEnded={() => setIsPreviewPlaying(false)}
      />

      {/* Top Studio Wildwoods Navigation Header */}
      <header className="sticky top-0 z-40 bg-wildwoods-slate/95 backdrop-blur-md text-wildwoods-cream border-b border-wildwoods-moss shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand Logo & Studio Wildwoods Partnership Badge */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3.5 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center shadow-md font-serif font-extrabold text-xl group-hover:bg-wildwoods-gold transition">
                <Disc3 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-xl tracking-tight text-wildwoods-cream">
                    The Magic Jukebox
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-wildwoods-moss text-wildwoods-gold text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Open Pilot
                  </span>
                </div>
                <p className="text-xs text-wildwoods-mint">
                  Precision Music Medicine for Dementia &amp; Emotional Transformation
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleResetDemoState}
              title="Reset Arthur Pendelton Demo Data"
              className="lg:hidden px-3 py-2 rounded-xl bg-wildwoods-forest text-wildwoods-mint text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          </div>

          {/* Primary Navigation Bar */}
          <nav
            aria-label="Primary Navigation"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                activeTab === 'home'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow-md'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream'
              }`}
            >
              <Home className="w-4 h-4" />
              Start Here
            </button>

            <button
              type="button"
              onClick={() => {
                setInterviewStartBlank(true);
                setActiveTab('interview');
              }}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                activeTab === 'interview'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow-md'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream border border-wildwoods-amber/50'
              }`}
            >
              <Wand2 className="w-4 h-4 text-wildwoods-gold" />
              Create Your Own
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('jukebox')}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                activeTab === 'jukebox'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow-md'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream'
              }`}
            >
              <Disc3 className="w-4 h-4" />
              {isCustomProfile ? `${patient.preferredName}’s Jukebox` : 'Demo Jukebox'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('detective')}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                activeTab === 'detective'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow-md'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream'
              }`}
            >
              <Search className="w-4 h-4" />
              Song Finder
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                activeTab === 'telemetry'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow-md'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream'
              }`}
            >
              <Activity className="w-4 h-4" />
              Care Log
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('science')}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                activeTab === 'science'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow-md'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Clinical Science
            </button>

            <button
              type="button"
              onClick={handleResetDemoState}
              title="Reset Arthur Pendelton Demo Data"
              className="hidden lg:inline-flex min-h-[48px] px-3.5 py-2 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-mint text-xs font-semibold items-center gap-1.5 border border-wildwoods-moss transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        {interviewCompleteBanner && (
          <div
            role="status"
            className="mb-6 bg-emerald-950 text-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="font-semibold text-sm md:text-base">
                {interviewCompleteBanner}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setInterviewCompleteBanner(null)}
              className="text-xs underline px-3 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <LandingHomeView
            patient={patient}
            isCustomProfile={isCustomProfile}
            onStartCreateOwn={() => {
              setInterviewStartBlank(true);
              setActiveTab('interview');
            }}
            onExploreDemo={() => setActiveTab('jukebox')}
            onNavigateTab={(t) => {
              if (t === 'interview') setInterviewStartBlank(false);
              setActiveTab(t);
            }}
          />
        )}

        {activeTab === 'jukebox' && (
          <IsoJukeboxView
            patient={patient}
            isCustomProfile={isCustomProfile}
            currentStateId={currentStateId}
            targetStateId={targetStateId}
            onSelectCurrentState={setCurrentStateId}
            onSelectTargetState={setTargetStateId}
            trajectory={trajectory}
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            progressSec={progressSec}
            durationSec={durationSec}
            isMuted={isMuted}
            playerMode={playerMode}
            onTogglePlay={handleTogglePlay}
            onNextTrack={handleNextTrack}
            onPrevTrack={handlePrevTrack}
            onSeek={handleSeek}
            onToggleMute={handleToggleMute}
            onTogglePlayerMode={setPlayerMode}
            onQuarantineTrack={handleQuarantineTrack}
            quarantinedCount={quarantinedList.length}
            gerdnerTimerRemainingSec={gerdnerTimerRemainingSec}
            isGerdnerTimerRunning={isGerdnerTimerRunning}
            onToggleGerdnerTimer={() => setIsGerdnerTimerRunning((prev) => !prev)}
            onOpenGuidedInterview={() => {
              setInterviewStartBlank(!isCustomProfile);
              setActiveTab('interview');
            }}
            onCopyShareLink={handleCopyShareLink}
            onCopyCaregiverSheet={handleCopyCaregiverSheet}
          />
        )}

        {activeTab === 'interview' && (
          <GuidedOnboardingView
            startBlank={interviewStartBlank}
            onCompleteInterview={({
              profile: newProfile,
              tracks: synthesizedTracks,
              quarantinedEntry,
              initialCurrentState,
              initialTargetState,
              isCustom,
            }) => {
              stopAllAudio();
              setPatient(newProfile);
              setIsCustomProfile(isCustom);
              if (synthesizedTracks.length >= 6) {
                setLibrary(synthesizedTracks);
              } else {
                setLibrary([...synthesizedTracks, ...ARTHUR_SEED_TRACKS]);
              }
              if (quarantinedEntry) {
                setQuarantinedList([quarantinedEntry]);
              }
              setCurrentStateId(initialCurrentState);
              setTargetStateId(initialTargetState);
              setActiveTrackId(null);
              setActiveTab('jukebox');
              setInterviewCompleteBanner(
                `✨ Custom Jukebox Created! Generated ${newProfile.name}’s personalized 3-Phase Iso-Principle Jukebox (${
                  newProfile.birthYear + 10
                }–${newProfile.birthYear + 30} Reminiscence Bump) with verified audio streams.`
              );
              setTimeout(() => setInterviewCompleteBanner(null), 9000);
            }}
          />
        )}

        {activeTab === 'detective' && (
          <MusicDetectiveView
            patient={patient}
            onUpdateBirthYear={(year) =>
              setPatient((prev) => ({ ...prev, birthYear: year }))
            }
            library={library}
            quarantinedList={quarantinedList}
            onAddTrackToLibrary={(newTrack) =>
              setLibrary((prev) => [
                newTrack,
                ...prev.filter((t) => t.id !== newTrack.id),
              ])
            }
            onQuarantineCandidate={(cand) =>
              setQuarantinedList((prev) => [
                {
                  ...cand,
                  quarantinedAt: new Date().toISOString().slice(0, 10),
                },
                ...prev.filter((q) => q.id !== cand.id),
              ])
            }
            onRestoreQuarantined={(id) =>
              setQuarantinedList((prev) => prev.filter((q) => q.id !== id))
            }
            previewingUrl={previewingUrl}
            isPreviewPlaying={isPreviewPlaying}
            onTogglePreviewUrl={handleTogglePreviewUrl}
            onStopPreview={handleStopDetectivePreview}
          />
        )}

        {activeTab === 'telemetry' && (
          <ClinicalTelemetryView
            patient={patient}
            logs={barsLogs}
            onAddLog={(newLog) => setBarsLogs((prev) => [...prev, newLog])}
            onUpdateSundowningTime={(peakTime) =>
              setPatient((prev) => ({ ...prev, sundowningPeakTime: peakTime }))
            }
            onTriggerSundowningShieldNow={() => {
              setCurrentStateId('agitated_sundowning');
              setTargetStateId('deep_calm');
              setPlayerMode('receptive');
              setGerdnerTimerRemainingSec(1800);
              setIsGerdnerTimerRunning(true);
              setActiveTab('jukebox');
              setTimeout(() => {
                if (trajectory.orderedTracks[0]) {
                  handleTogglePlay(trajectory.orderedTracks[0]);
                }
              }, 100);
            }}
          />
        )}

        {activeTab === 'science' && <ClinicalEvidenceVaultView />}
      </main>

      {/* Page Footer */}
      <footer className="border-t border-wildwoods-sand bg-wildwoods-parchment/70 py-6 px-4 text-center text-xs sm:text-sm text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-wildwoods-slate">
            This Magic Jukebox is being developed in partnership with{' '}
            <strong>Studio Wildwoods</strong>.
          </p>
          <p className="text-xs text-slate-500">
            Precision Music Medicine for Dementia &amp; Emotional Transformation
          </p>
        </div>
      </footer>

      {/* Persistent Mini-Player Bar when navigating other tabs */}
      {activeTrack && activeTab !== 'jukebox' && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-wildwoods-slate/95 backdrop-blur-md text-wildwoods-cream border-t-2 border-wildwoods-amber px-4 py-3 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleTogglePlay(activeTrack)}
                className="w-12 h-12 rounded-xl bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center font-bold shadow"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <div>
                <div className="text-xs font-bold text-wildwoods-gold">
                  {activeTrack.phaseName} • {activeTrack.bpm} BPM ({activeTrack.mode})
                </div>
                <div className="font-serif font-bold text-sm sm:text-base">
                  {activeTrack.title} — {activeTrack.artist}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextTrack}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-xs font-bold flex items-center gap-1.5"
              >
                <SkipForward className="w-4 h-4" />
                Next Track
              </button>
              <button
                type="button"
                onClick={() => handleQuarantineTrack(activeTrack)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-red-900 hover:bg-red-700 text-red-100 text-xs font-bold flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                Red Flag
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('jukebox')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-moss hover:bg-wildwoods-sage text-xs font-bold"
              >
                Open Full Jukebox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
