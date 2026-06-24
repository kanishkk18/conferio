"use client";
import { Button } from "../ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TaskForm } from "./task-form";

export default function TaskEmptyState() {

  return (
    <div className="flex flex-col justify-center items-center h-screen pb-32">
      <Image
        width={1000}
        height={1000}
        alt="task-empty"
        src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1767042695/task2_mqo7sm.png"
        className="w-auto rounded-sm mb-3 h-[280px]"
      />
      <p className="text-md text-center mb-3 dark:text-white truncate font-semibold">
        Start by adding your task and organizing your day.
      </p>
      
     <TaskForm>
          <Button className="px-6 py-3 bg-[#5C47CD] text-white rounded-md shadow-md hover:bg-primary-dark">
            Add Task
          </Button>
      </TaskForm>

    
    </div>
  );
}
