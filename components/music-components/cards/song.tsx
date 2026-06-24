// "use client";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useContext } from "react";
// import { MusicContext } from "../../../hooks/use-context";
// import { Play } from "lucide-react";
// import { Button } from "../ui/button";

// export default function SongCard({ title, image, artist, id, desc }) {
//     const ids = useContext(MusicContext);
//     const setLastPlayed = () => {
//         localStorage.clear();
//         localStorage.setItem("last-played", id);
//     };
//     return (
//         <div className="h-fit w-[200px] rounded-lg py-2.5 px-3 relative overflow-hidden group hover:bg-[#1F1F1F]">
//             <div className="overflow-hidden rounded-md">
//                 {image ? (
//                     <div className="relative shadow-md" onClick={() => { ids.setMusic(id); setLastPlayed(); }}>
//                         <img src={image} alt={title} className="w-full aspect-square object-cover rounded-md mb-1" />
//                         <Button size="icon" className="absolute right-2 bottom-2 text-white rounded-full bg-blue-600 hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     <Play className="h-4 w-4 text-white fill-white" />
//                   </Button>
//                        </div>
//                 ) : (
//                     <Skeleton className="w-full h-[182px]" />
//                 )}
//             </div>
//             <div className="cursor-pointer">
//                 {title ? (
//                     <div onClick={() => { ids.setMusic(id); setLastPlayed(); }} className=" flex items-center justify-between">
//                         <h1 className="font-medium text-white truncate">{title.slice(0, 20)}{title.length > 20 && '...'}</h1>
//                     </div>
//                 ) : (
//                     <Skeleton className="w-[70%] h-4 mt-2" />
//                 )}
//                 {desc && (
//                     <p className="text-xs text-muted-foreground">{desc.slice(0, 30)}</p>
//                 )}
//                 {artist ? (
//                     <p className="text-sm font-medium text-gray-400 truncate ">{artist.slice(0, 20)}{artist.length > 20 && '...'}</p>
//                 ) : (
//                     <Skeleton className="w-10 h-2 mt-2" />
//                 )}
//             </div>
            
//         </div>
//     )
// }


"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useContext } from "react";
import { MusicContext } from "../../../hooks/use-context";
import { Play } from "lucide-react";
import { Button } from "../ui/button";

export default function SongCard({ title, image, artist, id, desc }: any) {
    const { setMusic } = useContext(MusicContext);

    const play = () => {
        setMusic(id); // Player will detect old vs new ID automatically
    };

    return (
        <div className="h-fit w-[200px] rounded-lg py-2.5 px-3 relative overflow-hidden group hover:bg-[#1F1F1F]">
            <div className="overflow-hidden rounded-md">
                {image ? (
                    <div className="relative shadow-md cursor-pointer" onClick={play}>
                        <img src={image} alt={title} className="w-full aspect-square object-cover rounded-md mb-1" />
                        <Button size="icon" className="absolute right-2 bottom-2 text-white rounded-full bg-blue-600 hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="h-4 w-4 text-white fill-white" />
                        </Button>
                    </div>
                ) : (
                    <Skeleton className="w-full h-[182px]" />
                )}
            </div>
            <div className="cursor-pointer" onClick={play}>
                {title ? (
                    <h1 className="font-medium text-white truncate">
                        {title.slice(0, 20)}{title.length > 20 && '...'}
                    </h1>
                ) : (
                    <Skeleton className="w-[70%] h-4 mt-2" />
                )}
                {desc && <p className="text-xs text-muted-foreground">{desc.slice(0, 30)}</p>}
                {artist ? (
                    <p className="text-sm font-medium text-gray-400 truncate">{artist.slice(0, 20)}{artist.length > 20 && '...'}</p>
                ) : (
                    <Skeleton className="w-10 h-2 mt-2" />
                )}
            </div>
        </div>
    );
}
