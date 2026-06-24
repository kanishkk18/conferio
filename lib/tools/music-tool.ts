// Uses your existing music API
const MUSIC_API_URL = process.env.NEXT_PUBLIC_MUSIC_API_URL || 'https://conferiosync.vercel.app/api/';

export class MusicTool {
  async playMusic(query: string) {
    try {
      // Search for song using your existing API
      const searchRes = await fetch(`${MUSIC_API_URL}/search?q=${encodeURIComponent(query)}`);
      const searchData = await searchRes.json();
      
      if (!searchData.data?.results?.length) {
        return { success: false, message: `No results found for "${query}"` };
      }

      const song = searchData.data.results[0];
      
      return {
        success: true,
        song: {
          id: song.id,
          name: song.name,
          artist: song.artists?.primary?.[0]?.name,
          image: song.image?.[2]?.url,
        },
        message: `Playing "${song.name}" by ${song.artists?.primary?.[0]?.name}`,
        action: 'play',
        songId: song.id,
      };
    } catch (error) {
      return { success: false, message: 'Failed to play music' };
    }
  }
  // lib/tools/music-tool.ts (continued)
  async pauseMusic() {
    return {
      success: true,
      action: 'pause',
      message: 'Music paused',
    };
  }

  async resumeMusic() {
    return {
      success: true,
      action: 'resume',
      message: 'Music resumed',
    };
  }

  async nextSong() {
    return {
      success: true,
      action: 'next',
      message: 'Playing next song',
    };
  }

  async previousSong() {
    return {
      success: true,
      action: 'previous',
      message: 'Playing previous song',
    };
  }

  async setVolume(level: number) {
    return {
      success: true,
      action: 'volume',
      volume: level,
      message: `Volume set to ${level}%`,
    };
  }
}

export const musicTool = new MusicTool();
