"use client"

import {useState, useEffect } from "react";
import {CategoryForm} from "./categories/category-form";

import Categories from "@/components/categories/categories";
import { DatePicker } from "@/components/date-picker";
// import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Category from "interfaces/category";
import Loading from "./common/loading";
import { useQuery } from "@tanstack/react-query";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user] = useState();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch("/api/category", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Error fetching category");
      return response.json();
    }
  });

  const data = {
    user,
    categories,
  };

  return (
    <div className="z-50">
      {/* <Loading isLoading={isLoading} /> */}

      <Sidebar {...props} className="dark">

        <SidebarContent className="z-50 dark">
          <SidebarTrigger className=" bottom-5 -left-2 z-50 bg-blue-600 absolute text-white" />

          <DatePicker />
          <SidebarSeparator className="mx-0" />
          <Categories
            isLoading={isLoading}
            categories={data.categories!}
            setCategories={setCategories}
          />
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center justify-center">
              <CategoryForm setCategories={setCategories} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </div>
  );
}
