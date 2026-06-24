"use client";

import TaskEmptyState from "@/components/tasks/task-empty-state";
import { TaskList } from "@/components/tasks/task-list";
import TaskSkeleton from "@/components/tasks/task-skeleton";
import { UserTask }from "interfaces/task";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function TaskbyCategoryPage() {
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const { id } = useParams();

  const { isLoading } = useQuery({
    queryKey: ['tasks-by-category', id],
    queryFn: async () => {
      const response = await fetch(`/api/task?categoryId=${id}`);
      const data = await response.json();
      setTasks(data);
      return data;
    },
    enabled: !!id,
  });

  return (
    <div>
      {isLoading ? (
        <TaskSkeleton />
      ) : tasks.length > 0 ? (
        <TaskList task={tasks} setTask={setTasks} />
      ) : (
        <TaskEmptyState />
      )}
    </div>
  );
}
