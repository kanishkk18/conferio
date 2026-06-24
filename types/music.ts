export interface JioSaavnImage {
  quality: string;
  url: string;
}

export interface JioSaavnArtist {
  id: string;
  name: string;
  role: string;
  image: JioSaavnImage[];
  type: string;
  url: string;
}

export interface JioSaavnArtists {
  primary: JioSaavnArtist[];
  featured: JioSaavnArtist[];
  all: JioSaavnArtist[];
}

export interface JioSaavnAlbum {
  id: string;
  name: string;
  url: string;
}

export interface JioSaavnSong {
  id: string;
  name: string;
  type: "song";
  year: string;
  releaseDate: string | null;
  duration: number;
  label: string;
  explicitContent: boolean;
  playCount: number;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string;
  album: JioSaavnAlbum;
  artists: JioSaavnArtists;
  image: JioSaavnImage[];
  downloadUrl: { quality: string; url: string }[];
}

export interface JioSaavnAlbumDetail {
  id: string;
  name: string;
  description: string;
  year: number;
  type: "album";
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  artists: JioSaavnArtists;
  url: string;
  image: JioSaavnImage[];
  songs?: JioSaavnSong[];
}

export interface JioSaavnPlaylist {
  id: string;
  name: string;
  type: "playlist";
  image: JioSaavnImage[];
  url: string;
  language: string;
  explicitContent: boolean;
  songCount: number;
  description?: string;
}

export interface JioSaavnArtistDetail {
  id: string;
  name: string;
  role: string;
  type: "artist";
  image: JioSaavnImage[];
  url: string;
  followerCount?: number;
  fanCount?: number;
  topSongs?: JioSaavnSong[];
  singles?: JioSaavnSong[];
  albums?: JioSaavnAlbumDetail[];
}

export interface JioSaavnShow {
  id: string;
  name: string;
  type: "show";
  image: JioSaavnImage[];
  url: string;
  description?: string;
  explicitContent: boolean;
  episodes?: JioSaavnEpisode[];
}

export interface JioSaavnEpisode {
  id: string;
  name: string;
  type: "episode";
  image: JioSaavnImage[];
  url: string;
  duration: number;
  description?: string;
}

export interface JioSaavnRadio {
  id: string;
  name: string;
  type: "radio";
  image: JioSaavnImage[];
  url: string;
}

export interface JioSaavnChart {
  id: string;
  title: string;
  subtitle: string;
  type: "chart";
  image: JioSaavnImage[];
  url: string;
  language: string;
  explicitContent: boolean;
}

export interface MusicContextType {
  currentSong: JioSaavnSong | null;
  isPlaying: boolean;
  queue: JioSaavnSong[];
  currentIndex: number;
  volume: number;
  isMuted: boolean;
  progress: number;
  duration: number;
  setMusic: (songId: string, songs?: JioSaavnSong[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (song: JioSaavnSong) => void;
  removeFromQueue: (index: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
}

export interface PlaylistWithSongs {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  isPublic: boolean;
  createdAt: Date;
  songs: {
    id: string;
    songId: string;
    songData: any;
    order: number;
  }[];
}
