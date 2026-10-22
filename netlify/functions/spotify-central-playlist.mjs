/**
 * Netlify Serverless Function: Central Magic Jukebox Spotify Playlist Builder
 *
 * Mints an unlisted (`public: false`), de-identified Spotify playlist on the central
 * Magic Jukebox service account so families and caregivers get a 1-tap Spotify playlist URL
 * and scannable QR code without logging in, downloading CSVs, or hitting Spotify's 25-user OAuth wall.
 *
 * Required Netlify Environment Variables:
 *   - SPOTIFY_CENTRAL_CLIENT_ID
 *   - SPOTIFY_CENTRAL_CLIENT_SECRET (optional if using PKCE refresh token, recommended for confidential refresh)
 *   - SPOTIFY_CENTRAL_REFRESH_TOKEN
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function computeShortPlaylistCode(tracks, birthYear) {
  const raw = `${birthYear || 1945}:${tracks.map((t) => `${t.title}-${t.artist}`).join('|')}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().slice(0, 5);
}

async function getCentralSpotifyAccessToken(clientId, clientSecret, refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (clientSecret) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers.Authorization = `Basic ${basic}`;
  } else {
    body.set('client_id', clientId);
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Spotify token refresh failed (${res.status}): ${errText.slice(0, 120)}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Spotify token response did not include an access_token.');
  }
  return data.access_token;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Method not allowed. Use POST.' }),
    };
  }

  const clientId = (
    process.env.SPOTIFY_CENTRAL_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ||
    ''
  ).trim();
  const clientSecret = (process.env.SPOTIFY_CENTRAL_CLIENT_SECRET || '').trim();
  const refreshToken = (process.env.SPOTIFY_CENTRAL_REFRESH_TOKEN || '').trim();

  if (!clientId || !refreshToken) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: false,
        configured: false,
        reason:
          'Central Magic Jukebox Spotify credentials (SPOTIFY_CENTRAL_CLIENT_ID and SPOTIFY_CENTRAL_REFRESH_TOKEN) are not yet set in Netlify Environment Variables.',
      }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const birthYear = Number(payload.birthYear) || 1944;
    const vibeLabel = String(payload.vibeLabel || 'Calm & Comforting Arc')
      .replace(/[^a-zA-Z0-9 &•→-]/g, '')
      .slice(0, 42);
    const tracks = Array.isArray(payload.tracks) ? payload.tracks.slice(0, 25) : [];

    if (tracks.length === 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: 'No tracks provided.' }),
      };
    }

    const accessToken = await getCentralSpotifyAccessToken(clientId, clientSecret, refreshToken);

    // 1. Resolve each sequenced song to a Spotify track URI in exact order
    const uris = [];
    for (const track of tracks) {
      const title = String(track.title || '').trim();
      const artist = String(track.artist || '').trim();
      if (!title) continue;

      const strictQuery = encodeURIComponent(`track:${title} artist:${artist}`);
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${strictQuery}&type=track&limit=1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const firstUri = searchData?.tracks?.items?.[0]?.uri;
        if (firstUri) {
          uris.push(firstUri);
          continue;
        }
      }

      // Broad fallback
      const broadRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          `${title} ${artist}`
        )}&type=track&limit=1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (broadRes.ok) {
        const broadData = await broadRes.json();
        const broadUri = broadData?.tracks?.items?.[0]?.uri;
        if (broadUri) uris.push(broadUri);
      }
    }

    // 2. Create a de-identified, link-accessible (public: true) playlist on the central account
    // Uses POST /v1/me/playlists per Spotify's Feb 2026 Web API spec (which deprecated /v1/users/{id}/playlists).
    // Note: Spotify requires `public: true` for `open.spotify.com/playlist/{id}` and QR codes to be openable
    // without returning 404 ("This content is no longer available"). API-created playlists are not pinned to
    // the creator's public profile by default, and titles are strictly de-identified (zero patient PHI).
    const bumpStart = birthYear + 10;
    const bumpEnd = birthYear + 30;
    const code = computeShortPlaylistCode(tracks, birthYear);
    const playlistName = `Magic Jukebox • ${bumpStart}–${bumpEnd} Era (${vibeLabel} #${code})`;
    const description = `Sequenced by The Magic Jukebox (Studio Wildwoods) • ${bumpStart}-${bumpEnd} Reminiscence Era (${vibeLabel}). For personal, non-commercial listening via your own Spotify account.`;

    const createRes = await fetch('https://api.spotify.com/v1/me/playlists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        description,
        public: true, // Required so the shared link & QR code resolve (200 OK) instead of 404
      }),
    });

    if (!createRes.ok) {
      const errDetail = await createRes.text().catch(() => '');
      throw new Error(
        `Could not create unlisted playlist on central Spotify account (${createRes.status}): ${errDetail.slice(0, 140)}`
      );
    }
    const createdPlaylist = await createRes.json();

    // 3. Add ordered tracks to the playlist (uses Feb 2026 /items endpoint with /tracks fallback)
    if (uris.length > 0) {
      const itemsRes = await fetch(
        `https://api.spotify.com/v1/playlists/${encodeURIComponent(createdPlaylist.id)}/items`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris }),
        }
      );

      if (!itemsRes.ok) {
        await fetch(
          `https://api.spotify.com/v1/playlists/${encodeURIComponent(createdPlaylist.id)}/tracks`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris }),
          }
        );
      }
    }

    const playlistUrl =
      createdPlaylist?.external_urls?.spotify ||
      `https://open.spotify.com/playlist/${createdPlaylist.id}`;
    const embedUrl = `https://open.spotify.com/embed/playlist/${createdPlaylist.id}?utm_source=generator`;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: true,
        configured: true,
        mode: 'central',
        playlistId: createdPlaylist.id,
        playlistUrl,
        embedUrl,
        matchedCount: uris.length,
        playlistName,
      }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: false,
        configured: true,
        error: err instanceof Error ? err.message : 'Unexpected Spotify error',
      }),
    };
  }
}
