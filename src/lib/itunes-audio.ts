import { BiographicalTrack, MusicalMode, NeuroTargetBadge } from './iso-sequencer';

export interface ItunesCandidateTrack {
  trackId: string;
  appleTrackId?: string;
  appleMusicUrl?: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  previewUrl: string;
  artworkUrl: string;
  genre: string;
  inferredBpm: number;
  inferredMode: MusicalMode;
  inferredEnergy: number;
  inferredValence: number;
  neuroTargets: NeuroTargetBadge[];
}

interface RawItunesItem {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
  trackViewUrl?: string;
}

/**
 * Deterministically infers clinical acoustic parameters (BPM, Mode, Energy, Neuro-Targets)
 * for newly discovered iTunes tracks based on genre, title keywords, and trackId hash,
 * and allows the caregiver to fine-tune them during triage.
 */
export function inferAcousticMetadata(
  item: RawItunesItem
): Pick<
  ItunesCandidateTrack,
  'inferredBpm' | 'inferredMode' | 'inferredEnergy' | 'inferredValence' | 'neuroTargets'
> {
  const genre = (item.primaryGenreName || '').toLowerCase();
  const title = (item.trackName || '').toLowerCase();
  const seed = (item.trackId || 1000) % 17;

  let baseBpm = 88 + seed;
  let mode: MusicalMode = 'Major';
  let energy = 5;
  let valence = 8;
  let neuroTargets: NeuroTargetBadge[] = [
    'cACC Affective Salience',
    'DMN Functional Connectivity',
  ];

  if (
    genre.includes('rock') ||
    genre.includes('r&b') ||
    genre.includes('soul') ||
    genre.includes('motown') ||
    title.includes('rock') ||
    title.includes('twist') ||
    title.includes('dance')
  ) {
    baseBpm = 112 + (seed % 14);
    energy = 8;
    valence = 9;
    neuroTargets = ['Ventral Pre-SMA Motor Entrainment', 'cACC Affective Salience'];
  } else if (
    genre.includes('vocal') ||
    genre.includes('jazz') ||
    genre.includes('easy') ||
    genre.includes('christian') ||
    genre.includes('gospel') ||
    title.includes('moon') ||
    title.includes('dream') ||
    title.includes('grace') ||
    title.includes('river')
  ) {
    baseBpm = 64 + (seed % 12);
    energy = 3;
    valence = 8;
    neuroTargets = ['PLST Stress Threshold Restoration', 'cACC Affective Salience'];
  } else if (
    title.includes('blues') ||
    title.includes('lonely') ||
    title.includes('cry') ||
    title.includes('rain')
  ) {
    baseBpm = 70 + (seed % 10);
    mode = 'Minor';
    energy = 3;
    valence = 5;
    neuroTargets = ['cACC Affective Salience', 'DMN Functional Connectivity'];
  }

  return {
    inferredBpm: baseBpm,
    inferredMode: mode,
    inferredEnergy: energy,
    inferredValence: valence,
    neuroTargets,
  };
}

/**
 * Searches the public iTunes Search API and strictly filters out any item without a valid previewUrl.
 */
export async function searchItunesTracks(
  query: string,
  limit: number = 12
): Promise<ItunesCandidateTrack[]> {
  if (!query.trim()) return [];
  const encoded = encodeURIComponent(query.trim());
  const url = `https://itunes.apple.com/search?term=${encoded}&entity=song&limit=${limit}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const results: RawItunesItem[] = Array.isArray(data?.results) ? data.results : [];

    // Guardrail #2: Never Render Silent Cards — strictly filter for valid https previewUrl
    // Also filter out karaoke, lullaby, or tribute cover bands so authentic recordings appear first.
    const JUNK_PATTERNS =
      /karaoke|tribute|lullaby|twinkle twinkle|made famous|originally performed|in the style of|8-bit|ringtone|instrumental version/i;

    const validItems = results.filter(
      (item) =>
        typeof item.previewUrl === 'string' &&
        item.previewUrl.startsWith('http') &&
        item.trackName &&
        item.artistName
    );

    const authenticItems = validItems.filter(
      (item) =>
        !JUNK_PATTERNS.test(item.artistName || '') &&
        !JUNK_PATTERNS.test(item.trackName || '') &&
        !JUNK_PATTERNS.test(item.collectionName || '')
    );

    const finalItems = authenticItems.length > 0 ? authenticItems : validItems;

    return finalItems.map((item) => {
        const yearMatch = item.releaseDate ? parseInt(item.releaseDate.slice(0, 4), 10) : 1962;
        const year = !Number.isNaN(yearMatch) ? yearMatch : 1962;
        const artworkUrl = item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb', '300x300bb')
          : '';
        const appleMusicUrl = item.trackViewUrl
          ? item.trackViewUrl.replace('itunes.apple.com', 'music.apple.com')
          : undefined;
        const appleTrackId = item.trackId ? String(item.trackId) : undefined;
        const acoustic = inferAcousticMetadata(item);

        return {
          trackId: `itunes-${item.trackId || Math.random().toString(36).slice(2, 9)}`,
          appleTrackId,
          appleMusicUrl,
          title: item.trackName!,
          artist: item.artistName!,
          album: item.collectionName || 'Original Recording',
          year,
          previewUrl: item.previewUrl!,
          artworkUrl,
          genre: item.primaryGenreName || 'Classic Pop',
          ...acoustic,
        };
      });
  } catch {
    return [];
  }
}

/**
 * Hydrates a list of BiographicalTracks with live iTunes previewUrl, high-res artworkUrl, and direct Apple Music URL.
 */
export async function hydrateSeedTracksWithItunes(
  tracks: BiographicalTrack[]
): Promise<BiographicalTrack[]> {
  const hydrated = await Promise.all(
    tracks.map(async (track) => {
      if (track.previewUrl && track.artworkUrl && track.appleMusicUrl) {
        return track;
      }
      const matches = await searchItunesTracks(track.itunesQuery, 3);
      if (matches.length > 0) {
        return {
          ...track,
          previewUrl: matches[0].previewUrl,
          artworkUrl: matches[0].artworkUrl,
          appleMusicUrl: matches[0].appleMusicUrl || track.appleMusicUrl,
          appleTrackId: matches[0].appleTrackId || track.appleTrackId,
        };
      }
      return track;
    })
  );
  return hydrated;
}
