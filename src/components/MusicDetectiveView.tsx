'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  SkipForward,
  ShieldAlert,
  Play,
  Pause,
  Calendar,
  Music,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  Radio,
} from 'lucide-react';
import {
  BiographicalTrack,
  MusicalMode,
  PatientProfile,
  calculateReminiscenceBump,
  getTrackEpochLabel,
} from '@/lib/iso-sequencer';
import { ERA_DISCOVERY_PRESETS } from '@/lib/clinical-evidence';
import { ItunesCandidateTrack, searchItunesTracks } from '@/lib/itunes-audio';

interface QuarantinedItem {
  id: string;
  title: string;
  artist: string;
  year: number;
  reason: string;
  quarantinedAt: string;
}

interface MusicDetectiveViewProps {
  patient: PatientProfile;
  onUpdateBirthYear: (year: number) => void;
  library: BiographicalTrack[];
  quarantinedList: QuarantinedItem[];
  onAddTrackToLibrary: (track: BiographicalTrack) => void;
  onQuarantineCandidate: (candidate: {
    id: string;
    title: string;
    artist: string;
    year: number;
    reason: string;
  }) => void;
  onRestoreQuarantined: (id: string) => void;
  previewingUrl: string | null;
  isPreviewPlaying: boolean;
  onTogglePreviewUrl: (url: string, fallbackBpm?: number, fallbackMode?: MusicalMode) => void;
  onStopPreview: () => void;
}

export default function MusicDetectiveView({
  patient,
  onUpdateBirthYear,
  library,
  quarantinedList,
  onAddTrackToLibrary,
  onQuarantineCandidate,
  onRestoreQuarantined,
  previewingUrl,
  isPreviewPlaying,
  onTogglePreviewUrl,
  onStopPreview,
}: MusicDetectiveViewProps) {
  const [birthYearInput, setBirthYearInput] = useState<number>(patient.birthYear);
  const [searchQuery, setSearchQuery] = useState<string>('Nat King Cole Perry Como Dean Martin');
  const [activePresetId, setActivePresetId] = useState<string>('1950s-crooners');
  const [candidates, setCandidates] = useState<ItunesCandidateTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(0);

  // Custom Memory Mirror & Acoustic Triage state for the focused candidate card
  const [memoryNoteDraft, setMemoryNoteDraft] = useState<string>('');
  const [duetPromptDraft, setDuetPromptDraft] = useState<string>('');
  const [customBpm, setCustomBpm] = useState<number>(84);
  const [customMode, setCustomMode] = useState<MusicalMode>('Major');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const bump = calculateReminiscenceBump(birthYearInput);

  const runDiscoverySearch = async (query: string) => {
    setIsLoading(true);
    const results = await searchItunesTracks(query, 12);
    setCandidates(results);
    setSelectedCardIdx(0);
    if (results.length > 0) {
      setCustomBpm(results[0].inferredBpm);
      setCustomMode(results[0].inferredMode);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    runDiscoverySearch(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCandidate = candidates[selectedCardIdx] || null;

  useEffect(() => {
    if (currentCandidate) {
      setCustomBpm(currentCandidate.inferredBpm);
      setCustomMode(currentCandidate.inferredMode);
      setMemoryNoteDraft('');
      setDuetPromptDraft('');
    }
  }, [selectedCardIdx, currentCandidate]);

  const handleBirthYearChange = (val: number) => {
    setBirthYearInput(val);
    if (val >= 1915 && val <= 2010) {
      onUpdateBirthYear(val);
    }
  };

  const handleSparkAdd = (candidate: ItunesCandidateTrack) => {
    const newTrack: BiographicalTrack = {
      id: candidate.trackId,
      title: candidate.title,
      artist: candidate.artist,
      year: candidate.year,
      bpm: customBpm || candidate.inferredBpm,
      mode: customMode || candidate.inferredMode,
      energy: candidate.inferredEnergy,
      valence: candidate.inferredValence,
      neuroTargets: candidate.neuroTargets,
      memoryNote:
        memoryNoteDraft.trim() ||
        `Added via Music Detective (${getTrackEpochLabel(
          candidate.year,
          bump.birthYear
        )}). Sparked immediate facial recognition and positive emotional valence.`,
      duetPrompt:
        duetPromptDraft.trim() ||
        `Invite ${patient.preferredName} to hum along with ${candidate.artist} and ask what this melody brings to mind.`,
      chorusLyrics: [
        `${candidate.title} — ${candidate.artist} (${candidate.year})`,
        'Listen closely to the chorus hook and sing or sway together.',
      ],
      itunesQuery: `${candidate.artist} ${candidate.title}`,
      previewUrl: candidate.previewUrl,
      artworkUrl: candidate.artworkUrl,
      epochLabel: getTrackEpochLabel(candidate.year, bump.birthYear),
    };

    onAddTrackToLibrary(newTrack);
    setFeedbackBanner(
      `✨ Sparked! "${candidate.title}" (${newTrack.bpm} BPM, ${newTrack.mode}) added to ${patient.preferredName}'s Iso-Principle Jukebox.`
    );
    setTimeout(() => setFeedbackBanner(null), 5000);

    if (selectedCardIdx < candidates.length - 1) {
      setSelectedCardIdx((prev) => prev + 1);
    }
  };

  const handleSkipCandidate = () => {
    onStopPreview();
    if (selectedCardIdx < candidates.length - 1) {
      setSelectedCardIdx((prev) => prev + 1);
    } else {
      setSelectedCardIdx(0);
    }
  };

  const handleQuarantineFromDetective = (candidate: ItunesCandidateTrack) => {
    onStopPreview();
    onQuarantineCandidate({
      id: candidate.trackId,
      title: candidate.title,
      artist: candidate.artist,
      year: candidate.year,
      reason:
        memoryNoteDraft.trim() ||
        'Quarantined during Music Detective audition (negative autonomic or bereavement cue observed).',
    });
    setFeedbackBanner(
      `🛑 Red Flag Quarantined: "${candidate.title}" by ${candidate.artist} permanently blocked from ${patient.preferredName}'s playlists.`
    );
    setTimeout(() => setFeedbackBanner(null), 5000);

    if (selectedCardIdx < candidates.length - 1) {
      setSelectedCardIdx((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header contrasting against UK Playlist for Life friction */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wildwoods-amber/20 border border-wildwoods-amber text-wildwoods-gold text-xs font-bold uppercase tracking-wider">
              Pillar 1 • Zero-Friction Auditory Reminiscence Studio
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold">
              The “Music Detective” Co-Curation Studio
            </h1>
            <p className="text-wildwoods-mint text-sm md:text-base max-w-3xl">
              Solves the UK <em>Playlist for Life</em> “Missing Preview Clip” &amp; Spotify login
              traps. Every suggested song card streams a live 30-second chorus hook immediately upon
              tap—so a loved one with anomia can recognize music by ear, not written text.
            </p>
          </div>

          <div className="bg-wildwoods-forest p-5 rounded-2xl border border-wildwoods-sage/50 shrink-0 space-y-2">
            <label
              htmlFor="patient-birth-year-input"
              className="block text-xs font-bold uppercase tracking-wider text-wildwoods-gold"
            >
              Patient Birth Year (Calculates Ages 10–30 Bump)
            </label>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-wildwoods-amber" />
              <input
                id="patient-birth-year-input"
                type="number"
                min={1915}
                max={2005}
                value={birthYearInput}
                onChange={(e) => handleBirthYearChange(Number(e.target.value))}
                className="w-28 px-3 py-2 rounded-xl bg-wildwoods-slate border-2 border-wildwoods-amber text-wildwoods-cream font-serif font-bold text-2xl text-center focus:outline-none"
              />
              <div className="text-xs text-wildwoods-mint">
                <div className="font-bold text-wildwoods-cream">
                  Core Bump: {bump.bumpStart}–{bump.bumpEnd}
                </div>
                <div>Current Age: {bump.currentAge} yrs</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Developmental Reminiscence Bump Epochs (Click any epoch to search its hits) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-wildwoods-moss">
          {bump.epochs.map((epoch) => (
            <button
              key={epoch.id}
              type="button"
              onClick={() => {
                const decadeQuery = `${epoch.startYear} ${epoch.endYear} classic hits`;
                setSearchQuery(decadeQuery);
                setActivePresetId(epoch.id);
                runDiscoverySearch(decadeQuery);
              }}
              className="text-left p-4 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss border border-wildwoods-sage/40 transition group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold">
                  {epoch.ageRange} ({epoch.startYear}–{epoch.endYear})
                </span>
                <span className="text-xs text-wildwoods-mint group-hover:underline">
                  Audition Era →
                </span>
              </div>
              <h2 className="text-base font-serif font-bold text-wildwoods-cream mt-1">
                {epoch.name}
              </h2>
              <p className="text-xs text-wildwoods-mint mt-1 leading-relaxed">
                {epoch.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {feedbackBanner && (
        <div
          role="status"
          className="bg-emerald-950 text-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="font-semibold text-sm md:text-base">{feedbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-xs underline px-3 py-1"
          >
            Close
          </button>
        </div>
      )}

      {/* Search Bar & Era Discovery Pills */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-wildwoods-sand space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runDiscoverySearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search any song, artist, or decade on iTunes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any song, artist, hymn, or year (e.g., 'Patsy Cline', '1958', 'Amazing Grace')..."
              className="w-full min-h-[52px] pl-12 pr-4 py-3 rounded-2xl bg-wildwoods-cream border-2 border-wildwoods-sand text-wildwoods-slate font-medium focus:border-wildwoods-sage focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[52px] px-7 py-3 rounded-2xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-cream font-bold flex items-center justify-center gap-2 transition"
          >
            <Radio className="w-5 h-5 text-wildwoods-gold" />
            {isLoading ? 'Fetching Audio Previews...' : 'Search Live iTunes Audio'}
          </button>
        </form>

        {/* Era Discovery Suggestion Pills */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1-Tap Era &amp; Heritage Discovery Collections (100% Verified Audio Previews):
          </div>
          <div className="flex flex-wrap gap-2">
            {ERA_DISCOVERY_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setActivePresetId(preset.id);
                    setSearchQuery(preset.searchQuery);
                    runDiscoverySearch(preset.searchQuery);
                  }}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-wildwoods-amber text-wildwoods-slate border-wildwoods-amber shadow-sm'
                      : 'bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate border-wildwoods-sand'
                  }`}
                >
                  {preset.label} ({preset.years})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Tactile Co-Curation Deck & Candidate Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Tactile Vinyl Jukebox Swipe/Triage Card */}
        <section
          aria-label="Tactile Reaction Triage Deck"
          className="xl:col-span-7 bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss space-y-6"
        >
          <div className="flex items-center justify-between border-b border-wildwoods-moss pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-wildwoods-gold">
                Interactive Patient Co-Curation Card
              </span>
              <h3 className="text-xl font-serif font-bold">
                Play 30-Second Hook &amp; Observe Facial / Motor Response
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-wildwoods-forest text-wildwoods-mint">
              Card {candidates.length ? selectedCardIdx + 1 : 0} of {candidates.length}
            </span>
          </div>

          {currentCandidate ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-wildwoods-forest p-5 rounded-2xl border border-wildwoods-moss">
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-wildwoods-amber shrink-0 bg-wildwoods-slate flex items-center justify-center">
                  {currentCandidate.artworkUrl ? (
                    <img
                      src={currentCandidate.artworkUrl}
                      alt={currentCandidate.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-12 h-12 text-wildwoods-gold" />
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-wildwoods-amber/20 border border-wildwoods-amber text-wildwoods-gold text-xs font-bold">
                      Released {currentCandidate.year} •{' '}
                      {getTrackEpochLabel(currentCandidate.year, bump.birthYear)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                      30s AAC Preview Verified
                    </span>
                  </div>

                  <h4 className="text-2xl font-serif font-bold text-wildwoods-cream">
                    {currentCandidate.title}
                  </h4>
                  <p className="text-base text-wildwoods-mint font-medium">
                    {currentCandidate.artist} — <em>{currentCandidate.album}</em>
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onTogglePreviewUrl(
                          currentCandidate.previewUrl,
                          customBpm,
                          customMode
                        )
                      }
                      className="min-h-[54px] px-7 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-base inline-flex items-center gap-3 shadow-lg transition"
                    >
                      {previewingUrl === currentCandidate.previewUrl && isPreviewPlaying ? (
                        <>
                          <Pause className="w-6 h-6" />
                          Pause 30s Chorus Preview
                        </>
                      ) : (
                        <>
                          <Play className="w-6 h-6" />
                          Play 30s Chorus Preview Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Memory Mirror Journal & Acoustic Tagging Inputs */}
              <div className="bg-wildwoods-forest/80 p-5 rounded-2xl border border-wildwoods-moss space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-wildwoods-gold">
                  <BookOpen className="w-4 h-4" />
                  Memory Mirror Journal &amp; Iso-Principle Acoustic Tagging
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-wildwoods-mint mb-1 font-semibold">
                      Estimated Tempo (BPM: 60–140)
                    </label>
                    <input
                      type="number"
                      min={55}
                      max={150}
                      value={customBpm}
                      onChange={(e) => setCustomBpm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-wildwoods-slate border border-wildwoods-moss text-wildwoods-cream font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-wildwoods-mint mb-1 font-semibold">
                      Musical Mode (Harmonic Valence)
                    </label>
                    <select
                      value={customMode}
                      onChange={(e) => setCustomMode(e.target.value as MusicalMode)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-wildwoods-slate border border-wildwoods-moss text-wildwoods-cream font-bold text-sm"
                    >
                      <option value="Major">Major Mode (Resolved / Uplifting / Calm)</option>
                      <option value="Minor">Minor Mode (Reflective / Empathetic Match)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-wildwoods-mint mb-1 font-semibold">
                    Family “Memory Mirror” Story (Why this song matters to {patient.preferredName}):
                  </label>
                  <input
                    type="text"
                    value={memoryNoteDraft}
                    onChange={(e) => setMemoryNoteDraft(e.target.value)}
                    placeholder={`e.g., "${patient.preferredName} danced to this with Clara at the 1962 County Fair..."`}
                    className="w-full px-4 py-2.5 rounded-xl bg-wildwoods-slate border border-wildwoods-moss text-wildwoods-cream text-sm placeholder:text-wildwoods-mint/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-wildwoods-mint mb-1 font-semibold">
                    Caregiver Duet Conversation Starter Prompt:
                  </label>
                  <input
                    type="text"
                    value={duetPromptDraft}
                    onChange={(e) => setDuetPromptDraft(e.target.value)}
                    placeholder={`e.g., "Ask ${patient.preferredName} about his first car after the chorus finishes..."`}
                    className="w-full px-4 py-2.5 rounded-xl bg-wildwoods-slate border border-wildwoods-moss text-wildwoods-cream text-sm placeholder:text-wildwoods-mint/50"
                  />
                </div>
              </div>

              {/* 3 Tactile Reaction Triage Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSparkAdd(currentCandidate)}
                  className="min-h-[60px] px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Sparkles className="w-5 h-5" />
                  Spark / Add to Jukebox
                </button>

                <button
                  type="button"
                  onClick={handleSkipCandidate}
                  className="min-h-[60px] px-4 py-3 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream border border-wildwoods-sage font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <SkipForward className="w-5 h-5" />
                  Neutral / Skip Track
                </button>

                <button
                  type="button"
                  onClick={() => handleQuarantineFromDetective(currentCandidate)}
                  className="min-h-[60px] px-4 py-3 rounded-2xl bg-red-900 hover:bg-red-700 text-red-100 border border-red-400/50 font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <ShieldAlert className="w-5 h-5" />
                  Quarantine Red Flag
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-wildwoods-mint">
              {isLoading
                ? 'Searching iTunes catalog for verified 30-second audio previews...'
                : 'No previewable tracks found for that query. Try another artist or click an Era Discovery pill above.'}
            </div>
          )}
        </section>

        {/* Right 5 Columns: Live iTunes Results List & Red Flag Quarantine Exclusion List */}
        <div className="xl:col-span-5 space-y-6">
          <section className="bg-white rounded-3xl p-6 shadow-md border border-wildwoods-sand space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-wildwoods-slate">
                Verified Audio Candidates ({candidates.length})
              </h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                Zero Silent Cards Guardrail Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {candidates.map((cand, idx) => {
                const isSelected = idx === selectedCardIdx;
                const isAlreadyInLibrary = library.some(
                  (t) =>
                    t.id === cand.trackId ||
                    (t.title.toLowerCase() === cand.title.toLowerCase() &&
                      t.artist.toLowerCase() === cand.artist.toLowerCase())
                );
                const isPlayingThis = previewingUrl === cand.previewUrl && isPreviewPlaying;

                return (
                  <div
                    key={cand.trackId}
                    onClick={() => setSelectedCardIdx(idx)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow'
                        : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCardIdx(idx);
                          onTogglePreviewUrl(
                            cand.previewUrl,
                            cand.inferredBpm,
                            cand.inferredMode
                          );
                        }}
                        className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center shrink-0 ${
                          isPlayingThis
                            ? 'bg-wildwoods-amber text-wildwoods-slate'
                            : 'bg-wildwoods-forest text-wildwoods-cream'
                        }`}
                      >
                        {isPlayingThis ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{cand.title}</div>
                        <div
                          className={`text-xs truncate ${
                            isSelected ? 'text-wildwoods-mint' : 'text-slate-600'
                          }`}
                        >
                          {cand.artist} • {cand.year} ({cand.inferredBpm} BPM)
                        </div>
                      </div>
                    </div>

                    {isAlreadyInLibrary && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold shrink-0">
                        In Jukebox
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Red Flag Quarantine Vault */}
          <section className="bg-red-950/95 text-red-100 rounded-3xl p-6 shadow-md border border-red-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-serif font-bold">
                  Red Flag Quarantine Vault ({quarantinedList.length})
                </h3>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-red-300 font-semibold">
                Gerdner Safety Protocol
              </span>
            </div>
            <p className="text-xs text-red-200/90">
              Songs linked to bereavement, trauma, or acoustic overstimulation are permanently
              blocked so visiting staff or family members never accidentally trigger distress.
            </p>

            <div className="space-y-2.5 pt-1">
              {quarantinedList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-red-900/60 border border-red-400/30 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white">
                      {item.title} — {item.artist} ({item.year})
                    </div>
                    <p className="text-xs text-red-200 leading-relaxed">{item.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRestoreQuarantined(item.id)}
                    title="Remove from Quarantine"
                    className="px-2.5 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
