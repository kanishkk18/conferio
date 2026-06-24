// components/time-tracking/TaskSelector.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, Loader2 } from 'lucide-react';
import { Task } from '@prisma/client';

interface TaskWithDetails extends Task {
  column: {
    title: string;
    board: {
      id: string;
      title: string;
    };
  };
  assignees: {
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
  labels: {
    label: {
      name: string;
      color: string;
    };
  }[];
}

interface TaskSelectorProps {
  selectedTaskId: string | null;
  onSelectTask: (task: TaskWithDetails | null) => void;
}

export function TaskSelector({ selectedTaskId, onSelectTask }: TaskSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTasks();
    }
  }, []);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedTaskId && !selectedTask) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) setSelectedTask(task);
    }
  }, [selectedTaskId, tasks]);

  const fetchTasks = async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/time-tracking/tasks?${params}`);
      const data = await res.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useRef(
    debounce((query: string) => {
      fetchTasks(query);
    }, 300)
  ).current;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSelect = (task: TaskWithDetails) => {
    setSelectedTask(task);
    onSelectTask(task);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedTask(null);
    onSelectTask(null);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-700',
      MEDIUM: 'bg-blue-100 text-blue-700',
      HIGH: 'bg-orange-100 text-orange-700',
      URGENT: 'bg-red-100 text-red-700',
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TODO: 'bg-gray-100 text-gray-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      REVIEW: 'bg-yellow-100 text-yellow-700',
      DONE: 'bg-green-100 text-green-700',
    };
    return colors[status] || colors.TODO;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:dark:bg-[#222222] rounded-lg transition-colors text-left"
      >
        {selectedTask ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="size-2 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="truncate text-sm font-medium text-gray-900">
              {selectedTask.title}
            </span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {selectedTask.column.board.title}
            </span>
          </div>
        ) : (
          <span className="text-gray-500 text-sm">Select task</span>
        )}
        <svg
          className={`size-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 dark:bg-[#111111] rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                aria-label='search-task'
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No tasks found
              </div>
            ) : (
              <div className="py-1 rounded-xl dark:border-[#222222]  border overflow-hidden">
                {selectedTask && (
                  <button type="button"
                    onClick={handleClear}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Clear selection
                  </button>
                )}

                {tasks.map((task) => (
                  <button type="button"
                    key={task.id}
                    onClick={() => handleSelect(task)}
                    className={`w-full px-4 py-3 text-left dark:border-[#222222]  border hover:bg-[#222222] transition-colors last:border-0 ${selectedTask?.id === task.id ? 'bg-blue-50' : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {selectedTask?.id === task.id ? (
                          <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="size-3 text-white" />
                          </div>
                        ) : (
                          <div className="size-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-[#B4B4B4] truncate">
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {task.column.board.title} • {task.column.title}
                          </span>
                        </div>

                        {task.assignees.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="flex -gap-x-2">
                              {task.assignees.slice(0, 3).map((assignee) => (
                                <div
                                  key={assignee.user.id}
                                  className="size-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                                  title={assignee.user.name}
                                >
                                  {assignee.user.name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                            {task.assignees.length > 3 && (
                              <span className="text-xs text-gray-500 ml-1">
                                +{task.assignees.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
