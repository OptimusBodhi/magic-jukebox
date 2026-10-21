import { IsoTrajectoryResult, PatientProfile } from './iso-sequencer';

const SPOTIFY_VERIFIER_KEY = 'magic_jukebox_spotify_pkce_verifier';
const SPOTIFY_CLIENT_ID_KEY = 'magic_jukebox_spotify_client_id';
const SPOTIFY_TOKEN_KEY = 'magic_jukebox_spotify_access_token';

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
  return sessionStorage.getItem(SPOTIFY_TOKEN_KEY);
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
 * Exchanges a returned ?code=... query param from Spotify into an access token using PKCE.
 */
export async function exchangeSpotifyCodeIfPresent(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return getSavedSpotifyAccessToken();

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
 * Creates a real, full-length Spotify playlist in the user's Spotify account
 * sequenced in exact Iso-Principle order (Phase 1 -> Phase 2 -> Phase 3).
 */
export async function createFullLengthSpotifyPlaylist(
  accessToken: string,
  patient: PatientProfile,
  trajectory: IsoTrajectoryResult
): Promise<{ playlistUrl: string; matchedCount: number; playlistName: string }> {
  // 1. Fetch current Spotify user profile
  const meRes = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!meRes.ok) {
    sessionStorage.removeItem(SPOTIFY_TOKEN_KEY);
    throw new Error('Spotify session expired. Please reconnect.');
  }
  const me = await meRes.json();

  // 2. Search Spotify for each sequenced track's URI in exact order
  const uris: string[] = [];
  for (const track of trajectory.orderedTracks) {
    const q = encodeURIComponent(`track:${track.title} artist:${track.artist}`);
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
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
    // Fallback broader search if strict track/artist query didn't match
    const broadRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        `${track.title} ${track.artist}`
      )}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (broadRes.ok) {
      const broadData = await broadRes.json();
      const broadUri = broadData?.tracks?.items?.[0]?.uri;
      if (broadUri) uris.push(broadUri);
    }
  }

  // 3. Create the playlist in the user's Spotify account
  const playlistName = `${patient.preferredName}’s Magic Jukebox (${trajectory.currentState.label} → ${trajectory.targetState.label})`;
  const description = `Generated by The Magic Jukebox • Ages 10-30 Reminiscence Bump (${
    patient.birthYear + 10
  }-${patient.birthYear + 30}) • Sequenced from ${trajectory.currentState.label} to ${
    trajectory.targetState.label
  }.`;

  const createRes = await fetch(
    `https://api.spotify.com/v1/users/${encodeURIComponent(me.id)}/playlists`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        description,
        public: false,
      }),
    }
  );
  if (!createRes.ok) {
    throw new Error('Could not create playlist in Spotify.');
  }
  const createdPlaylist = await createRes.json();

  // 4. Add the ordered tracks to the newly created playlist
  if (uris.length > 0) {
    await fetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(
        createdPlaylist.id
      )}/tracks`,
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

  return {
    playlistUrl:
      createdPlaylist?.external_urls?.spotify ||
      `https://open.spotify.com/playlist/${createdPlaylist.id}`,
    matchedCount: uris.length,
    playlistName,
  };
}
