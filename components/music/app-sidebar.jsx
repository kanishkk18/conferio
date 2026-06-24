import {
  GalleryVerticalEnd,
} from "lucide-react"
import { TeamSwitcher } from "../music-components/team-switcher"
import { LibrarySection } from './ui/LibrarySection'
import {ScrollArea, ScrollBar} from "../ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
} from "./ui/sidebar"


export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar collapsible="icon" {...props} className=" pt-2 rounded-lg">
      
      <SidebarContent className="overflow-hidden !relative">
        <ScrollArea className="h-full">
          <LibrarySection/>
          <ScrollBar orientation="vertical" className="hidden" />
        </ScrollArea>
      </SidebarContent>
      
    </Sidebar>)
  );
}
