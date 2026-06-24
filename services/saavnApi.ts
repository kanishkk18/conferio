import { Album, Artist, Playlist, SearchResponse, SearchResponses, Song } from 'types';
import { useState, useEffect } from 'react'

const API_BASE = 'https://conferiosync.vercel.app/api'

const BASE_URL = 'https://conferiosync.vercel.app/api';

export class SaavnAPI {
  static async searchAlbums(query: string, page = 0, limit = 10): Promise<SearchResponses<Album>> {
    const response = await fetch(
      `${BASE_URL}/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.json();
  }

  static async searchArtists(query: string, page = 0, limit = 10): Promise<SearchResponses<Artist>> {
    const response = await fetch(
      `${BASE_URL}/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.json();
  }

  static async searchPlaylists(query: string, page = 0, limit = 10): Promise<SearchResponses<Playlist>> {
    const response = await fetch(
      `${BASE_URL}/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.json();
  }

  static async getTrendingAlbums(): Promise<Album[]> {
    // Using popular search terms to get trending albums
    const trendingQueries = [
      'bollywood hits',
      'punjabi songs',
      'arijit singh',
      'trending songs',
      'hollywood',
      'english songs'
    ];
    
    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    const response = await this.searchAlbums(randomQuery, 0, 20);
    
    if (response.success && response.data.results.length > 0) {
      // Shuffle and return first 6 albums
      const shuffled = response.data.results.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 6);
    }
    
    return [];
  }

  static getHighestQualityImage(images: { quality: string; url: string }[]): string {
    if (!images || images.length === 0) return '';
    
    // Try to find the highest quality image
    const qualityOrder = ['500x500', '150x150', '50x50'];
    
    for (const quality of qualityOrder) {
      const image = images.find(img => img.quality === quality);
      if (image) return image.url;
    }
    
    // Return the first available image
    return images[0]?.url || '';
  }
}

export function useSearch(query: string) {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setData(null)
      return
    }

    const searchMusic = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Search failed')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchMusic, 300)
    return () => clearTimeout(debounce)
  }, [query])

  return { data, loading, error }
}

export function useTrendingSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${API_BASE}/search/songs?query=trending&limit=10`)
        const result = await response.json()
        if (result.success) {
          setSongs(result.data.results || [])
        }
      } catch (error) {
        console.error('Failed to fetch trending songs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  return { songs, loading }
}

export function useFeaturedPlaylists() {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        // Using search for playlists as an example
        const queries = ['bollywood', 'punjabi', 'indie', 'classical', 'devotional']
        const promises = queries.map(q => 
          fetch(`${API_BASE}/search/playlists?query=${q}&limit=2`)
            .then(res => res.json())
            .then(data => data.success ? data.data.results : [])
        )
        
        const results = await Promise.all(promises)
        const allPlaylists = results.flat()
        setPlaylists(allPlaylists)
      } catch (error) {
        console.error('Failed to fetch playlists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [])

  return { playlists, loading }
}

export function usePopularArtists() {
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistNames = [
  "Hariharan",
  "Swarnalatha",
  "Kumar Sanu",
  "Sapna Mukherjee",
  "Lata Mangeshkar",
  "Aamir Khan",
  "Alka Yagnik",
  "Arijit Singh",
  "Atif Aslam",
  "Shreya Ghoshal",
  "Sami Yusuf",
  "Rahat Fateh Ali Khan",
  "Sonu Nigam",
  "Sia",
  "Taylor Swift",
  "Adele",
  "Ed Sheeran",
  "Bruno Mars",
  "The Weeknd",
  "Justin Bieber",
  "Beyoncé",
  "Rihanna",
  "Lady Gaga",
  "Ariana Grande",
  "Billie Eilish",
  "Dua Lipa",
  "Katy Perry",
  "Selena Gomez",
  "Olivia Rodrigo",
  "Harry Styles",
  "Shawn Mendes",
  "Post Malone",
  "Sam Smith",
  "John Legend",
  "Coldplay",
  "Imagine Dragons",
  "Linkin Park",
  "Maroon 5",
  "OneRepublic",
  "Backstreet Boys",
  "Eminem",
  "Drake",
  "Kanye West",
  "Jay-Z",
  "Travis Scott",
  "Doja Cat",
  "Lana Del Rey",
  "Halsey",
  "Miley Cyrus",
  "Madonna",
  "Michael Jackson",
  "Whitney Houston",
  "Elton John",
  "Queen",
  "ABBA",
  "Hans Zimmer",
  "John Williams",
  "James Horner",
  "Danny Elfman",
  "Howard Shore",
  "Alan Silvestri",
  "Michael Giacchino",
  "Ramin Djawadi",
  "Ludwig Göransson",
  "Trent Reznor",
  "Atticus Ross",
  "Alexandre Desplat",
  "Thomas Newman",
  "Ennio Morricone",
  "Jóhann Jóhannsson"
]
        const promises = artistNames.map(name => 
          fetch(`${API_BASE}/search/artists?query=${encodeURIComponent(name)}&limit=1`)
            .then(res => res.json())
            .then(data => data.success && data.data.results.length > 0 ? data.data.results[0] : null)
        )
        
        const results = await Promise.all(promises)
        const validArtists = results.filter(Boolean)
        setArtists(validArtists)
      } catch (error) {
        console.error('Failed to fetch artists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  return { artists, loading }
}