// "use client";

// import { useEffect, useState } from "react";
// import TaskEmptyState from "@/components/tasks/task-empty-state";
// import { UserTask } from "interfaces/task";
// import { TaskList } from "@/components/tasks/task-list";
// import TaskSkeleton from "@/components/tasks/task-skeleton";
// import CircularText from "@/components/ui/CircularTextLoader";

// export default function TaskPage() {
//   const [task, setTask] = useState<UserTask[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch("/api/tasks", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch user data");
//         }

//         const data = await response.json();
//         setTask(data);
//       } catch (error) {
//         console.error("Error fetching user session:", error);
//       }
//       setIsLoading(false);
//     };

//     const verifyUser = async () => {
//       const response = await fetch("/api/auth/services-signin", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         console.error("Failed to verify user");
//       }
//     };

//     fetchTasks();
//     verifyUser();
//   }, []);

//   return (
//     <div>
//       {isLoading ? (
//         <div className="min-h-screen flex items-center justify-center">
//                      <CircularText
//                 text="CONFERIO*CALLS*"
//                 onHover="speedUp"
//                 spinDuration={5}
//                 className="custom-class"
//               />
//                     </div>
//       ) : task.length > 0 ? (
//         <TaskList task={task} setTask={setTask} />
//       ) : (
//         <TaskEmptyState />
//       )}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TaskEmptyState from "@/components/tasks/task-empty-state";
import { UserTask } from "interfaces/task";
import { TaskList } from "@/components/tasks/task-list";
import CircularText from "@/components/ui/CircularTextLoader";
import BoardsProvider from "store/BoardListContext";
import { Tabs } from "@/components/ui/tabs";

export default function TaskPage() {
  const [tasks, setTasks] = useState<UserTask[]>([]);

  const { isLoading } = useQuery({
    queryKey: ["tasksPage"],
    queryFn: async () => {
      const response = await fetch("/api/task", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      const transformedTasks = data.map((task: any) => ({
        id: task.uuid || task.id,
        title: task.name,
        description: task.description,
        priority: task.priority || "medium",
        dueTime: task.due_date || task.createdAt,
        createdAt: task.created_at || task.createdAt,
        itsDone: task.completed || task.itsDone || false,
        category: task.category || {
          name: task.column?.name || "No Category",
          color: task.column?.color,
          icon: task.column?.icon,
        },
      }));

      setTasks(transformedTasks);
      return transformedTasks;
    },
  });

  const handleTaskUpdate = (updatedTask: UserTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <Tabs>
      <BoardsProvider>
        <div>
          {isLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <CircularText
                text="CONFERIO*CALLS*"
                onHover="speedUp"
                spinDuration={5}
                className="custom-class"
              />
            </div>
          ) : tasks.length > 0 ? (
            <TaskList
              task={tasks}
              setTask={setTasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
            />
          ) : (
            <TaskEmptyState />
          )}
        </div>
      </BoardsProvider>
    </Tabs>
  );
}