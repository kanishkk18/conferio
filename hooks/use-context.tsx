"use client"
import { createContext } from "react"

type NextData = {
  id: string;
  name: string;
};

interface NextContextType {
  nextData: NextData;
  // Add more if needed
}

export const MusicContext = createContext(null);


// 👇 Provide default value that satisfies the type or use null with a union
export const NextContext = createContext<NextContextType | null>(null);
