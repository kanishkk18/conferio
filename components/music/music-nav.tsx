// import Link from "next/link";
// import { useRouter } from "next/router";
// import {
//   Home,
//   Disc3,
//   ListMusic,
//   Mic2,
//   Radio,
//   History,
//   Heart,
//   Upload,
//   Podcast,
//   Search,
// } from "lucide-react";

// import { cn } from "@/lib/utils";

// const NAV_ITEMS = [
//   { href: "/music", label: "All", icon: Home },
//   // { href: "/music/search", label: "Search", icon: Search },
//   { href: "/music/album", label: "Albums", icon: Disc3 },
//   { href: "/music/chart", label: "Charts", icon: ListMusic },
//   { href: "/music/playlist", label: "Playlists", icon: ListMusic },
//   { href: "/music/show", label: "Podcasts", icon: Podcast },
//   { href: "/music/artist", label: "Artists", icon: Mic2 },
//   { href: "/music/radio", label: "Radio", icon: Radio },
//   // { href: "/music/me/recently-played", label: "Recently Played", icon: History },
//   // { href: "/music/me/liked-songs", label: "Your Favorites", icon: Heart },
//   { href: "/music/me/playlists", label: "My Playlists", icon: ListMusic },
//   { href: "/music/upload", label: "Upload Music", icon: Upload },
// ];

// export function MusicNav() {
//   const router = useRouter();

//   return (
//     <nav className="space-x-1 flex w-full sticky top-0 px-2 z-50 py-4 ">
//       {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
//         const active = router.pathname === href || router.asPath.startsWith(href + "/");

//         return (
//           <Link
//             key={href}
//             href={href}
//             className={cn(
//               " flex items-center gap-3 rounded-full border px-2.5 py-1 text-sm font-medium transition-colors hover:bg-muted",
//               active ? "text-primary" : "text-muted-foreground",
//             )}
//           >
//             {/* <Icon className="h-4 w-4" /> */}
//             {label}
//           </Link>
//         );
//       })}
//     </nav>
//   );
// }

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Home,
  Disc3,
  ListMusic,
  Mic2,
  Radio,
  Podcast,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/music", label: "All", icon: Home },
  { href: "/music/album", label: "Albums", icon: Disc3 },
  { href: "/music/chart", label: "Charts", icon: ListMusic },
  { href: "/music/playlist", label: "Playlists", icon: ListMusic },
  { href: "/music/show", label: "Podcasts", icon: Podcast },
  { href: "/music/artist", label: "Artists", icon: Mic2 },
  { href: "/music/radio", label: "Radio", icon: Radio },
  { href: "/music/me/playlists", label: "My Playlists", icon: ListMusic },
  { href: "/music/upload", label: "Upload Music", icon: Upload },
];

export function MusicNav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll(); // Check initial scroll position
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 flex w-full px-2 py-4 space-x-1 transition-all duration-300",
        scrolled
          ? "bg-gradient-to-r from-purple-900/90 via-purple-600/80 to-indigo-900/90 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-r from-indigo-500/60 via-indigo-500/80 to-indigo-900/90 backdrop-blur-md shadow-lg"
      )}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          router.pathname === href || router.asPath.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-full border px-2.5 py-1 text-sm font-medium transition-colors",
              active
                ? "bg-white/10 text-white border-white/20"
                : "text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}