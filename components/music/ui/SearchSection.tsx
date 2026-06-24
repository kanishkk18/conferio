import { useState } from 'react';
import { Search, Music, Users, ListMusic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { SaavnAPI } from 'services/saavnApi';
import { Album, Artist, Playlist } from 'types';

export const SearchSection = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const [albumResults, artistResults, playlistResults] = await Promise.all([
        SaavnAPI.searchAlbums(searchQuery, 0, 12),
        SaavnAPI.searchArtists(searchQuery, 0, 12),
        SaavnAPI.searchPlaylists(searchQuery, 0, 12)
      ]);

      setAlbums(albumResults.success ? albumResults.data.results : []);
      setArtists(artistResults.success ? artistResults.data.results : []);
      setPlaylists(playlistResults.success ? playlistResults.data.results : []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-music-surface to-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-semibold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Discover Music
          </h1>
          <p className="text-muted-foreground text-lg">
            Search for albums, artists, and playlists
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input
            placeholder="Search for music..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-12 pr-24 h-14 text-lg rounded-2xl border-music-primary/20 focus:border-music-primary bg-music-surface"
          />
          <Button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl bg-gradient-primary hover:shadow-glow"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {['Arijit Singh', 'Bollywood Hits', 'Punjabi Songs', 'Love Songs', 'Party Music'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery(suggestion);
                handleSearch(suggestion);
              }}
              className="rounded-full border-music-primary/30 hover:bg-music-primary/10 hover:border-music-primary"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Search Results */}
        {(albums.length > 0 || artists.length > 0 || playlists.length > 0) && (
          <Tabs defaultValue="albums" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8 bg-music-surface">
              <TabsTrigger value="albums" className="flex items-center gap-2">
                <Music className="size-4" />
                Albums
              </TabsTrigger>
              <TabsTrigger value="artists" className="flex items-center gap-2">
                <Users className="size-4" />
                Artists
              </TabsTrigger>
              <TabsTrigger value="playlists" className="flex items-center gap-2">
                <ListMusic className="size-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="albums">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {albums.map((album) => (
                  <Card key={album.id} className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-elevated bg-gradient-card border-music-primary/10">
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-xl overflow-hidden mb-3">
                        <img
                          src={SaavnAPI.getHighestQualityImage(album.image)}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{album.name}</h3>
                      <p className="text-muted-foreground text-xs line-clamp-1">
                        {album.artists.primary[0]?.name}
                      </p>
                      {album.year && (
                        <p className="text-muted-foreground/60 text-xs mt-1">{album.year}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="artists">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {artists.map((artist) => (
                  <Card key={artist.id} className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-elevated bg-gradient-card border-music-primary/10">
                    <CardContent className="p-4 text-center">
                      <div className="aspect-square rounded-full overflow-hidden mb-3 mx-auto">
                        <img
                          src={SaavnAPI.getHighestQualityImage(artist.image)}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{artist.name}</h3>
                      <p className="text-muted-foreground text-xs capitalize">{artist.role}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="playlists">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {playlists.map((playlist) => (
                  <Card key={playlist.id} className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-elevated bg-gradient-card border-music-primary/10">
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-xl overflow-hidden mb-3">
                        <img
                          src={SaavnAPI.getHighestQualityImage(playlist.image)}
                          alt={playlist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{playlist.name}</h3>
                      <p className="text-muted-foreground text-xs">
                        {playlist.songCount ? `${playlist.songCount} songs` : 'Playlist'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!loading && albums.length === 0 && artists.length === 0 && playlists.length === 0 && query && (
          <div className="text-center py-12">
            <Music className="size-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
};
