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
  HelpCircle,
  ChevronDown,
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
import SimpleTutorialModal from '@/components/SimpleTutorialModal';

type ActiveTab = 'home' | 'jukebox' | 'interview' | 'detective' | 'telemetry' | 'science';

const STORAGE_KEY = 'magic_jukebox_wildwoods_state_v1';

export default function MagicJukeboxApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_PATIENT_PROFILE);
  const [isCustomProfile, setIsCustomProfile] = useState<boolean>(false);
  const [interviewStartBlank, setInterviewStartBlank] = useState<boolean>(false);
  const [savedInterviewAnswers, setSavedInterviewAnswers] =
    useState< Record<string, unknown> | null>(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState<boolean>(false);
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

  // Pitch-Preserving Tempo & Parkinson's RAS (Rhythmic Auditory Stimulation) Pacing State
  const [playbackRate, setPlaybackRate] = useState<number>(1.0); // 0.65x to 1.35x with preservesPitch = true
  const [rampMode, setRampMode] = useState<'off' | 'speed_up' | 'slow_down'>('off');
  const [rasPulseEnabled, setRasPulseEnabled] = useState<boolean>(false);

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
  const rasPulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Helper: Apply pitch-preserving time-stretch (WSOLA) to HTML5 Audio element
  const applyPitchLockedRate = (el: HTMLAudioElement | null, rate: number) => {
    if (!el) return;
    const safeRate = Math.max(0.65, Math.min(1.35, Number(rate.toFixed(2))));
    el.preservesPitch = true;
    (el as HTMLAudioElement & { mozPreservesPitch?: boolean }).mozPreservesPitch = true;
    (el as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
    el.playbackRate = safeRate;
  };

  // Sync playbackRate to audio element whenever rate changes
  useEffect(() => {
    applyPitchLockedRate(audioRef.current, playbackRate);
  }, [playbackRate]);

  // Gradual Tempo Ramp (Parkinson's RAS Speed-Up or Calming Slow-Down) while playing
  useEffect(() => {
    if (!isPlaying || rampMode === 'off') return;
    const rampTimer = setInterval(() => {
      setPlaybackRate((prev) => {
        if (rampMode === 'speed_up') {
          const next = Number((prev + 0.01).toFixed(2));
          if (next >= 1.25) {
            setRampMode('off');
            return 1.25;
          }
          return next;
        } else {
          const next = Number((prev - 0.01).toFixed(2));
          if (next <= 0.75) {
            setRampMode('off');
            return 0.75;
          }
          return next;
        }
      });
    }, 2200);
    return () => clearInterval(rampTimer);
  }, [isPlaying, rampMode]);

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
          if (parsed.isCustomProfile) {
            setActiveTab('jukebox');
          }
        }
        if (parsed.savedInterviewAnswers) {
          setSavedInterviewAnswers(parsed.savedInterviewAnswers);
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
    } finally {
      setHasLoadedStorage(true);
    }

    // Hydrate all library tracks with live iTunes 30-second AAC preview streams
    hydrateSeedTracksWithItunes(initialTracks).then((hydrated) => {
      setLibrary(hydrated);
    });
  }, []);

  // Save state changes to LocalStorage (only after initial load has completed so we never overwrite saved data with defaults!)
  useEffect(() => {
    if (!hasLoadedStorage) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          patient,
          isCustomProfile,
          savedInterviewAnswers,
          library,
          quarantinedList,
          barsLogs,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [hasLoadedStorage, patient, isCustomProfile, savedInterviewAnswers, library, quarantinedList, barsLogs]);

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

  // Optional Rhythmic Auditory Stimulation (RAS) Tactile Beat Cue Overlay for Parkinson's Gait / Motor Pacing
  useEffect(() => {
    if (rasPulseIntervalRef.current) {
      clearInterval(rasPulseIntervalRef.current);
      rasPulseIntervalRef.current = null;
    }
    if (!isPlaying || !rasPulseEnabled || isMuted || !activeTrack) return;

    const effectiveBpm = Math.max(45, Math.round(activeTrack.bpm * playbackRate));
    const beatMs = Math.round((60 / effectiveBpm) * 1000);

    const triggerRasTick = () => {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.035);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch {
        // Ignore audio context errors
      }
    };

    triggerRasTick();
    rasPulseIntervalRef.current = setInterval(triggerRasTick, beatMs);
    return () => {
      if (rasPulseIntervalRef.current) {
        clearInterval(rasPulseIntervalRef.current);
        rasPulseIntervalRef.current = null;
      }
    };
  }, [isPlaying, rasPulseEnabled, isMuted, activeTrack, playbackRate]);

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
        applyPitchLockedRate(audioRef.current, playbackRate);
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
    startWebAudioFallback(Math.round(target.bpm * playbackRate), target.mode);
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
    setSavedInterviewAnswers(null);
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
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col bg-wildwoods-cream text-wildwoods-slate">
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

      {/* Clean, Mobile-Fitted Top Header (Never Overflows Phone Width) */}
      <header className="sticky top-0 z-40 w-full bg-wildwoods-slate/95 backdrop-blur-md text-wildwoods-cream border-b border-wildwoods-moss shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              setActiveTab('home');
            }}
            className="flex items-center gap-2 text-left group min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center shadow font-serif font-extrabold shrink-0 group-hover:bg-wildwoods-gold transition">
              <Disc3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="font-serif font-bold text-sm sm:text-xl tracking-tight text-wildwoods-cream block truncate">
                The Magic Jukebox
              </span>
              <span className="hidden sm:block text-[11px] text-wildwoods-mint truncate">
                Personal Music &amp; Memory Player
              </span>
            </div>
          </button>

          {/* 1 Primary Jukebox Button + 1 Unified "Menu" Dropdown */}
          <nav
            aria-label="Primary Navigation"
            className="flex items-center gap-1.5 shrink-0 relative"
          >
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                setActiveTab('jukebox');
              }}
              className={`min-h-[42px] px-3 sm:px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                activeTab === 'jukebox'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream'
              }`}
            >
              <Disc3 className="w-4 h-4 shrink-0" />
              <span className="max-w-[115px] sm:max-w-none truncate">
                {isCustomProfile ? `${patient.preferredName}’s Jukebox` : 'Play Jukebox'}
              </span>
            </button>

            {/* Desktop-only quick setup button; on mobile it sits right at the top of the unified Menu */}
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                setInterviewStartBlank(!isCustomProfile);
                setActiveTab('interview');
              }}
              className={`hidden md:flex min-h-[42px] px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm items-center gap-1.5 transition ${
                activeTab === 'interview'
                  ? 'bg-wildwoods-amber text-wildwoods-slate shadow'
                  : 'bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream border border-wildwoods-amber/50'
              }`}
            >
              <Wand2 className="w-4 h-4 text-wildwoods-gold shrink-0" />
              <span>{isCustomProfile ? 'Change Setup' : 'Build Playlist'}</span>
            </button>

            {/* Unified Menu Dropdown (Always fits on every mobile screen!) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                aria-expanded={isMoreMenuOpen}
                className="min-h-[42px] px-3 sm:px-3.5 py-2 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-gold border border-wildwoods-amber/60 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition"
              >
                <span>Menu</span>
                <ChevronDown className="w-4 h-4 shrink-0" />
              </button>

              {isMoreMenuOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] max-w-xs rounded-2xl bg-wildwoods-slate border-2 border-wildwoods-amber shadow-2xl p-2.5 z-50 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setInterviewStartBlank(!isCustomProfile);
                      setActiveTab('interview');
                    }}
                    className="w-full px-3.5 py-3 rounded-xl bg-wildwoods-amber text-wildwoods-slate text-left text-sm font-extrabold flex items-center gap-2.5 shadow"
                  >
                    <Wand2 className="w-4 h-4 shrink-0" />
                    {isCustomProfile ? 'Edit My Profile & Playlist' : 'Build My Playlist (3 Steps)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsTutorialOpen(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-left text-xs sm:text-sm font-extrabold text-wildwoods-gold border border-wildwoods-amber/40 flex items-center gap-2.5"
                  >
                    <HelpCircle className="w-4 h-4 text-wildwoods-gold shrink-0" />
                    How It Works (Quick Guide)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setActiveTab('jukebox');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl hover:bg-wildwoods-forest text-left text-xs sm:text-sm font-bold text-wildwoods-cream flex items-center gap-2.5"
                  >
                    <Disc3 className="w-4 h-4 text-wildwoods-gold shrink-0" />
                    Open Jukebox Player
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setActiveTab('home');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl hover:bg-wildwoods-forest text-left text-xs sm:text-sm font-bold text-wildwoods-cream flex items-center gap-2.5"
                  >
                    <Home className="w-4 h-4 text-wildwoods-gold shrink-0" />
                    Welcome / Home Screen
                  </button>

                  <div className="border-t border-wildwoods-moss my-1 pt-1 space-y-1">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-wildwoods-mint/70">
                      Caregiver &amp; Clinical Tools
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setActiveTab('detective');
                      }}
                      className="w-full px-3.5 py-2 rounded-xl hover:bg-wildwoods-forest text-left text-xs font-bold text-wildwoods-cream flex items-center gap-2.5"
                    >
                      <Search className="w-4 h-4 text-wildwoods-gold shrink-0" />
                      Song Finder Studio
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setActiveTab('telemetry');
                      }}
                      className="w-full px-3.5 py-2 rounded-xl hover:bg-wildwoods-forest text-left text-xs font-bold text-wildwoods-cream flex items-center gap-2.5"
                    >
                      <Activity className="w-4 h-4 text-wildwoods-gold shrink-0" />
                      Caregiver Log &amp; Medical Record
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setActiveTab('science');
                      }}
                      className="w-full px-3.5 py-2 rounded-xl hover:bg-wildwoods-forest text-left text-xs font-bold text-wildwoods-cream flex items-center gap-2.5"
                    >
                      <BookOpen className="w-4 h-4 text-wildwoods-gold shrink-0" />
                      Clinical Science &amp; Research
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        handleResetDemoState();
                      }}
                      className="w-full px-3.5 py-2 rounded-xl hover:bg-wildwoods-forest text-left text-xs font-semibold text-wildwoods-mint flex items-center gap-2.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      Reset Sample Demo Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Beginner-Friendly Interactive 4-Step Visual Tutorial Modal */}
      <SimpleTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartBuildingPlaylist={() => {
          setInterviewStartBlank(true);
          setActiveTab('interview');
        }}
        onOpenJukebox={() => setActiveTab('jukebox')}
      />

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
            onOpenTutorial={() => setIsTutorialOpen(true)}
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
            onQuickMoodLog={(newLog) => setBarsLogs((prev) => [...prev, newLog])}
            onAddTrackToLibrary={(newTrack) => {
              setLibrary((prev) => [
                newTrack,
                ...prev.filter((t) => t.id !== newTrack.id),
              ]);
              setActiveTrackId(newTrack.id);
            }}
            onUpdateTrackInLibrary={(trackId, updates) => {
              setLibrary((prev) =>
                prev.map((t) => (t.id === trackId ? { ...t, ...updates } : t))
              );
            }}
            playbackRate={playbackRate}
            onChangePlaybackRate={(rate) => {
              setRampMode('off');
              setPlaybackRate(Math.max(0.65, Math.min(1.35, Number(rate.toFixed(2)))));
            }}
            rampMode={rampMode}
            onChangeRampMode={setRampMode}
            rasPulseEnabled={rasPulseEnabled}
            onToggleRasPulse={() => setRasPulseEnabled((prev) => !prev)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onUpdatePatientProfile={(updates) => {
              setPatient((prev) => ({ ...prev, ...updates }));
              setIsCustomProfile(true);
            }}
          />
        )}

        {activeTab === 'interview' && (
          <GuidedOnboardingView
            startBlank={interviewStartBlank}
            existingPatient={patient}
            isCustomProfile={isCustomProfile}
            initialSavedAnswers={savedInterviewAnswers}
            onLiveUpdateProfile={(updatedFields, latestAnswers) => {
              setPatient((prev) => ({ ...prev, ...updatedFields }));
              setIsCustomProfile(true);
              setSavedInterviewAnswers(
                latestAnswers as unknown as Record<string, unknown>
              );
            }}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onCompleteInterview={({
              profile: newProfile,
              tracks: synthesizedTracks,
              quarantinedEntry,
              initialCurrentState,
              initialTargetState,
              isCustom,
              answers: completedAnswers,
            }) => {
              stopAllAudio();
              setPatient(newProfile);
              setIsCustomProfile(isCustom);
              setSavedInterviewAnswers(
                completedAnswers as unknown as Record<string, unknown>
              );
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
                `✨ Saved ${newProfile.name}’s Jukebox (${
                  newProfile.birthYear + 10
                }–${newProfile.birthYear + 30} Favorite Youth Era) and updated playlist!`
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
            trajectory={trajectory}
            library={library}
            quarantinedList={quarantinedList}
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

      {/* Persistent Mini-Player Bar only when audio is actively playing on another tab */}
      {activeTrack && isPlaying && activeTab !== 'jukebox' && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-wildwoods-slate/95 backdrop-blur-md text-wildwoods-cream border-t-2 border-wildwoods-amber px-4 py-2.5 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => handleTogglePlay(activeTrack)}
                className="w-11 h-11 rounded-xl bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center font-bold shadow shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <div className="min-w-0">
                <div className="font-serif font-bold text-sm sm:text-base truncate">
                  {activeTrack.title} — {activeTrack.artist}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleNextTrack}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-xs font-bold flex items-center gap-1"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Next
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('jukebox')}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-wildwoods-amber text-wildwoods-slate text-xs font-extrabold"
              >
                Open Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
