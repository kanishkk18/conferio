
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWatchLocation } from "hooks/useUserLocation";
import { MapPin, RefreshCw, Navigation, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LocationMapProps {
  location?: string;
  className?: string;
  targetUserId?: string; // If provided, fetches live location from DB
  isAdmin?: boolean;
}

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function MapIframe({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const [error, setError] = useState(false);

  // Google Maps (English)
  const googleSrc = GOOGLE_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=${lat},${lng}&zoom=16&language=en`
    : null;

  // OpenStreetMap with English labels (using Wikimedia tiles for English)
  // Alternative: use &lang=en if supported, or switch to Mapbox
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01
    }%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}&lang=en`;

  const src = googleSrc && !error ? googleSrc : osmSrc;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900">
      <iframe

        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="eager"
        className="absolute inset-0"
        onError={() => setError(true)}
        title={`${name} location`}
        sandbox="allow-scripts"
      />

      {/* Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-white font-medium truncate max-w-[140px]">
              {name}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
            <div className="size-1.5  rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LocationMap({
  location = "Unknown Location",
  className,
  targetUserId,
  isAdmin = false,
}: LocationMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only fetch when expanded and we have a target user
  const shouldFetch = isExpanded && !!targetUserId;

  const { location: liveLocation, isLoading } = useWatchLocation(
    targetUserId ?? null,
    shouldFetch
  );

  // Debug logging
  useEffect(() => {
    if (isExpanded) {
      console.log("LocationMap state:", {
        targetUserId,
        shouldFetch,
        isLoading,
        hasLocation: !!liveLocation,
        liveLocation
      });
    }
  }, [isExpanded, targetUserId, shouldFetch, isLoading, liveLocation]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return `${Math.floor(diff / 3_600_000)}h ago`;
  };

  // Handle expand
  const handleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <div className={className}>
      <motion.div

        animate={{

          height: isExpanded ? 280 : 150,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative w-full"
      >
        <Card
          className="w-full h-full bg-neutral-900 border-neutral-800 overflow-hidden cursor-pointer relative"
          onClick={handleExpand}
        >
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              // COLLAPSED STATE
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full p-4 flex flex-col justify-between relative"
              >
                {/* Grid background */}
                <div className="absolute inset-0 opacity-[0.03]">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                <div className="relative z-10 flex items-start justify-between">
                  <MapPin className="size-4 text-emerald-400" />
                  <span className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {targetUserId ? "Live" : "Location"}
                  </span>
                </div>

                <div className="relative z-10 gap-y-1">
                  <p className="text-white text-sm font-medium truncate">{location}</p>
                  <div className="h-0.5 w-12 bg-emerald-500/60 rounded-full" />
                </div>
              </motion.div>
            ) : (
              // EXPANDED STATE
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative bg-neutral-900"
                onClick={(e) => e.stopPropagation()}
              >
                {!targetUserId ? (
                  // No target user - show placeholder
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                    <MapPin className="size-8 text-gray-600" />
                    <p className="text-xs text-gray-400">No tracking ID</p>
                  </div>
                ) : isLoading ? (
                  // Loading state
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-neutral-900">
                    <div className="relative">
                      <div className="size-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                      <Navigation className="absolute inset-0 m-auto size-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-gray-400">Fetching location&hellip;</p>
                  </div>
                ) : liveLocation ? (
                  // HAS LIVE LOCATION - SHOW MAP
                  <>
                    <MapIframe
                      lat={liveLocation.lat}
                      lng={liveLocation.lng}
                      name={location}
                    />

                    {/* Last updated timestamp */}
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <RefreshCw className="w-2.5 h-2.5 text-gray-400" />
                      <span className="text-[9px] text-gray-300">
                        {formatTimeAgo(liveLocation.updatedAt)}
                      </span>
                    </div>
                  </>
                ) : (
                  // NO LOCATION DATA IN DB
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-neutral-900 p-4">
                    <div className="size-12 rounded-full bg-neutral-800 flex items-center justify-center">
                      <MapPin className="size-5 text-gray-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 font-medium">
                        Location not shared
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        User is offline or hasn't enabled location
                      </p>
                    </div>
                  </div>
                )}

                {/* Close button */}
                <button type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="absolute top-2 right-2 z-30 size-8 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {!isExpanded && (
        <p className="text-[10px] text-gray-600 text-center mt-1.5">
          Click to track location
        </p>
      )}
    </div>
  );
}
