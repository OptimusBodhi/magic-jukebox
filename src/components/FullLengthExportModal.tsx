'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Disc3,
  ExternalLink,
  Copy,
  CheckCircle2,
  Download,
  Upload,
  Music,
  Sparkles,
  Play,
  Settings,
} from 'lucide-react';
import {
  BiographicalTrack,
  IsoTrajectoryResult,
  PatientProfile,
  SequencedTrack,
} from '@/lib/iso-sequencer';
import {
  formatCsvPlaylist,
  formatM3uPlaylist,
  formatSpotifyImportTracklist,
  getFullSongStreamingLinks,
} from '@/lib/share-and-export';
import {
  createFullLengthSpotifyPlaylist,
  exchangeSpotifyCodeIfPresent,
  getConfiguredSpotifyClientId,
  startSpotifyPkceAuth,
} from '@/lib/spotify-export';

interface FullLengthExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  trajectory: IsoTrajectoryResult;
  onAttachFullAudioFile?: (trackId: string, fileUrl: string, fileName: string) => void;
}

export default function FullLengthExportModal({
  isOpen,
  onClose,
  patient,
  trajectory,
  onAttachFullAudioFile,
}: FullLengthExportModalProps) {
  const [copiedTracklist, setCopiedTracklist] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [showSpotifyClientConfig, setShowSpotifyClientConfig] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [isCreatingSpotify, setIsCreatingSpotify] = useState(false);
  const [createdSpotifyPlaylist, setCreatedSpotifyPlaylist] = useState<{
    playlistUrl: string;
    matchedCount: number;
    playlistName: string;
  } | null>(null);
  const [spotifyStatusMessage, setSpotifyStatusMessage] = useState<string | null>(null);
  const [attachedFilesMap, setAttachedFilesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setCustomClientId(getConfiguredSpotifyClientId());
    exchangeSpotifyCodeIfPresent().then((token) => {
      if (token) setSpotifyToken(token);
    });
  }, []);

  if (!isOpen) return null;

  const orderedTracks = trajectory.orderedTracks;

  const handleCopyTracklistForSpotify = async () => {
    const text = formatSpotifyImportTracklist(trajectory);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTracklist(true);
      setTimeout(() => setCopiedTracklist(false), 4500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPlaylistFile = (format: 'csv' | 'm3u') => {
    const content =
      format === 'csv'
        ? formatCsvPlaylist(trajectory)
        : formatM3uPlaylist(patient, trajectory);
    const mime = format === 'csv' ? 'text/csv;charset=utf-8;' : 'audio/x-mpegurl;charset=utf-8;';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patient.preferredName.toLowerCase().replace(/\s+/g, '-')}-magic-jukebox.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDirectSpotifyExport = async () => {
    setSpotifyStatusMessage(null);
    if (spotifyToken) {
      setIsCreatingSpotify(true);
      try {
        const result = await createFullLengthSpotifyPlaylist(
          spotifyToken,
          patient,
          trajectory
        );
        setCreatedSpotifyPlaylist(result);
      } catch (err) {
        setSpotifyToken(null);
        setSpotifyStatusMessage(
          err instanceof Error ? err.message : 'Could not export to Spotify.'
        );
      } finally {
        setIsCreatingSpotify(false);
      }
      return;
    }

    const clientId = customClientId.trim() || getConfiguredSpotifyClientId();
    if (!clientId) {
      // Copy tracklist automatically and open TuneMyMusic / Spotify importer or show Client ID box
      await handleCopyTracklistForSpotify();
      setShowSpotifyClientConfig(true);
      setSpotifyStatusMessage(
        '✓ Copied your ordered tracklist! Paste it into Spotify or TuneMyMusic below—or enter a Spotify Client ID for 1-click OAuth creation.'
      );
      return;
    }

    await startSpotifyPkceAuth(clientId);
  };

  const handleFileUploadForTrack = (
    track: SequencedTrack,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !onAttachFullAudioFile) return;
    const objectUrl = URL.createObjectURL(file);
    onAttachFullAudioFile(track.id, objectUrl, file.name);
    setAttachedFilesMap((prev) => ({ ...prev, [track.id]: file.name }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="full-length-export-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-wildwoods-cream text-wildwoods-slate rounded-3xl max-w-3xl w-full shadow-2xl border-4 border-wildwoods-amber overflow-hidden my-8">
        {/* Header */}
        <div className="bg-wildwoods-slate text-wildwoods-cream px-6 py-5 flex items-center justify-between gap-4 border-b border-wildwoods-moss">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow">
              <Disc3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                Full-Length Playlist • Sequenced for Current Mood
              </div>
              <h2
                id="full-length-export-title"
                className="text-xl sm:text-2xl font-serif font-bold text-wildwoods-cream"
              >
                Play Full-Length Songs &amp; Export to Spotify
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream text-xs font-bold flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>

        {/* Active Mood Sequence Banner */}
        <div className="bg-wildwoods-parchment px-6 py-3.5 border-b border-wildwoods-sand flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="font-bold text-wildwoods-slate flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-wildwoods-amber" />
            <span>
              Ordered for: <strong>{trajectory.currentState.label}</strong> →{' '}
              <strong>{trajectory.targetState.label}</strong>
            </span>
          </div>
          <span className="font-extrabold text-wildwoods-sage">
            {orderedTracks.length} Songs ({patient.birthYear + 10}–{patient.birthYear + 30} Era)
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* OPTION 1: EXPORT TO SPOTIFY / APPLE MUSIC */}
          <section className="bg-white rounded-2xl p-5 border-2 border-emerald-600/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-extrabold uppercase tracking-wider">
                  Option 1 • Full-Length Streaming Playlist
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-wildwoods-slate mt-1">
                  Export Ordered Playlist to Spotify or Apple Music
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Saves all {orderedTracks.length} songs in their exact mood-to-calm order so they
                  play full-length from start to finish.
                </p>
              </div>
            </div>

            {createdSpotifyPlaylist && (
              <div className="p-4 rounded-2xl bg-emerald-950 text-emerald-100 border-2 border-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-extrabold text-sm flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Created “{createdSpotifyPlaylist.playlistName}” ({createdSpotifyPlaylist.matchedCount}{' '}
                    full tracks)
                  </div>
                  <p className="text-xs text-emerald-200">
                    Your playlist is ready in your Spotify account!
                  </p>
                </div>
                <a
                  href={createdSpotifyPlaylist.playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shrink-0"
                >
                  Open in Spotify App
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {spotifyStatusMessage && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold">
                {spotifyStatusMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isCreatingSpotify}
                onClick={handleDirectSpotifyExport}
                className="min-h-[52px] px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <Disc3 className="w-5 h-5" />
                {isCreatingSpotify
                  ? 'Creating Spotify Playlist...'
                  : spotifyToken
                  ? '1-Click Create Playlist in My Spotify'
                  : 'Export Playlist to Spotify'}
              </button>

              <button
                type="button"
                onClick={handleCopyTracklistForSpotify}
                className="min-h-[52px] px-5 py-3 rounded-2xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-gold font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                {copiedTracklist ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Copied All {orderedTracks.length} Songs!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Ordered Song List (Title – Artist)
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-wildwoods-parchment text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPlaylistFile('csv')}
                  className="px-3 py-1.5 rounded-xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand font-bold text-wildwoods-slate flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .CSV (Spotify / Apple Importers)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPlaylistFile('m3u')}
                  className="px-3 py-1.5 rounded-xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand font-bold text-wildwoods-slate flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .M3U Playlist
                </button>
                <a
                  href="https://www.tunemymusic.com/transfer/file-to-spotify"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCopyTracklistForSpotify}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold text-emerald-950 flex items-center gap-1"
                >
                  Paste into TuneMyMusic → Spotify
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowSpotifyClientConfig((prev) => !prev)}
                className="text-slate-500 hover:text-wildwoods-slate underline flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                Spotify API Settings
              </button>
            </div>

            {showSpotifyClientConfig && (
              <div className="p-4 rounded-xl bg-wildwoods-parchment/80 border border-wildwoods-sand space-y-2 text-xs">
                <label className="block font-bold text-wildwoods-slate">
                  Optional: Direct Spotify Web API Client ID (OAuth 2.0 PKCE)
                </label>
                <p className="text-slate-600">
                  To create playlists directly in 1 click without copying text, paste a free{' '}
                  <code>Spotify Client ID</code> from developer.spotify.com (with Redirect URI set to{' '}
                  <code>{typeof window !== 'undefined' ? window.location.origin : ''}</code>):
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    placeholder="Paste Spotify Client ID..."
                    className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-wildwoods-sand font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => startSpotifyPkceAuth(customClientId)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold"
                  >
                    Connect Spotify
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* OPTION 2: LOAD FULL-LENGTH MP3/M4A FOR TEMPO & PARKINSON'S PACE MATCHER */}
          <section className="bg-white rounded-2xl p-5 border-2 border-wildwoods-sand shadow-sm space-y-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider">
                Option 2 • Works with Tempo &amp; Parkinson’s Pace Slider!
              </span>
              <h3 className="text-lg font-serif font-bold text-wildwoods-slate mt-1">
                Play Full-Length Songs in Browser (or Attach MP3/M4A Files)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Click <strong>Spotify</strong> or <strong>YouTube</strong> on any song below to play
                it full-length—or click <strong>📂 Load MP3/Audio</strong> to attach a full song file
                from your device so you can adjust its speed (`65%–135%`) with our Parkinson’s Pace
                Matcher!
              </p>
            </div>

            <div className="divide-y divide-wildwoods-parchment border border-wildwoods-sand rounded-2xl overflow-hidden">
              {orderedTracks.map((track, idx) => {
                const links = getFullSongStreamingLinks(track);
                const attachedFileName = attachedFilesMap[track.id];
                return (
                  <div
                    key={track.id}
                    className="p-3.5 bg-wildwoods-cream/50 hover:bg-wildwoods-parchment/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-wildwoods-slate text-wildwoods-gold font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-wildwoods-slate truncate">
                          {track.title}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {track.artist} ({track.year}) • {track.bpm} BPM
                        </div>
                        {attachedFileName && (
                          <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
                            ✓ Loaded Full Audio: {attachedFileName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <a
                        href={links.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                      >
                        Spotify
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={links.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1"
                      >
                        YouTube
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={links.appleMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-cream text-xs font-bold flex items-center gap-1"
                      >
                        Apple
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {onAttachFullAudioFile && (
                        <label className="px-2.5 py-1.5 rounded-lg bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate text-xs font-extrabold flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          Load MP3
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileUploadForTrack(track, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
