'use client';

import React, { useState, useEffect, useRef } from 'react';

import Mainsidebar from '@/components/ui/mainSideBar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/dashboardCalendar';
import { CloudSunIcon, Disc2, FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sun } from 'lucide-react';
import { FamilyButtonDemo } from '@/components/ui/multiButton';
import DashMusic from '../music/dashMusic';
import { UserTask } from 'interfaces/task';
import { DashboardTaskList } from '@/components/tasks/dashboard-task-list';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FloatingPanelBody,
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelHeader,
  FloatingPanelRoot,
  FloatingPanelSubmitButton,
  FloatingPanelTrigger,
  useFloatingPanel,
} from '@/components/ui/floatingPanel';
import { Scroll } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList } from '@/components/animate-ui/icons/clipboard-list';
import { AlarmClock } from '@/components/animate-ui/icons/alarm-clock';
import { Header } from '@/components/doc-components/Header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flag } from 'lucide-react';
import { RiGatsbyLine, RiNextjsLine, RiReactjsLine } from '@remixicon/react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from '@/components/ui/animated-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { DropDownCategory } from '@/components/categories/select-category';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PopoverDatePicker from '@/components/ui/popoverPicker';
import { Dayjs } from 'dayjs';
import Category from 'interfaces/category';
import { redirect, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Star, Archive, Trash2, Share2, MoreHorizontal, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoteEditor from '@/components/NoteEditor';
import { CategoryForm } from '@/components/categories/category-form';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Player } from '@/components/music/player';

interface TaskProps {
  task: UserTask[];
  setTask: (value: UserTask[]) => void;
}

interface Note {
  id: string;
  title: string;
  emoji?: string;
  content?: any;
  isArchived: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  preview?: string;
  _count?: { blocks: number };
}

interface Reminder {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
}

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [date, setDate] = useState<Date | undefined>(new Date());
  type ForecastDay = { day: string; temp: number };
  const [task, setTask] = useState<UserTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('3');
  const [createdAt, setCreatedAt] = useState<Dayjs | null>(null);
  const [dueTime, setDueTime] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const isFormValid = title.trim() !== '' && dueTime !== null;
  const router = useRouter();

  const [weather, setWeather] = useState<{
    temperature: string | number;
    feelsLike: string | number;
    high: string | number;
    low: string | number;
    condition: string;
    humidity: string | number;
    wind: string | number;
    precipitation: string | number;
    forecast: ForecastDay[];
  }>({
    temperature: '--',
    feelsLike: '--',
    high: '--',
    low: '--',
    condition: '--',
    humidity: '--',
    wind: '--',
    precipitation: '--',
    forecast: [],
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error fetching location: ', error.message);
          alert('Unable to fetch your location. Please allow location access.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  const hasFetchedTasks = useRef(false);
  if (!hasFetchedTasks.current) {
    hasFetchedTasks.current = true;
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/task', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setTask(data);
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
      setIsLoading(false);
    })();
  }

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!location?.latitude || !location?.longitude) {
          console.log('Waiting for location...');
          return;
        }

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=auto`
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        const mapWeatherCodeToDescription = (code: number): string => {
          const codes: { [key: number]: string } = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Heavy drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            80: 'Rain showers',
            81: 'Moderate showers',
            82: 'Heavy showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with hail',
          };
          return codes[code] || 'Unknown';
        };

        setWeather({
          temperature: data.current_weather.temperature,
          feelsLike: data.current_weather.temperature,
          high: data.daily.temperature_2m_max[0],
          low: data.daily.temperature_2m_min[0],
          condition: mapWeatherCodeToDescription(data.current_weather.weathercode),
          humidity: '--',
          wind: data.current_weather.windspeed,
          precipitation: data.current_weather.precipitation ?? 0,
          forecast: data.daily.temperature_2m_max
            .slice(0, 5)
            .map((temp: number, index: number) => ({
              day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                (new Date().getDay() + index) % 7
              ],
              temp,
            })),
        });
      } catch (error) {
        console.error('Weather fetch failed:', error);
        setWeather((prev) => ({ ...prev, condition: 'Unavailable' }));
      }
    };

    fetchWeather();
  }, [location]);

  const handleNewTask = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    const taskData = {
      title,
      description,
      priority,
      createdAt: createdAt ? createdAt.toISOString() : null,
      dueTime: dueTime ? dueTime.toISOString() : null,
      category: category ? category : null,
    };

    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        body: JSON.stringify(taskData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating new task:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex dark:bg-black w-full h-screen overflow-hidden">
      <Mainsidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="grid grid-cols-[1fr_1.6fr_1fr] flex-1 min-h-0 overflow-hidden">

          <div className="py-2 !px-8 space-y-2 h-full bg-gray-50 dark:bg-[#040404] flex flex-col justify-start items-start overflow-hidden thin-scrollbar relative">
            <Tabs
              defaultValue="Remindar"
              className="py-0 w-full h-2/3 !px-0 overflow-hidden"
            >
              <div className="flex items-center w-full justify-between flex-shrink-0">
                <AnimateIcon animateOnHover className="!px-0 !py-0">
                  <TabsList className="!px-0 !py-0 !h-fit !rounded-xl dark:border-[#171717] border">
                    <TabsTrigger value="Remindar" className="rounded-r-none py-1.5">
                      <AlarmClock />
                    </TabsTrigger>
                    <TabsTrigger value="Notes" className="rounded-l-none py-1.5">
                      <ClipboardList />
                    </TabsTrigger>
                  </TabsList>
                </AnimateIcon>
                <Link href="/task/layout">
                  <Button
                    variant="outline"
                    className="text-yellow-400 px-2 py-3 h-0 dark:text-[#2647eb]"
                  >
                    View all
                  </Button>
                </Link>
              </div>

              <TabsContent
                value="Remindar"
                className="flex-1 min-w-full p-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:flex-1 data-[state=active]:min-h-0 data-[state=active]:overflow-y-auto thin-scrollbar data-[state=active]:items-center data-[state=active]:!gap-y-3"
              >
                <div className="w-full overflow-y-auto thin-scrollbar">
                  {isLoading ? (
                    <div className="flex w-full h-full flex-col justify-center items-center gap-4">
                      <div className="bg-white dark:bg-[#111111] shadow-[0px_18px_50px_-10px_rgba(0,0,0,0.2)] justify-start items-start rounded-[12px] p-5 gap-4 w-full flex">
                        <div className="h-10 w-10 p-2 flex justify-center items-center rounded-[10px] bg-yellow-400 dark:bg-[#2647eb]">
                          <Scroll />
                        </div>
                        <div className="flex flex-col">
                          <p className="bg-black dark:bg-white w-[70px] font-bold h-[12px] mb-1 rounded-xl"></p>
                          <div className="h-[12px] w-[30px] bg-gray-500/55 rounded-xl"></div>
                          <div className="h-[12px] w-[40px] my-2 font-medium bg-yellow-400 dark:bg-[#2647eb] rounded-2xl"></div>
                          <div className="h-[12px] w-[80px] bg-gray-500/55 rounded-xl"></div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-neutral-950 justify-between items-center rounded-[12px] p-3 gap-4 w-full flex">
                        <div className="h-10 w-10 p-2 justify-center items-center rounded-[10px] bg-yellow-400 dark:bg-[#2647eb]"></div>
                        <div className="justify-between text-center items-center gap-8 flex">
                          <p className="bg-black w-[70px] rounded-xl dark:bg-white h-[12px]"></p>
                          <p className="h-[12px] w-[50px] bg-gray-500/55 rounded-xl"></p>
                        </div>
                      </div>
                    </div>
                  ) : task.length > 0 ? (
                    <Remindars task={task} setTask={setTask} />
                  ) : (
                    <div className="flex w-full flex-col justify-center items-center gap-4">
                      <div className="bg-white dark:bg-[#111111] shadow-[0px_18px_50px_-10px_rgba(0,0,0,0.2)] justify-start items-start rounded-[12px] p-5 gap-4 w-full flex">
                        <div className="h-10 w-10 p-2 flex justify-center items-center rounded-[10px] bg-yellow-400 dark:bg-[#2647eb]">
                          <Scroll />
                        </div>
                        <div className="flex flex-col">
                          <p className="bg-black dark:bg-white w-[70px] font-bold h-[12px] mb-1 rounded-xl"></p>
                          <div className="h-[12px] w-[30px] bg-gray-500/55 rounded-xl"></div>
                          <div className="h-[12px] w-[40px] my-2 font-medium bg-yellow-400 dark:bg-[#2647eb] rounded-2xl"></div>
                          <div className="h-[12px] w-[80px] bg-gray-500/55 rounded-xl"></div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-neutral-950 justify-between items-center rounded-[12px] p-3 gap-4 w-full flex">
                        <div className="h-10 w-10 p-2 justify-center items-center rounded-[10px] bg-yellow-400 dark:bg-[#2647eb]"></div>
                        <div className="justify-between text-center items-center gap-8 flex">
                          <p className="bg-black w-[70px] rounded-xl dark:bg-white h-[12px]"></p>
                          <p className="h-[12px] w-[50px] bg-gray-500/55 rounded-xl"></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Reminder Button - keeps its natural height */}
                <FloatingPanelRoot className="w-full bg-transparent h-fit !px-0 !py-0 flex-shrink-0">
                  <FloatingPanelTrigger className="w-full !px-0 !py-0 min-w-full dark:border-[#171717] border h-fit bg-white dark:bg-neutral-950 !rounded-[12px] justify-start items-center gap-4 flex">
                    <div className="bg-white dark:bg-neutral-950 justify-start items-center !rounded-[12px] p-3 gap-4 w-full flex">
                      <div className="h-10 w-10 p-2 justify-center items-center rounded-[10px] bg-yellow-400 dark:bg-[#2647eb]">
                        <Plus className="w-full h-full text-white" />
                      </div>
                      <div className="justify-center items-center gap-4 flex">
                        <p className="text-black text-center font-sans dark:text-white font-semibold text-md">
                          Add Remindar
                        </p>
                      </div>
                    </div>
                  </FloatingPanelTrigger>

                  <FloatingPanelContent className="w-[26rem] ml-20 border-none -mt-20 dark:bg-[#0A0A0A]">
                    <div className="flex flex-col">
                      <div className="!px-6 space-y-4 pb-4 pt-6">
                        <div className="flex justify-start items-center gap-2">
                          <DropDownCategory categoryToSend={category} setCategory={setCategory} />
                          <CategoryForm setCategory={setCategory} />
                        </div>
                        <div className="px-0 space-y-2">
                          <Input
                            placeholder="Reminder Name"
                            className="border-none font-semibold !text-xl hover:bg-muted"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                          <Textarea
                            placeholder="Add Description"
                            className="border-none text-xs hover:bg-muted h-fit"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <PopoverDatePicker date={dueTime} setDate={setDueTime} />
                          <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80 w-fit px-1.5 !py-1 h-fit justify-start text-left font-medium shadow-none dark:bg-[#111111] overflow-hidden text-xs">
                              <Flag className="h-4 w-4 mr-1" /> <SelectValue placeholder="Assignee" />
                            </SelectTrigger>
                            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80">
                              <SelectItem value="high">
                                <span className="truncate">High</span>
                              </SelectItem>
                              <SelectItem value="medium">
                                <span className="truncate">Medium</span>
                              </SelectItem>
                              <SelectItem value="low">
                                <span className="truncate">Low</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="dark:bg-neutral-950 bg-[#eee] mt-auto flex justify-between items-center p-3">
                        <FloatingPanelCloseButton />
                        <div>
                          <Button
                            onClick={handleNewTask}
                            disabled={!isFormValid}
                            className={`font-semibold rounded-lg ${isFormValid
                              ? 'text-white bg-[#6347EA] hover:text-white'
                              : 'text-white bg-[#6347EA] cursor-not-allowed'
                              }`}
                          >
                            Create Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  </FloatingPanelContent>
                </FloatingPanelRoot>
              </TabsContent>

              <TabsContent
                value="Notes"
                className="w-full !px-0 !py-0  data-[state=active]:flex data-[state=active]:flex-col data-[state=active]:flex-1 data-[state=active]:min-h-0 data-[state=active]:items-center data-[state=active]:!gap-y-3 data-[state=active]:mx-auto"
              >
                <NotesPage />
              </TabsContent>
            </Tabs>

            {/* Calendar Container: Exactly 50% of the parent height */}
            <div className="flex items-center w-full min-h-[50%] max-h-[50%] overflow-hidden">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="dark:bg-neutral-950 bg-white w-full rounded-[12px] px-3 py-2 overflow-hidden dark:border-[#171717] border items-center shadow-xs"
              />
            </div>
          </div>
          {/* ═══════ CENTER COLUMN — Dashboard Task List (wider) ═══════ */}
          <div className="overflow-y-auto thin-scrollbar flex flex-col justify-start items-start py-1 px-4">
            <DashboardTaskList />
          </div>

          {/* ═══════ RIGHT COLUMN — Music / Weather / CTA ═══════ */}
          <div className=" px-10 py-2.5 gap-y-3 h-full max-w-full flex flex-col justify-center items-center">

            <div className="w-full">
              <Player />
              {/* <DashMusic/> */}
            </div>

            <FloatingPanelRoot className="flex w-full h-3/3 shadow-md  justify-center dark:border-[#171717] border items-center bg-gray-50 dark:bg-neutral-950 rounded-[14px] flex-col">
              <FloatingPanelTrigger className="bg-transparent h-3/3 dark:bg-transparent py-1 border-none w-full px-6">
                <div className="flex justify-end items-end text-gray-500 pb-4 -mr-8">
                  <p className="font-medium text-sm">{format(new Date(), 'MMMM d, yyyy')}</p>
                </div>
                <div className="flex justify-between gap-4 items-center pb-4">
                  <h1 className="lg:text-[32px] md:text-[24px] text-[16px] font-sans font-semibold">
                    {time.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </h1>
                  <p className="bg-blue-200 text-blue-600 w-fit px-2 rounded-xl">
                    {weather.temperature}°C
                  </p>
                </div>
                <div className="text-[16px] flex text-left justify-start gap-1 items-start font-sans text-gray-700 dark:text-white font-semibold">
                  <span className="text-left flex justify-start gap-2 items-start">
                    <CloudSunIcon className="text-yellow-400 text-start" />
                  </span>
                  <div className="flex gap-3 justify-center items-center">
                    <p className="font-normal text-md">Feels like</p>
                    <span className="font-bold text-neutral-500">
                      {(weather.condition || 'Loading...').slice(0, 12)}
                    </span>
                  </div>
                </div>
              </FloatingPanelTrigger>

              <FloatingPanelContent className="-mt-32 -ml-14 px-6 min-w-2xl border dark:bg-[#111]">
                <FloatingPanelHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sun className="size-8 text-yellow-400 mr-2" />
                      <h1 className="font-semibold text-lg pr-4">Todays Weather</h1>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {weather.temperature}°C
                    </Badge>
                  </div>
                </FloatingPanelHeader>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold">{weather.temperature}°C</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Feels like {weather.feelsLike}°C
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{weather.condition}</p>
                    <FloatingPanelBody>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        High {weather.high}°C / Low {weather.low}°C
                      </p>
                    </FloatingPanelBody>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">5-Day Forecast</h4>
                  {weather.forecast.map((day, index) => (
                    <div key={`${index}-${day.day}`} className="flex justify-between items-center">
                      <span>{day.day}</span>
                      <div className="flex items-center">
                        <Sun className="size-4 text-yellow-400 mr-2" />
                        <span>{day.temp}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
                <FloatingPanelFooter>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated:{' '}
                    {time.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </FloatingPanelFooter>
              </FloatingPanelContent>
            </FloatingPanelRoot>

            {/* <div className="relative group flex w-full h-2/3 shadow-md !gap-y-7 justify-center items-start px-6 bg-gray-50 dark:bg-neutral-950 pt-4 rounded-[14px] flex-col">
              <h1 className="lg:text-[20px] md:text-[20px] text-[16px] leading-tight font-sans font-semibold">
                Unsleash <br /> the professional <br /> super power
              </h1>
              <p className="text-[14px] font-semibold text-gray-400">
                Unlimited conversations, tasks, premium features and much more
              </p>
              <div className="flex items-end">
                <Image
                  height={1000}
                  width={1000}
                  className="h-28 justify-self-end -ml-3 w-auto"
                  src="https://res.cloudinary.com/kanishkkcloud18/image/upload/v1730377159/CONFERIO/ix8hjpuaaqftbagoekit.png"
                  alt=""
                />
                <FamilyButtonDemo />
              </div>
            </div> */}

            <FamilyButtonDemo />

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

export function Remindars({ task, setTask }: TaskProps) {
  const [selectedTask, setSelectedTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = (task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleCheckboxClick = (e, task) => {
    e.stopPropagation() // Prevent modal from opening
    if (!task.itsDone) {
      handleItsDone(task)
    }
  }

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
    <div className="w-full min-h-0 overflow-y-scroll thin-scrollbar space-y-3">

      {task.map((t, i) => (
        <div key={`task-${t.id}`} className="w-full">
          {i === 0 ? (
            <div
              onClick={() => handleOpenModal(t)}
              className="bg-white dark:bg-[#111111] hover:shadow-md transition-all duration-300 justify-start items-start dark:border-[#222] border rounded-[12px] p-5 gap-4 w-full flex cursor-pointer group"
            >
              {/* Icon/Checkbox Swap Container */}
              <div className="relative h-10 w-10 flex-shrink-0">
                {/* Icon - hides on hover */}
                <div className="absolute inset-0 flex justify-center items-center rounded-[10px] bg-yellow-400 dark:bg-[#2647eb] p-2 transition-opacity duration-200 group-hover:opacity-0">
                  {t.category?.icon ? (
                    t.category.icon
                  ) : (
                    <Scroll className="dark:text-white h-5 w-5" />
                  )}
                </div>

                {/* Checkbox - shows on hover */}
                <div className="absolute inset-0 flex justify-center items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Checkbox
                    className='border-yellow-500 dark:border-blue-600 h-5 w-5 data-[state=checked]:bg-yellow-500 dark:data-[state=checked]:bg-blue-600'
                    onClick={(e) => handleCheckboxClick(e, t)}
                    checked={t.itsDone}
                  />
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <p className="text-black dark:text-white font-semibold text-sm">
                  {t.title}
                </p>

                <p className="text-gray-500 font-sans text-xs font-normal">
                  {format(new Date(), 'MMMM d, yyyy')}
                </p>

                <p className="dark:text-[#cfcdcd] text-[11px] px-2 my-2 font-medium uppercase tracking-wider bg-yellow-400 dark:bg-[#2647eba6] rounded-2xl w-fit">
                  {t.priority}
                </p>

                {t.description ? (
                  <p className="text-gray-400 font-normal text-xs">
                    {t.description.slice(0, 25)}...
                  </p>
                ) : (
                  <p className="text-[14px] font-medium text-gray-500">
                    No Description
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* ✨ ALL OTHER CARDS */
            <div className="bg-white dark:bg-neutral-950 justify-between items-center dark:border-[#171717] border rounded-[12px] p-3 gap-4 w-full flex group">
              {/* Container with fixed size for the swap */}
              <div className="relative h-9 w-9 flex-shrink-0">
                {/* Icon - visible by default, hides on hover */}
                <div className="absolute inset-0 flex justify-center items-center rounded-[8px] bg-yellow-400 dark:bg-[#2647eb] p-1 transition-opacity duration-200 group-hover:opacity-0">
                  {t.category?.icon ? (
                    t.category.icon
                  ) : (
                    <Scroll className="dark:text-white h-5 w-5" />
                  )}
                </div>


                <div className="absolute inset-0 flex justify-center items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Checkbox
                    className='border-yellow-500 dark:border-blue-600'
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering card click if parent is clickable
                      !t.itsDone && handleItsDone(t);
                    }}
                    checked={t.itsDone}
                  />
                </div>
              </div>

              <div className="justify-between w-full items-center flex">
                <p className="text-black font-sans dark:text-white font-semibold text-[16px]">
                  {t.title}
                </p>
                <p className="text-gray-500 font-sans text-xs font-normal">
                  {format(typeof t.dueTime === 'string' ? parseISO(t.dueTime) : t.dueTime, 'dd MMM yy')}
                </p>
              </div>
            </div>
          )}
          <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
            <ModalBody>
              <ModalContent className="sm:max-w-[425px] bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
                <ModalHeader>
                  <ModalTitle className="text-black dark:text-white">
                    {selectedTask?.title}
                  </ModalTitle>
                  <ModalDescription className="text-gray-500 dark:text-gray-400">
                    Due: {selectedTask && format(
                      typeof selectedTask.dueTime === 'string'
                        ? parseISO(selectedTask.dueTime)
                        : selectedTask.dueTime,
                      "dd MMM yy"
                    )}
                  </ModalDescription>
                </ModalHeader>

                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">Priority:</span>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-400 dark:bg-[#2647eba6] rounded-full text-black dark:text-white">
                      {selectedTask?.priority}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">Description:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTask?.description || "No description available"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="modal-task-done"
                      checked={selectedTask?.itsDone}
                      onCheckedChange={() => selectedTask && handleItsDone(selectedTask)}
                      className="border-yellow-500 dark:border-blue-600 data-[state=checked]:bg-yellow-500 dark:data-[state=checked]:bg-blue-600"
                    />
                    <label
                      htmlFor="modal-task-done"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      Mark as completed
                    </label>
                  </div>
                </div>
              </ModalContent>
            </ModalBody>
          </Modal>
        </div>
      ))}
    </div>
  );
}

export function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [shareNote, setShareNote] = useState<Note | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  useEffect(() => {
    if (session) fetchNotes();
  }, [session, activeTab]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let url = '/api/notes?';
      if (activeTab === 'archived') url += 'archived=true&';
      else if (activeTab === 'favorites') url += 'favorite=true&';
      else url += 'archived=false&';
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: { blocks: [] } }),
      });
      if (response.ok) {
        const note = await response.json();
        setNotes([note, ...notes]);
        toast.success('Note created');
        return note;
      }
    } catch (error) {
      toast.error('Failed to create note');
    }
    return null;
  };

  const deleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const toggleArchive = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !note.isArchived }),
      });
      if (activeTab !== 'all') setNotes(notes.filter(n => n.id !== note.id));
      else setNotes(notes.map(n => n.id === note.id ? { ...n, isArchived: !n.isArchived } : n));
      toast.success(note.isArchived ? 'Restored' : 'Archived');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const toggleFavorite = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const method = note.isFavorite ? 'DELETE' : 'POST';
      await fetch(`/api/notes/favorite?noteId=${note.id}`, { method });
      if (activeTab === 'favorites' && note.isFavorite) setNotes(notes.filter(n => n.id !== note.id));
      else setNotes(notes.map(n => n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n));
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const togglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      fetchNotes();
    } catch (error) {
      toast.error('Failed to pin');
    }
  };

  const handleShare = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notes/share?noteId=${note.id}`, { method: 'POST' });
      const data = await res.json();
      setShareUrl(data.shareUrl);
      setShareNote(note);
      navigator.clipboard.writeText(data.shareUrl);
      toast.success('Link copied!');
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? { ...n, ...updatedNote } : n));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex w-full h-full flex-col justify-center items-center gap-4">
        <div className="bg-white dark:bg-[#111111] shadow-lg rounded-[12px] p-5 w-full flex animate-pulse">
          <div className="h-10 w-10 rounded-[10px] bg-yellow-400 dark:bg-[#2647eb]" />
          <div className="flex flex-col ml-4 gap-2">
            <div className="bg-gray-300 dark:bg-gray-700 h-4 w-24 rounded" />
            <div className="bg-gray-200 dark:bg-gray-800 h-3 w-16 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <FloatingPanelRoot className="w-full">
      <NotesContent
        notes={notes}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        onToggleArchive={toggleArchive}
        onToggleFavorite={toggleFavorite}
        onTogglePin={togglePin}
        onShare={handleShare}
        onUpdate={handleNoteUpdate}
        setSelectedNote={setSelectedNote}
        selectedNote={selectedNote}
      />

      <Modal open={!!shareNote} onOpenChange={() => setShareNote(null)}>
        <ModalBody>
          <ModalContent className="sm:max-w-md">
            <ModalHeader>
              <ModalTitle>Share Note</ModalTitle>
              <ModalDescription>
                Anyone with this link can view your note
              </ModalDescription>
            </ModalHeader>
            <div className="flex items-center gap-2 mt-4">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>
                Copy
              </Button>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>
    </FloatingPanelRoot>
  );
}

// Inner component to access FloatingPanel context
function NotesContent({
  notes, onCreateNote, onDeleteNote, onToggleArchive,
  onToggleFavorite, onTogglePin, onShare, onUpdate, setSelectedNote, selectedNote
}: any) {
  const { openFloatingPanel, closeFloatingPanel } = useFloatingPanel();
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleNewNote = async () => {
    const note = await onCreateNote();
    if (note && newButtonRef.current) {
      setSelectedNote(note);
      openFloatingPanel(newButtonRef.current.getBoundingClientRect());
    }
  };

  const handleCardClick = (note: Note, e: React.MouseEvent) => {
    // Prevent opening if clicking on buttons inside the card
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="menuitem"]')) {
      return;
    }

    const cardEl = cardRefs.current.get(note.id);
    if (cardEl) {
      setSelectedNote(note);
      openFloatingPanel(cardEl.getBoundingClientRect());
    }
  };

  return (
    <div className="space-y-2">
      <div className="w-full overflow-y-scroll h-[26%] md:max-h-[26%] lg:max-h-[29vh] xl:max-h-[29vh] thin-scrollbar rounded-xl">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No notes yet</div>
        ) : (
          <div className="space-y-2">
            {notes.map((note: Note) => (
              <div
                key={note.id}
                ref={el => { if (el) cardRefs.current.set(note.id, el); }}
                onClick={(e) => handleCardClick(note, e)}
                className={`bg-white dark:bg-[#090909] hover:shadow-md dark:border-[#171717] border transition-all duration-300 justify-start items-start rounded-[12px] p-5 gap-4 w-full flex cursor-pointer group ${note.color ? `border-l-4 border-l-${note.color}` : ''}`}
              >
                <div className="relative h-9 w-9 flex-shrink-0">
                  <div className="flex justify-center items-center rounded-[8px] bg-yellow-400 dark:bg-[#2647eb] p-1 py-1.5">
                    {note.emoji || <FileText className="dark:text-white h-5 w-5" />}
                  </div>
                </div>

                <div className="flex flex-col flex-1">
                  <p className="text-black dark:text-white font-semibold text-sm">{note.title || 'Note'}</p>
                  <p className="text-gray-500 font-sans text-xs font-normal">
                    {format(typeof note.updatedAt === 'string' ? parseISO(note.updatedAt) : note.updatedAt, 'dd MMM yy')}
                  </p>
                  <p className="dark:text-[#cfcdcd] text-[11px] px-2 my-2 font-semibold uppercase tracking-wider bg-yellow-400 dark:bg-[#2647eba6] rounded-2xl w-fit">
                    {note._count?.blocks || 0} blocks
                  </p>
                  <p className="text-gray-400 font-normal text-xs">{note.preview}</p>
                </div>

                <div className="p-2 pt-0 flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => onTogglePin(note, e)}>
                    <Pin className={`h-3 w-3 ${note.isPinned ? 'text-blue-500 fill-blue-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => onToggleFavorite(note, e)}>
                    <Star className={`h-3 w-3 ${note.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => onShare(note, e)}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => onToggleArchive(note, e)}>
                        <Archive className="mr-2 h-4 w-4" /> {note.isArchived ? 'Restore' : 'Archive'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => onDeleteNote(note.id, e)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="default"
        size="lg"
        ref={newButtonRef}
        onClick={handleNewNote}
        className="w-full !px-0 dark:border-[#171717] border !py-0 min-w-full h-full bg-white dark:bg-neutral-950 !rounded-[12px] justify-start items-center gap-4 flex"
      >
        <div className="bg-white dark:bg-neutral-950 justify-start items-center !rounded-[12px] p-3 gap-4 w-full flex">
          <div className="!h-10 !w-10 p-2 flex justify-center items-center rounded-[10px] bg-yellow-400 dark:bg-[#2647eb]">
            <Plus className="!h-full !w-full text-white" />
          </div>
          <div className="justify-center items-center gap-4 flex">
            <p className="text-black text-center font-sans dark:text-white font-medium text-sm">
              Add Note
            </p>
          </div>
        </div>
      </Button>

      {/* Floating Panel Content */}
      <FloatingPanelContent className="w-[500px] ml-20 border-none -mt-40 dark:bg-[#0A0A0A]">
        <FloatingPanelBody className="max-w-4xl h-[80vh] p-0 overflow-y-auto">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onUpdate={onUpdate}
              onClose={closeFloatingPanel}
            />
          ) : (
            <div className="p-8 text-center text-gray-500">Select or create a note</div>
          )}
        </FloatingPanelBody>
        <FloatingPanelFooter>
          <FloatingPanelCloseButton />
          <FloatingPanelSubmitButton />
        </FloatingPanelFooter>
      </FloatingPanelContent>
    </div>
  );
}



