"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,

} from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";
import TaskPage from "./page";
import Mainsidebar from "@/components/ui/mainSideBar";
// import { ThemeToggle } from "@/components/ui/ThemeToggle";
// import UserComponent from "@/components/ui/comp-377";
// import DynamicIslandDemo from "@/components/ui/DynamicIslandDemo";


export default function TaskLayout() {
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = currentDateTime
    ? `${currentDateTime.toLocaleString("en-US", {
        weekday: "long",
      })}, ${currentDateTime.toLocaleString("en-US", {
        month: "long",
      })} ${currentDateTime.getDate()}, ${currentDateTime.getFullYear()} - ${currentDateTime.toLocaleTimeString()}`
    : "";

  return (
    <div>
      <SidebarProvider className="h-screen overflow-hidden">
        <Mainsidebar/>
        {/* <AppSidebar /> */}
        <SidebarInset className="dark:bg-[#101011] bg-transparent overflow-y-auto">
          <TaskPage/>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
