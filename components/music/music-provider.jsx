// "use client"
// import { MusicContext } from "hooks/use-context";
// import { useEffect, useState } from "react";
// // import Player from "./cards/player";

// export default function MusicProvider({ children }) {
//     const [music, setMusic] = useState(null);

//     useEffect(() => {
//         if (localStorage.getItem("last-played")) {
//             setMusic(localStorage.getItem("last-played"));
//         }
//     }, []);

//     return (
//         <MusicContext.Provider value={{ music, setMusic }}>
//             {children}
//         </MusicContext.Provider>
//     )
// }

"use client";
import { MusicContext } from "hooks/use-context";
import { useState } from "react";

export default function MusicProvider({ children }) {
    const [music, setMusicState] = useState(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem("conferio-player-id") || null;
    });

    const setMusic = (value) => {
        setMusicState(value);
        // Support both string IDs and full track objects
        if (typeof value === "string") {
            localStorage.setItem("conferio-player-id", value);
        } else if (value?.id) {
            localStorage.setItem("conferio-player-id", value.id);
        } else {
            localStorage.removeItem("conferio-player-id");
        }
    };

    return (
        <MusicContext.Provider value={{ music, setMusic }}>
            {children}
        </MusicContext.Provider>
    );
}
