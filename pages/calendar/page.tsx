
import { AppSidebar } from "@/components/calendar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/calendar/ui/sidebar";
import BigCalendar from "@/components/calendar/big-calendar";
import { CalendarProvider } from "@/components/calendar/event-calendar/calendar-context";
import ThinSidebar from '@/components/ui/thinSidebar';

export default function Page() {
  return (
    <div className="flex">
      <ThinSidebar/>
    <CalendarProvider>
    <SidebarProvider className="overflow-hidden max-h-screen bg-[#09090B] p-2">
      <AppSidebar/>
      <SidebarInset className="border dark:border-[#27272A] rounded-3xl dark:bg-[#101010] overflow-hidden">
          <BigCalendar />
      </SidebarInset>
    </SidebarProvider>
    </CalendarProvider>
     </div>
  );
}