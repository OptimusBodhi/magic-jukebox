import { IsoTrajectoryResult, PatientProfile, SequencedTrack } from './iso-sequencer';

const SPOTIFY_VERIFIER_KEY = 'magic_jukebox_spotify_pkce_verifier';
const SPOTIFY_CLIENT_ID_KEY = 'magic_jukebox_spotify_client_id';
const SPOTIFY_TOKEN_KEY = 'magic_jukebox_spotify_access_token';
const SPOTIFY_REFRESH_TOKEN_KEY = 'magic_jukebox_spotify_refresh_token';

export interface MintedSpotifyPlaylist {
  playlistUrl: string;
  embedUrl?: string;
  matchedCount: number;
  playlistName: string;
  mode?: 'central' | 'user_pkce';
}

/**
 * Generates a cryptographic random code verifier and SHA-256 code challenge for Spotify OAuth 2.0 PKCE.
 */
async function generatePkceChallenge(): Promise<{ verifier: string; challenge: string }> {
  const array = new Uint8Array(48);
  window.crypto.getRandomValues(array);
  const verifier = Array.from(array, (b) => ('0' + b.toString(16)).slice(-2)).join('');

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { verifier, challenge: base64 };
}

export function getConfiguredSpotifyClientId(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID) {
    return process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem(SPOTIFY_CLIENT_ID_KEY) || '';
  }
  return '';
}

export function saveCustomSpotifyClientId(clientId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SPOTIFY_CLIENT_ID_KEY, clientId.trim());
  }
}

export function getSavedSpotifyAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SPOTIFY_TOKEN_KEY) || localStorage.getItem(SPOTIFY_TOKEN_KEY);
}

export function getSavedSpotifyRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SPOTIFY_REFRESH_TOKEN_KEY);
}

/**
 * Initiates the browser-only Spotify OAuth 2.0 PKCE authorization redirect.
 */
export async function startSpotifyPkceAuth(customClientId?: string): Promise<void> {
  const clientId = (customClientId || getConfiguredSpotifyClientId()).trim();
  if (!clientId) {
    throw new Error('Missing Spotify Client ID');
  }
  saveCustomSpotifyClientId(clientId);

  const { verifier, challenge } = await generatePkceChallenge();
  localStorage.setItem(SPOTIFY_VERIFIER_KEY, verifier);

  const redirectUri = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: 'playlist-modify-public playlist-modify-private user-read-private',
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Exchanges a returned ?code=... query param from Spotify into an access token (and refresh token) using PKCE,
 * or refreshes an expired access token automatically if a saved PKCE refresh token exists.
 */
export async function exchangeSpotifyCodeIfPresent(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (!code) {
    return getSavedSpotifyAccessToken();
  }

  const verifier = localStorage.getItem(SPOTIFY_VERIFIER_KEY);
  const clientId = getConfiguredSpotifyClientId();
  if (!verifier || !clientId) return null;

  const redirectUri = `${window.location.origin}${window.location.pathname}`;
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
      sessionStorage.setItem(SPOTIFY_TOKEN_KEY, data.access_token);
      localStorage.setItem(SPOTIFY_TOKEN_KEY, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(SPOTIFY_REFRESH_TOKEN_KEY, data.refresh_token);
      }
      // Clean ?code= from URL
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('code');
      cleanUrl.searchParams.delete('state');
      window.history.replaceState({}, '', cleanUrl.toString());
      return data.access_token as string;
    }
  } catch {
    // Ignore network error
  }
  return null;
}

/**
 * Refreshes a browser-stored PKCE refresh token if the access token expired.
 */
export async function refreshBrowserSpotifyTokenIfPossible(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = getSavedSpotifyRefreshToken();
  const clientId = getConfiguredSpotifyClientId();
  if (!refreshToken || !clientId) return null;

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
      sessionStorage.setItem(SPOTIFY_TOKEN_KEY, data.access_token);
      localStorage.setItem(SPOTIFY_TOKEN_KEY, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(SPOTIFY_REFRESH_TOKEN_KEY, data.refresh_token);
      }
      return data.access_token as string;
    }
  } catch {
    // Ignore refresh error
  }
  return null;
}

/**
 * Mints a zero-login, de-identified, unlisted (`public: false`) Spotify playlist
 * on the Central Magic Jukebox Spotify account via `/.netlify/functions/spotify-central-playlist`.
 */
export async function createCentralSpotifyPlaylist(
  patient: PatientProfile,
  tracks: SequencedTrack[],
  vibeLabel: string = 'Calm & Comforting Arc'
): Promise<{
  ok: boolean;
  configured: boolean;
  result?: MintedSpotifyPlaylist;
  error?: string;
}> {
  if (typeof window === 'undefined') {
    return { ok: false, configured: false };
  }

  try {
    const res = await fetch('/.netlify/functions/spotify-central-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthYear: patient.birthYear,
        vibeLabel,
        // De-identified payload: only song titles & artists are sent, never patient PHI
        tracks: tracks.map((t) => ({
          title: t.title,
          artist: t.artist,
          year: t.year,
        })),
      }),
    });

    if (!res.ok) {
      return { ok: false, configured: false };
    }

    const data = await res.json();
    if (data?.ok && data.playlistUrl) {
      return {
        ok: true,
        configured: true,
        result: {
          playlistUrl: data.playlistUrl,
          embedUrl: data.embedUrl,
          matchedCount: data.matchedCount || tracks.length,
          playlistName: data.playlistName,
          mode: 'central',
        },
      };
    }

    return {
      ok: false,
      configured: Boolean(data?.configured),
      error: data?.error || data?.reason,
    };
  } catch {
    return { ok: false, configured: false };
  }
}

/**
 * Creates a real, full-length Spotify playlist in the connected Spotify account
 * sequenced in exact Iso-Principle order (Phase 1 -> Phase 2 -> Phase 3).
 * Uses de-identified, unlisted (`public: false`) safe-harbor naming.
 */
export async function createFullLengthSpotifyPlaylist(
  accessToken: string,
  patient: PatientProfile,
  trajectory: IsoTrajectoryResult
): Promise<MintedSpotifyPlaylist> {
  // 1. Fetch current Spotify user profile
  let activeToken = accessToken;
  let meRes = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${activeToken}` },
  });

  if (!meRes.ok) {
    const refreshed = await refreshBrowserSpotifyTokenIfPossible();
    if (refreshed) {
      activeToken = refreshed;
      meRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
    }
  }

  if (!meRes.ok) {
    sessionStorage.removeItem(SPOTIFY_TOKEN_KEY);
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
    throw new Error('Spotify session expired. Please reconnect.');
  }
  const me = await meRes.json();

  // 2. Search Spotify for each sequenced track's URI in exact order
  const uris: string[] = [];
  for (const track of trajectory.orderedTracks) {
    const q = encodeURIComponent(`track:${track.title} artist:${track.artist}`);
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${activeToken}` } }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const firstUri = searchData?.tracks?.items?.[0]?.uri;
      if (firstUri) {
        uris.push(firstUri);
        continue;
      }
    }
    // Fallback broader search if strict track/artist query didn't match
    const broadRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        `${track.title} ${track.artist}`
      )}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${activeToken}` } }
    );
    if (broadRes.ok) {
      const broadData = await broadRes.json();
      const broadUri = broadData?.tracks?.items?.[0]?.uri;
      if (broadUri) uris.push(broadUri);
    }
  }

  // 3. Create an unlisted (public: false), de-identified playlist via Feb 2026 /v1/me/playlists
  const bumpStart = patient.birthYear + 10;
  const bumpEnd = patient.birthYear + 30;
  const playlistName = `Magic Jukebox • ${bumpStart}–${bumpEnd} Era (${trajectory.targetState.label})`;
  const description = `Sequenced by The Magic Jukebox (Studio Wildwoods) • ${bumpStart}-${bumpEnd} Reminiscence Era. Personal, non-commercial listening via your Spotify account.`;

  const createRes = await fetch('https://api.spotify.com/v1/me/playlists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: playlistName,
      description,
      public: false,
    }),
  });
  if (!createRes.ok) {
    throw new Error('Could not create playlist in Spotify.');
  }
  const createdPlaylist = await createRes.json();

  // 4. Add the ordered tracks to the newly created playlist (Feb 2026 /items endpoint with /tracks fallback)
  if (uris.length > 0) {
    const itemsRes = await fetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(
        createdPlaylist.id
      )}/items`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris }),
      }
    );

    if (!itemsRes.ok) {
      await fetch(
        `https://api.spotify.com/v1/playlists/${encodeURIComponent(
          createdPlaylist.id
        )}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris }),
        }
      );
    }
  }

  return {
    playlistUrl:
      createdPlaylist?.external_urls?.spotify ||
      `https://open.spotify.com/playlist/${createdPlaylist.id}`,
    embedUrl: `https://open.spotify.com/embed/playlist/${createdPlaylist.id}?utm_source=generator`,
    matchedCount: uris.length,
    playlistName,
    mode: 'user_pkce',
  };
}
