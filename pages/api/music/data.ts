// import type { NextApiRequest, NextApiResponse } from "next";

// import {
//   getAlbumById,
//   getAlbumByLink,
//   getAlbumRecommendations,
//   getArtistAlbums,
//   getArtistById,
//   getArtistSongs,
//   getArtistTopSongs,
//   getCharts,
//   getFeaturedPlaylists,
//   getFeaturedRadioStations,
//   getHomeData,
//   getLyrics,
//   getMixDetails,
//   getPlaylistById,
//   getPlaylistByLink,
//   getPlaylistRecommendations,
//   getRadioSongs,
//   getShowByToken,
//   getShowEpisodes,
//   getSongById,
//   getSongByLink,
//   getSongRecommendations,
//   getTopAlbums,
//   getTopArtists,
//   getTopShows,
//   getTopSearches,
//   getTrending,
//   createRadioStation,
//   type Lang,
// } from "@/lib/music/jiosaavn";
// import { uploadedTrackToSong } from "./tracks";
// import { prisma } from "@/lib/prisma";

// /**
//  * Generic data endpoint:
//  *   /api/music/data?resource=home&lang=hindi,english
//  *   /api/music/data?resource=album&id=xxx
//  *   /api/music/data?resource=playlist&id=xxx
//  *   /api/music/data?resource=artist&id=xxx
//  *   /api/music/data?resource=song&id=xxx           (handles "local:" ids too)
//  *   /api/music/data?resource=charts&page=1
//  *   /api/music/data?resource=top-albums
//  *   /api/music/data?resource=top-artists
//  *   /api/music/data?resource=top-shows
//  *   /api/music/data?resource=featured-playlists
//  *   /api/music/data?resource=radio-stations
//  *   /api/music/data?resource=radio-songs&id=xxx
//  *   /api/music/data?resource=radio-create&type=featured&name=xxx
//  *   /api/music/data?resource=trending&type=song
//  *   /api/music/data?resource=lyrics&id=xxx
//  *   /api/music/data?resource=show&token=xxx
//  *   /api/music/data?resource=show-episodes&id=xxx
//  *   /api/music/data?resource=recommend&type=song|album|playlist|artist&id=xxx
//  */
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") {
//     res.setHeader("Allow", ["GET"]);
//     return res.status(405).end();
//   }

//   const q = req.query as Record<string, string>;
//   const resource = q.resource;
//   const lang: Lang[] | undefined = q.lang ? (q.lang.split(",") as Lang[]) : undefined;
//   const page = q.page ? Number(q.page) : undefined;
//   const n = q.n ? Number(q.n) : undefined;

//   try {
//     switch (resource) {
//       case "home":
//         return res.status(200).json(await getHomeData(lang));

//       case "album": {
//         const data = q.link ? await getAlbumByLink(q.link) : await getAlbumById(q.id);
//         return res.status(200).json(data);
//       }

//       case "playlist": {
//         const data = q.link ? await getPlaylistByLink(q.link) : await getPlaylistById(q.id);
//         return res.status(200).json(data);
//       }

//       case "artist":
//         return res.status(200).json(await getArtistById(q.id, page ?? 1));

//       case "artist-songs":
//         return res
//           .status(200)
//           .json(await getArtistSongs(q.id, page ?? 0, (q.cat as never) ?? "popularity", (q.sort as never) ?? "asc"));

//       case "artist-albums":
//         return res
//           .status(200)
//           .json(await getArtistAlbums(q.id, page ?? 0, (q.cat as never) ?? "popularity", (q.sort as never) ?? "asc"));

//       case "artist-top-songs":
//         return res
//           .status(200)
//           .json(await getArtistTopSongs(q.artist_id, q.song_id, lang ?? ["hindi", "english"], page ?? 1));

//       case "song": {
//         if (q.id?.startsWith("local:")) {
//           const rawId = q.id.replace("local:", "");
//           const track = await prisma.uploadedTrack.findFirst({ where: { id: rawId } });
//           if (!track) return res.status(404).json({ error: "Track not found" });
//           return res.status(200).json({ songs: [uploadedTrackToSong(track)] });
//         }

//         const data = q.link ? await getSongByLink(q.link) : await getSongById(q.id);
//         return res.status(200).json(data);
//       }

//       case "recommend": {
//         const type = q.type as "song" | "album" | "playlist" | "artist";

//         if (type === "song") return res.status(200).json(await getSongRecommendations(q.id, lang));
//         if (type === "album") return res.status(200).json(await getAlbumRecommendations(q.id, lang));
//         if (type === "playlist") return res.status(200).json(await getPlaylistRecommendations(q.id, lang));

//         return res.status(400).json({ error: "Unsupported recommend type" });
//       }

//       case "charts":
//         return res.status(200).json(await getCharts(page ?? 1, n ?? 50, lang));

//       case "top-albums":
//         return res.status(200).json(await getTopAlbums(page ?? 1, n ?? 50, lang));

//       case "top-artists":
//         return res.status(200).json(await getTopArtists(page ?? 1, n ?? 50, lang));

//       case "top-shows":
//         return res.status(200).json(await getTopShows(page ?? 1, n ?? 50, lang));

//       case "featured-playlists":
//         return res.status(200).json(await getFeaturedPlaylists(page ?? 1, n ?? 50, lang));

//       case "radio-stations":
//         return res.status(200).json(await getFeaturedRadioStations(page ?? 1, n ?? 50, lang));

//       case "radio-songs":
//         return res.status(200).json(await getRadioSongs(q.id, n ?? 10));

//       case "radio-create":
//         return res.status(200).json(
//           await createRadioStation(
//             (q.type as "featured" | "artist" | "entity") ?? "featured",
//             {
//               name: q.name,
//               artist_id: q.artist_id,
//               song_id: q.song_id,
//               id: q.id,
//               q: q.q,
//             },
//             lang,
//           ),
//         );

//       case "trending":
//         return res
//           .status(200)
//           .json(await getTrending((q.type as "song" | "album" | "playlist") ?? "song", lang));

//       case "lyrics":
//         return res.status(200).json(await getLyrics(q.id));

//       case "mix":
//         return res.status(200).json(await getMixDetails(q.token, page ?? 1, n ?? 20, lang));

//       case "show":
//         return res.status(200).json(await getShowByToken(q.token, page ?? 1, (q.sort as never) ?? "desc"));

//       case "show-episodes":
//         return res
//           .status(200)
//           .json(await getShowEpisodes(q.id, q.season ? Number(q.season) : 1, page ?? 1, (q.sort as never) ?? "desc"));

//       case "top-searches":
//         return res.status(200).json(await getTopSearches());

//       default:
//         return res.status(400).json({ error: `Unknown resource: ${resource}` });
//     }
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Failed to fetch data";
//     return res.status(500).json({ error: message });
//   }
// }

import type { NextApiRequest, NextApiResponse } from "next";

import {
  getAlbumById,
  getAlbumByLink,
  getAlbumRecommendations,
  getArtistAlbums,
  getArtistById,
  getArtistSongs,
  getArtistTopSongs,
  getCharts,
  getFeaturedPlaylists,
  getFeaturedRadioStations,
  getHomeData,
  getLyrics,
  getMixDetails,
  getPlaylistById,
  getPlaylistByLink,
  getPlaylistRecommendations,
  getShowByToken,
  getShowEpisodes,
  getSongById,
  getSongByLink,
  getSongRecommendations,
  getTopAlbums,
  getTopArtists,
  getTopShows,
  getTopSearches,
  getTrending,
  createRadioStation,
  getRadioSongs,
  type Lang,
} from "@/lib/music/jiosaavn";
import { uploadedTrackToSong } from "./tracks";
import { prisma } from "@/lib/prisma";

/**
 * Generic data endpoint:
 *   /api/music/data?resource=home&lang=hindi,english
 *   /api/music/data?resource=album&id=xxx
 *   /api/music/data?resource=playlist&id=xxx
 *   /api/music/data?resource=artist&id=xxx
 *   /api/music/data?resource=song&id=xxx           (handles "local:" ids too)
 *   /api/music/data?resource=charts&page=1
 *   /api/music/data?resource=top-albums
 *   /api/music/data?resource=top-artists
 *   /api/music/data?resource=top-shows
 *   /api/music/data?resource=featured-playlists
 *   /api/music/data?resource=radio-stations
 *   /api/music/data?resource=radio-songs&id=xxx
 *   /api/music/data?resource=radio-create&type=featured&name=xxx
 *   /api/music/data?resource=trending&type=song
 *   /api/music/data?resource=lyrics&id=xxx
 *   /api/music/data?resource=show&token=xxx
 *   /api/music/data?resource=show-episodes&id=xxx
 *   /api/music/data?resource=recommend&type=song|album|playlist|artist&id=xxx
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  const q = req.query as Record<string, string>;
  const resource = q.resource;
  const lang: Lang[] | undefined = q.lang ? (q.lang.split(",") as Lang[]) : undefined;
  const page = q.page ? Number(q.page) : undefined;
  const n = q.n ? Number(q.n) : undefined;

  try {
    switch (resource) {
      case "home":
        return res.status(200).json(await getHomeData(lang));

      case "album": {
        const data = q.link ? await getAlbumByLink(q.link) : await getAlbumById(q.id);
        return res.status(200).json(data);
      }

      case "playlist": {
        const data = q.link ? await getPlaylistByLink(q.link) : await getPlaylistById(q.id);
        return res.status(200).json(data);
      }

      case "artist":
        return res.status(200).json(await getArtistById(q.id, page ?? 1));

      case "artist-songs":
        return res
          .status(200)
          .json(await getArtistSongs(q.id, page ?? 0, (q.cat as never) ?? "popularity", (q.sort as never) ?? "asc"));

      case "artist-albums":
        return res
          .status(200)
          .json(await getArtistAlbums(q.id, page ?? 0, (q.cat as never) ?? "popularity", (q.sort as never) ?? "asc"));

      case "artist-top-songs":
        return res
          .status(200)
          .json(await getArtistTopSongs(q.artist_id, q.song_id, lang ?? ["hindi", "english"], page ?? 1));

      case "song": {
        if (q.id?.startsWith("local:")) {
          const rawId = q.id.replace("local:", "");
          const track = await prisma.uploadedTrack.findFirst({ where: { id: rawId } });
          if (!track) return res.status(404).json({ error: "Track not found" });
          return res.status(200).json({ songs: [uploadedTrackToSong(track)] });
        }

        const data = q.link ? await getSongByLink(q.link) : await getSongById(q.id);
        return res.status(200).json(data);
      }

      case "recommend": {
        const type = q.type as "song" | "album" | "playlist" | "artist";

        if (type === "song") return res.status(200).json(await getSongRecommendations(q.id, lang));
        if (type === "album") return res.status(200).json(await getAlbumRecommendations(q.id, lang));
        if (type === "playlist") return res.status(200).json(await getPlaylistRecommendations(q.id, lang));

        return res.status(400).json({ error: "Unsupported recommend type" });
      }

      // ─── COLLECTION ENDPOINTS: wrap in { data: [...] } for frontend consistency ───
      case "charts":
        return res.status(200).json({ data: await getCharts(page ?? 1, n ?? 50, lang) });

      case "top-albums":
        return res.status(200).json({ data: await getTopAlbums(page ?? 1, n ?? 50, lang) });

      case "top-artists":
        return res.status(200).json({ data: await getTopArtists(page ?? 1, n ?? 50, lang) });

      case "top-shows":
        return res.status(200).json({ data: await getTopShows(page ?? 1, n ?? 50, lang) });

      case "featured-playlists":
        return res.status(200).json({ data: await getFeaturedPlaylists(page ?? 1, n ?? 50, lang) });

      case "radio-stations":
        return res.status(200).json({ data: await getFeaturedRadioStations(page ?? 1, n ?? 50, lang) });

      case "radio-songs":
        return res.status(200).json({ data: await getRadioSongs(q.id, n ?? 10) });

      case "radio-create":
        return res.status(200).json(
          await createRadioStation(
            (q.type as "featured" | "artist" | "entity") ?? "featured",
            {
              name: q.name,
              artist_id: q.artist_id,
              song_id: q.song_id,
              id: q.id,
              q: q.q,
            },
            lang,
          ),
        );

      case "trending":
        return res
          .status(200)
          .json({ data: await getTrending((q.type as "song" | "album" | "playlist") ?? "song", lang) });

      case "lyrics":
        return res.status(200).json(await getLyrics(q.id));

      case "mix":
        return res.status(200).json(await getMixDetails(q.token, page ?? 1, n ?? 20, lang));

      case "show":
        return res.status(200).json(await getShowByToken(q.token, page ?? 1, (q.sort as never) ?? "desc"));

      case "show-episodes":
        return res
          .status(200)
          .json(await getShowEpisodes(q.id, q.season ? Number(q.season) : 1, page ?? 1, (q.sort as never) ?? "desc"));

      case "top-searches":
        return res.status(200).json(await getTopSearches());

      default:
        return res.status(400).json({ error: `Unknown resource: ${resource}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch data";
    return res.status(500).json({ error: message });
  }
}
