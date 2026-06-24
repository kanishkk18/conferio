// import { atom, createStore, useAtom } from "jotai";
// import { atomWithStorage } from "jotai/utils";

// import type { Lang, Song, StreamQuality } from "@/lib/music/jiosaavn";

// const store = createStore();

// /* ---------------------------------------------------------------------- */
// /* Queue & playback                                                        */
// /* ---------------------------------------------------------------------- */

// const queueAtom = atomWithStorage<Song[]>("music_queue", []);
// export function useQueue() {
//   return useAtom(queueAtom, { store });
// }

// const currentSongIndexAtom = atomWithStorage("music_current_index", 0);
// export function useCurrentSongIndex() {
//   return useAtom(currentSongIndexAtom, { store });
// }

// const isPlayerInitAtom = atom(false);
// export function useIsPlayerInit() {
//   return useAtom(isPlayerInitAtom, { store });
// }

// const isTypingAtom = atom(false);
// export function useIsTyping() {
//   return useAtom(isTypingAtom, { store });
// }

// /* ---------------------------------------------------------------------- */
// /* Quality / language preferences                                          */
// /* ---------------------------------------------------------------------- */

// const streamQualityAtom = atomWithStorage<StreamQuality>(
//   "music_stream_quality",
//   "excellent",
// );
// export function useStreamQuality() {
//   return useAtom(streamQualityAtom, { store });
// }

// const languagesAtom = atomWithStorage<Lang[]>("music_languages", [
//   "hindi",
//   "english",
// ]);
// export function useLanguages() {
//   return useAtom(languagesAtom, { store });
// }

// /* ---------------------------------------------------------------------- */
// /* Helpers                                                                  */
// /* ---------------------------------------------------------------------- */

// /**
//  * Replace the queue with a new list of songs and start playing from index.
//  */
// export function setQueueAndPlay(songs: Song[], startIndex = 0) {
//   store.set(queueAtom, songs);
//   store.set(currentSongIndexAtom, startIndex);
//   store.set(isPlayerInitAtom, true);
// }

// /**
//  * Append songs to the end of the current queue (used by "Add to queue").
//  */
// export function addToQueue(songs: Song[]) {
//   const current = store.get(queueAtom);
//   store.set(queueAtom, [...current, ...songs]);

//   // if nothing was playing yet, start playing from the first added song
//   if (!store.get(isPlayerInitAtom)) {
//     store.set(currentSongIndexAtom, current.length);
//     store.set(isPlayerInitAtom, true);
//   }
// }

// /**
//  * Play a single song immediately, replacing the queue with just this song
//  * unless `keepQueue` is true (in which case it's inserted at current index + 1).
//  */
// export function playSong(song: Song, keepQueue = false) {
//   if (!keepQueue) {
//     setQueueAndPlay([song], 0);
//     return;
//   }

//   const current = store.get(queueAtom);
//   const idx = store.get(currentSongIndexAtom);
//   const next = [...current];
//   next.splice(idx + 1, 0, song);
//   store.set(queueAtom, next);
//   store.set(currentSongIndexAtom, idx + 1);
//   store.set(isPlayerInitAtom, true);
// }

import { atom, createStore, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Lang, Song, StreamQuality } from "@/lib/music/jiosaavn";

const store = createStore();

/* ── Queue & playback ──────────────────────────────────────────────── */

const queueAtom = atomWithStorage<Song[]>("music_queue", []);
export function useQueue() {
  return useAtom(queueAtom, { store });
}

const currentSongIndexAtom = atomWithStorage("music_current_index", 0);
export function useCurrentSongIndex() {
  return useAtom(currentSongIndexAtom, { store });
}

const isPlayerInitAtom = atom(false);
export function useIsPlayerInit() {
  return useAtom(isPlayerInitAtom, { store });
}

/* ── Quality / language ─────────────────────────────────────────────── */

const streamQualityAtom = atomWithStorage<StreamQuality>("music_stream_quality", "excellent");
export function useStreamQuality() {
  return useAtom(streamQualityAtom, { store });
}

const languagesAtom = atomWithStorage<Lang[]>("music_languages", ["hindi", "english"]);
export function useLanguages() {
  return useAtom(languagesAtom, { store });
}

/* ── Helpers ────────────────────────────────────────────────────────── */

/**
 * Fetch full song data (with download_url) from our proxy API.
 * Songs from listing endpoints (trending, search, etc.) often only have mini
 * data — no download_url. This ensures we always have the URL before playing.
 */
async function fetchFullSong(song: Song): Promise<Song> {
  // Local uploaded tracks already have download_url
  if (song.id.startsWith("local:")) return song;

  // If download_url already exists and has entries, no need to re-fetch
  const dl = song.download_url;
  if (Array.isArray(dl) && dl.length > 0 && (dl[0].link || dl[0].url)) return song;
  if (typeof dl === "string" && dl.length > 0) return song;

  // Re-fetch full song data
  try {
    const res = await fetch(`/api/music/data?resource=song&id=${song.id}`);
    const data = await res.json();
    const full: Song | undefined = data?.songs?.[0];
    if (full && full.download_url) return full;
  } catch {
    // fall through and return original
  }
  return song;
}

/**
 * Replace the queue and start playing from `startIndex`.
 * Fetches full song data for the first song to play immediately,
 * then lazily enriches the rest in the background.
 */
export async function setQueueAndPlay(songs: Song[], startIndex = 0) {
  if (!songs.length) return;

  // Put songs in queue immediately (shows UI)
  store.set(queueAtom, songs);
  store.set(currentSongIndexAtom, startIndex);
  store.set(isPlayerInitAtom, true);

  // Fetch full data for the song about to play
  const full = await fetchFullSong(songs[startIndex]);
  if (full !== songs[startIndex]) {
    const updated = [...store.get(queueAtom)];
    updated[startIndex] = full;
    store.set(queueAtom, updated);
  }

  // Enrich remaining songs silently in background
  songs.forEach(async (song, idx) => {
    if (idx === startIndex) return;
    const enriched = await fetchFullSong(song);
    if (enriched !== song) {
      const q = [...store.get(queueAtom)];
      q[idx] = enriched;
      store.set(queueAtom, q);
    }
  });
}

/** Add songs to end of queue. Enriches them in the background. */
export function addToQueue(songs: Song[]) {
  const current = store.get(queueAtom);
  store.set(queueAtom, [...current, ...songs]);

  if (!store.get(isPlayerInitAtom)) {
    store.set(currentSongIndexAtom, current.length);
    store.set(isPlayerInitAtom, true);
  }

  // Enrich in background
  songs.forEach(async (song, i) => {
    const enriched = await fetchFullSong(song);
    if (enriched !== song) {
      const q = [...store.get(queueAtom)];
      const qIdx = current.length + i;
      if (q[qIdx]?.id === song.id) q[qIdx] = enriched;
      store.set(queueAtom, q);
    }
  });
}

/** Play a single song immediately. */
export async function playSong(song: Song) {
  const full = await fetchFullSong(song);
  store.set(queueAtom, [full]);
  store.set(currentSongIndexAtom, 0);
  store.set(isPlayerInitAtom, true);
}
