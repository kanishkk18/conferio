import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { UserTask } from "interfaces/task";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Skeleton } from "./ui/skeleton";

export function DatePicker() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { push } = useRouter();

  const filterPendingTasks = (tasks: UserTask[]): UserTask[] => {
    return tasks.filter((task) => !task.itsDone);
  };

  const extractDates = (tasks: UserTask[]): Date[] => {
    return tasks.map((task) => new Date(task.createdAt));
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      push(`/task/date/${selectedDate.toISOString()}`);
    }
    setDate(selectedDate);
  };

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', 'pending'],
    queryFn: async () => {
      const response = await fetch("/api/task", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    }
  });

  const pendingTasks = tasksData ? filterPendingTasks(tasksData) : [];
  const pendingDates = extractDates(pendingTasks);

  return (
    <SidebarGroup className="px-0 text-white">
      <SidebarGroupContent>
        {isLoading ? (
          <div className=" items-center gap-4">
            <div>
              <Skeleton className="w-[232px] ml-2 h-[320px] aspect-square rounded-xl  bg-foreground" />
            </div>
            <div>
              <Skeleton className="w-[232px] ml-2 h-[50px] aspect-square rounded-xl mt-5  bg-foreground" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className="rounded-none bg-transparent shadow-lg text-white"
              classNames={{
                day: "h-8 m-[1.5px] w-8 text-sm flex items-center justify-center rounded-md hover:bg-gray-700",
                day_selected:
                  "bg-indigo-500 text-white font-bold rounded-md hover:bg-indigo-600",
                day_today: "bg-green-500 text-white rounded-md",
                day_outside: "text-gray-500 cursor-not-allowed",
              }}
              modifiers={{
                pending: pendingDates,
              }}
              modifiersClassNames={{
                pending:
                  "bg-gradient-to-r from-[#FFF500] to-[#FF7A00] text-white font-semibold rounded-md hover:bg-transparent",
              }}
            />
            {date && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-300">
                  selected date:{" "}
                  <span className="font-bold text-white">
                    {date.toLocaleDateString()}
                  </span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  pending tasks:{" "}
                  <span className="font-semibold text-orange-400">
                    {
                      pendingTasks.filter(
                        (task) =>
                          new Date(task.createdAt).toDateString() ===
                          date.toDateString()
                      ).length
                    }
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
