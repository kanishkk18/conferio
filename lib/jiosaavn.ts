

const BASE_URL = process.env.JIOSAAVN_API_URL || "https://conferiosyncbackend.vercel.app";

export async function jioSaavnFetch(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }
  
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  
  if (!response.ok) {
    throw new Error(`JioSaavn API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getModules(lang = "hindi,english") {
  return jioSaavnFetch("/modules", { lang, mini: "true" });
}

export async function getTrending(type: string, lang = "hindi,english") {
  return jioSaavnFetch("/get/trending", { type, lang, mini: "true" });
}

export async function getCollection(path: string, lang = "hindi,english", page = "1", n = "20") {
  return jioSaavnFetch(`/get/${path}`, { lang, page, n, mini: "true" });
}

export async function searchAll(query: string) {
  return jioSaavnFetch("/search", { q: query });
}

export async function searchByEntity(path: string, query: string, page = "1", n = "20") {
  return jioSaavnFetch(`/search/${path}`, { q: query, page, n });
}

export async function searchPodcasts(query: string, page = "1", n = "20") {
  return jioSaavnFetch("/search/podcasts", { q: query, page, n });
}

export async function getSongDetails(id?: string, link?: string, token?: string) {
  const params: Record<string, string> = {};
  if (id) params.id = id;
  if (link) params.link = link;
  if (token) params.token = token;
  return jioSaavnFetch("/song", params);
}

export async function getSongRecommendations(id: string, lang = "hindi,english") {
  return jioSaavnFetch("/song/recommend", { id, lang, mini: "true" });
}

export async function getAlbumDetails(id?: string, link?: string, token?: string) {
  const params: Record<string, string> = {};
  if (id) params.id = id;
  if (link) params.link = link;
  if (token) params.token = token;
  return jioSaavnFetch("/album", params);
}

export async function getAlbumRecommendations(id: string, lang = "hindi,english") {
  return jioSaavnFetch("/album/recommend", { id, lang, mini: "true" });
}

export async function getAlbumsSameYear(year: string, lang = "hindi,english") {
  return jioSaavnFetch("/album/same-year", { year, lang, mini: "true" });
}

export async function getPlaylistDetails(id?: string, link?: string, token?: string) {
  const params: Record<string, string> = {};
  if (id) params.id = id;
  if (link) params.link = link;
  if (token) params.token = token;
  return jioSaavnFetch("/playlist", params);
}

export async function getPlaylistRecommendations(id: string, lang = "hindi,english") {
  return jioSaavnFetch("/playlist/recommend", { id, lang, mini: "true" });
}

export async function getArtistDetails(id?: string, link?: string, token?: string) {
  const params: Record<string, string> = {};
  if (id) params.id = id;
  if (link) params.link = link;
  if (token) params.token = token;
  return jioSaavnFetch("/artist", params);
}

export async function getArtistSongs(id: string, page = "1") {
  return jioSaavnFetch("/artist/songs", { id, page, mini: "true" });
}

export async function getArtistAlbums(id: string, page = "1") {
  return jioSaavnFetch("/artist/albums", { id, page, mini: "true" });
}

export async function getArtistTopSongs(artistId: string, songId: string) {
  return jioSaavnFetch("/artist/top-songs", { artist_id: artistId, song_id: songId });
}

export async function getShowDetails(token?: string, link?: string) {
  const params: Record<string, string> = {};
  if (token) params.token = token;
  if (link) params.link = link;
  return jioSaavnFetch("/show", params);
}

export async function getShowEpisodes(id: string) {
  return jioSaavnFetch("/show/episodes", { id });
}

export async function getEpisodeDetails(token?: string, link?: string) {
  const params: Record<string, string> = {};
  if (token) params.token = token;
  if (link) params.link = link;
  return jioSaavnFetch("/show/episode", params);
}

export async function getLyrics(id: string) {
  return jioSaavnFetch("/get/lyrics", { id });
}

export async function getSyncedLyrics(id: string) {
  return jioSaavnFetch("/get/synced-lyrics", { id });
}

export async function createRadio(path: string, params: Record<string, string>) {
  return jioSaavnFetch(`/radio/${path}`, params);
}

export async function getRadioSongs(id: string, n = "10") {
  return jioSaavnFetch("/radio/songs", { id, n, mini: "true" });
}

export async function getMixDetails(token?: string, link?: string) {
  const params: Record<string, string> = {};
  if (token) params.token = token;
  if (link) params.link = link;
  return jioSaavnFetch("/get/mix", params);
}

export async function getLabelDetails(token?: string, link?: string) {
  const params: Record<string, string> = {};
  if (token) params.token = token;
  if (link) params.link = link;
  return jioSaavnFetch("/get/label", params);
}

export async function getMegaMenu() {
  return jioSaavnFetch("/get/mega-menu");
}

export async function getFooterDetails(lang = "hindi,english") {
  return jioSaavnFetch("/get/footer-details", { lang });
}

