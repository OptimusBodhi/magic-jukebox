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
  Sparkles,
  Play,
  Settings,
  Radio,
  Printer,
  QrCode,
  Tv,
  ChevronDown,
} from 'lucide-react';
import {
  IsoTrajectoryResult,
  PatientProfile,
  SequencedTrack,
} from '@/lib/iso-sequencer';
import {
  buildBedsideCardUrl,
  formatCsvPlaylist,
  formatM3uPlaylist,
  formatPhysicalPlayerUsbGuide,
  formatSpotifyImportTracklist,
  getFullSongStreamingLinks,
  printBedsideCardsOnly,
} from '@/lib/share-and-export';
import {
  MintedSpotifyPlaylist,
  createCentralSpotifyPlaylist,
  createFullLengthSpotifyPlaylist,
  exchangeSpotifyCodeIfPresent,
  getConfiguredSpotifyClientId,
  getSavedSpotifyRefreshToken,
  startSpotifyPkceAuth,
} from '@/lib/spotify-export';
import {
  buildEmbeddedContinuousPlayerUrl,
  buildInstantYoutubePlaylistUrl,
  getDirectAppleMusicLinks,
  hydrateYoutubeVideoIdsForTracks,
} from '@/lib/full-length-player';

interface FullLengthExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  trajectory: IsoTrajectoryResult;
  initialTab?: 'streaming' | 'hardware';
  onAttachFullAudioFile?: (trackId: string, fileUrl: string, fileName: string) => void;
  onOpenGiantButtonMode?: () => void;
  onTriggerBedsideCardVibe?: (vibe: 'upbeat' | 'arc' | 'relaxing') => void;
  onSwitchToInAppFullPlayer?: () => void;
}

export default function FullLengthExportModal({
  isOpen,
  onClose,
  patient,
  trajectory,
  initialTab = 'streaming',
  onAttachFullAudioFile,
  onOpenGiantButtonMode,
  onTriggerBedsideCardVibe,
  onSwitchToInAppFullPlayer,
}: FullLengthExportModalProps) {
  const [modalTab, setModalTab] = useState<'streaming' | 'hardware'>(initialTab);
  const [copiedTracklist, setCopiedTracklist] = useState(false);
  const [copiedPlaylistLink, setCopiedPlaylistLink] = useState(false);
  const [copiedUsbGuide, setCopiedUsbGuide] = useState(false);
  const [copiedNfcVibe, setCopiedNfcVibe] = useState<string | null>(null);
  const [copiedRefreshToken, setCopiedRefreshToken] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [savedRefreshToken, setSavedRefreshToken] = useState<string | null>(null);
  const [showSpotifyClientConfig, setShowSpotifyClientConfig] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [isCreatingSpotify, setIsCreatingSpotify] = useState(false);
  const [createdSpotifyPlaylist, setCreatedSpotifyPlaylist] =
    useState<MintedSpotifyPlaylist | null>(null);
  const [spotifyStatusMessage, setSpotifyStatusMessage] = useState<string | null>(null);
  const [attachedFilesMap, setAttachedFilesMap] = useState<Record<string, string>>({});
  const [resolvedYtMap, setResolvedYtMap] = useState<Record<string, string>>({});
  const [showEmbeddedContinuousPlayer, setShowEmbeddedContinuousPlayer] = useState(false);
  const [qrTargetMode, setQrTargetMode] = useState<'instant_playlist' | 'spotify'>('instant_playlist');

  useEffect(() => {
    if (isOpen) {
      setModalTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    setCustomClientId(getConfiguredSpotifyClientId());
    setSavedRefreshToken(getSavedSpotifyRefreshToken());
    exchangeSpotifyCodeIfPresent().then((token) => {
      if (token) {
        setSpotifyToken(token);
        setSavedRefreshToken(getSavedSpotifyRefreshToken());
      }
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    hydrateYoutubeVideoIdsForTracks(trajectory.orderedTracks).then((map) => {
      setResolvedYtMap(map);
    });
  }, [isOpen, trajectory.orderedTracks]);

  if (!isOpen) return null;

  const orderedTracks = trajectory.orderedTracks;
  const instantMultiSongPlaylistUrl = buildInstantYoutubePlaylistUrl(orderedTracks, resolvedYtMap);
  const embeddedContinuousUrl = buildEmbeddedContinuousPlayerUrl(
    orderedTracks,
    orderedTracks[0]?.id,
    resolvedYtMap,
    true
  );

  const activeQrUrl =
    qrTargetMode === 'spotify' && createdSpotifyPlaylist?.playlistUrl
      ? createdSpotifyPlaylist.playlistUrl
      : instantMultiSongPlaylistUrl;

  const handleCopyInstantPlaylistLink = async (urlToCopy: string) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopiedPlaylistLink(true);
      setTimeout(() => setCopiedPlaylistLink(false), 4000);
    } catch {
      // Ignore clipboard error
    }
  };

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

  const handleCopyPhysicalUsbGuide = async () => {
    const guideText = formatPhysicalPlayerUsbGuide(patient, trajectory);
    try {
      await navigator.clipboard.writeText(guideText);
      setCopiedUsbGuide(true);
      setTimeout(() => setCopiedUsbGuide(false), 4000);
    } catch {
      // Ignore
    }
  };

  const handleDownloadPhysicalUsbGuide = () => {
    const guideText = formatPhysicalPlayerUsbGuide(patient, trajectory);
    const blob = new Blob([guideText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patient.preferredName.toLowerCase().replace(/\s+/g, '-')}-3-button-player-usb-guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCardAutoPlayUrl = (vibe: 'upbeat' | 'arc' | 'relaxing') => {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin + window.location.pathname
        : 'https://magicjukebox.netlify.app/';
    return buildBedsideCardUrl(base, vibe, patient, orderedTracks);
  };

  const handleCopyNfcLink = async (vibe: 'upbeat' | 'arc' | 'relaxing') => {
    const nfcUrl = getCardAutoPlayUrl(vibe);
    try {
      await navigator.clipboard.writeText(nfcUrl);
      setCopiedNfcVibe(vibe);
      setTimeout(() => setCopiedNfcVibe(null), 4000);
    } catch {
      // Ignore
    }
  };

  const handlePrintCardsSheetOnly = () => {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin + window.location.pathname
        : 'https://magicjukebox.netlify.app/';
    printBedsideCardsOnly(patient, trajectory, base);
  };

  const handleDirectSpotifyExport = async () => {
    setSpotifyStatusMessage(null);
    setIsCreatingSpotify(true);

    try {
      // 1. Try zero-login Central Magic Jukebox Spotify Service first
      const centralRes = await createCentralSpotifyPlaylist(
        patient,
        orderedTracks,
        trajectory.targetState.label
      );
      if (centralRes.ok && centralRes.result) {
        setCreatedSpotifyPlaylist(centralRes.result);
        setQrTargetMode('spotify');
        setIsCreatingSpotify(false);
        return;
      }

      // 2. Next, if a browser Spotify token is present, mint directly via PKCE
      if (spotifyToken) {
        const result = await createFullLengthSpotifyPlaylist(
          spotifyToken,
          patient,
          trajectory
        );
        setCreatedSpotifyPlaylist(result);
        setQrTargetMode('spotify');
        setIsCreatingSpotify(false);
        return;
      }

      // 3. Otherwise, if a Client ID is configured, start 1-click PKCE auth
      const clientId = customClientId.trim() || getConfiguredSpotifyClientId();
      if (clientId) {
        await startSpotifyPkceAuth(clientId);
        return;
      }

      // 4. If neither central env vars nor Client ID is set yet, open the 1-time admin setup drawer
      setShowSpotifyClientConfig(true);
      setSpotifyStatusMessage(
        'To enable 1-click Spotify playlist links & QR codes, connect the central Magic Jukebox Spotify account below—or use the Instant Multi-Song Playlist button right next to it (zero login needed!).'
      );
    } catch (err) {
      setSpotifyToken(null);
      setSpotifyStatusMessage(
        err instanceof Error ? err.message : 'Could not build Spotify playlist.'
      );
    } finally {
      setIsCreatingSpotify(false);
    }
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-4 overflow-y-auto overflow-x-hidden"
    >
      <div className="bg-wildwoods-cream text-wildwoods-slate rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border-2 sm:border-4 border-wildwoods-amber overflow-hidden my-2 sm:my-8">
        {/* Header */}
        <div className="bg-wildwoods-slate text-wildwoods-cream px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-wildwoods-moss">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold shadow shrink-0 ${
                modalTab === 'hardware'
                  ? 'bg-wildwoods-amber text-wildwoods-slate'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {modalTab === 'hardware' ? (
                <Radio className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Disc3 className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold truncate">
                {modalTab === 'hardware'
                  ? 'Bedside Cards, 1-Button Screen & Physical Players'
                  : 'Instant Full-Length Playlist & QR Code'}
              </div>
              <h2
                id="full-length-export-title"
                className="text-base sm:text-2xl font-serif font-bold text-wildwoods-cream leading-snug"
              >
                {modalTab === 'hardware' ? (
                  <>Easy-Button, Printable QR Cards &amp; Bedside Setup</>
                ) : (
                  <>Play Full-Length Songs &amp; Export to Spotify</>
                )}
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

        {/* Active Mood Sequence Banner + Clean 2-Tab Switcher */}
        <div className="bg-wildwoods-parchment px-4 sm:px-6 py-3 border-b border-wildwoods-sand space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="font-bold text-wildwoods-slate flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wildwoods-amber" />
              <span>
                Ordered for: <strong>{trajectory.currentState.label}</strong> →{' '}
                <strong>{trajectory.targetState.label}</strong>
              </span>
            </div>
            <span className="font-extrabold text-wildwoods-sage">
              {orderedTracks.length} Full Songs ({patient.birthYear + 10}–{patient.birthYear + 30}{' '}
              Era)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setModalTab('streaming')}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition ${
                modalTab === 'streaming'
                  ? 'bg-wildwoods-slate text-wildwoods-gold border-wildwoods-slate shadow-sm'
                  : 'bg-white hover:bg-wildwoods-cream text-wildwoods-slate border-wildwoods-sand'
              }`}
            >
              <Disc3 className="w-4 h-4 shrink-0" />
              1. Instant Playlist Link, QR &amp; Full Songs
            </button>

            <button
              type="button"
              onClick={() => setModalTab('hardware')}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition ${
                modalTab === 'hardware'
                  ? 'bg-wildwoods-slate text-wildwoods-gold border-wildwoods-slate shadow-sm'
                  : 'bg-white hover:bg-wildwoods-cream text-wildwoods-slate border-wildwoods-sand'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              2. Physical &ldquo;Easy Button&rdquo; &amp; Bedside Setup
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {modalTab === 'hardware' ? (
            <div className="space-y-5">
              {/* HARDWARE OPTION 1: GIANT 1-BUTTON SCREEN & BLUETOOTH / USB BUTTONS */}
              <section className="bg-white rounded-2xl p-5 border-2 border-wildwoods-amber shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[11px] font-extrabold uppercase tracking-wider">
                    Zero New Hardware Needed • Works Right Now
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    ✓ Bluetooth &amp; USB Switches Auto-Enabled
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-wildwoods-slate">
                  Giant 1-Button Bedside Screen &amp; Physical Push-Buttons
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  For a loved one who cannot use menus or small buttons, open our{' '}
                  <strong>Giant 1-Button Bedside Screen</strong> (tapping anywhere on the screen
                  starts or pauses the music). You can also pair any{' '}
                  <strong>$15 Bluetooth media button</strong> or <strong>USB dome switch</strong>
                  —pressing it automatically plays/pauses the music!
                </p>

                {onOpenGiantButtonMode && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGiantButtonMode();
                    }}
                    className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Open Giant 1-Button Bedside Screen (+ Daily Auto-Play Clock)
                  </button>
                )}
              </section>

              {/* HARDWARE OPTION 2: RELISH / SMPL 3-BUTTON PHYSICAL PLAYER USB EXPORT */}
              <section className="bg-white rounded-2xl p-5 border-2 border-wildwoods-sand shadow-sm space-y-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[11px] font-extrabold uppercase tracking-wider">
                    For Relish Radio &amp; SMPL Lift-Lid Players
                  </span>
                  <h3 className="text-lg font-serif font-bold text-wildwoods-slate mt-1">
                    Load onto a Dedicated 3-Button Dementia Music Player (USB)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Have a physical <strong>Relish Radio</strong> or <strong>SMPL Player</strong>?
                    Download {patient.preferredName}’s 3-Button USB folder list (organized into{' '}
                    <strong>Button 1: Cheerful</strong>, <strong>Button 2: Afternoon Calm</strong>,
                    and <strong>Button 3: Peaceful Rest</strong>) with a cut-out paper label for the
                    top of the radio.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadPhysicalUsbGuide}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-gold font-extrabold text-xs flex items-center gap-2 shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    Download 3-Button USB Guide &amp; Paper Label (.TXT)
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPhysicalUsbGuide}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border border-wildwoods-sand font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedUsbGuide ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        Copied 3-Button Guide!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy 3-Button List
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* HARDWARE OPTION 3: NFC PHOTO CARDS & PRINTABLE BEDSIDE QR COASTERS */}
              <section className="bg-white rounded-2xl p-5 border-2 border-wildwoods-sand shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[11px] font-extrabold uppercase tracking-wider">
                      Tap-a-Photo NFC Stickers &amp; Printable Bedside Cards
                    </span>
                    <h3 className="text-lg font-serif font-bold text-wildwoods-slate mt-1">
                      1-Tap NFC Photo Links &amp; Printable Bedside Coasters
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintCardsSheetOnly}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Printer className="w-4 h-4" />
                    Print Cards &amp; Label Only
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Click <strong>Open &amp; Play Card</strong> below to launch that bedside card
                  right now, scan the QR code with a phone camera, or click{' '}
                  <strong>Copy NFC Link</strong> to paste onto a $0.40 NFC photo sticker:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        vibe: 'upbeat',
                        emoji: '☀️',
                        title: 'Card 1: Cheerful',
                        desc: 'Upbeat sing-alongs',
                      },
                      {
                        vibe: 'arc',
                        emoji: '🌊',
                        title: 'Card 2: Calm Arc',
                        desc: '30-min mood-to-calm',
                      },
                      {
                        vibe: 'relaxing',
                        emoji: '🌙',
                        title: 'Card 3: Peaceful',
                        desc: 'Soothing rest songs',
                      },
                    ] as const
                  ).map((card) => {
                    const isCopied = copiedNfcVibe === card.vibe;
                    const cardUrl = getCardAutoPlayUrl(card.vibe);
                    return (
                      <div
                        key={card.vibe}
                        className="p-3.5 rounded-2xl bg-wildwoods-cream border-2 border-wildwoods-sand flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xl">{card.emoji}</div>
                            <div className="font-extrabold text-xs sm:text-sm text-wildwoods-slate mt-1">
                              {card.title}
                            </div>
                            <div className="text-[11px] text-slate-600">{card.desc}</div>
                          </div>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&margin=2&data=${encodeURIComponent(
                              cardUrl
                            )}`}
                            alt={`QR code for ${card.title}`}
                            className="w-14 h-14 rounded-lg border border-wildwoods-sand bg-white p-0.5 shrink-0"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (onTriggerBedsideCardVibe) {
                                onClose();
                                onTriggerBedsideCardVibe(card.vibe);
                              } else {
                                window.location.href = cardUrl;
                              }
                            }}
                            className="w-full py-2 px-2.5 rounded-xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-gold font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Open &amp; Play Card
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyNfcLink(card.vibe)}
                            className="w-full py-1.5 px-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-wildwoods-sand text-wildwoods-slate font-bold text-[11px] flex items-center justify-center gap-1 transition"
                          >
                            {isCopied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                Copied Link!
                              </>
                            ) : (
                              <>
                                <QrCode className="w-3.5 h-3.5 text-wildwoods-amber" />
                                Copy NFC Sticker Link
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : (
            <>
              {/* HERO CARD: 1-TAP FULL-LENGTH PLAYLIST LAUNCHER + SCANNABLE QR CODE */}
              <section className="bg-white rounded-2xl p-5 border-2 border-emerald-600/50 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[11px] font-extrabold uppercase tracking-wider">
                      Zero CSVs • Zero Copy-Paste • Plays Full Songs Immediately
                    </span>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-wildwoods-slate">
                      1-Tap Full-Length Playlist Link &amp; Phone QR Code
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Tap a button below or scan the QR code with any phone camera to automatically
                      open and play all <strong>{orderedTracks.length} full-length songs</strong> in
                      their exact calming sequence:
                    </p>
                  </div>

                  {/* Live Scannable Playlist QR Code */}
                  <div className="flex items-center gap-3 bg-wildwoods-cream p-3 rounded-2xl border-2 border-wildwoods-sand shrink-0 self-center sm:self-auto">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=2&data=${encodeURIComponent(
                        activeQrUrl
                      )}`}
                      alt="Scan to open full-length playlist on phone"
                      className="w-20 h-20 rounded-xl border border-wildwoods-sand bg-white p-1 shrink-0"
                    />
                    <div className="text-xs space-y-1 max-w-[135px]">
                      <div className="font-extrabold text-wildwoods-slate flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        Scan with Phone
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        {qrTargetMode === 'spotify' && createdSpotifyPlaylist
                          ? 'Opens your unlisted Spotify playlist'
                          : `Auto-builds & plays all ${orderedTracks.length} full songs`}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyInstantPlaylistLink(activeQrUrl)}
                        className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                      >
                        {copiedPlaylistLink ? '✓ Copied Link!' : 'Copy Playlist Link'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary 1-Tap Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Instant Multi-Song Full Playlist (Zero Login Required) */}
                  <a
                    href={instantMultiSongPlaylistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setQrTargetMode('instant_playlist')}
                    className="min-h-[54px] px-4 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition text-center"
                  >
                    <Play className="w-5 h-5 fill-current shrink-0" />
                    <span>
                      Play Full {orderedTracks.length}-Song Playlist Now (No Login)
                    </span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>

                  {/* 2. 1-Tap Spotify Playlist Generator (Central Account or Connected Spotify) */}
                  <button
                    type="button"
                    disabled={isCreatingSpotify}
                    onClick={handleDirectSpotifyExport}
                    className="min-h-[54px] px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Disc3 className="w-5 h-5 shrink-0" />
                    <span>
                      {isCreatingSpotify
                        ? 'Building Spotify Playlist...'
                        : createdSpotifyPlaylist
                        ? 'Rebuild Spotify Playlist & QR'
                        : '1-Tap Open Playlist in Spotify'}
                    </span>
                  </button>
                </div>

                {/* In-App Continuous Full-Song Player Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchToInAppFullPlayer) {
                        onClose();
                        onSwitchToInAppFullPlayer();
                      } else {
                        setShowEmbeddedContinuousPlayer((prev) => !prev);
                      }
                    }}
                    className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-gold font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Tv className="w-4 h-4 text-wildwoods-amber shrink-0" />
                    Play All {orderedTracks.length} Full-Length Songs Right Inside the Jukebox
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSpotifyClientConfig((prev) => !prev)}
                    className="text-xs text-slate-500 hover:text-wildwoods-slate underline flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Central Spotify Account Setup
                  </button>
                </div>

                {/* Created Spotify Playlist Banner + Embedded Player */}
                {createdSpotifyPlaylist && (
                  <div className="p-4 rounded-2xl bg-emerald-950 text-emerald-100 border-2 border-emerald-400 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-sm flex items-center gap-2 text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          Ready: “{createdSpotifyPlaylist.playlistName}” (
                          {createdSpotifyPlaylist.matchedCount} full tracks)
                        </div>
                        <p className="text-xs text-emerald-200">
                          Unlisted &amp; privacy-safe • Tap to launch in the Spotify app or scan the
                          QR code above!
                        </p>
                      </div>
                      <a
                        href={createdSpotifyPlaylist.playlistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shrink-0"
                      >
                        Open in Spotify App
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {createdSpotifyPlaylist.embedUrl && (
                      <iframe
                        title="Spotify Full Playlist Player"
                        src={createdSpotifyPlaylist.embedUrl}
                        width="100%"
                        height="152"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl border border-emerald-700"
                      />
                    )}
                  </div>
                )}

                {showEmbeddedContinuousPlayer && embeddedContinuousUrl && (
                  <div className="p-3 rounded-2xl bg-wildwoods-slate text-wildwoods-cream space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-wildwoods-gold">
                      <span>
                        ▶ Continuous Full-Length Playlist ({orderedTracks.length} Songs in Order)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEmbeddedContinuousPlayer(false)}
                        className="underline text-wildwoods-mint"
                      >
                        Hide Player
                      </button>
                    </div>
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-wildwoods-moss bg-black">
                      <iframe
                        title="Continuous Full-Length Playlist Player"
                        src={embeddedContinuousUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {spotifyStatusMessage && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold">
                    {spotifyStatusMessage}
                  </div>
                )}

                {/* Central Magic Jukebox Spotify Admin Setup Drawer */}
                {showSpotifyClientConfig && (
                  <div className="p-4 rounded-xl bg-wildwoods-parchment/90 border border-wildwoods-sand space-y-3 text-xs">
                    <div className="font-extrabold text-wildwoods-slate">
                      Central Magic Jukebox Spotify Account Setup (1-Time Admin Configuration)
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Connect your central <strong>Magic Jukebox</strong> Spotify account once so
                      every family gets instant, unlisted (<code>public: false</code>),
                      de-identified Spotify playlist links &amp; QR codes with zero user login:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={customClientId}
                        onChange={(e) => setCustomClientId(e.target.value)}
                        placeholder="Paste Spotify Client ID from developer.spotify.com..."
                        className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-wildwoods-sand font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => startSpotifyPkceAuth(customClientId)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold shrink-0"
                      >
                        {spotifyToken
                          ? 'Reconnect Spotify Account'
                          : 'Connect Central Spotify Account'}
                      </button>
                    </div>

                    {savedRefreshToken && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1.5">
                        <div className="font-bold text-emerald-950 flex items-center justify-between">
                          <span>✓ Central Account Connected in This Browser!</span>
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(savedRefreshToken);
                              setCopiedRefreshToken(true);
                              setTimeout(() => setCopiedRefreshToken(false), 4000);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-bold"
                          >
                            {copiedRefreshToken
                              ? '✓ Copied Refresh Token!'
                              : 'Copy SPOTIFY_CENTRAL_REFRESH_TOKEN'}
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-900">
                          To enable zero-login server playlists for all visitors on Netlify, paste{' '}
                          <code>SPOTIFY_CENTRAL_CLIENT_ID</code> and{' '}
                          <code>SPOTIFY_CENTRAL_REFRESH_TOKEN</code> into your Netlify Environment
                          Variables.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* SECTION 2: DIRECT FULL-SONG LINKS (APPLE MUSIC, SPOTIFY, YOUTUBE) + LOCAL MP3 FOR PACE SLIDER */}
              <section className="bg-white rounded-2xl p-5 border-2 border-wildwoods-sand shadow-sm space-y-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider">
                    Direct Apple Music, Spotify &amp; Tempo-Slider Audio
                  </span>
                  <h3 className="text-lg font-serif font-bold text-wildwoods-slate mt-1">
                    Open Any Track in Apple Music / Spotify (or Attach MP3 for Pace Matcher)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Tap <strong>Apple Music</strong>, <strong>Spotify</strong>, or{' '}
                    <strong>YouTube</strong> on any song below to open the full track directly—or
                    click <strong>Load MP3</strong> if you want to adjust a full song’s tempo (
                    <code>65%–135%</code>) with our Parkinson’s Pace Matcher.
                  </p>
                </div>

                <div className="divide-y divide-wildwoods-parchment border border-wildwoods-sand rounded-2xl overflow-hidden">
                  {orderedTracks.map((track, idx) => {
                    const links = getFullSongStreamingLinks(track);
                    const appleDirect = getDirectAppleMusicLinks(track);
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
                            href={appleDirect.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-cream text-xs font-bold flex items-center gap-1"
                          >
                            Apple Music
                            <ExternalLink className="w-3 h-3" />
                          </a>
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
                            Full Song
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

              {/* COLLAPSED ADVANCED / RAW FILE EXPORTS (HIDDEN BY DEFAULT SO USERS NEVER HAVE TO DEAL WITH CSVs) */}
              <details className="bg-wildwoods-parchment/70 rounded-2xl border border-wildwoods-sand p-4 text-xs">
                <summary className="font-bold text-slate-600 cursor-pointer flex items-center justify-between">
                  <span>Advanced Options: Copy Text List or Download Raw .CSV / .M3U Files</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </summary>
                <div className="pt-3 mt-3 border-t border-wildwoods-sand flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTracklistForSpotify}
                    className="px-3 py-2 rounded-xl bg-wildwoods-slate text-wildwoods-gold font-bold flex items-center gap-1.5"
                  >
                    {copiedTracklist ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Copied All {orderedTracks.length} Songs!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Ordered Song List (Title – Artist)
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPlaylistFile('csv')}
                    className="px-3 py-2 rounded-xl bg-white border border-wildwoods-sand font-bold text-wildwoods-slate flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPlaylistFile('m3u')}
                    className="px-3 py-2 rounded-xl bg-white border border-wildwoods-sand font-bold text-wildwoods-slate flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .M3U
                  </button>
                </div>
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
