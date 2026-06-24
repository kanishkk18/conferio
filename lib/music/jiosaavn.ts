// /**
//  * JioSaavn API wrapper - adapted for Next.js Pages Router.
//  * Base URL points to the same unofficial JioSaavn wrapper used by infinitunes.
//  * Set JIOSAAVN_API_URL in your env (e.g. https://conferiosyncbackend.vercel.app)
//  */

// const JIOSAAVN_API_URL =
//   process.env.JIOSAAVN_API_URL ?? "https://conferiosyncbackend.vercel.app";

// export type Lang =
//   | "hindi"
//   | "english"
//   | "punjabi"
//   | "tamil"
//   | "telugu"
//   | "marathi"
//   | "gujarati"
//   | "bengali"
//   | "kannada"
//   | "bhojpuri"
//   | "malayalam"
//   | "urdu"
//   | "haryanvi"
//   | "rajasthani"
//   | "odia"
//   | "assamese";

// export type Category = "latest" | "alphabetical" | "popularity";
// export type Sort = "asc" | "desc";
// export type StreamQuality = "low" | "medium" | "high" | "excellent";

// export type Quality = { quality: string; url: string }[];

// export type ArtistMini = {
//   id: string;
//   name: string;
//   role?: string;
//   image?: Quality;
//   type?: string;
//   url?: string;
// };

// export type ArtistMap = {
//   primary_artists: ArtistMini[];
//   featured_artists: ArtistMini[];
//   artists: ArtistMini[];
// };

// export type Song = {
//   id: string;
//   name: string;
//   subtitle: string;
//   type: "song";
//   image: Quality;
//   language: string;
//   year?: number;
//   play_count?: number;
//   explicit?: boolean;
//   album?: string;
//   album_id?: string;
//   album_url?: string;
//   download_url: Quality;
//   duration: number;
//   has_lyrics?: boolean;
//   lyrics_id?: string;
//   artist_map?: ArtistMap;
//   release_date?: string;
// };

// export type Album = {
//   id: string;
//   name: string;
//   subtitle?: string;
//   type: "album";
//   image: Quality;
//   songs?: Song[];
//   songCount?: number;
//   artist_map?: ArtistMap;
//   language?: string;
//   year?: number;
// };

// export type Playlist = {
//   id: string;
//   name: string;
//   subtitle?: string;
//   type: "playlist";
//   image: Quality;
//   songs?: Song[];
//   songCount?: number;
// };

// export type Artist = {
//   id: string;
//   name: string;
//   type: "artist";
//   image: Quality;
//   topSongs?: Song[];
//   topAlbums?: Album[];
//   bio?: unknown;
// };

// export type Show = {
//   id: string;
//   title: string;
//   type: "show";
//   image: Quality;
//   episodes?: unknown[];
// };

// export type AllSearch = {
//   albums?: { results: Album[] };
//   songs?: { results: Song[] };
//   artists?: { results: Artist[] };
//   playlists?: { results: Playlist[] };
//   shows?: { results: Show[] };
//   topQuery?: { results: unknown[] };
// };

// export type SearchResults<T> = { total: number; start: number; results: T[] };

// export type CustomResponse<T> = {
//   status: string;
//   message: string;
//   data: T | null;
// };

// async function jioSaavnGetCall<T>(
//   path: string,
//   query?: Record<string, string | undefined>,
//   lang: Lang | Lang[] = ["hindi", "english"],
// ): Promise<T> {
//   const langStr = Array.isArray(lang) ? lang.join(",") : lang;

//   const params = new URLSearchParams();
//   Object.entries(query ?? {}).forEach(([k, v]) => {
//     if (v !== undefined && v !== "") params.set(k, v);
//   });
//   if (!params.has("lang")) params.set("lang", langStr);

//   const url = `${JIOSAAVN_API_URL}${path}?${params.toString()}`;

//   const res = await fetch(url, {
//     // cache for an hour on the server, JioSaavn data is fairly static
//     next: { revalidate: 3600 },
//   });

//   const json = (await res.json()) as CustomResponse<T>;

//   if (!res.ok || json.status !== "Success") {
//     throw new Error(json.message ?? `JioSaavn API error: ${res.status}`);
//   }

//   return json.data as T;
// }

// /* ---------------------------------------------------------------------- */
// /* Home / Modules                                                          */
// /* ---------------------------------------------------------------------- */

// export async function getHomeData(lang?: Lang[], mini = true) {
//   return jioSaavnGetCall<Record<string, unknown>>("/modules", {
//     mini: `${mini}`,
//   }, lang);
// }

// /* ---------------------------------------------------------------------- */
// /* Song                                                                    */
// /* ---------------------------------------------------------------------- */

// export async function getSongById(id: string | string[], mini = false) {
//   const ids = Array.isArray(id) ? id.join(",") : id;
//   return jioSaavnGetCall<{ songs: Song[] }>("/song", { id: ids, mini: `${mini}` });
// }

// export async function getSongByLink(link: string, mini = false) {
//   return jioSaavnGetCall<{ songs: Song[] }>("/song", { link, mini: `${mini}` });
// }

// export async function getSongRecommendations(id: string, lang?: Lang[], mini = true) {
//   return jioSaavnGetCall<Song[]>("/song/recommend", { id, mini: `${mini}` }, lang);
// }

// /* ---------------------------------------------------------------------- */
// /* Album                                                                   */
// /* ---------------------------------------------------------------------- */

// export async function getAlbumById(id: string, mini = true) {
//   return jioSaavnGetCall<Album>("/album", { id, mini: `${mini}` });
// }

// export async function getAlbumByLink(link: string, mini = true) {
//   return jioSaavnGetCall<Album>("/album", { link, mini: `${mini}` });
// }

// export async function getAlbumRecommendations(id: string, lang?: Lang[], mini = true) {
//   return jioSaavnGetCall<Album[]>("/album/recommend", { id, mini: `${mini}` }, lang);
// }

// export async function getAlbumsBySameYear(year: number, lang?: Lang[], mini = true) {
//   return jioSaavnGetCall<Album[]>("/album/same-year", { year: `${year}`, mini: `${mini}` }, lang);
// }

// /* ---------------------------------------------------------------------- */
// /* Playlist                                                                */
// /* ---------------------------------------------------------------------- */

// export async function getPlaylistById(id: string, mini = true) {
//   return jioSaavnGetCall<Playlist>("/playlist", { id, mini: `${mini}` });
// }

// export async function getPlaylistByLink(link: string, mini = true) {
//   return jioSaavnGetCall<Playlist>("/playlist", { link, mini: `${mini}` });
// }

// export async function getPlaylistRecommendations(id: string, lang?: Lang[], mini = true) {
//   return jioSaavnGetCall<Playlist[]>("/playlist/recommend", { id, mini: `${mini}` }, lang);
// }

// /* ---------------------------------------------------------------------- */
// /* Artist                                                                  */
// /* ---------------------------------------------------------------------- */

// export async function getArtistById(id: string, page = 1, nSong = 50, nAlbum = 50, mini = true) {
//   return jioSaavnGetCall<Artist>("/artist", {
//     id,
//     page: `${page}`,
//     n_song: `${nSong}`,
//     n_album: `${nAlbum}`,
//     mini: `${mini}`,
//   });
// }

// export async function getArtistSongs(
//   id: string,
//   page = 0,
//   cat: Category = "popularity",
//   sort: Sort = "asc",
//   mini = true,
// ) {
//   return jioSaavnGetCall<{ topSongs: Song[]; total: number }>("/artist/songs", {
//     id,
//     page: `${page}`,
//     cat,
//     sort,
//     mini: `${mini}`,
//   });
// }

// export async function getArtistAlbums(
//   id: string,
//   page = 0,
//   cat: Category = "popularity",
//   sort: Sort = "asc",
//   mini = true,
// ) {
//   return jioSaavnGetCall<{ topAlbums: Album[]; total: number }>("/artist/albums", {
//     id,
//     page: `${page}`,
//     cat,
//     sort,
//     mini: `${mini}`,
//   });
// }

// export async function getArtistTopSongs(
//   artistId: string,
//   songId: string,
//   lang: Lang | Lang[] = ["hindi", "english"],
//   page = 1,
//   cat: Category = "latest",
//   sort: Sort = "asc",
//   mini = true,
// ) {
//   return jioSaavnGetCall<Song[]>("/artist/top-songs", {
//     artist_id: artistId,
//     song_id: songId,
//     page: `${page}`,
//     cat,
//     sort,
//     mini: `${mini}`,
//   }, lang);
// }

// /* ---------------------------------------------------------------------- */
// /* Search                                                                  */
// /* ---------------------------------------------------------------------- */

// export async function searchAll(query: string) {
//   return jioSaavnGetCall<AllSearch>("/search", { q: query });
// }

// export async function getTopSearches() {
//   return jioSaavnGetCall<{ id: string; title: string; type: string; image: Quality }[]>(
//     "/search/top",
//   );
// }

// export async function searchByType(
//   type: "songs" | "albums" | "playlists" | "artists",
//   query: string,
//   page = 1,
//   n = 20,
// ) {
//   return jioSaavnGetCall<SearchResults<Song | Album | Playlist | Artist>>(`/search/${type}`, {
//     q: query,
//     page: `${page}`,
//     n: `${n}`,
//   });
// }

// export async function searchPodcasts(query: string, page = 1, n = 20) {
//   return jioSaavnGetCall<SearchResults<Show>>("/search/podcasts", {
//     q: query,
//     page: `${page}`,
//     n: `${n}`,
//   });
// }

// /* ---------------------------------------------------------------------- */
// /* Show / Podcast                                                          */
// /* ---------------------------------------------------------------------- */

// export async function getShowByToken(token: string, season = 1, sort: Sort = "desc") {
//   return jioSaavnGetCall<Show>("/show", { token, season: `${season}`, sort });
// }

// export async function getShowEpisodes(id: string, season = 1, page = 1, sort: Sort = "desc") {
//   return jioSaavnGetCall<unknown[]>("/show/episodes", {
//     id,
//     season: `${season}`,
//     page: `${page}`,
//     sort,
//   });
// }

// export async function getEpisodeByToken(token: string, season = 1, sort: Sort = "desc") {
//   return jioSaavnGetCall<unknown>("/show/episode", { token, season: `${season}`, sort });
// }

// /* ---------------------------------------------------------------------- */
// /* Get / Collections                                                       */
// /* ---------------------------------------------------------------------- */


// export async function getTrending(
//   type: "song" | "album" | "playlist",
//   lang?: Lang[],
//   mini = true,
// ) {
//   // API returns a flat array of items for the requested type
//   return jioSaavnGetCall<Song[] | Album[] | Playlist[]>(
//     "/get/trending",
//     { type, mini: `${mini}` },
//     lang,
//   );
// }

// export async function getCollection(
//   path: "featured-playlists" | "charts" | "top-shows" | "top-artists" | "top-albums" | "featured-stations",
//   page = 1,
//   n = 50,
//   lang?: Lang[],
//   mini = true,
// ) {
//   return jioSaavnGetCall<unknown>(`/get/${path}`, {
//     page: `${page}`,
//     n: `${n}`,
//     mini: `${mini}`,
//   }, lang);
// }

// export async function getTopAlbums(page = 1, n = 50, lang?: Lang[], mini = true) {
//   return getCollection("top-albums", page, n, lang, mini) as Promise<{ results: Album[]; total: number }>;
// }

// export async function getCharts(page = 1, n = 50, lang?: Lang[], mini = true) {
//   return getCollection("charts", page, n, lang, mini) as Promise<{ results: Playlist[]; total: number }>;
// }

// export async function getFeaturedPlaylists(page = 1, n = 50, lang?: Lang[], mini = true) {
//   return getCollection("featured-playlists", page, n, lang, mini) as Promise<{ results: Playlist[]; total: number }>;
// }

// export async function getTopArtists(page = 1, n = 50, lang?: Lang[], mini = true) {
//   return getCollection("top-artists", page, n, lang, mini) as Promise<{ results: Artist[]; total: number }>;
// }

// export async function getTopShows(page = 1, n = 50, lang?: Lang[], mini = true) {
//   return getCollection("top-shows", page, n, lang, mini) as Promise<{ results: Show[]; total: number }>;
// }

// export async function getFeaturedRadioStations(page = 1, n = 50, lang?: Lang[], mini = true) {
//   return getCollection("featured-stations", page, n, lang, mini) as Promise<{ results: unknown[]; total: number }>;
// }

// export async function getLyrics(id: string) {
//   return jioSaavnGetCall<{ lyrics: string; snippet: string; copyright: string }>("/get/lyrics", { id });
// }

// export async function getSyncedLyrics(opts: {
//   id?: string;
//   track?: string;
//   artist?: string;
//   duration?: string;
// }) {
//   return jioSaavnGetCall<unknown>("/get/synced-lyrics", { ...opts });
// }

// export async function getMixDetails(token: string, page = 1, n = 20, lang?: Lang[], mini = true) {
//   return jioSaavnGetCall<Playlist>("/get/mix", { token, page: `${page}`, n: `${n}`, mini: `${mini}` }, lang);
// }

// /* ---------------------------------------------------------------------- */
// /* Radio                                                                   */
// /* ---------------------------------------------------------------------- */

// export async function createRadioStation(
//   type: "featured" | "artist" | "entity",
//   params: {
//     name?: string;
//     artist_id?: string;
//     song_id?: string;
//     id?: string;
//     entityType?: string;
//     q?: string;
//   },
//   lang?: Lang[],
// ) {
//   return jioSaavnGetCall<{ stationid: string }>(`/radio/${type}`, { ...params }, lang);
// }

// export async function getRadioSongs(stationId: string, n = 10, mini = true) {
//   return jioSaavnGetCall<Song[]>("/radio/songs", { id: stationId, n: `${n}`, mini: `${mini}` });
// }

// /* ---------------------------------------------------------------------- */
// /* Helpers                                                                 */
// /* ---------------------------------------------------------------------- */

// // export function getDownloadLink(downloadUrl: Quality | undefined, quality: StreamQuality = "excellent") {
// //   if (!downloadUrl?.length) return "";

// //   const qualityMap: Record<StreamQuality, string> = {
// //     low: "12kbps",
// //     medium: "48kbps",
// //     high: "160kbps",
// //     excellent: "320kbps",
// //   };

// //   const target = qualityMap[quality];
// //   const found = downloadUrl.find((d) => d.quality === target);
// //   return (found ?? downloadUrl[downloadUrl.length - 1])?.url ?? "";
// // }

// export function formatDuration(seconds: number, format: "hh:mm:ss" | "mm:ss" = "mm:ss") {
//   const date = new Date((seconds || 0) * 1000);
//   return format === "hh:mm:ss" ? date.toISOString().slice(11, 19) : date.toISOString().slice(14, 19);
// }


// export function getDownloadLink(
//   downloadUrl: Array<{ quality: string; link?: string; url?: string }> | undefined,
//   quality: string = "high"
// ): string | null {
//   if (!downloadUrl || !Array.isArray(downloadUrl)) return null;

//   const map: Record<string, string> = {
//     low: "12kbps",
//     medium: "96kbps",
//     high: "160kbps",
//     max: "320kbps",
//   };

//   const target = map[quality] || "160kbps";
//   const match = downloadUrl.find((d) => d.quality === target);

//   // v0.1.0 uses 'link', v1.0.0 uses 'url' — handle both
//   return match?.link || match?.url || downloadUrl[downloadUrl.length - 1]?.link || downloadUrl[downloadUrl.length - 1]?.url || null;
// }

// export function getImageSrc(
//   image: Array<{ quality: string; link?: string; url?: string }> | undefined,
//   size: "low" | "medium" | "high" = "medium"
// ): string {
//   if (!image || !Array.isArray(image)) return "/images/placeholder.jpg";

//   const sizeMap: Record<string, string> = {
//     low: "50x50",
//     medium: "150x150",
//     high: "500x500",
//   };

//   const target = sizeMap[size] || "150x150";
//   const match = image.find((i) => i.quality === target);

//   // v0.1.0 uses 'link', v1.0.0 uses 'url' — handle both
//   return match?.link || match?.url || image[0]?.link || image[0]?.url || "/images/placeholder.jpg";
// }


/**
 * JioSaavn API wrapper - adapted for Next.js Pages Router.
 * Base URL points to v0.1.0 backend API.
 * Set JIOSAAVN_API_URL in your env (e.g. https://conferiosyncbackend.vercel.app)
 */

const JIOSAAVN_API_URL =
  process.env.JIOSAAVN_API_URL ?? "https://conferiosyncbackend.vercel.app";
  const V1_API_URL = "https://conferiosync.vercel.app/api"; // better search
const V0_API_URL = "https://conferiosyncbackend.vercel.app";


// Convert v1.0.0 song shape to v0.1.0 shape
function normalizeV1Song(song: any): Song {
  return {
    id: song.id,
    name: song.name ?? song.title,           // v1 uses "title" sometimes
    subtitle: song.subtitle,
    type: song.type ?? "song",
    image: Array.isArray(song.image)
      ? song.image.map((img: any) => ({
          quality: img.quality,
          link: img.url ?? img.link,         // v1 uses "url", v0 uses "link"
          url: img.url ?? img.link,
        }))
      : [],
    language: song.language,
    year: song.year,
    play_count: song.playCount,
    explicit: song.explicitContent,
    album: song.album?.name,
    album_id: song.album?.id,
    album_url: song.album?.url,
    download_url: Array.isArray(song.downloadUrl)
      ? song.downloadUrl.map((d: any) => ({
          quality: d.quality,
          link: d.url ?? d.link,             // v1 uses "url", v0 uses "link"
          url: d.url ?? d.link,
        }))
      : [],
    duration: song.duration,
    has_lyrics: song.hasLyrics,
    lyrics_id: song.lyricsId,
    artist_map: song.artists
      ? {
          primary_artists: song.artists.primary?.map(normalizeV1Artist) ?? [],
          featured_artists: song.artists.featured?.map(normalizeV1Artist) ?? [],
          artists: song.artists.all?.map(normalizeV1Artist) ?? [],
        }
      : undefined,
    release_date: song.releaseDate,
  };
}

function normalizeV1Artist(artist: any): ArtistMini {
  return {
    id: artist.id,
    name: artist.name,
    role: artist.role,
    image: Array.isArray(artist.image)
      ? artist.image.map((img: any) => ({
          quality: img.quality,
          link: img.url ?? img.link,
          url: img.url ?? img.link,
        }))
      : [],
    type: artist.type,
    url: artist.url,
  };
}

function normalizeV1Album(album: any): Album {
  return {
    id: album.id,
    name: album.name ?? album.title,
    subtitle: album.subtitle,
    type: "album",
    image: Array.isArray(album.image)
      ? album.image.map((img: any) => ({
          quality: img.quality,
          link: img.url ?? img.link,
          url: img.url ?? img.link,
        }))
      : [],
    songCount: album.songCount,
    language: album.language,
    year: album.year ? Number(album.year) : undefined,
  };
}

function normalizeV1Playlist(pl: any): Playlist {
  return {
    id: pl.id,
    name: pl.name ?? pl.title,
    subtitle: pl.subtitle,
    type: "playlist",
    image: Array.isArray(pl.image)
      ? pl.image.map((img: any) => ({
          quality: img.quality,
          link: img.url ?? img.link,
          url: img.url ?? img.link,
        }))
      : [],
    songCount: pl.songCount,
  };
}

function normalizeV1ArtistFull(artist: any): Artist {
  return {
    id: artist.id,
    name: artist.name ?? artist.title,
    type: "artist",
    image: Array.isArray(artist.image)
      ? artist.image.map((img: any) => ({
          quality: img.quality,
          link: img.url ?? img.link,
          url: img.url ?? img.link,
        }))
      : artist.image ?? [],
  };
}

export async function searchAllV1(query: string) {
  const res = await fetch(`${V1_API_URL}/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  const json = await res.json();
  const d = json.data;

  return {
    songs: { position: d.songs?.position ?? 1, data: (d.songs?.results ?? []).map(normalizeV1Song) },
    albums: { position: d.albums?.position ?? 2, data: (d.albums?.results ?? []).map(normalizeV1Album) },
    artists: { position: d.artists?.position ?? 3, data: (d.artists?.results ?? []).map(normalizeV1ArtistFull) },
    playlists: { position: d.playlists?.position ?? 4, data: (d.playlists?.results ?? []).map(normalizeV1Playlist) },
    shows: { position: d.shows?.position ?? 5, data: [] },
    episodes: { position: d.episodes?.position ?? 6, data: [] },
    topQuery: { position: d.topQuery?.position ?? 0, data: (d.topQuery?.results ?? []).map(normalizeV1Song) },
  };
}

export type Lang =
  | "hindi"
  | "english"
  | "punjabi"
  | "tamil"
  | "telugu"
  | "marathi"
  | "gujarati"
  | "bengali"
  | "kannada"
  | "bhojpuri"
  | "malayalam"
  | "urdu"
  | "haryanvi"
  | "rajasthani"
  | "odia"
  | "assamese";

export type Category = "latest" | "alphabetical" | "popularity";
export type Sort = "asc" | "desc";
export type StreamQuality = "low" | "medium" | "high" | "excellent";

// v0.1.0 API returns { quality, link } — not { quality, url }
export type QualityItem = { quality: string; link: string; url?: string };
export type Quality = QualityItem[];

export type ArtistMini = {
  id: string;
  name: string;
  role?: string;
  image?: Quality | string; // v0.1.0 sometimes returns string for artists
  type?: string;
  url?: string;
};

export type ArtistMap = {
  primary_artists: ArtistMini[];
  featured_artists: ArtistMini[];
  artists: ArtistMini[];
};

export type Song = {
  id: string;
  name: string;
  subtitle: string;
  type: "song";
  image: Quality;
  language: string;
  year?: number;
  play_count?: number;
  explicit?: boolean;
  album?: string;
  album_id?: string;
  album_url?: string;
  download_url: Quality;
  duration: number;
  has_lyrics?: boolean;
  lyrics_id?: string;
  artist_map?: ArtistMap;
  release_date?: string;
};

export type Album = {
  id: string;
  name: string;
  subtitle?: string;
  type: "album";
  image: Quality;
  songs?: Song[];
  songCount?: number;
  artist_map?: ArtistMap;
  language?: string;
  year?: number;
};

export type Playlist = {
  id: string;
  name: string;
  subtitle?: string;
  type: "playlist";
  image: Quality;
  songs?: Song[];
  songCount?: number;
};

export type Artist = {
  id: string;
  name: string;
  type: "artist";
  image: Quality | string;
  topSongs?: Song[];
  topAlbums?: Album[];
  bio?: unknown;
};

export type Show = {
  id: string;
  title: string;
  type: "show";
  image: Quality;
  episodes?: unknown[];
};

// v0.1.0 search returns { position, data: [...] } not { results: [...] }
export type SearchCategory<T> = { position: number; data: T[] };

export type AllSearch = {
  albums?: SearchCategory<Album>;
  songs?: SearchCategory<Song>;
  artists?: SearchCategory<Artist>;
  playlists?: SearchCategory<Playlist>;
  shows?: SearchCategory<Show>;
  episodes?: SearchCategory<unknown>;
  topQuery?: SearchCategory<unknown>;
};

export type SearchResults<T> = { total: number; start: number; data: T[] };

export type CustomResponse<T> = {
  status: string;
  message: string;
  data: T | null;
};

async function jioSaavnGetCall<T>(
  path: string,
  query?: Record<string, string | undefined>,
  lang: Lang | Lang[] = ["hindi", "english"],
): Promise<T> {
  const langStr = Array.isArray(lang) ? lang.join(",") : lang;

  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, v);
  });
  if (!params.has("lang")) params.set("lang", langStr);

  const url = `${JIOSAAVN_API_URL}${path}?${params.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  const json = (await res.json()) as CustomResponse<T>;

  if (!res.ok || json.status !== "Success") {
    throw new Error(json.message ?? `JioSaavn API error: ${res.status}`);
  }

  return json.data as T;
}

/* ---------------------------------------------------------------------- */
/* Home / Modules                                                          */
/* ---------------------------------------------------------------------- */

export async function getHomeData(lang?: Lang[], mini = true) {
  return jioSaavnGetCall<Record<string, unknown>>("/modules", {
    mini: `${mini}`,
  }, lang);
}

/* ---------------------------------------------------------------------- */
/* Song                                                                    */
/* ---------------------------------------------------------------------- */

export async function getSongById(id: string | string[], mini = false) {
  const ids = Array.isArray(id) ? id.join(",") : id;
  return jioSaavnGetCall<{ songs: Song[] }>("/song", { id: ids, mini: `${mini}` });
}

export async function getSongByLink(link: string, mini = false) {
  return jioSaavnGetCall<{ songs: Song[] }>("/song", { link, mini: `${mini}` });
}

export async function getSongRecommendations(id: string, lang?: Lang[], mini = true) {
  return jioSaavnGetCall<Song[]>("/song/recommend", { id, mini: `${mini}` }, lang);
}

/* ---------------------------------------------------------------------- */
/* Album                                                                   */
/* ---------------------------------------------------------------------- */

export async function getAlbumById(id: string, mini = true) {
  return jioSaavnGetCall<Album>("/album", { id, mini: `${mini}` });
}

export async function getAlbumByLink(link: string, mini = true) {
  return jioSaavnGetCall<Album>("/album", { link, mini: `${mini}` });
}

export async function getAlbumRecommendations(id: string, lang?: Lang[], mini = true) {
  return jioSaavnGetCall<Album[]>("/album/recommend", { id, mini: `${mini}` }, lang);
}

export async function getAlbumsBySameYear(year: number, lang?: Lang[], mini = true) {
  return jioSaavnGetCall<Album[]>("/album/same-year", { year: `${year}`, mini: `${mini}` }, lang);
}

/* ---------------------------------------------------------------------- */
/* Playlist                                                                */
/* ---------------------------------------------------------------------- */

export async function getPlaylistById(id: string, mini = true) {
  return jioSaavnGetCall<Playlist>("/playlist", { id, mini: `${mini}` });
}

export async function getPlaylistByLink(link: string, mini = true) {
  return jioSaavnGetCall<Playlist>("/playlist", { link, mini: `${mini}` });
}

export async function getPlaylistRecommendations(id: string, lang?: Lang[], mini = true) {
  return jioSaavnGetCall<Playlist[]>("/playlist/recommend", { id, mini: `${mini}` }, lang);
}

/* ---------------------------------------------------------------------- */
/* Artist                                                                  */
/* ---------------------------------------------------------------------- */

export async function getArtistById(id: string, page = 1, nSong = 50, nAlbum = 50, mini = true) {
  return jioSaavnGetCall<Artist>("/artist", {
    id,
    page: `${page}`,
    n_song: `${nSong}`,
    n_album: `${nAlbum}`,
    mini: `${mini}`,
  });
}

export async function getArtistSongs(
  id: string,
  page = 0,
  cat: Category = "popularity",
  sort: Sort = "asc",
  mini = true,
) {
  return jioSaavnGetCall<{ topSongs: Song[]; total: number }>("/artist/songs", {
    id,
    page: `${page}`,
    cat,
    sort,
    mini: `${mini}`,
  });
}

export async function getArtistAlbums(
  id: string,
  page = 0,
  cat: Category = "popularity",
  sort: Sort = "asc",
  mini = true,
) {
  return jioSaavnGetCall<{ topAlbums: Album[]; total: number }>("/artist/albums", {
    id,
    page: `${page}`,
    cat,
    sort,
    mini: `${mini}`,
  });
}

export async function getArtistTopSongs(
  artistId: string,
  songId: string,
  lang: Lang | Lang[] = ["hindi", "english"],
  page = 1,
  cat: Category = "latest",
  sort: Sort = "asc",
  mini = true,
) {
  return jioSaavnGetCall<Song[]>("/artist/top-songs", {
    artist_id: artistId,
    song_id: songId,
    page: `${page}`,
    cat,
    sort,
    mini: `${mini}`,
  }, lang);
}

/* ---------------------------------------------------------------------- */
/* Search                                                                  */
/* ---------------------------------------------------------------------- */

export async function searchAll(query: string) {
  return jioSaavnGetCall<AllSearch>("/search", { q: query });
}


export async function getTopSearches() {
  return jioSaavnGetCall<{ id: string; title: string; type: string; image: Quality }[]>(
    "/search/top",
  );
}

export async function searchByType(
  type: "songs" | "albums" | "playlists" | "artists",
  query: string,
  page = 1,
  n = 20,
) {
  return jioSaavnGetCall<SearchResults<Song | Album | Playlist | Artist>>(`/search/${type}`, {
    q: query,
    page: `${page}`,
    n: `${n}`,
  });
}

export async function searchPodcasts(query: string, page = 1, n = 20) {
  return jioSaavnGetCall<SearchResults<Show>>("/search/podcasts", {
    q: query,
    page: `${page}`,
    n: `${n}`,
  });
}

/* ---------------------------------------------------------------------- */
/* Show / Podcast                                                          */
/* ---------------------------------------------------------------------- */

export async function getShowByToken(token: string, season = 1, sort: Sort = "desc") {
  return jioSaavnGetCall<Show>("/show", { token, season: `${season}`, sort });
}

export async function getShowEpisodes(id: string, season = 1, page = 1, sort: Sort = "desc") {
  return jioSaavnGetCall<unknown[]>("/show/episodes", {
    id,
    season: `${season}`,
    page: `${page}`,
    sort,
  });
}

export async function getEpisodeByToken(token: string, season = 1, sort: Sort = "desc") {
  return jioSaavnGetCall<unknown>("/show/episode", { token, season: `${season}`, sort });
}

/* ---------------------------------------------------------------------- */
/* Get / Collections                                                       */
/* ---------------------------------------------------------------------- */

export async function getTrending(
  type: "song" | "album" | "playlist",
  lang?: Lang[],
  mini = true,
) {
  return jioSaavnGetCall<Song[] | Album[] | Playlist[]>(
    "/get/trending",
    { type, mini: `${mini}` },
    lang,
  );
}

export async function getCollection(
  path: "featured-playlists" | "charts" | "top-shows" | "top-artists" | "top-albums" | "featured-stations",
  page = 1,
  n = 50,
  lang?: Lang[],
  mini = true,
) {
  return jioSaavnGetCall<unknown>(`/get/${path}`, {
    page: `${page}`,
    n: `${n}`,
    mini: `${mini}`,
  }, lang);
}

export async function getTopAlbums(page = 1, n = 50, lang?: Lang[], mini = true) {
  return getCollection("top-albums", page, n, lang, mini) as Promise<{ results: Album[]; total: number }>;
}

export async function getCharts(page = 1, n = 50, lang?: Lang[], mini = true) {
  return getCollection("charts", page, n, lang, mini) as Promise<{ results: Playlist[]; total: number }>;
}

export async function getFeaturedPlaylists(page = 1, n = 50, lang?: Lang[], mini = true) {
  return getCollection("featured-playlists", page, n, lang, mini) as Promise<{ results: Playlist[]; total: number }>;
}

export async function getTopArtists(page = 1, n = 50, lang?: Lang[], mini = true) {
  return getCollection("top-artists", page, n, lang, mini) as Promise<{ results: Artist[]; total: number }>;
}

export async function getTopShows(page = 1, n = 50, lang?: Lang[], mini = true) {
  return getCollection("top-shows", page, n, lang, mini) as Promise<{ results: Show[]; total: number }>;
}

export async function getFeaturedRadioStations(page = 1, n = 50, lang?: Lang[], mini = true) {
  return getCollection("featured-stations", page, n, lang, mini) as Promise<{ results: unknown[]; total: number }>;
}

export async function getLyrics(id: string) {
  return jioSaavnGetCall<{ lyrics: string; snippet: string; copyright: string }>("/get/lyrics", { id });
}

export async function getSyncedLyrics(opts: {
  id?: string;
  track?: string;
  artist?: string;
  duration?: string;
}) {
  return jioSaavnGetCall<unknown>("/get/synced-lyrics", { ...opts });
}

export async function getMixDetails(token: string, page = 1, n = 20, lang?: Lang[], mini = true) {
  return jioSaavnGetCall<Playlist>("/get/mix", { token, page: `${page}`, n: `${n}`, mini: `${mini}` }, lang);
}

/* ---------------------------------------------------------------------- */
/* Radio                                                                   */
/* ---------------------------------------------------------------------- */

export async function createRadioStation(
  type: "featured" | "artist" | "entity",
  params: {
    name?: string;
    artist_id?: string;
    song_id?: string;
    id?: string;
    entityType?: string;
    q?: string;
  },
  lang?: Lang[],
) {
  return jioSaavnGetCall<{ stationid: string }>(`/radio/${type}`, { ...params }, lang);
}

export async function getRadioSongs(stationId: string, n = 10, mini = true) {
  return jioSaavnGetCall<Song[]>("/radio/songs", { id: stationId, n: `${n}`, mini: `${mini}` });
}

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

export function formatDuration(seconds: number, format: "hh:mm:ss" | "mm:ss" = "mm:ss") {
  const date = new Date((seconds || 0) * 1000);
  return format === "hh:mm:ss" ? date.toISOString().slice(11, 19) : date.toISOString().slice(14, 19);
}

export function getDownloadLink(
  downloadUrl: Quality | undefined,
  quality: StreamQuality = "excellent"
): string | null {
  if (!downloadUrl?.length) return null;

  const qualityMap: Record<StreamQuality, string> = {
    low: "12kbps",
    medium: "48kbps",
    high: "160kbps",
    excellent: "320kbps",
  };

  const target = qualityMap[quality];
  const found = downloadUrl.find((d) => d.quality === target);
  
  // v0.1.0 uses 'link', fallback to 'url' if present
  const item = found ?? downloadUrl[downloadUrl.length - 1];
  return item?.link || item?.url || null;
}

export function getImageSrc(
  image: Quality | string | undefined,
  size: "low" | "medium" | "high" = "medium"
): string {
  // Handle string images (some artist results return plain string)
  if (typeof image === "string") return image || "/images/placeholder.jpg";
  if (!image?.length) return "/images/placeholder.jpg";

  const sizeMap: Record<string, string> = {
    low: "50x50",
    medium: "150x150",
    high: "500x500",
  };

  const target = sizeMap[size] || "150x150";
  const match = image.find((i) => i.quality === target);
  
  // v0.1.0 uses 'link', fallback to 'url'
  const item = match ?? image[0];
  return item?.link || item?.url || "/images/placeholder.jpg";
}