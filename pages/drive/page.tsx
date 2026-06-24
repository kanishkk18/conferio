import { AppSidebar } from '@/components/file-manager/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/file-manager/components/ui/sidebar';
import TableUpload from '@/components/file-manager/table-upload';
import { ScrollArea } from '@/components/ui/scroll-area';
import ThinSidebar from '@/components/ui/thinSidebar';

export default function Page() {
  return (
    <div className='flex'>
      <ThinSidebar />
      <SidebarProvider className=" bg-[#FFFFFF] dark:bg-[#09090B] p-2 overflow-hidden">
        <AppSidebar className=" h-screen mr-2 w-60 bg-transparent" />
        <SidebarInset className=" border flex flex-col dark:border-[#27272A] dark:bg-[#101010] bg-[#F4F4F4] rounded-3xl overflow-hidden">
          <ScrollArea className="py-2 px-0 thin-scrollbar2">
            <TableUpload />
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
