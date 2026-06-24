// import Logo from "./logo";
import { Button } from '@/components/ui/button';
import Search from '../../music-components/page/search';
import { Home } from 'lucide-react';
import Link from 'next/link';
// import { Input } from "@/components/ui/input";
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SidebarTrigger } from './sidebar';
import DynamicIslandDemo from '@/components/ui/DynamicIslandDemo';
import { Separator } from '@/components/ui/separator';
import UserComponent from '@/components/ui/comp-377';
import { TaskForm } from '@/components/tasks/task-form';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { CirclePlus } from '@/components/animate-ui/icons/circle-plus';
import Image from 'next/image';

export default function Header() {
  return (
    <div className="flex z-50 h-fit w-full p-1 pb-0 items-center justify-between pl-2 pr-4">
      <div className="flex aspect-square size-8 ml-6 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Image
          src="/logo-transparent.png"
          alt="logo"
          className="p-1 rounded-md h-8 w-8"
          height={1000}
          width={1000}
        />
      </div>

      <div className="flex !justify-end h-full gap-3 !items-end w-[40%] max-w-[40%]">
        <Link
          href="/dashboard"
          className="bg-[#121212] p-2 rounded-full text-neutral-400"
        >
          <Home className="h-6 w-6 font-light " />
        </Link>
        <div className="w-[100%]">
          <Search />
        </div>
      </div>

      <div className="flex w-fit justify-center items-center gap-1">
        <DynamicIslandDemo />
        <Separator orientation="vertical" className="h-6 mr-1" />
        <UserComponent />
      </div>

    </div>
  );
}
