import { FileText, Plus, Upload, CheckCircle, Info, Scroll } from "lucide-react";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { format, parseISO } from 'date-fns'
import { AlarmClock } from "../animate-ui/icons/alarm-clock";
import { UserTask } from 'interfaces/task';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../ui/card";


interface TaskProps {
  task: UserTask[];
  setTask: (value: UserTask[]) => void;
}

export function WikiSection() {
  const [task, setTask] = useState<UserTask[]>([]);

  const { isLoading } = useQuery({
    queryKey: ['wiki-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/task', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setTask(data);
      return data;
    },
  });

  // Verify user on mount
  useQuery({
    queryKey: ['verify-user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/services-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) console.error('Failed to verify user');
      return null;
    },
    staleTime: Infinity,
  });

  return (
    <div className="px-4 mt-4 dark:bg-[#111111] bg-[#fff] py-3 overflow-x-hidden rounded-xl border dark:border-[#222222]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <div className="">
            <AlarmClock className="size-4" />
          </div>
          <span className="text-foreground font-medium text-sm">Remindars</span>
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <button type="button"  className="text-muted-foreground hover:text-foreground">
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex w-full gap-3 justify-start items-center">
        {isLoading ? (
          <div className="flex w-full justify-start items-center gap-4">

            <div className="bg-transparent border rounded-lg px-2 py-0 inline-block">
              <button type="button"  className="flex items-center gap-3 hover:bg-secondary rounded p-2 transition-colors">
                <div className="size-8 bg-secondary rounded flex items-center justify-center">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground font-medium text-sm">Project Notes</span>
                    <CheckCircle className="w-3.5 h-3.5 text-blue" />
                  </div>
                  <span className="text-muted-foreground text-xs">Nov 13</span>
                </div>
              </button>
            </div>
          </div>
        ) : task.length > 0 ? (
          <Remindars task={task} setTask={setTask} />
        ) : (
          <div className="bg-transparent border rounded-lg px-2 py-0 inline-block">
            <button type="button"  className="flex items-center gap-3 hover:bg-secondary rounded p-2 transition-colors">
              <div className="size-8 bg-secondary rounded flex items-center justify-center">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground font-medium text-sm">No remindar</span>
                  <CheckCircle className="w-3.5 h-3.5 text-blue" />
                </div>
                <span className="text-muted-foreground text-xs"></span>
              </div>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export function Remindars({ task, setTask }: TaskProps) {
  const handleItsDone = async (selectedTask: UserTask) => {
    try {
      const response = await fetch(`/api/task`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itsDone: true, id: selectedTask.id }),
      });

      if (!response.ok) {
        throw new Error('Error updating task status');
      }

      const updatedTasks = task.map((t) =>
        t.id === selectedTask.id ? { ...t, itsDone: true } : t
      );
      setTask(updatedTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <>

      {task.slice(0, 5).map((t) => (
        <div key={`task-${t.id}`}>

          <Card className="bg-transparent w-[250px] dark:hover:bg-[#222222] border rounded-lg px-3 py-2 inline-block">
            <div className="flex items-center gap-3 rounded transition-colors">

              <AnimateIcon animateOnHover>
                <div className="size-8 flex justify-center items-center dark:bg-[#191919] rounded-[4px] border">
                  {t.category?.icon ? (
                    <div className="text-white -mt-1">
                      {t.category.icon}
                    </div>
                  ) : (
                    <AlarmClock className="dark:text-[#7F7F7F] h-5 w-5" />
                  )}
                </div>
              </AnimateIcon>

              <div className="text-left w-full">
                <div className="flex flex-col">
                  <span className="text-foreground font-medium text-sm"> {t.title}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">{format(parseISO(t.dueTime), " MMM dd")}</span>
                    <p className="dark:text-[#cfcdcd] text-white text-[10px] px-2 py-1 font-medium bg-yellow-400 dark:bg-[#191919] rounded-2xl w-fit">
                      {t.priority}
                    </p></div>
                </div>
              </div>
            </div>
          </Card>


        </div>
      ))}

    </>
  );
}
