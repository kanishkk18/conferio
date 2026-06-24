import { ReactNode } from "react";

import { MusicNav } from "./music-nav";
import { Player } from "./player";
import { useEffect } from "react";
// import MusicProvider from './music-provider';
// import Footer from "./components/page/footer";
// import Header from "./components/page/header";
// import Search from "./components/page/search";
// import MusicPage from '@/pages/music/(root)/page';
import {
  // SidebarInset,
  SidebarProvider,
  // SidebarTrigger,
} from './ui/sidebar';
import { AppSidebar } from './app-sidebar';
import Header from './ui/header';
// import { SearchSection } from '@/components/music-components/ui/SearchSection'

export function MusicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="bg-black dark !overflow-hidden overflow-y-hidden h-screen">
        <SidebarProvider className="overflow-hidden !grid space-y-1.5">
          <Header />
          <main className=" dark !overflow-hidden w-full !relative md:h-[81svh] lg:h-[83svh] lg:max-h-[83svh] flex justify-center items-start gap-x-2 ml-2">
            <AppSidebar /> 
            
            <div className="bg-[#121212] w-full rounded-lg h-full scrollbar-thin2 overflow-y-scroll">
             <MusicNav /> 
             <div className="px-6 pt-8">
             {children}
             </div>
            </div>
          </main>
          
          <Player />
        </SidebarProvider>
      </div>
    </>
  );
}
