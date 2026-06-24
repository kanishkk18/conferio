import { useState, useEffect } from 'react';
import { Album } from 'types';
import { SaavnAPI } from 'services/saavnApi';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LazyLoader from '@/components/loader/lazyloader';

export const AlbumCarousel = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrendingAlbums = async () => {
      try {
        const trendingAlbums = await SaavnAPI.getTrendingAlbums();
        setAlbums(trendingAlbums);
      } catch (error) {
        console.error('Failed to load trending albums:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingAlbums();
  }, []);

  useEffect(() => {
    if (albums.length > 0 && albums.length < 7) {
      setAlbums(prev => [...prev, ...prev]);
    }
  }, [albums]);

  const updateCarousel = (newIndex: number) => {
    if (isAnimating || albums.length === 0) return;
    setIsAnimating(true);

    setCurrentIndex((newIndex + albums.length) % albums.length);

    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const getCardPosition = (index: number) => {
    const offset = (index - currentIndex + albums.length) % albums.length;

    if (offset === 0) return 'center';
    if (offset === 1) return 'right-1';
    if (offset === 2) return 'right-2';
    if (offset === 3) return 'right-3';

    if (offset === albums.length - 1) return 'left-1';
    if (offset === albums.length - 2) return 'left-2';
    if (offset === albums.length - 3) return 'left-3';

    return 'hidden';
  };

  const getCurrentAlbum = () => albums[currentIndex];

  if (loading) {
    return (
      <div className=" flex items-center justify-center">
        <LazyLoader/>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className=" flex items-center justify-center ">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No albums found</h2>
          <p className="text-muted-foreground">Unable to load trending albums at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit flex flex-col items-center justify-center overflow-hidden">

      {/* Carousel Container */}
      <div className="w-full max-w-7xl h-96 md:h-[400px] relative " style={{ perspective: '1000px' }}>
        <div className="w-full h-full flex justify-center items-center relative transition-transform duration-700 ease-out" style={{ transformStyle: 'preserve-3d' }}>
          {albums.map((album, index) => {
            const position = getCardPosition(index);
            return (
              <div
                key={`${album.id}-${index}`}
                className={`
                  absolute w-60 h-80 md:w-72 md:h-96 bg-card rounded-2xl overflow-hidden shadow-card cursor-pointer transition-all duration-700 ease-out
                  ${position === 'center' ? 'z-20 scale-105' : ''}
                  ${position === 'left-1' ? 'z-10 -translate-x-40 md:-translate-x-48 scale-90 -translate-z-24' : ''}
                  ${position === 'left-2' ? 'z-0 -translate-x-80 md:-translate-x-96 scale-75 -translate-z-48 opacity-70' : ''}
                  ${position === 'left-3' ? 'z-0 -translate-x-120 md:-translate-x-144 scale-60 -translate-z-72 opacity-50' : ''}
                  ${position === 'right-1' ? 'z-10 translate-x-40 md:translate-x-48 scale-90 -translate-z-24' : ''}
                  ${position === 'right-2' ? 'z-0 translate-x-80 md:translate-x-96 scale-75 -translate-z-48 opacity-70' : ''}
                  ${position === 'right-3' ? 'z-0 translate-x-120 md:translate-x-144 scale-60 -translate-z-72 opacity-50' : ''}
                  ${position === 'hidden' ? 'opacity-0 pointer-events-none' : ''}
                  ${position !== 'center' ? 'grayscale' : ''}
                `}
                onClick={() => updateCarousel(index)}
                style={{
                  transform: `
                    ${position === 'center' ? 'scale(1) translateZ(0)' : ''}
                    ${position === 'left-1' ? 'translateX(-250px) scale(0.9) translateZ(-100px)' : ''}
                    ${position === 'left-2' ? 'translateX(-500px) scale(0.8) translateZ(-300px)' : ''}
                    ${position === 'left-3' ? 'translateX(-750px) scale(0.7) translateZ(-500px)' : ''}
                    ${position === 'right-1' ? 'translateX(250px) scale(0.9) translateZ(-100px)' : ''}
                    ${position === 'right-2' ? 'translateX(500px) scale(0.8) translateZ(-300px)' : ''}
                    ${position === 'right-3' ? 'translateX(750px) scale(0.7) translateZ(-500px)' : ''}
                  `
                }}
              >
                <Link key={`artist-link-${album.id}`} href={`/music/album/${album.id}`}>
                  <Image
                    src={SaavnAPI.getHighestQualityImage(album.image)}
                    alt={album.name}
                    className="w-full h-full object-cover transition-all duration-700"
                    height={1000}
                    width={1000}
                  />
                  {position === 'center' && (
                    <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-6">
                      <Button
                        size="icon"
                        className="absolute right-4 top-4 rounded-full bg-white/20 hover:bg-white/30"
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                      <h3 className="text-2xl font-semibold">{getCurrentAlbum()?.name.slice(0, 10)}</h3>
                      <p className="text-gray-200">{getCurrentAlbum()?.artists.primary[0]?.name || 'Various Artists'}</p>
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-music-primary/60 hover:bg-music-primary/80 text-white border-0"
          onClick={() => updateCarousel(currentIndex - 1)}
        >
          <ChevronLeft className="size-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-music-primary/60 hover:bg-music-primary/80 text-white border-0"
          onClick={() => updateCarousel(currentIndex + 1)}
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>

      {/* Album Info */}
      {/* <div className="text-center mt-10 transition-all duration-500">
        <h2 className="text-3xl md:text-4xl font-bold text-music-primary mb-2 relative inline-block">
          {getCurrentAlbum()?.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-24 h-0.5 bg-music-primary mt-2"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-x-32 w-24 h-0.5 bg-music-primary mt-2"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 translate-x-32 w-24 h-0.5 bg-music-primary mt-2"></div>
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl font-medium uppercase tracking-wider mt-6">
          {getCurrentAlbum()?.artists.primary[0]?.name || 'Various Artists'}
        </p>
        {getCurrentAlbum()?.year && (
          <p className="text-muted-foreground/60 text-sm mt-2">
            {getCurrentAlbum()?.year}
          </p>
        )}
      </div> */}
    </div>
  );
};
