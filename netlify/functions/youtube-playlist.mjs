/**
 * Netlify Serverless Function: Instant Multi-Song Full-Length Playlist Resolver
 *
 * Resolves a list of sequenced songs ({ title, artist }) into official YouTube videoIds
 * so the app can:
 *   1. Generate a 1-tap stateless multi-song playlist link & QR code:
 *      https://www.youtube.com/watch_videos?video_ids=ID1,ID2,ID3...
 *   2. Stream full-length songs continuously inside the embedded Jukebox player
 *      with zero login and zero 30-second cutoff.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

async function searchYoutubeVideoId(title, artist) {
  const query = encodeURIComponent(`${artist} ${title} official audio`);
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${query}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Cookie: 'CONSENT=YES+cb.20210328-17-p0.en+FX+417',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const tracks = Array.isArray(body.tracks) ? body.tracks.slice(0, 20) : [];

    const resolved = await Promise.all(
      tracks.map(async (t) => {
        if (t.videoId && /^[a-zA-Z0-9_-]{11}$/.test(t.videoId)) {
          return { id: t.id, title: t.title, artist: t.artist, videoId: t.videoId };
        }
        const foundId = await searchYoutubeVideoId(t.title || '', t.artist || '');
        return { id: t.id, title: t.title, artist: t.artist, videoId: foundId };
      })
    );

    const videoIds = resolved.map((r) => r.videoId).filter(Boolean);
    const playlistUrl =
      videoIds.length > 0
        ? `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`
        : null;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: true,
        tracks: resolved,
        videoIds,
        playlistUrl,
      }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : 'Could not resolve playlist video IDs',
      }),
    };
  }
}
