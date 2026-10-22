import { BiographicalTrack, SequencedTrack } from './iso-sequencer';

/**
 * Pre-verified official YouTube Audio videoIds for core Reminiscence Bump tracks
 * so 1-tap multi-song playlist links, QR codes, and in-app full-length playback
 * work instantaneously with zero latency.
 */
export const VERIFIED_YOUTUBE_VIDEO_IDS: Record<string, string> = {
  'rock around the clock': 'Ud_JZcC0tHI',
  'all shook up': '23zLefwiii4',
  'i want to hold your hand': 'v1HDt1tknTc',
  'my girl': 'y3KJ7d2qBoA',
  'fly me to the moon': 'JYuyWrkwpok',
  'stand by me': 'hwZNL7QVJjE',
  "twistin' the night away": 'zTArYTvpLZA',
  'twistin’ the night away': 'zTArYTvpLZA',
  'twistin the night away': 'zTArYTvpLZA',
  "(sittin' on) the dock of the bay": '7C-VscEQugk',
  'sittin on the dock of the bay': '7C-VscEQugk',
  'dock of the bay': '7C-VscEQugk',
  'bridge over troubled water': '4G-YQA_bsOU',
  unforgettable: '-XDAnPvTQFo',
  'what a wonderful world': 'rBrd_3VMC3c',
  'moon river': 'L_jgIezosVA',
  'in the mood': 'dVh3ZzVDZik',
  'mona lisa': 'G2vgJ0MGOlg',
  'amazing grace': 'ZJg5Op5W7yw',
  "ain't no mountain high enough": 'ABfQuZqq8wg',
  'aint no mountain high enough': 'ABfQuZqq8wg',
  crazy: '7PqtUULmZSE',
  'ring of fire': '5WyLhwYFgmk',
};

const YT_CACHE_KEY = 'magic_jukebox_yt_video_id_cache_v1';

function normalizeTrackTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\([^)]*\)/g, '')
    .trim();
}

function readCachedVideoIds(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(YT_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCachedVideoIds(map: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(YT_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Synchronously resolves a track's YouTube videoId from track metadata,
 * pre-verified classics dictionary, or localStorage cache.
 */
export function getResolvedYoutubeVideoId(
  track: Pick<BiographicalTrack, 'title' | 'artist' | 'youtubeVideoId'>
): string | null {
  if (track.youtubeVideoId && /^[a-zA-Z0-9_-]{11}$/.test(track.youtubeVideoId)) {
    return track.youtubeVideoId;
  }

  const normalizedTitle = normalizeTrackTitleKey(track.title);
  if (VERIFIED_YOUTUBE_VIDEO_IDS[normalizedTitle]) {
    return VERIFIED_YOUTUBE_VIDEO_IDS[normalizedTitle];
  }

  for (const [key, vid] of Object.entries(VERIFIED_YOUTUBE_VIDEO_IDS)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return vid;
    }
  }

  const cache = readCachedVideoIds();
  const cacheKey = `${track.title.toLowerCase().trim()}|${track.artist.toLowerCase().trim()}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  return null;
}

/**
 * Asynchronously resolves any missing YouTube videoIds for custom tracks via
 * the Netlify function `/.netlify/functions/youtube-playlist` and caches them.
 */
export async function hydrateYoutubeVideoIdsForTracks<
  T extends Pick<BiographicalTrack, 'id' | 'title' | 'artist' | 'youtubeVideoId'>
>(tracks: T[]): Promise<Record<string, string>> {
  const resultMap: Record<string, string> = {};
  const missing: Array<{ id: string; title: string; artist: string }> = [];

  for (const track of tracks) {
    const existing = getResolvedYoutubeVideoId(track);
    if (existing) {
      resultMap[track.id] = existing;
    } else {
      missing.push({ id: track.id, title: track.title, artist: track.artist });
    }
  }

  if (missing.length === 0 || typeof window === 'undefined') {
    return resultMap;
  }

  try {
    const res = await fetch('/.netlify/functions/youtube-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracks: missing }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && Array.isArray(data.tracks)) {
        const cache = readCachedVideoIds();
        for (const item of data.tracks) {
          if (item.id && item.videoId) {
            resultMap[item.id] = item.videoId;
            const cacheKey = `${String(item.title || '')
              .toLowerCase()
              .trim()}|${String(item.artist || '')
              .toLowerCase()
              .trim()}`;
            cache[cacheKey] = item.videoId;
          }
        }
        writeCachedVideoIds(cache);
      }
    }
  } catch {
    // Graceful fallback if offline or running static export locally without Netlify CLI
  }

  return resultMap;
}

/**
 * Builds a stateless 1-tap multi-song YouTube playlist URL (`watch_videos?video_ids=...`)
 * that automatically constructs an anonymous full-length playlist in exact Iso-Principle order
 * without requiring any user login.
 */
export function buildInstantYoutubePlaylistUrl(
  tracks: Array<Pick<BiographicalTrack, 'id' | 'title' | 'artist' | 'youtubeVideoId'>>,
  resolvedMap: Record<string, string> = {}
): string {
  const videoIds = tracks
    .map((t) => resolvedMap[t.id] || getResolvedYoutubeVideoId(t))
    .filter((id): id is string => Boolean(id));

  if (videoIds.length > 0) {
    return `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
  }

  // Fallback search if custom tracks haven't hydrated yet
  const first = tracks[0];
  if (first) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${first.artist} ${first.title} official audio`
    )}`;
  }
  return 'https://www.youtube.com';
}

/**
 * Builds an in-app continuous multi-track YouTube embed URL so the caregiver can play
 * full-length songs back-to-back right inside the Jukebox UI.
 */
export function buildEmbeddedContinuousPlayerUrl(
  tracks: Array<Pick<BiographicalTrack, 'id' | 'title' | 'artist' | 'youtubeVideoId'>>,
  activeTrackId?: string | null,
  resolvedMap: Record<string, string> = {},
  autoplay: boolean = true
): string | null {
  const orderedIds: string[] = [];
  let startIdx = 0;

  tracks.forEach((t) => {
    const vid = resolvedMap[t.id] || getResolvedYoutubeVideoId(t);
    if (vid) {
      if (activeTrackId && t.id === activeTrackId) {
        startIdx = orderedIds.length;
      }
      orderedIds.push(vid);
    }
  });

  if (orderedIds.length === 0) return null;

  const rotated = [...orderedIds.slice(startIdx), ...orderedIds.slice(0, startIdx)];
  const firstId = rotated[0];
  const restIds = rotated.slice(1);

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (restIds.length > 0) {
    params.set('playlist', restIds.join(','));
    params.set('loop', '1');
  }

  return `https://www.youtube-nocookie.com/embed/${firstId}?${params.toString()}`;
}

/**
 * Returns direct Apple Music / iTunes deep links for a track or sequenced playlist.
 */
export function getDirectAppleMusicLinks(track: SequencedTrack | BiographicalTrack): {
  webUrl: string;
  nativeAppUrl: string;
} {
  if (track.appleMusicUrl && track.appleMusicUrl.startsWith('http')) {
    const webUrl = track.appleMusicUrl.replace('itunes.apple.com', 'music.apple.com');
    const nativeAppUrl = webUrl.replace(/^https?:\/\//, 'music://');
    return { webUrl, nativeAppUrl };
  }
  const q = encodeURIComponent(`${track.artist} ${track.title}`);
  const webUrl = `https://music.apple.com/us/search?term=${q}`;
  return {
    webUrl,
    nativeAppUrl: `music://music.apple.com/us/search?term=${q}`,
  };
}
