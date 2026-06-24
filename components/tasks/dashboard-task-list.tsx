// 'use client';

// import { UserTask } from 'interfaces/task';
// import { Plus, Scroll } from 'lucide-react';
// import moment from 'moment';
// import { Checkbox } from '../ui/checkbox';
// import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
// import { TaskForm } from './task-form';

// interface TaskProps {
//   task: UserTask[];
//   setTask: (value: UserTask[]) => void;
// }

// export function DashboardTaskList({ task, setTask }: TaskProps) {
//   const handleItsDone = async (selectedTask: UserTask) => {
//     try {
//       const response = await fetch(`/api/task`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ itsDone: true, id: selectedTask.id }),
//       });

//       if (!response.ok) {
//         throw new Error('Error updating task status');
//       }

//       const updatedTasks = task.map((t) =>
//         t.id === selectedTask.id ? { ...t, itsDone: true } : t
//       );
//       setTask(updatedTasks);
//     } catch (error) {
//       console.error('Error updating task status:', error);
//     }
//   };

//   return (
//     <div className="w-full">
//       {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
//         {task.map((t, i) => (
//           <div
//             key={`task-${i}`}
//             className="relative aspect-square rounded-xl p-6 text-white shadow-md"
//             style={{ backgroundColor: t.category?.color || "#18181b" }}
//           >
//             <div className="flex gap-2 items-center">
//               <span
//                 className="bg-foreground pl-2 w-16 rounded-lg flex items-center"
//                 style={{
//                   fontSize: "2rem",
//                 }}
//               >
//                 {t.category?.icon ? (
//                   t.category?.icon
//                 ) : (
//                   <div className="p-1">
//                     <Scroll className="size-10 " />
//                   </div>
//                 )}
//               </span>
//               <h2 className="text-lg font-bold truncate">{t.title}</h2>
//             </div>

//             {t.description ? (
//               <div className="mt-2">
//                 <span className="font-semibold">Description</span>
//                 <p className="rounded-lg mt-2 text-sm text-gray-200">
//                   {t.description}
//                 </p>
//               </div>
//             ) : (
//               <div className="mt-2">
//                 <span className="font-semibold">No Description</span>
//               </div>
//             )}

//             <div className="absolute bottom-4 left-4 right-4 flex justify-between">
//               <div className="text-sm">
//                 <p>
//                   <span className="font-semibold">Due:</span>{" "}
//                   {new Date(t.dueTime).toLocaleString()}
//                 </p>
//                 <p>
//                   <span className="font-semibold">Priority:</span> {t.priority}
//                 </p>

//                 <p className="mt-2 text-xs text-gray-300">
//                   Created: {new Date(t.createdAt).toLocaleString()}
//                 </p>
//               </div>

//               <div className="absolute right-0 bottom-0 p-0">
//                 <button type="button"
//                   onClick={() => !t.itsDone && handleItsDone(t)}
//                   className={
//                     t.itsDone
//                       ? "bg-ItsDone cursor-not-allowed text-black hover:bg-ItsDone"
//                       : "hover:bg-ItsDone"
//                   }
//                 >
//                   {t.itsDone ? "It's Done" : "Pending"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         ))}

//         <div className="flex flex-col justify-center aspect-square rounded-xl bg-primary h-full gap-1">
//           <div className="text-sm text-muted-foreground text-white p-4 items-center flex justify-center">
//             <p>Do you have any ideas? Let&apos;s create them</p>
//           </div>
//           <div className="flex justify-center items-center">
//             <button type="button"
//               onClick={handleAddTask}
//               className="px-8 py-3 bg-ItsDone text-black rounded-md shadow-md hover:bg-foreground hover:text-white"
//             >
//               Add Task
//             </Button>
//           </div>
//         </div>

//         {Array.from({ length: emptyBlocks }).map((_, i) => (
//           <div
//             key={`empty-${i}`}
//             className="aspect-square rounded-xl bg-primary"
//           />
//         ))}
//       </div> */}
//       <div className="flex mt-2 w-[100%] px-4 justify-between items-center">
//         <div className="flex flex-col">
//           <h1 className="text-black dark:text-white font-semibold text-[32px]">
//             Scheduled Tasks
//           </h1>
//           <h1 className="text-yellow-400 dark:text-[#2647eb] font-semibold text-[32px]">
//             {moment().format('dddd D')}
//           </h1>
//         </div>

//         <Dialog>
//           <DialogTrigger>
//             <div className="text-white bg-yellow-400 dark:bg-[#2647eb] rounded-lg">
//               <Plus className="size-10 p-2" />{' '}
//             </div>
//           </DialogTrigger>
//           <DialogContent>
//             <TaskForm />
//           </DialogContent>
//         </Dialog>
//       </div>

//       {task.map((t, i) => (
//         <div className="" key={`task-${i}`}>
//           {/* <div className="px-4 w-full mt-4 gap-2 flex justify-center items-center"><Minus/>
//       <div className="bg-yellow-400 dark:bg-[#2647eb] p-4 flex justify-between items-center px-6 rounded-[14px] w-[100%] ">
//         <div className="flex gap-4 justify-center items-center">
//         <div className="bg-white flex justify-center items-center rounded-lg size-8 p-1"><AlarmClock/>
//         </div>
//         <p className='text-[16px] font-sans text-black dark:text-white font-bold '>Wake up buddy</p>
//         </div>
//         <p className='text-[16px] font-sans text-gray-700 dark:text-white font-semibold'>7:00 AM</p>
//       </div>
//       </div>

//       <div className="px-4 w-full mt-4 gap-2 flex justify-center items-center"><Minus/>
//       <div className="bg-yellow-400 dark:bg-[#2647eb] p-4 flex justify-between items-center px-6 rounded-[14px] w-[100%] ">
//         <div className="flex gap-4 justify-center items-center">
//         <div className="bg-white flex justify-center items-center rounded-lg size-8 p-1"><IconYoga/>
//         </div>
//         <p className='text-[16px] font-sans text-black dark:text-white font-bold '>morning yoga</p>
//         </div>
//         <p className='text-[16px] font-sans text-gray-700 dark:text-white font-semibold'>8:00 AM</p>
//       </div>
//       </div> */}

//           <div className="px-4 w-full mt-4 gap-2 flex justify-center items-center">
//             <div className="">
//              <Checkbox onClick={() => !t.itsDone && handleItsDone(t)} checked={t.itsDone}/>
//             </div>
//             <div className="bg-gray-100 dark:bg-neutral-950 py-4 flex justify-between items-start px-6 rounded-[14px] w-[100%] ">
//               <div className="flex gap-4 justify-center items-start">
//                 <div className="bg-white flex justify-center items-center rounded-lg size-8 p-1">
//                   {t.category?.icon ? (
//                     t.category?.icon
//                   ) : (
//                     <Scroll className="dark:text-black" />
//                   )}
//                 </div>
//                 <div className="text-[16px] font-sans flex flex-col text-black dark:text-white font-bold ">
//                   <h1>{t.title}</h1>
//                   <div className="flex flex-col gap-2 list-disc"></div>
//                   {t.description ? (
//                     <div className="mt-1">
//                       <p className="text-[14px] font-sans font-medium text-gray-500">
//                         {t.description}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="mt-1">
//                       <p className="text-[14px] font-sans font-medium text-gray-500">
//                         No Description
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <p className="text-[16px] font-sans text-gray-700 dark:text-white font-semibold">
//                 {' '}
//                 {moment(t.dueTime).format('D MMM')}
//               </p>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }



// 'use client';

// import { UserTask } from 'interfaces/task';
// import { Plus, Scroll } from 'lucide-react';
// import moment from 'moment';
// import { Checkbox } from '../ui/checkbox';
// import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
// import { TaskForm } from './task-form';
// import React, {
//   useRef,
//   useState,
//   useEffect,
//   ReactNode,
//   MouseEventHandler,
//   UIEvent,
//   FC,
// } from "react";
// import { motion, useInView } from "motion/react";
// import Board from '../Board/Board';
// import useModal from 'hooks/useModal';
// import { mutate } from 'swr';
// import TaskDetails from '../Modals/TaskDetails';
// import { Card, CardContent } from '../ui/card';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { Button } from '../ui/button';
// import { useBoardsContext } from 'store/BoardListContext';


// interface AnimatedItemProps {
//   children: ReactNode;
//   delay?: number;
//   index: number;
//   onMouseEnter?: MouseEventHandler<HTMLDivElement>;
//   onClick?: MouseEventHandler<HTMLDivElement>;
// }

// const AnimatedItem: React.FC<AnimatedItemProps> = ({
//   children,
//   delay = 0,
//   index,
//   onMouseEnter,
//   onClick,
// }) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { amount: 0.5, once: false });
//   return (
//     <motion.div
//       ref={ref}
//       data-index={index}
//       onMouseEnter={onMouseEnter}
//       onClick={onClick}
//       initial={{ scale: 0.7, opacity: 0 }}
//       animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
//       transition={{ duration: 0.2, delay }}
//       className="mb-4 cursor-pointer"
//     >
//       {children}
//     </motion.div>
//   );
// };

// interface AnimatedListProps {
//   items?: string[];
//   onItemSelect?: (item: string, index: number) => void;
//   showGradients?: boolean;
//   enableArrowNavigation?: boolean;
//   className?: string;
//   itemClassName?: string;
//   displayScrollbar?: boolean;
//   initialSelectedIndex?: number;
// }

// interface TaskProps {
//   task: UserTask[];
//   setTask: (value: UserTask[]) => void;
//   onItemSelect?: (item: UserTask, index: number) => void;
//   showGradients?: boolean;
//   enableArrowNavigation?: boolean;
//   className?: string;
//   itemClassName?: string;
//   displayScrollbar?: boolean;
//   initialSelectedIndex?: number;
// }

// const BoardLink: FC<{ board }> = ({ board }) => {
//   // const isActive = router.query.boardId === board.uuid;
//   // const imageUrl = `https://picsum.photos/seed/${board.uuid}/400/200`;
//   const router = useRouter();
//   const [imageUrl, setImageUrl] = useState(
//     'https://i.pinimg.com/1200x/46/f0/5c/46f05c604d64a25948b9ad15ba4ee35a.jpg'
//   );

//   useEffect(() => {
//     const fetchImage = async () => {
//       try {
//         const res = await fetch(`/api/board-image?q=${board.name}`);
//         const data = await res.json();
//         if (data.imageUrl) {
//           setImageUrl(data.imageUrl);
//         }
//       } catch (err) {
//         console.error('Image fetch error:', err);
//       }
//     };

//     fetchImage();
//   }, [board.name]);

//   return (
//     <>
//       <Card className="h-36 dark:bg-[#1e1e1f] bg-[#F9F9FA] w-40 p-0 overflow-hidden border-none shadow-md rounded-lg">
//         <CardContent className="flex flex-col space-y-6 p-2 bg-transparent boder-none overflow-hidden h-full w-full ">
//           <Image
//             src={imageUrl}
//             alt="Add Board"
//             width={1000}
//             height={1000}
//             className="object-cover h-[8.5rem] w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
//           />
//           <div className=" flex !gap-x-2 justify-center items-center ">
//             <button type="button"
//               onClick={(e) => router.push(`/${board.uuid}`)}
//               variant="outline"
//               size="sm"
//               className="w-full hover:bg-neutral-900 text-white border-none bg-[#5C47CD]"
//             >
//               {board.name}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </>
//   );
// };

// export function DashboardTaskList({ task, setTask, onItemSelect,
//   handleBoardSelect,
//   showGradients = true,
//   enableArrowNavigation = true,
//   className = "",
//   itemClassName = "",
//   displayScrollbar = true,
//   initialSelectedIndex = -1, }) {
//     const {
//       selectedBoard,
//       selectedTask,
//       setSelectedTask,
//       isLoading,
//       boards,
//       isValidating,
//     } = useBoardsContext();
//   const listRef = useRef<HTMLDivElement>(null);
//   const [selectedIndex, setSelectedIndex] =
//     useState<number>(initialSelectedIndex);
//   const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
//   const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
//   const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);
//   const taskDetailsModal = useModal();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const Modal = taskDetailsModal.Component;
//   const boardSelectHandler = () => {
//     handleBoardSelect && handleBoardSelect();
//     setDialogOpen(false);
//   };

//   const handleScroll = (e: UIEvent<HTMLDivElement>) => {
//     const { scrollTop, scrollHeight, clientHeight } =
//       e.target as HTMLDivElement;
//     setTopGradientOpacity(Math.min(scrollTop / 50, 1));
//     const bottomDistance = scrollHeight - (scrollTop + clientHeight);
//     setBottomGradientOpacity(
//       scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
//     );
//   };

//   useEffect(() => {
//     if (!enableArrowNavigation) return;
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
//         e.preventDefault();
//         setKeyboardNav(true);
//         setSelectedIndex((prev) => Math.min(prev + 1, task.length - 1));
//       } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
//         e.preventDefault();
//         setKeyboardNav(true);
//         setSelectedIndex((prev) => Math.max(prev - 1, 0));
//       } else if (e.key === "Enter") {
//         if (selectedIndex >= 0 && selectedIndex < task.length) {
//           e.preventDefault();
//           if (onItemSelect) {
//             onItemSelect(task[selectedIndex], selectedIndex);
//           }
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [task, selectedIndex, onItemSelect, enableArrowNavigation]);

//   useEffect(() => {
//     if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
//     const container = listRef.current;
//     const selectedItem = container.querySelector(
//       `[data-index="${selectedIndex}"]`
//     ) as HTMLElement | null;
//     if (selectedItem) {
//       const extraMargin = 50;
//       const containerScrollTop = container.scrollTop;
//       const containerHeight = container.clientHeight;
//       const itemTop = selectedItem.offsetTop;
//       const itemBottom = itemTop + selectedItem.offsetHeight;
//       if (itemTop < containerScrollTop + extraMargin) {
//         container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
//       } else if (
//         itemBottom >
//         containerScrollTop + containerHeight - extraMargin
//       ) {
//         container.scrollTo({
//           top: itemBottom - containerHeight + extraMargin,
//           behavior: "smooth",
//         });
//       }
//     }
//     setKeyboardNav(false);
//   }, [selectedIndex, keyboardNav])


//   const handleItsDone = async (selectedTask: UserTask) => {
//     try {
//       const response = await fetch(`/api/task`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ itsDone: true, id: selectedTask.id }),
//       });

//       if (!response.ok) {
//         throw new Error('Error updating task status');
//       }

//       const updatedTasks = task.map((t) =>
//         t.id === selectedTask.id ? { ...t, itsDone: true } : t
//       );
//       setTask(updatedTasks);
//     } catch (error) {
//       console.error('Error updating task status:', error);
//     }
//   };

//   useEffect(() => {
//     if (selectedTask) {
//       taskDetailsModal.open();
//     }
//   }, [selectedTask, taskDetailsModal]);

//   useEffect(() => {
//     if (selectedBoard && !taskDetailsModal.isOpen) {
//       setSelectedTask(null);
//       mutate(`/api/boards/${selectedBoard.uuid}`);
//     }
//   }, [taskDetailsModal.isOpen]);

//   return (
//     <div className="w-full">

//       <div className="flex mb-4 w-[100%] px-4 py-0 justify-between items-center">
//         <div className="flex flex-col">
//           <h1 className="text-black dark:text-white font-semibold text-[32px]">
//             Scheduled Tasks
//           </h1>
//           <h1 className="text-yellow-400 dark:text-[#2647eb] font-semibold text-[32px]">
//             {moment().format('dddd D')}
//           </h1>
//         </div>

//         <TaskForm>
//           <div className="text-white bg-yellow-400 dark:bg-[#2647eb] rounded-lg">
//             <Plus className="size-10 p-2" />{' '}
//           </div>
//         </TaskForm>

//       </div>

//       <main className="text-semibold bg-white/30 dark:bg-black/50 min-w-[60%] w-full max-w-[100%] box-shadow dark:shadow-none rounded-2xl m-0 min-h-[88vh] max-h-[89vh] px-4 py-6 text-center border-b border-r dark:border-[#262626] font-jakarta text-lg text-mid-grey">
//         {selectedBoard ? (
//           <div className="">
//             <div className=" overflow-x-auto max-h-full h-[80vh] overflow-y-scroll thin-scrollbar">
//               <Board boardUUID={selectedBoard.uuid[0]} />
//             </div>
//           </div>
//         ) : (
//           <div className="flex h-full items-center justify-center ">
//             {isLoading || isValidating ? (
//               <div className="h-[89vh] flex items-center justify-center">

//               </div>
//             ) : (
//               <div className="max-h-[95%] h-[95%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 px-4">
//                 <div className="h-52 dark:bg-[#1e1e1f] bg-[#F9F9FA] w-64 p-0 overflow-hidden border-none shadow-md rounded-lg">
// kjjkkjk
//                 </div>

//                 {boards?.map((board) => (
//                           <div key={board.uuid} onClick={boardSelectHandler}>
//                             <BoardLink board={board} />
//                           </div>
//                         ))}
//               </div>
//             )}
//           </div>
//         )}
//         {/* <Modal> */}
//         {selectedBoard && selectedTask && (
//           <TaskDetails
//             closeModal={taskDetailsModal.close}
//             taskUUID={selectedTask}
//             columns={selectedBoard.columns}
//           />
//         )}
//       </main>

//       {task.map((t, i) => (
//         <div key={`task-${i}`} ref={listRef}
//           className={` overflow-y-auto ${displayScrollbar
//               ? "[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]"
//               : "scrollbar-hide"
//             }`}
//           onScroll={handleScroll}
//           style={{
//             scrollbarWidth: displayScrollbar ? "thin" : "none",
//             scrollbarColor: "#222 #060010",
//           }}>

//           <AnimatedItem

//             delay={0.1}
//             index={i}
//             onMouseEnter={() => setSelectedIndex(i)}
//             onClick={() => {
//               setSelectedIndex(i);
//               if (onItemSelect) {
//                 onItemSelect(t, i);
//               }
//             }}
//           >
//             <div
//               className={` ${selectedIndex === i ? "" : ""} ${itemClassName}`}
//             >


//               <div className="px-4 w-full gap-2 flex justify-center items-center">
//                 <div className="">
//                   <Checkbox className='border-yellow-500 dark:border-blue-600' onClick={() => !t.itsDone && handleItsDone(t)} checked={t.itsDone} />
//                 </div>
//                 <div className="bg-gray-100 dark:bg-neutral-950 py-4 flex justify-between items-start px-6 rounded-[14px] w-[100%] ">
//                   <div className="flex gap-4 justify-center items-start">
//                     <div className="bg-white flex justify-center items-center rounded-lg size-8 p-1">
//                       {t.category?.icon ? (
//                         t.category?.icon
//                       ) : (
//                         <Scroll className="dark:text-black" />
//                       )}
//                     </div>
//                     <div className="text-[16px] font-sans flex flex-col text-black dark:text-white font-bold ">
//                       <h1>{t.title}</h1>
//                       <div className="flex flex-col gap-2 list-disc"></div>
//                       {t.description ? (
//                         <div className="mt-1">
//                           <p className="text-[14px] w-xs max-w-xs font-sans font-medium text-gray-500">
//                             {t.description.slice(0, 92)}...
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="mt-1">
//                           <p className="text-[14px] font-sans font-medium text-gray-500">
//                             No Description
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <p className="text-[16px] font-sans text-gray-700 dark:text-white font-semibold">
//                     {' '}
//                     {moment(t.dueTime).format('D MMM')}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </AnimatedItem>

//         </div>
//       ))}
//     </div>
//   );
// }


// 'use client';

// import { UserTask } from 'interfaces/task';
// import { Plus, Scroll } from 'lucide-react';
// import moment from 'moment';
// import { Checkbox } from '../ui/checkbox';
// import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
// import { TaskForm } from './task-form';

// interface TaskProps {
//   task: UserTask[];
//   setTask: (value: UserTask[]) => void;
// }

// export function DashboardTaskList({ task, setTask }: TaskProps) {
//   const handleItsDone = async (selectedTask: UserTask) => {
//     try {
//       const response = await fetch(`/api/task`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ itsDone: true, id: selectedTask.id }),
//       });

//       if (!response.ok) {
//         throw new Error('Error updating task status');
//       }

//       const updatedTasks = task.map((t) =>
//         t.id === selectedTask.id ? { ...t, itsDone: true } : t
//       );
//       setTask(updatedTasks);
//     } catch (error) {
//       console.error('Error updating task status:', error);
//     }
//   };

//   return (
//     <div className="w-full">
//       {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
//         {task.map((t, i) => (
//           <div
//             key={`task-${i}`}
//             className="relative aspect-square rounded-xl p-6 text-white shadow-md"
//             style={{ backgroundColor: t.category?.color || "#18181b" }}
//           >
//             <div className="flex gap-2 items-center">
//               <span
//                 className="bg-foreground pl-2 w-16 rounded-lg flex items-center"
//                 style={{
//                   fontSize: "2rem",
//                 }}
//               >
//                 {t.category?.icon ? (
//                   t.category?.icon
//                 ) : (
//                   <div className="p-1">
//                     <Scroll className="size-10 " />
//                   </div>
//                 )}
//               </span>
//               <h2 className="text-lg font-bold truncate">{t.title}</h2>
//             </div>

//             {t.description ? (
//               <div className="mt-2">
//                 <span className="font-semibold">Description</span>
//                 <p className="rounded-lg mt-2 text-sm text-gray-200">
//                   {t.description}
//                 </p>
//               </div>
//             ) : (
//               <div className="mt-2">
//                 <span className="font-semibold">No Description</span>
//               </div>
//             )}

//             <div className="absolute bottom-4 left-4 right-4 flex justify-between">
//               <div className="text-sm">
//                 <p>
//                   <span className="font-semibold">Due:</span>{" "}
//                   {new Date(t.dueTime).toLocaleString()}
//                 </p>
//                 <p>
//                   <span className="font-semibold">Priority:</span> {t.priority}
//                 </p>

//                 <p className="mt-2 text-xs text-gray-300">
//                   Created: {new Date(t.createdAt).toLocaleString()}
//                 </p>
//               </div>

//               <div className="absolute right-0 bottom-0 p-0">
//                 <button type="button"
//                   onClick={() => !t.itsDone && handleItsDone(t)}
//                   className={
//                     t.itsDone
//                       ? "bg-ItsDone cursor-not-allowed text-black hover:bg-ItsDone"
//                       : "hover:bg-ItsDone"
//                   }
//                 >
//                   {t.itsDone ? "It's Done" : "Pending"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         ))}

//         <div className="flex flex-col justify-center aspect-square rounded-xl bg-primary h-full gap-1">
//           <div className="text-sm text-muted-foreground text-white p-4 items-center flex justify-center">
//             <p>Do you have any ideas? Let&apos;s create them</p>
//           </div>
//           <div className="flex justify-center items-center">
//             <button type="button"
//               onClick={handleAddTask}
//               className="px-8 py-3 bg-ItsDone text-black rounded-md shadow-md hover:bg-foreground hover:text-white"
//             >
//               Add Task
//             </Button>
//           </div>
//         </div>

//         {Array.from({ length: emptyBlocks }).map((_, i) => (
//           <div
//             key={`empty-${i}`}
//             className="aspect-square rounded-xl bg-primary"
//           />
//         ))}
//       </div> */}
//       <div className="flex mt-2 w-[100%] px-4 justify-between items-center">
//         <div className="flex flex-col">
//           <h1 className="text-black dark:text-white font-semibold text-[32px]">
//             Scheduled Tasks
//           </h1>
//           <h1 className="text-yellow-400 dark:text-[#2647eb] font-semibold text-[32px]">
//             {moment().format('dddd D')}
//           </h1>
//         </div>

//         <Dialog>
//           <DialogTrigger>
//             <div className="text-white bg-yellow-400 dark:bg-[#2647eb] rounded-lg">
//               <Plus className="size-10 p-2" />{' '}
//             </div>
//           </DialogTrigger>
//           <DialogContent>
//             <TaskForm />
//           </DialogContent>
//         </Dialog>
//       </div>

//       {task.map((t, i) => (
//         <div className="" key={`task-${i}`}>
//           {/* <div className="px-4 w-full mt-4 gap-2 flex justify-center items-center"><Minus/>
//       <div className="bg-yellow-400 dark:bg-[#2647eb] p-4 flex justify-between items-center px-6 rounded-[14px] w-[100%] ">
//         <div className="flex gap-4 justify-center items-center">
//         <div className="bg-white flex justify-center items-center rounded-lg size-8 p-1"><AlarmClock/>
//         </div>
//         <p className='text-[16px] font-sans text-black dark:text-white font-bold '>Wake up buddy</p>
//         </div>
//         <p className='text-[16px] font-sans text-gray-700 dark:text-white font-semibold'>7:00 AM</p>
//       </div>
//       </div>

//       <div className="px-4 w-full mt-4 gap-2 flex justify-center items-center"><Minus/>
//       <div className="bg-yellow-400 dark:bg-[#2647eb] p-4 flex justify-between items-center px-6 rounded-[14px] w-[100%] ">
//         <div className="flex gap-4 justify-center items-center">
//         <div className="bg-white flex justify-center items-center rounded-lg size-8 p-1"><IconYoga/>
//         </div>
//         <p className='text-[16px] font-sans text-black dark:text-white font-bold '>morning yoga</p>
//         </div>
//         <p className='text-[16px] font-sans text-gray-700 dark:text-white font-semibold'>8:00 AM</p>
//       </div>
//       </div> */}

//           <div className="px-4 w-full mt-4 gap-2 flex justify-center items-center">
//             <div className="">
//              <Checkbox onClick={() => !t.itsDone && handleItsDone(t)} checked={t.itsDone}/>
//             </div>
//             <div className="bg-gray-100 dark:bg-neutral-950 py-4 flex justify-between items-start px-6 rounded-[14px] w-[100%] ">
//               <div className="flex gap-4 justify-center items-start">
//                 <div className="bg-white flex justify-center items-center rounded-lg size-8 p-1">
//                   {t.category?.icon ? (
//                     t.category?.icon
//                   ) : (
//                     <Scroll className="dark:text-black" />
//                   )}
//                 </div>
//                 <div className="text-[16px] font-sans flex flex-col text-black dark:text-white font-bold ">
//                   <h1>{t.title}</h1>
//                   <div className="flex flex-col gap-2 list-disc"></div>
//                   {t.description ? (
//                     <div className="mt-1">
//                       <p className="text-[14px] font-sans font-medium text-gray-500">
//                         {t.description}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="mt-1">
//                       <p className="text-[14px] font-sans font-medium text-gray-500">
//                         No Description
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <p className="text-[16px] font-sans text-gray-700 dark:text-white font-semibold">
//                 {' '}
//                 {moment(t.dueTime).format('D MMM')}
//               </p>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }



// 'use client';

// import { UserTask } from 'interfaces/task';
// import { Plus, Scroll } from 'lucide-react';
// import moment from 'moment';
// import { Checkbox } from '../ui/checkbox';
// import { TaskForm } from './task-form';
// import React, {
//   useRef,
//   useState,
//   useEffect,
//   ReactNode,
//   MouseEventHandler,
//   UIEvent,
// } from "react";
// import { motion, useInView } from "motion/react";



// interface AnimatedItemProps {
//   children: ReactNode;
//   delay?: number;
//   index: number;
//   onMouseEnter?: MouseEventHandler<HTMLDivElement>;
//   onClick?: MouseEventHandler<HTMLDivElement>;
// }

// const AnimatedItem: React.FC<AnimatedItemProps> = ({
//   children,
//   delay = 0,
//   index,
//   onMouseEnter,
//   onClick,
// }) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { amount: 0.5, once: false });
//   return (
//     <motion.div
//       ref={ref}
//       data-index={index}
//       onMouseEnter={onMouseEnter}
//       onClick={onClick}
//       initial={{ scale: 0.7, opacity: 0 }}
//       animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
//       transition={{ duration: 0.2, delay }}
//       className="mb-4 cursor-pointer"
//     >
//       {children}
//     </motion.div>
//   );
// };

// interface AnimatedListProps {
//   items?: string[];
//   onItemSelect?: (item: string, index: number) => void;
//   showGradients?: boolean;
//   enableArrowNavigation?: boolean;
//   className?: string;
//   itemClassName?: string;
//   displayScrollbar?: boolean;
//   initialSelectedIndex?: number;
// }

// interface TaskProps {
//   task: UserTask[];
//   setTask: (value: UserTask[]) => void;
//   onItemSelect?: (item: UserTask, index: number) => void;
//   showGradients?: boolean;
//   enableArrowNavigation?: boolean;
//   className?: string;
//   itemClassName?: string;
//   displayScrollbar?: boolean;
//   initialSelectedIndex?: number;
// }

// export function DashboardTaskList({ task, setTask, onItemSelect,
//   showGradients = true,
//   enableArrowNavigation = true,
//   className = "",
//   itemClassName = "",
//   displayScrollbar = true,
//   initialSelectedIndex = -1, }) {

//   const listRef = useRef<HTMLDivElement>(null);
//   const [selectedIndex, setSelectedIndex] =
//     useState<number>(initialSelectedIndex);
//   const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
//   const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
//   const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);


//   const handleScroll = (e: UIEvent<HTMLDivElement>) => {
//     const { scrollTop, scrollHeight, clientHeight } =
//       e.target as HTMLDivElement;
//     setTopGradientOpacity(Math.min(scrollTop / 50, 1));
//     const bottomDistance = scrollHeight - (scrollTop + clientHeight);
//     setBottomGradientOpacity(
//       scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
//     );
//   };

//   useEffect(() => {
//     if (!enableArrowNavigation) return;
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
//         e.preventDefault();
//         setKeyboardNav(true);
//         setSelectedIndex((prev) => Math.min(prev + 1, task.length - 1));
//       } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
//         e.preventDefault();
//         setKeyboardNav(true);
//         setSelectedIndex((prev) => Math.max(prev - 1, 0));
//       } else if (e.key === "Enter") {
//         if (selectedIndex >= 0 && selectedIndex < task.length) {
//           e.preventDefault();
//           if (onItemSelect) {
//             onItemSelect(task[selectedIndex], selectedIndex);
//           }
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [task, selectedIndex, onItemSelect, enableArrowNavigation]);

//   useEffect(() => {
//     if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
//     const container = listRef.current;
//     const selectedItem = container.querySelector(
//       `[data-index="${selectedIndex}"]`
//     ) as HTMLElement | null;
//     if (selectedItem) {
//       const extraMargin = 50;
//       const containerScrollTop = container.scrollTop;
//       const containerHeight = container.clientHeight;
//       const itemTop = selectedItem.offsetTop;
//       const itemBottom = itemTop + selectedItem.offsetHeight;
//       if (itemTop < containerScrollTop + extraMargin) {
//         container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
//       } else if (
//         itemBottom >
//         containerScrollTop + containerHeight - extraMargin
//       ) {
//         container.scrollTo({
//           top: itemBottom - containerHeight + extraMargin,
//           behavior: "smooth",
//         });
//       }
//     }
//     setKeyboardNav(false);
//   }, [selectedIndex, keyboardNav])


//   const handleItsDone = async (selectedTask: UserTask) => {
//     try {
//       const response = await fetch(`/api/task`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ itsDone: true, id: selectedTask.id }),
//       });

//       if (!response.ok) {
//         throw new Error('Error updating task status');
//       }

//       const updatedTasks = task.map((t) =>
//         t.id === selectedTask.id ? { ...t, itsDone: true } : t
//       );
//       setTask(updatedTasks);
//     } catch (error) {
//       console.error('Error updating task status:', error);
//     }
//   };


//   return (
//     <div className="w-full">

//       <div className="flex mb-4 w-[100%] px-4 py-0 justify-between items-center">
//         <div className="flex flex-col">
//           <h1 className="text-black dark:text-white font-semibold text-[32px]">
//             Scheduled Tasks
//           </h1>
//           <h1 className="text-yellow-400 dark:text-[#2647eb] font-semibold text-[32px]">
//             {moment().format('dddd D')}
//           </h1>
//         </div>

//         <TaskForm>
//           <div className="text-white bg-yellow-400 dark:bg-[#2647eb] rounded-lg">
//             <Plus className="size-10 p-2" />{' '}
//           </div>
//         </TaskForm>

//       </div>

//       {task.map((t, i) => (
//         <div key={`task-${i}`} ref={listRef}
//           className={` overflow-y-auto ${displayScrollbar
//               ? "[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]"
//               : "scrollbar-hide"
//             }`}
//           onScroll={handleScroll}
//           style={{
//             scrollbarWidth: displayScrollbar ? "thin" : "none",
//             scrollbarColor: "#222 #060010",
//           }}>

//           <AnimatedItem

//             delay={0.1}
//             index={i}
//             onMouseEnter={() => setSelectedIndex(i)}
//             onClick={() => {
//               setSelectedIndex(i);
//               if (onItemSelect) {
//                 onItemSelect(t, i);
//               }
//             }}
//           >
//             <div
//               className={` ${selectedIndex === i ? "" : ""} ${itemClassName}`}
//             >


//               <div className="px-4 w-full gap-2 flex justify-center items-center">
//                 <div className="">
//                   <Checkbox className='border-yellow-500 dark:border-blue-600' onClick={() => !t.itsDone && handleItsDone(t)} checked={t.itsDone} />
//                 </div>
//                 <div className="bg-gray-100 dark:bg-neutral-950 py-4 flex justify-between items-start px-6 rounded-[14px] w-[100%] ">
//                   <div className="flex gap-4 justify-center items-start">
//                     <div className="bg-white flex justify-center items-center rounded-lg size-8 p-1">
//                       {t.category?.icon ? (
//                         t.category?.icon
//                       ) : (
//                         <Scroll className="dark:text-black" />
//                       )}
//                     </div>
//                     <div className="text-[16px] font-sans flex flex-col text-black dark:text-white font-bold ">
//                       <h1>{t.title}</h1>
//                       <div className="flex flex-col gap-2 list-disc"></div>
//                       {t.description ? (
//                         <div className="mt-1">
//                           <p className="text-[14px] w-xs max-w-xs font-sans font-medium text-gray-500">
//                             {t.description.slice(0, 92)}...
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="mt-1">
//                           <p className="text-[14px] font-sans font-medium text-gray-500">
//                             No Description
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <p className="text-[16px] font-sans text-gray-700 dark:text-white font-semibold">
//                     {' '}
//                     {moment(t.dueTime).format('D MMM')}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </AnimatedItem>

//         </div>
//       ))}
//     </div>
//   );
// }

// // components/board/standalone-board-task-list.tsx
// 'use client';

// import { useState, useRef, useEffect, ReactNode, MouseEventHandler, UIEvent } from "react";
// import { motion, useInView } from "framer-motion";
// import { Plus, Scroll, CheckSquare, MessageSquare, Paperclip, Clock, User, ChevronDown, Folder, LayoutGrid } from 'lucide-react';
// import { Checkbox } from '@/components/ui/checkbox';
// import { format, isValid } from 'date-fns';
// import moment from 'moment';
// import { TaskModal } from '@/components/Board/task-modal';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSession } from 'next-auth/react';

// interface Label {
//   id: string;
//   name: string;
//   color: string;
// }

// interface Task {
//   id: string;
//   title: string;
//   description: string | null;
//   coverImage: string | null;
//   status: string;
//   priority: string;
//   dueDate: string | null;
//   order: number;
//   columnId: string;
//   columnTitle: string;
//   columnColor: string | null;
//   assignees: Array<{
//     id: string;
//     user: {
//       id: string;
//       name: string | null;
//       image: string | null;
//     };
//   }>;
//   labels: Array<{
//     id: string;
//     label: Label;
//   }>;
//   attachments: Array<{
//     id: string;
//     filename: string;
//   }>;
//   subtasks: Array<{
//     id: string;
//     isCompleted: boolean;
//   }>;
//   _count: {
//     boardComments: number;
//   };
// }

// interface Column {
//   id: string;
//   title: string;
//   color: string | null;
//   order: number;
//   tasks: Task[];
// }

// interface Board {
//   id: string;
//   title: string;
//   description: string | null;
//   coverImage: string | null;
//   createdAt: string;
//   updatedAt: string;
//   owner: {
//     id: string;
//     name: string | null;
//     image: string | null;
//   };
//   members: Array<{
//     id: string;
//     role: string;
//     user: {
//       id: string;
//       name: string | null;
//       image: string | null;
//       email: string;
//     };
//   }>;
//   columns: Column[];
//   labels: Label[];
//   _count?: {
//     columns: number;
//   };
// }

// interface AnimatedItemProps {
//   children: ReactNode;
//   delay?: number;
//   index: number;
//   onMouseEnter?: MouseEventHandler<HTMLDivElement>;
//   onClick?: MouseEventHandler<HTMLDivElement>;
// }

// const AnimatedItem: React.FC<AnimatedItemProps> = ({
//   children,
//   delay = 0,
//   index,
//   onMouseEnter,
//   onClick,
// }) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { amount: 0.5, once: false });

//   return (
//     <motion.div
//       ref={ref}
//       data-index={index}
//       onMouseEnter={onMouseEnter}
//       onClick={onClick}
//       initial={{ scale: 0.7, opacity: 0 }}
//       animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
//       transition={{ duration: 0.2, delay }}
//       className="mb-4 cursor-pointer"
//     >
//       {children}
//     </motion.div>
//   );
// };

// export function DashboardTaskList() {
//   const { data: session } = useSession();
//   const queryClient = useQueryClient();
//   const listRef = useRef<HTMLDivElement>(null);

//   // UI States
//   const [selectedIndex, setSelectedIndex] = useState<number>(-1);
//   const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
//   const [showBoardSelector, setShowBoardSelector] = useState(false);

//   // Modal States
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
//   const [isAddingTask, setIsAddingTask] = useState(false);
//   const [newTaskTitle, setNewTaskTitle] = useState('');
//   const [selectedColumnId, setSelectedColumnId] = useState<string>('');

//   // Fetch all boards
//   const { data: boards, isLoading: boardsLoading } = useQuery({
//     queryKey: ['boards'],
//     queryFn: async () => {
//       const res = await fetch('/api/boards');
//       if (!res.ok) throw new Error('Failed to fetch boards');
//       return res.json() as Promise<Board[]>;
//     },
//     enabled: !!session,
//   });

//   // Selected board state - defaults to first board
//   const [selectedBoardId, setSelectedBoardId] = useState<string>('');

//   // Set default board when boards load
//   useEffect(() => {
//     if (boards && boards.length > 0 && !selectedBoardId) {
//       setSelectedBoardId(boards[0].id);
//     }
//   }, [boards, selectedBoardId]);

//   // Fetch selected board with full data
//   const { data: board, isLoading: boardLoading } = useQuery({
//     queryKey: ['board', selectedBoardId],
//     queryFn: async () => {
//       const res = await fetch(`/api/boards/${selectedBoardId}`);
//       if (!res.ok) throw new Error('Failed to fetch board');
//       return res.json() as Promise<Board>;
//     },
//     enabled: !!selectedBoardId && !!session,
//   });

//   // Mutations
//   const updateTaskMutation = useMutation({
//     mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
//       const res = await fetch(`/api/tasks/${taskId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//       });
//       if (!res.ok) throw new Error('Failed to update task');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', selectedBoardId] });
//     },
//   });

//   const createTaskMutation = useMutation({
//     mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
//       const res = await fetch('/api/tasks', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           title,
//           columnId,
//           boardId: selectedBoardId,
//           status: 'TODO',
//         }),
//       });
//       if (!res.ok) throw new Error('Failed to create task');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', selectedBoardId] });
//       setIsAddingTask(false);
//       setNewTaskTitle('');
//     },
//   });

//   const deleteTaskMutation = useMutation({
//     mutationFn: async (taskId: string) => {
//       const res = await fetch(`/api/tasks/${taskId}`, {
//         method: 'DELETE',
//       });
//       if (!res.ok) throw new Error('Failed to delete task');
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', selectedBoardId] });
//     },
//   });

//   // Flatten all tasks from columns
//   const allTasks: Task[] = [];
//   if (board?.columns) {
//     board.columns.forEach(column => {
//       column.tasks.forEach(task => {
//         allTasks.push({
//           ...task,
//           columnId: column.id,
//           columnTitle: column.title,
//           columnColor: column.color,
//         });
//       });
//     });

//     // Sort by column order, then task order
//     allTasks.sort((a, b) => {
//       const colA = board.columns.find(c => c.id === a.columnId)?.order || 0;
//       const colB = board.columns.find(c => c.id === b.columnId)?.order || 0;
//       if (colA !== colB) return colA - colB;
//       return a.order - b.order;
//     });
//   }

//   const handleScroll = (e: UIEvent<HTMLDivElement>) => {
//     const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
//     const bottomDistance = scrollHeight - (scrollTop + clientHeight);
//     // Gradients handled via state if needed
//   };

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
//         e.preventDefault();
//         setKeyboardNav(true);
//         setSelectedIndex((prev) => Math.min(prev + 1, allTasks.length - 1));
//       } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
//         e.preventDefault();
//         setKeyboardNav(true);
//         setSelectedIndex((prev) => Math.max(prev - 1, 0));
//       } else if (e.key === "Enter" && selectedIndex >= 0) {
//         e.preventDefault();
//         handleTaskClick(allTasks[selectedIndex]);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [allTasks, selectedIndex]);

//   useEffect(() => {
//     if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
//     const container = listRef.current;
//     const selectedItem = container.querySelector(
//       `[data-index="${selectedIndex}"]`
//     ) as HTMLElement | null;
//     if (selectedItem) {
//       const extraMargin = 50;
//       const containerScrollTop = container.scrollTop;
//       const containerHeight = container.clientHeight;
//       const itemTop = selectedItem.offsetTop;
//       const itemBottom = itemTop + selectedItem.offsetHeight;
//       if (itemTop < containerScrollTop + extraMargin) {
//         container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
//       } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
//         container.scrollTo({
//           top: itemBottom - containerHeight + extraMargin,
//           behavior: "smooth",
//         });
//       }
//     }
//     setKeyboardNav(false);
//   }, [selectedIndex, keyboardNav]);

//   const handleTaskClick = (task: Task) => {
//     setSelectedTask(task);
//     setIsTaskModalOpen(true);
//   };

//   const handleCreateTask = () => {
//     if (newTaskTitle.trim() && selectedColumnId) {
//       createTaskMutation.mutate({ columnId: selectedColumnId, title: newTaskTitle.trim() });
//     }
//   };

//   const handleTaskStatusToggle = (task: Task) => {
//     const currentColumnIndex = board?.columns.findIndex(c => c.id === task.columnId) ?? -1;
//     const nextColumn = board?.columns[currentColumnIndex + 1];

//     if (nextColumn) {
//       updateTaskMutation.mutate({ 
//         taskId: task.id, 
//         updates: { columnId: nextColumn.id, status: nextColumn.title }
//       });
//     } else {
//       updateTaskMutation.mutate({ 
//         taskId: task.id, 
//         updates: { status: 'COMPLETED' }
//       });
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'URGENT': return 'text-red-600 bg-red-100';
//       case 'HIGH': return 'text-orange-600 bg-orange-100';
//       case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
//       case 'LOW': return 'text-green-600 bg-green-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const selectedBoard = boards?.find(b => b.id === selectedBoardId);

//   if (boardsLoading) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   if (!boards || boards.length === 0) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center text-gray-500">
//         <Folder className="size-16 mb-4 opacity-50" />
//         <p className="text-xl font-medium">No boards found</p>
//         <p className="text-sm mt-2">Create a board to get started</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full flex flex-col p-4">
//       {/* Header with Board Selector */}
//       <div className="flex mb-4 w-full justify-between items-start">
//         <div className="flex flex-col">
//           {/* Board Selector Dropdown */}
//           <div className="relative mb-2">
//             <button type="button"
//               onClick={() => setShowBoardSelector(!showBoardSelector)}
//               className="flex items-center gap-2 text-black dark:text-white font-semibold text-[28px] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg px-2 py-1 -ml-2 transition-colors"
//             >
//               <LayoutGrid className="size-6 text-indigo-500" />
//               {selectedBoard?.title || 'Select Board'}
//               <ChevronDown className={`size-5 transition-transform ${showBoardSelector ? 'rotate-180' : ''}`} />
//             </button>

//             {/* Dropdown Menu */}
//             {showBoardSelector && (
//               <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 z-50 max-h-80 overflow-y-auto">
//                 <div className="p-2">
//                   <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
//                     Your Boards
//                   </p>
//                   {boards.map((b) => (
//                     <button type="button"
//                       key={b.id}
//                       onClick={() => {
//                         setSelectedBoardId(b.id);
//                         setShowBoardSelector(false);
//                         setSelectedIndex(-1);
//                       }}
//                       className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
//                         b.id === selectedBoardId 
//                           ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
//                           : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200'
//                       }`}
//                     >
//                       {/* Board Cover or Color */}
//                       <div 
//                         className="w-10 h-8 rounded-lg bg-cover bg-center flex-shrink-0"
//                         style={{ 
//                           backgroundImage: b.coverImage ? `url(${b.coverImage})` : undefined,
//                           backgroundColor: b.coverImage ? undefined : '#6366f1'
//                         }}
//                       >
//                         {!b.coverImage && (
//                           <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
//                             {b.title.slice(0, 2).toUpperCase()}
//                           </span>
//                         )}
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium text-sm truncate">{b.title}</p>
//                         <p className="text-xs text-gray-500">
//                           {b._count?.columns || b.columns?.length || 0} columns
//                         </p>
//                       </div>

//                       {b.id === selectedBoardId && (
//                         <div className="size-2 rounded-full bg-indigo-500 flex-shrink-0" />
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Task Count & Date */}
//           <h1 className="text-indigo-500 dark:text-indigo-400 font-semibold text-[24px]">
//             {moment().format('dddd D')} • {allTasks.length} Tasks
//           </h1>
//         </div>

//         {/* Add Task Button */}
//         <div 
//           className="text-white bg-indigo-500 dark:bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
//           onClick={() => {
//             if (board?.columns[0]) {
//               setSelectedColumnId(board.columns[0].id);
//               setIsAddingTask(true);
//             }
//           }}
//         >
//           <Plus className="size-10 p-2" />
//         </div>
//       </div>

//       {/* Add Task Modal */}
//       {isAddingTask && board && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md shadow-2xl">
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
//               Add Task to {board.title}
//             </h2>
//             <input
//               type="text"
//               value={newTaskTitle}
//               onChange={(e) => setNewTaskTitle(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') handleCreateTask();
//                 if (e.key === 'Escape') setIsAddingTask(false);
//               }}
//               placeholder="Task title..."
//               className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg mb-4 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500"
//               
//             />
//             <select
//               value={selectedColumnId}
//               onChange={(e) => setSelectedColumnId(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg mb-4 bg-transparent dark:text-white"
//             >
//               {board.columns.map(col => (
//                 <option key={col.id} value={col.id}>{col.title}</option>
//               ))}
//             </select>
//             <div className="flex justify-end gap-2">
//               <button type="button"
//                 onClick={() => setIsAddingTask(false)}
//                 className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button type="button"
//                 onClick={handleCreateTask}
//                 disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//               >
//                 {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Click outside to close selector */}
//       {showBoardSelector && (
//         <div 
//           className="fixed inset-0 z-40"
//           onClick={() => setShowBoardSelector(false)}
//         />
//       )}

//       {/* Task List */}
//       <div 
//         ref={listRef}
//         className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]"
//         onScroll={handleScroll}
//         style={{
//           scrollbarWidth: "thin",
//           scrollbarColor: "#222 #060010",
//         }}
//       >
//         {boardLoading ? (
//           <div className="flex flex-col items-center justify-center h-64">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
//             <p className="text-gray-500">Loading tasks...</p>
//           </div>
//         ) : allTasks.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-64 text-gray-500">
//             <Scroll className="size-16 mb-4 opacity-50" />
//             <p className="text-lg font-medium">No tasks in {board?.title}</p>
//             <p className="text-sm">Click + to add your first task</p>
//           </div>
//         ) : (
//           allTasks.map((task, index) => (
//             <AnimatedItem
//               key={task.id}
//               delay={0.1}
//               index={index}
//               onMouseEnter={() => setSelectedIndex(index)}
//               onClick={() => {
//                 setSelectedIndex(index);
//                 handleTaskClick(task);
//               }}
//             >
//               <div className={`${selectedIndex === index ? "" : ""}`}>
//                 <div className="px-4 w-full gap-2 flex justify-center items-center">

//                   {/* Checkbox */}
//                   <div className="">
//                     <Checkbox 
//                       className="border-indigo-500 dark:border-indigo-600 size-5"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleTaskStatusToggle(task);
//                       }}
//                     />
//                   </div>

//                   {/* Main Task Card */}
//                   <div className="bg-gray-100 dark:bg-neutral-950 py-4 flex justify-between items-start px-6 rounded-[14px] w-[100%] hover:bg-gray-200 dark:hover:bg-neutral-900 transition-colors">

//                     {/* Left: Icon + Content */}
//                     <div className="flex gap-4 justify-center items-start flex-1 min-w-0">

//                       {/* Column Color Icon */}
//                       <div 
//                         className="flex justify-center items-center rounded-lg size-10 p-2 flex-shrink-0"
//                         style={{ backgroundColor: task.columnColor || '#6366f1' }}
//                       >
//                         <span className="text-white font-bold text-xs">
//                           {task.columnTitle.slice(0, 2).toUpperCase()}
//                         </span>
//                       </div>

//                       {/* Content */}
//                       <div className="text-[16px] font-sans flex flex-col text-black dark:text-white font-bold flex-1 min-w-0">

//                         {/* Title Row */}
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <h1 className="truncate">{task.title}</h1>

//                           {/* Priority Badge */}
//                           {task.priority && task.priority !== 'NONE' && (
//                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
//                               {task.priority}
//                             </span>
//                           )}
//                         </div>

//                         {/* Description */}
//                         <div className="flex flex-col gap-2 list-disc mt-1">
//                           {task.description ? (
//                             <p className="text-[14px] font-sans font-medium text-gray-500 dark:text-gray-400 line-clamp-2">
//                               {task.description.slice(0, 92)}
//                               {task.description.length > 92 ? '...' : ''}
//                             </p>
//                           ) : (
//                             <p className="text-[14px] font-sans font-medium text-gray-400 dark:text-gray-600 italic">
//                               No Description
//                             </p>
//                           )}
//                         </div>

//                         {/* Meta Row: Labels, Stats */}
//                         <div className="flex items-center gap-2 mt-2 flex-wrap">
//                           {/* Labels */}
//                           {task.labels.map(({ label }) => (
//                             <span
//                               key={label.id}
//                               className="text-[11px] px-2 py-0.5 rounded-full font-medium"
//                               style={{
//                                 backgroundColor: `${label.color}30`,
//                                 color: label.color,
//                               }}
//                             >
//                               {label.name}
//                             </span>
//                           ))}

//                           {/* Stats */}
//                           <div className="flex items-center gap-3 text-gray-400">
//                             {task.subtasks.length > 0 && (
//                               <span className="flex items-center gap-1 text-[12px]">
//                                 <CheckSquare className="size-3" />
//                                 {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
//                               </span>
//                             )}
//                             {task._count.boardComments > 0 && (
//                               <span className="flex items-center gap-1 text-[12px]">
//                                 <MessageSquare className="size-3" />
//                                 {task._count.boardComments}
//                               </span>
//                             )}
//                             {task.attachments.length > 0 && (
//                               <span className="flex items-center gap-1 text-[12px]">
//                                 <Paperclip className="size-3" />
//                                 {task.attachments.length}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Right: Due Date & Assignees */}
//                     <div className="flex flex-col items-end gap-2 flex-shrink-0">
//                       {/* Due Date */}
//                       <p className="text-[16px] font-sans text-gray-700 dark:text-white font-semibold">
//                       {task?.dueDate && isValid(new Date(task.dueDate))
//   ? format(new Date(task.dueDate), "dd MMM")
//   : "No Due Date"}   {/* {task.dueDate ? format(new Date(task.dueDate), 'D MMM') : 'No Date'} */}
//                       </p>

//                       {/* Assignees */}
//                       <div className="flex -!gap-x-2">
//                         {task.assignees.slice(0, 3).map(({ user }) => (
//                           <div
//                             key={user.id}
//                             className="size-6 rounded-full border-2 border-white dark:border-neutral-950 bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600"
//                             title={user.name || ''}
//                           >
//                             {user.name ? user.name.charAt(0).toUpperCase() : <User className="size-3" />}
//                           </div>
//                         ))}
//                         {task.assignees.length > 3 && (
//                           <div className="size-6 rounded-full border-2 border-white dark:border-neutral-950 bg-gray-100 flex items-center justify-center text-[10px] text-gray-600">
//                             +{task.assignees.length - 3}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                   </div>
//                 </div>
//               </div>
//             </AnimatedItem>
//           ))
//         )}
//       </div>

//       {/* Task Modal */}
//       {isTaskModalOpen && selectedTask && board && (
//         <TaskModal
//           task={selectedTask}
//           boardId={board.id}
//           boardMembers={board.members}
//           labels={board.labels}
//           onClose={() => {
//             setIsTaskModalOpen(false);
//             setSelectedTask(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }


// components/board/standalone-board-task-list.tsx
'use client';

import { useState, useRef, useEffect, ReactNode, MouseEventHandler, UIEvent } from "react";
import { motion, useInView } from "framer-motion";
import { Plus, Scroll, CheckSquare, MessageSquare, Paperclip, User, ChevronDown, Folder, LayoutGrid, Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
// import moment from 'moment';
import { TaskModal } from '@/components/Board/task-modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { TaskForm } from "./task-form";
import { Skeleton } from "../ui/skeleton";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  order: number;
  columnId: string;
  columnTitle: string;
  columnColor: string | null;
  assignees: Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  labels: Array<{
    id: string;
    label: Label;
  }>;
  attachments: Array<{
    id: string;
    filename: string;
  }>;
  subtasks: Array<{
    id: string;
    isCompleted: boolean;
  }>;
  _count: {
    boardComments: number;
  };
}

interface Column {
  id: string;
  title: string;
  color: string | null;
  order: number;
  tasks: Task[];
}

interface Board {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      email: string;
    };
  }>;
  columns: Column[];
  labels: Label[];
  _count?: {
    columns: number;
  };
}

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

// ClickUp-style status icons based on column position
const getStatusIcon = (columnTitle: string, columnColor: string | null, isLast: boolean) => {
  const color = columnColor || '#6366f1';

  // Done/Completed columns (last column) - filled circle
  if (isLast || columnTitle.toLowerCase().includes('done') || columnTitle.toLowerCase().includes('complete')) {
    return {
      icon: 'filled',
      component: (
        <div
          className="size-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <CheckCircle2 className="size-4 text-white" />
        </div>
      ),
      borderStyle: 'solid-filled'
    };
  }

  // In Progress columns - half-filled / dotted circle
  if (columnTitle.toLowerCase().includes('progress') || columnTitle.toLowerCase().includes('doing') || columnTitle.toLowerCase().includes('work')) {
    return {
      icon: 'half',
      component: (
        <div
          className="size-6 rounded-full flex items-center justify-center border-2"
          style={{
            borderColor: color,
            background: `linear-gradient(90deg, ${color}40 50%, transparent 50%)`
          }}
        >
          <CircleDot className="size-3" style={{ color }} />
        </div>
      ),
      borderStyle: 'half-filled'
    };
  }

  // Todo/Backlog columns (first columns) - empty dashed circle
  return {
    icon: 'empty',
    component: (
      <div
        className="size-6 rounded-full flex items-center justify-center border-2 border-dashed"
        style={{ borderColor: color }}
      >
        <Circle className="size-3" style={{ color }} />
      </div>
    ),
    borderStyle: 'dashed-empty'
  };
};

export function DashboardTaskList() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const listRef = useRef<HTMLDivElement>(null);

  // UI States
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState<string | null>(null); // taskId

  // Modal States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');

  // Fetch all boards
  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error('Failed to fetch boards');
      return res.json() as Promise<Board[]>;
    },
    enabled: !!session,
  });

  // Selected board state - defaults to first board
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');

  // Set default board when boards load
  useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, selectedBoardId]);

  // Fetch selected board with full data
  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', selectedBoardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${selectedBoardId}`);
      if (!res.ok) throw new Error('Failed to fetch board');
      return res.json() as Promise<Board>;
    },
    enabled: !!selectedBoardId && !!session,
  });

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Only send allowed fields - no status enum
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          columnId: updates.columnId,
          priority: updates.priority,
          dueDate: updates.dueDate,
          coverImage: updates.coverImage,
          isArchived: updates.isArchived,
          order: updates.order,
          // Don't send status - let it be inferred from column or backend
        }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', selectedBoardId] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          columnId,
          boardId: selectedBoardId,
          // Don't send status - let backend set default
        }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', selectedBoardId] });
      setIsAddingTask(false);
      setNewTaskTitle('');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', selectedBoardId] });
    },
  });

  // Flatten all tasks from columns
  const allTasks: Task[] = [];
  if (board?.columns) {
    board.columns.forEach(column => {
      column.tasks.forEach(task => {
        allTasks.push({
          ...task,
          columnId: column.id,
          columnTitle: column.title,
          columnColor: column.color,
        });
      });
    });

    // Sort by column order, then task order
    allTasks.sort((a, b) => {
      const colA = board.columns.find(c => c.id === a.columnId)?.order || 0;
      const colB = board.columns.find(c => c.id === b.columnId)?.order || 0;
      if (colA !== colB) return colA - colB;
      return a.order - b.order;
    });
  }

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    // Gradients handled via state if needed
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, allTasks.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "" && selectedIndex >= 0) {
        e.preventDefault();
        handleTaskClick(allTasks[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allTasks, selectedIndex]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleMoveToColumn = (task: Task, columnId: string) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: { columnId }
    });
    setShowColumnSelector(null);
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim() && selectedColumnId) {
      createTaskMutation.mutate({ columnId: selectedColumnId, title: newTaskTitle.trim() });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedBoard = boards?.find(b => b.id === selectedBoardId);
  const sortedColumns = board?.columns?.sort((a, b) => a.order - b.order) || [];

  if (boardsLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex w-full h-full flex-col py-12 justify-start items-center gap-4">
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
              </div>
      </div>
    );
  }

  if (!boards || boards.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-500">
        <Folder className="size-16 mb-4 opacity-50" />
        <p className="text-xl font-medium">No boards found</p>
        <p className="text-sm mt-2">Create a board to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col px-1 relative">
      {/* Header with Board Selector */}
      <div className="flex mb-2 w-full justify-between items-center px-1.5">
        <div className="flex flex-col">
          {/* Board Selector Dropdown */}

          <div className="relative ">
            <button type="button"
              onClick={() => setShowBoardSelector(!showBoardSelector)}
              className="flex capitalize font-semibold px-1 py-1 text-xl justify-center items-center gap-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-sm transition-colors"
            >
              <LayoutGrid className="size-5 text-indigo-500" />
              {selectedBoard?.title || 'Select Board'}
              <ChevronDown className={`size-5 transition-transform ${showBoardSelector ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showBoardSelector && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Your Boards
                  </p>
                  {boards.map((b) => (
                    <button type="button"
                      key={b.id}
                      onClick={() => {
                        setSelectedBoardId(b.id);
                        setShowBoardSelector(false);
                        setSelectedIndex(-1);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${b.id === selectedBoardId
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200'
                        }`}
                    >
                      <div
                        className="w-10 h-8 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: b.coverImage ? `url(${b.coverImage})` : undefined,
                          backgroundColor: b.coverImage ? undefined : '#6366f1'
                        }}
                      >
                        {!b.coverImage && (
                          <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {b.title.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{b.title}</p>
                        <p className="text-xs text-gray-500">
                          {b._count?.columns || b.columns?.length || 0} columns
                        </p>
                      </div>

                      {b.id === selectedBoardId && (
                        <div className="size-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          
          {/* <h1 className="text-indigo-500 dark:text-[#2647eb] font-semibold text-[28px]">
            {format(new Date(), 'EEEE')} • {allTasks.length} Tasks
          </h1> */}
        </div>

        {/* Add Task Button */}
        <TaskForm>
          <div
            className="text-white bg-indigo-500 dark:bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
          // onClick={() => {
          //   if (board?.columns[0]) {
          //     setSelectedColumnId(board.columns[0].id);
          //     setIsAddingTask(true);
          //   }
          // }}
          >
            <Plus className="size-8 p-1.5" />
          </div>
        </TaskForm>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && board && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add Task to {board.title}
            </h2>
            <input
            aria-label='add-task-title'
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTask();
                if (e.key === 'Escape') setIsAddingTask(false);
              }}
              placeholder="Task title..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg mb-4 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500"

            />
            <select
              value={selectedColumnId}
              onChange={(e) => setSelectedColumnId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg mb-4 bg-transparent dark:text-white"
            >
              {board.columns.map(col => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
              >
                Cancel
              </button>
              <button type="button"
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close selectors */}
      {(showBoardSelector || showColumnSelector) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowBoardSelector(false);
            setShowColumnSelector(null);
          }}
        />
      )}

      {/* Column Selector Popup */}
      {showColumnSelector && board && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-3 pointer-events-auto max-w-xs w-full">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-2">
              Move to Column
            </p>
            <div className="space-y-1">
              {sortedColumns.map((col, index) => {
                const isLast = index === sortedColumns.length - 1;
                const statusIcon = getStatusIcon(col.title, col.color, isLast);

                return (
                  <button type="button"
                    key={col.id}
                    onClick={() => {
                      const task = allTasks.find(t => t.id === showColumnSelector);
                      if (task) handleMoveToColumn(task, col.id);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    {statusIcon.component}
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                      {col.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto thin-scrollbar"
        onScroll={handleScroll}
      // style={{
      //   scrollbarWidth: "thin",
      //   scrollbarColor: "#222 #060010",
      // }}
      >
        {
        boardLoading ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="flex w-full h-full flex-col py-12 justify-start items-center gap-4">
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
                <div className="flex items-center !gap-x-4">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="">
                    <Skeleton className="h-16 w-[500px]" />
                  </div>
                </div>
              </div>
          </div>
        ) : allTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Scroll className="size-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No tasks in {board?.title}</p>
            <p className="text-sm">Click + to add your first task</p>
          </div>
        ) : (
          allTasks.map((task, index) => {
            const currentColumnIndex = sortedColumns.findIndex(c => c.id === task.columnId);
            const isLastColumn = currentColumnIndex === sortedColumns.length - 1;
            const statusIcon = getStatusIcon(task.columnTitle, task.columnColor, isLastColumn);

            return (
              <AnimatedItem
                key={task.id}
                delay={0.1}
                index={index}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  setSelectedIndex(index);
                  handleTaskClick(task);
                }}
              >
                <div className={`${selectedIndex === index ? "" : ""}`}>
                  <div className="px-1 w-full gap-2 flex justify-center items-center ">

                    <div
                      className="relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColumnSelector(task.id);
                      }}
                    >
                      <div className="cursor-pointer hover:scale-110 transition-transform">
                        {statusIcon.component}
                      </div>
                    </div>

                    {/* Main Task Card */}
                    <div className=" hover:bg-gray-200 dark:hover:bg-neutral-900 transition-colors
                    flex w-full max-w-[100%] items-center justify-between gap-4 rounded-2xl border border-neutral-50 bg-white p-3.5 shadow-sm shadow-neutral-200 dark:border-neutral-900 dark:bg-neutral-950 dark:shadow-neutral-950/70">

                      {/* Left: Content */}
                      <div className="flex gap-4 justify-center items-start flex-1 min-w-0">

                        {/* Column Badge */}
                        {task.coverImage ? (
                          <div className="rounded-lg h-10 w-10 overflow-hidden relative">
                            <img src={task.coverImage} alt="" className='h-full w-full object-cover' />
                            
                          </div>
                        ) : (
                          <div
                            className="flex justify-center items-center rounded-lg h-10 w-10 flex-shrink-0"
                            style={{ backgroundColor: task.columnColor || '#6366f1' }}
                          >
                            <span className="text-white font-bold text-xs">
                              {task.columnTitle.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}


                        {/* Content */}
                        <div className="text-[16px] font-sans flex flex-col text-black dark:text-white font-bold flex-1 min-w-0">

                     <h1 className="truncate text-sm font-semibold">{task.title}</h1>
                          {/* <div className="flex  gap-1">
                              {task.subtasks.length > 0 && (
                                <span className="flex items-center gap-1 w-fit text-[12px]">
                                  <CheckSquare className="size-2.5" />
                                  {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                                </span>
                              )}
                              {task._count.boardComments > 0 && (
                                <span className="flex items-center gap-1 w-fit text-[12px]">
                                  <MessageSquare className="size-2.5" />
                                  {task._count.boardComments}
                                </span>
                              )}
                              {task.attachments.length > 0 && (
                                <span className="flex items-center gap-1 w-fit text-[12px] rounded-sm">
                                  <Paperclip className="size-2.5" />
                                  {task.attachments.length}
                                </span>
                              )}
                            </div>  */}
                           
                          {/* Priority Badge */}
                          {/* {task.priority && task.priority !== 'NONE' && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            )} */}


                          {/* Description */}
                          <div className="flex flex-col list-disc ">
                            {task.description ? (
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 !font-sans font-normal line-clamp-2">
                                {task.description.slice(0, 40)}
                                {task.description.length > 40 ? '...' : ''}
                              </p>
                            ) : (
                             
                         <p className="text-sm text-neutral-600 dark:text-neutral-400 !font-sans font-normal line-clamp-2">
                                No description
                              </p>)}
                          </div>

                          {/* Meta Row: Labels, Stats */}
                          <div className="flex items-center gap-2 mt-0 flex-wrap">
                            {/* Labels */}
                            {task.labels.map(({ label }) => (
                              <span
                                key={label.id}
                                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: `${label.color}30`,
                                  color: label.color,
                                }}
                              >
                                {label.name}
                              </span>
                            ))}


                          </div>
                        </div>
                      </div>

                      {/* Right: Due Date & Assignees */}
                      <div className="flex flex-col justify-center items-end gap-2 flex-shrink-0">
                        {/* Due Date */}
                        <p className=" text-xs text-neutral-600 dark:text-neutral-400 font-sans">
                          {task?.dueDate
                            ? format(parseISO(task.dueDate), 'dd MMM')
                            : "No Due Date"}
                        </p>

                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map(({ user }) => (
                            <div
                              key={user.id}
                              className="size-6 rounded-full border-2 border-white dark:border-neutral-950 bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600"
                              title={user.name || ''}
                            >
                              {/* {user.name ? user.name.charAt(0).toUpperCase() : <User className="size-3" />} */}
                              <img src={user.image} alt="" className='h-full w-full object-cover rounded-full' />
                            </div>

                          ))}
                          {task.assignees.length > 3 && (
                            <div className="size-6 rounded-full border-2 border-white dark:border-neutral-950 bg-gray-100 flex items-center justify-center text-[10px] text-gray-600">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </AnimatedItem>
            );
          })
        )}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && selectedTask && board && (
        <TaskModal
          task={selectedTask}
          boardId={board.id}
          boardMembers={board.members}
          labels={board.labels}
          closeModal={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
