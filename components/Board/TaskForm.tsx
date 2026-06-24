// // import { FC } from 'react';
// // import useInput from '../../hooks/useInput';
// // import { Column, MultiInput, Task } from '../../types';
// // import { Dropdown, MultiValueInput } from '../Inputs/Inputs';
// // import { mutate } from 'swr';
// // import { Button } from '../ui/button';
// // import { Input } from '../ui/input';
// // import { Textarea } from '../ui/textarea';
// // import { Label } from '../ui/label';
// // import {
// //     Modal,
// //     ModalBody,
// //     ModalContent,
// //     ModalFooter,
// //     ModalTrigger,
// //   } from '../ui/animated-modal';
// // import { FilePlus2 } from 'lucide-react';

// // const validateTitle = (val: string | undefined): [boolean, string] => {
// //     if (!val || val?.trim().length < 1) return [false, "Can't be empty"];
// //     if (val?.trim().length > 100) return [false, `${val?.trim().length}/100`];
// //     return [true, ''];
// // };

// // const validateSubtasks = (val: MultiInput[]): [boolean, string] => {
// //     if (val?.length === 0 || !val) return [true, ''];
// //     for (const item of val) {
// //         const [isValid, errorMessage] = validateTitle(item.value);
// //         if (!isValid) return [isValid, errorMessage];
// //     }
// //     return [true, ''];
// // };

// // const TaskForm: FC<{
// //     closeModal: Function;
// //     columns?: Column[];
// //     taskData?: Task;
// //     formType: 'new' | 'edit';
// //     onTaskUpdated?: Function;
// // }> = (props) => {
// //     // Set initial field values if editing an existing task
// //     const initialSubtasks = props.taskData?.subtasks?.map((subtask) => {
// //         return { id: subtask.uuid, value: subtask.name, isValid: true, isTouched: false, errorMsg: '' };
// //     });
// //     const initialColumn = props.columns?.find((column) => column.uuid === props.taskData?.column_uuid)?.name;

// //     const dropdownOptions = props.columns?.map((item) => item.name);
// //     const nameInput = useInput<string>({ validateFn: validateTitle, initialValue: props.taskData?.name });
// //     const descriptionInput = useInput<string>({ initialValue: props.taskData?.description });
// //     const subtasksInput = useInput<MultiInput[]>({ validateFn: validateSubtasks, initialValue: initialSubtasks });
// //     const columnDropdown = useInput<string>({ initialValue: initialColumn ?? (dropdownOptions && dropdownOptions[0]) });

// //     const formIsValid = nameInput.isValid && subtasksInput.isValid;

// //     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
// //         e.preventDefault();
// //         nameInput.setIsTouched(true);
// //         subtasksInput.setIsTouched(true);
// //         const newColumnsValue = subtasksInput.value?.map((item) => {
// //             const [isValid, errorMsg] = validateTitle(item.value);
// //             return { ...item, isValid, errorMsg, isTouched: true };
// //         });
// //         if (newColumnsValue) subtasksInput.customValueChangeHandler(newColumnsValue);
// //         if (formIsValid) {
// //             const formData = {
// //                 name: nameInput.value,
// //                 description: descriptionInput.value,
// //                 subtasks: subtasksInput.value?.map((item) => {
// //                     const subtask = props.taskData?.subtasks?.find((subtask) => subtask.uuid === item.id);
// //                     if (subtask) return { uuid: subtask.uuid, name: item.value };
// //                     return { name: item.value };
// //                 }),
// //                 column_uuid: props.columns?.find((item) => item.name === columnDropdown.value)?.uuid,
// //             };
// //             if (props.formType === 'new') {
// //                 fetch('/api/tasks', {
// //                     method: 'POST',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify(formData),
// //                     credentials: 'include',
// //                 }).then(() => {
// //                     mutate(`/api/boards/${props.columns?.[0].board_uuid}`);
// //                     props.closeModal();
// //                 });
// //             } else {
// //                 fetch(`/api/tasks/${props.taskData?.uuid}`, {
// //                     method: 'PUT',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify(formData),
// //                 }).then(() => {
// //                     props.onTaskUpdated && props.onTaskUpdated();
// //                 });
// //             }
// //         }
// //     };

// //     return (
// //         <Modal>
// //              <ModalTrigger className='!py-0 !px-0'>
// //              <Button
// //           id="new-task"
// //           className=" bg-transparent py-4 h-0"
// //           variant={'outline'}
// //         >
// //           <span className="hidden sm:block dark:text-neutral-500 text-[14px] md:flex justify-center items-center gap-1 text-center">
// //             <FilePlus2 className=" h-4 w-5" />{' '}
// //             Create task
// //           </span>
// //         </Button>
// //       </ModalTrigger>
// //              <ModalBody className=" !max-w-[36%] !min-h-[60%] !h-[60%] !max-h-[70%] dark:bg-neutral-900 !w-[20%]">
// //              <ModalContent className="!px-6 gap-y-4 pb-0 flex flex-col ">

   
// //         <h2 className="mb-6 text-xl font-semibold text-foreground">
// //             {props.formType === 'new' ? 'Add New Task' : 'Edit Task'}
// //         </h2>

// //         <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">

// //             <Label>Title</Label>
// //             <Input
// //                 value={nameInput.value ?? ''}
// //                 onChange={nameInput.valueChangeHandler}
// //                 onBlur={nameInput.inputBlurHandler}
// //                 // haserror={nameInput.hasError}
// //                 // errorMsg={nameInput.errorMsg}
// //                 id="task-title"
// //                 placeholder=" Enter title here"
// //             />

// //             <Label>Description</Label>
// //             <Textarea
// //                 value={descriptionInput.value ?? ''}
// //                 onChange={descriptionInput.valueChangeHandler}
// //                 onBlur={descriptionInput.inputBlurHandler}
                
// //                 id="task-description"
// //                 placeholder="Enter description here"
// //             />

// //             <Label>Subtasks</Label>
// //             <MultiValueInput
// //                 id="subtasks"
// //                 label=""
// //                 values={subtasksInput.value}
// //                 changeHandler={subtasksInput.customValueChangeHandler}
// //                 validationHandler={validateTitle}
// //                 addBtnText="Add New Subtask"
// //                 fieldType="textarea"
// //             />

// //             {/* <Label>Status</Label> */}
// //             {dropdownOptions && (
// //                 <Dropdown
// //                     setValue={columnDropdown.setValue}
// //                     value={columnDropdown.value}
// //                     id="column-select"
// //                     label=""
// //                     options={dropdownOptions}
// //                     className='hidden'
// //                 />
                
// //             )}

// //             <div className="mt-4">
// //                 <Button
// //                     variant="default"
// //                     size="lg"
// //                     className="w-full text-white text-base font-medium transition-colors hover:bg-primary/90"
// //                     data-testid="task-submit"
// //                 >
// //                     {props.formType === 'new' ? 'Create New Task' : 'Save Changes'}
// //                 </Button>
// //             </div>
// //         </form>
// //     </ModalContent>
// //     </ModalBody>
// //     </Modal>

// //     );
// // };

// // components/Task/TaskForm.tsx

// import { FC, useState } from 'react';
// import useInput from '../../hooks/useInput';
// import { Column,  Task,  Label } from '../../types';
// import { mutate } from 'swr';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Textarea } from '../ui/textarea';
// import { Label as LabelComponent } from '../ui/label';
// // import {
// //   DialogHeader,
// //   DialogTitle,
// //   DialogDescription,
// // } from '@/components/ui/dialog';
// import {
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalTrigger,
// } from '../ui/animated-modal';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { format } from 'date-fns';
// import { CalendarIcon, Plus, X , FilePlus2} from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Editor, EditorTextChangeEvent } from 'primereact/editor';

// const validateTitle = (val: string | undefined): [boolean, string] => {
//   if (!val || val?.trim().length < 1) return [false, "Can't be empty"];
//   if (val?.trim().length > 100) return [false, `${val?.trim().length}/100`];
//   return [true, ''];
// };

// interface TaskFormProps {
//   closeModal: () => void;
//   columns?: Column[];
//   taskData?: Task;
//   formType: 'new' | 'edit';
//   onTaskUpdated?: () => void;
// }

// const TaskForm: FC<TaskFormProps> = (props) => {
//   const [selectedPriority, setSelectedPriority] = useState<Priority>(
//     props.taskData?.priority || 'MEDIUM'
//   );
//   const [dueDate, setDueDate] = useState<Date | undefined>(
//     props.taskData?.dueDate ? new Date(props.taskData.dueDate) : undefined
//   );
//   const [description, setDescription] = useState(props.taskData?.description || '');
//   const [subtasks, setSubtasks] = useState<{ id: string; value: string }[]>(
//     props.taskData?.subtasks.map(s => ({ id: s.uuid, value: s.name })) || []
//   );
//   const [selectedLabels, setSelectedLabels] = useState<string[]>(
//     props.taskData?.labels.map(l => l.uuid) || []
//   );
//   const [selectedMembers, setSelectedMembers] = useState<string[]>(
//     props.taskData?.taskMembers.map(m => m.user.uuid) || []
//   );

//   const nameInput = useInput<string>({ 
//     validateFn: validateTitle, 
//     initialValue: props.taskData?.name 
//   });

//   const columnDropdown = useInput<string>({ 
//     initialValue: props.taskData 
//       ? props.columns?.find(c => c.uuid === props.taskData?.column_uuid)?.name 
//       : props.columns?.[0]?.name 
//   });

//   const handleAddSubtask = () => {
//     setSubtasks([...subtasks, { id: Math.random().toString(), value: '' }]);
//   };

//   const handleRemoveSubtask = (id: string) => {
//     setSubtasks(subtasks.filter(s => s.id !== id));
//   };

//   const handleSubtaskChange = (id: string, value: string) => {
//     setSubtasks(subtasks.map(s => s.id === id ? { ...s, value } : s));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!nameInput.isValid) {
//       nameInput.setIsTouched(true);
//       return;
//     }

//     const column = props.columns?.find(c => c.uuid === columnDropdown.value);
    
//     const formData = {
//       name: nameInput.value,
//       description,
//       column_uuid: column?.uuid,
//       priority: selectedPriority,
//       dueDate: dueDate?.toISOString(),
//       subtasks: subtasks.filter(s => s.value.trim()).map(s => {
//         const existing = props.taskData?.subtasks.find(es => es.uuid === s.id);
//         return existing ? { uuid: s.id, name: s.value } : { name: s.value };
//       }),
//       labels: selectedLabels,      // ✅ included
//       assignees: selectedMembers   // ✅ included
//     };


//     try {
//       if (props.formType === 'new') {
//         await fetch('/api/tasks', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(formData),
//           credentials: 'include'
//         });
//         mutate(`/api/boards/${column?.board_uuid}`);
//       } else {
//         await fetch(`/api/tasks/${props.taskData?.uuid}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(formData)
//         });
//         props.onTaskUpdated?.();
//       }
//       props.closeModal();
//     } catch (error) {
//       console.error('Failed to save task:', error);
//     }
//   };

//   return (
//        <Modal>
//               <ModalTrigger className='!py-0 !px-0'>
//               <Button
//            id="new-task"
//            className=" bg-transparent py-4 h-0"
//            variant={'outline'}
//          >
//            <span className="hidden sm:block dark:text-neutral-500 text-[14px] md:flex justify-center items-center gap-1 text-center">
//              <FilePlus2 className=" h-4 w-5" />{' '}
//              Create task
//            </span>
//          </Button>
//        </ModalTrigger>
//               <ModalBody className=" !max-w-[36%] !min-h-[60%] !h-[90%] !max-h-[90%] dark:bg-neutral-900 !w-[40%] overflow-y-scroll">
//               <ModalContent className="!px-6 gap-y-4 pb-0 flex flex-col ">

   
//          <h2 className="mb-6 text-xl font-semibold text-foreground">
//              {props.formType === 'new' ? 'Add New Task' : 'Edit Task'}
//          </h2>
//     <form onSubmit={handleSubmit} className="gap-y-4">
//       {/* <DialogHeader>
//         <DialogTitle>{props.formType === 'new' ? 'Add New Task' : 'Edit Task'}</DialogTitle>
//         <DialogDescription>
//           {props.formType === 'new' 
//             ? 'Create a new task with all the details.' 
//             : 'Make changes to your task here.'}
//         </DialogDescription>
//       </DialogHeader> */}

//       <div className="gap-y-4">
//         {/* Title */}
//         <div className="gap-y-2">
//           <LabelComponent>Title</LabelComponent>
//           <Input
//             value={nameInput.value ?? ''}
//             onChange={nameInput.valueChangeHandler}
//             onBlur={nameInput.inputBlurHandler}
//             placeholder="Enter task title"
//             className={cn(nameInput.hasError && "border-red-500")}
//           />
//           {nameInput.hasError && (
//             <p className="text-xs text-red-500">{nameInput.errorMsg}</p>
//           )}
//         </div>

//         {/* Column & Priority Row */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="gap-y-2">
//             <LabelComponent>Column</LabelComponent>
//             <select
//   value={columnDropdown.value}
//   onChange={(e) => columnDropdown.setValue(e.target.value)}
//   className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
// >
//   {props.columns?.map(col => (
//     <option key={col.uuid} value={col.uuid}>{col.name}</option>
//   ))}
// </select>
//           </div>
//           <div className="gap-y-2">
//             <LabelComponent>Priority</LabelComponent>
//             <select
//               value={selectedPriority}
//               onChange={(e) => setSelectedPriority(e.target.value as Priority)}
//               className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
//             >
//               <option value="LOW">Low</option>
//               <option value="MEDIUM">Medium</option>
//               <option value="HIGH">High</option>
//               <option value="URGENT">Urgent</option>
//             </select>
//           </div>
//         </div>

//         {/* Due Date */}
//         <div className="gap-y-2">
//           <LabelComponent>Due Date</LabelComponent>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="outline"
//                 className={cn(
//                   "w-full justify-start text-left font-normal",
//                   !dueDate && "text-muted-foreground"
//                 )}
//               >
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {dueDate ? format(dueDate, "PPP") : "Pick a date"}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0">
//               <Calendar
//                 mode="single"
//                 selected={dueDate}
//                 onSelect={setDueDate}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>
//         </div>

//         {/* Description */}
//         <div className="gap-y-2">
//           <LabelComponent>Description</LabelComponent>
//           <Editor
//   value={description}
//   onTextChange={(e: EditorTextChangeEvent) => setDescription(e.htmlValue || '')}  // ✅ fixed
//   style={{ height: '200px' }}
//   placeholder="Add a more detailed description..."
// />
//         </div>

//         {/* Subtasks */}
//         <div className="gap-y-2">
//           <LabelComponent>Subtasks</LabelComponent>
//           <div className="gap-y-2">
//             {subtasks.map((subtask, idx) => (
//               <div key={subtask.id} className="flex gap-2">
//                 <Input
//                   value={subtask.value}
//                   onChange={(e) => handleSubtaskChange(subtask.id, e.target.value)}
//                   placeholder={`Subtask ${idx + 1}`}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => handleRemoveSubtask(subtask.id)}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             ))}
//             <Button
//               type="button"
//               variant="outline"
//               size="sm"
//               onClick={handleAddSubtask}
//               className="w-full"
//             >
//               <Plus className="h-4 w-4 mr-1" />
//               Add Subtask
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-end gap-2 pt-4">
//         <Button type="button" variant="outline" onClick={props.closeModal}>
//           Cancel
//         </Button>
//         <Button type="submit">
//           {props.formType === 'new' ? 'Create Task' : 'Save Changes'}
//         </Button>
//       </div>
//     </form>
//     </ModalContent>
//     </ModalBody>
//     </Modal>
//   );
// };

// export default TaskForm;

// // export default TaskForm;

// // components/TaskForm/TaskForm.tsx - Enhanced version
// // import { FC, useState } from 'react';
// // import useInput from '../../hooks/useInput';
// // import { Column, MultiInput, Task, Priority, Label, User } from '../../types';
// // import { Dropdown, MultiValueInput } from '../Inputs/Inputs';
// // import { mutate } from 'swr';
// // import { Button } from '../ui/button';
// // import { Input } from '../ui/input';
// // import { Textarea } from '../ui/textarea';
// // import { Label as FormLabel } from '../ui/label';
// // import {
// //   Modal,
// //   ModalBody,
// //   ModalContent,
// //   ModalFooter,
// //   ModalTrigger,
// // } from '../ui/animated-modal';
// // import { FilePlus2, Calendar, Users, Tag, Flag, Image as ImageIcon } from 'lucide-react';
// // import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// // import { Calendar as CalendarComponent } from '@/components/ui/calendar';
// // import { format } from 'date-fns';
// // import { cn } from '@/lib/utils';
// // import { Badge } from '@/components/ui/badge';
// // import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// // const validateTitle = (val: string | undefined): [boolean, string] => {
// //   if (!val || val?.trim().length < 1) return [false, "Can't be empty"];
// //   if (val?.trim().length > 100) return [false, `${val?.trim().length}/100`];
// //   return [true, ''];
// // };

// // const validateSubtasks = (val: MultiInput[]): [boolean, string] => {
// //   if (val?.length === 0 || !val) return [true, ''];
// //   for (const item of val) {
// //     const [isValid, errorMessage] = validateTitle(item.value);
// //     if (!isValid) return [isValid, errorMessage];
// //   }
// //   return [true, ''];
// // };

// // interface TaskFormProps {
// //   closeModal: Function;
// //   columns?: Column[];
// //   taskData?: Task;
// //   formType: 'new' | 'edit';
// //   onTaskUpdated?: Function;
// //   boardMembers?: User[];
// //   boardLabels?: Label[];
// // }

// // const TaskForm: FC<TaskFormProps> = (props) => {
// //   // Set initial field values
// //   const initialSubtasks = props.taskData?.subtasks?.map((subtask) => ({
// //     id: subtask.uuid,
// //     value: subtask.name,
// //     isValid: true,
// //     isTouched: false,
// //     errorMsg: '',
// //   }));

// //   const initialColumn = props.columns?.find((column) => column.uuid === props.taskData?.column_uuid)?.name;

// //   // Form state
// //   const nameInput = useInput<string>({
// //     validateFn: validateTitle,
// //     initialValue: props.taskData?.name,
// //   });
// //   const descriptionInput = useInput<string>({ initialValue: props.taskData?.description });
// //   const subtasksInput = useInput<MultiInput[]>({
// //     validateFn: validateSubtasks,
// //     initialValue: initialSubtasks,
// //   });
// //   const columnDropdown = useInput<string>({
// //     initialValue: initialColumn ?? (props.columns?.[0]?.name),
// //   });
  
// //   // New state for additional fields
// //   const [dueDate, setDueDate] = useState<Date | undefined>(
// //     props.taskData?.dueDate ? new Date(props.taskData.dueDate) : undefined
// //   );
// //   const [priority, setPriority] = useState<Priority>(props.taskData?.priority || 'medium');
// //   const [selectedLabels, setSelectedLabels] = useState<string[]>(
// //     props.taskData?.labels?.map(l => l.label.uuid) || []
// //   );
// //   const [selectedMembers, setSelectedMembers] = useState<string[]>(
// //     props.taskData?.members?.map(m => m.user.id) || []
// //   );
// //   const [coverImage, setCoverImage] = useState<File | null>(null);
// //   const [coverImagePreview, setCoverImagePreview] = useState<string>(
// //     props.taskData?.coverImage || ''
// //   );

// //   const formIsValid = nameInput.isValid && subtasksInput.isValid;

// //   // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
// //   //   e.preventDefault();
// //   //   nameInput.setIsTouched(true);
// //   //   subtasksInput.setIsTouched(true);

// //   //   const newColumnsValue = subtasksInput.value?.map((item) => {
// //   //     const [isValid, errorMsg] = validateTitle(item.value);
// //   //     return { ...item, isValid, errorMsg, isTouched: true };
// //   //   });

// //   //   if (newColumnsValue) subtasksInput.customValueChangeHandler(newColumnsValue);

// //   //   if (formIsValid) {
// //   //     const formData: any = {
// //   //       name: nameInput.value,
// //   //       description: descriptionInput.value,
// //   //       subtasks: subtasksInput.value?.map((item) => {
// //   //         const subtask = props.taskData?.subtasks?.find((subtask) => subtask.uuid === item.id);
// //   //         if (subtask) return { uuid: subtask.uuid, name: item.value };
// //   //         return { name: item.value };
// //   //       }),
// //   //       column_uuid: props.columns?.find((item) => item.name === columnDropdown.value)?.uuid,
// //   //       dueDate: dueDate?.toISOString(),
// //   //       priority,
// //   //       labelIds: selectedLabels,
// //   //       memberIds: selectedMembers,
// //   //     };

// //   //     // Upload cover image if selected
// //   //     if (coverImage) {
// //   //       const coverFormData = new FormData();
// //   //       coverFormData.append('file', coverImage);
// //   //       coverFormData.append('task_uuid', props.taskData?.uuid || '');

// //   //       const coverResponse = await fetch('/api/tasks/cover', {
// //   //         method: 'POST',
// //   //         body: coverFormData,
// //   //       });
// //   //       const coverData = await coverResponse.json();
// //   //       formData.coverImage = coverData.url;
// //   //     }

// //   //     if (props.formType === 'new') {
// //   //       fetch('/api/tasks', {
// //   //         method: 'POST',
// //   //         headers: { 'Content-Type': 'application/json' },
// //   //         body: JSON.stringify(formData),
// //   //         credentials: 'include',
// //   //       }).then(() => {
// //   //         mutate(`/api/boards/${props.columns?.[0].board_uuid}`);
// //   //         props.closeModal();
// //   //       });
// //   //     } else {
// //   //       fetch(`/api/tasks/${props.taskData?.uuid}`, {
// //   //         method: 'PUT',
// //   //         headers: { 'Content-Type': 'application/json' },
// //   //         body: JSON.stringify(formData),
// //   //       }).then(() => {
// //   //         props.onTaskUpdated && props.onTaskUpdated();
// //   //       });
// //   //     }
// //   //   }
// //   // };

// //   // components/TaskForm/TaskForm.tsx - Fix handleSubmit function
// // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
// //   e.preventDefault();
// //   nameInput.setIsTouched(true);
// //   subtasksInput.setIsTouched(true);

// //   const newColumnsValue = subtasksInput.value?.map((item) => {
// //     const [isValid, errorMsg] = validateTitle(item.value);
// //     return { ...item, isValid, errorMsg, isTouched: true };
// //   });

// //   if (newColumnsValue) subtasksInput.customValueChangeHandler(newColumnsValue);

// //   if (formIsValid) {
// //     const formData: any = {
// //       name: nameInput.value,
// //       description: descriptionInput.value,
// //       subtasks: subtasksInput.value?.map((item) => {
// //         const subtask = props.taskData?.subtasks?.find((subtask) => subtask.uuid === item.id);
// //         if (subtask) return { uuid: subtask.uuid, name: item.value };
// //         return { name: item.value };
// //       }),
// //       column_uuid: props.columns?.find((item) => item.name === columnDropdown.value)?.uuid,
// //       dueDate: dueDate?.toISOString(),
// //       priority,
// //     };

// //     // Handle labels
// //     if (selectedLabels.length > 0) {
// //       formData.labelIds = selectedLabels;
// //     }

// //     // Handle members
// //     if (selectedMembers.length > 0) {
// //       formData.memberIds = selectedMembers;
// //     }

// //     try {
// //       let taskResponse;
      
// //       if (props.formType === 'new') {
// //         taskResponse = await fetch('/api/tasks', {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify(formData),
// //           credentials: 'include',
// //         });
// //       } else {
// //         taskResponse = await fetch(`/api/tasks/${props.taskData?.uuid}`, {
// //           method: 'PUT',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify(formData),
// //         });
// //       }

// //       const taskData = await taskResponse.json();

// //       // Upload cover image if selected
// //       if (coverImage) {
// //         const coverFormData = new FormData();
// //         coverFormData.append('file', coverImage);
// //         coverFormData.append('task_uuid', taskData.uuid);

// //         await fetch('/api/tasks/cover', {
// //           method: 'POST',
// //           body: coverFormData,
// //         });
// //       }

// //       // Add labels if any
// //       if (selectedLabels.length > 0) {
// //         await Promise.all(
// //           selectedLabels.map(labelUuid =>
// //             fetch('/api/task-labels', {
// //               method: 'POST',
// //               headers: { 'Content-Type': 'application/json' },
// //               body: JSON.stringify({
// //                 task_uuid: taskData.uuid,
// //                 label_uuid: labelUuid,
// //               }),
// //             })
// //           )
// //         );
// //       }

// //       // Add members if any
// //       if (selectedMembers.length > 0) {
// //         await Promise.all(
// //           selectedMembers.map(userId =>
// //             fetch('/api/task-members', {
// //               method: 'POST',
// //               headers: { 'Content-Type': 'application/json' },
// //               body: JSON.stringify({
// //                 task_uuid: taskData.uuid,
// //                 user_id: userId,
// //               }),
// //             })
// //           )
// //         );
// //       }

// //       mutate(`/api/boards/${props.columns?.[0].board_uuid}`);
// //       props.closeModal();
// //       props.onTaskUpdated && props.onTaskUpdated(taskData);
// //     } catch (error) {
// //       console.error('Error creating/updating task:', error);
// //     }
// //   }
// // };

// //   const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (file) {
// //       setCoverImage(file);
// //       setCoverImagePreview(URL.createObjectURL(file));
// //     }
// //   };

// //   return (
// //     <Modal>
// //       <ModalTrigger className="!py-0 !px-0">
// //         <Button id="new-task" className="bg-transparent py-4 h-0" variant="outline">
// //           <span className="hidden sm:block dark:text-neutral-500 text-[14px] md:flex justify-center items-center gap-1 text-center">
// //             <FilePlus2 className="h-4 w-5" /> Create task
// //           </span>
// //         </Button>
// //       </ModalTrigger>
// //       <ModalBody className="!max-w-[50%] !min-h-[90%] !h-[90%] dark:bg-neutral-900 !w-[30%] overflow-y-auto">
// //         <ModalContent className="!px-6 gap-y-4 pb-0 flex flex-col">
// //           <h2 className="mb-6 text-xl font-semibold text-foreground">
// //             {props.formType === 'new' ? 'Add New Task' : 'Edit Task'}
// //           </h2>

// //           <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
// //             {/* Cover Image Upload */}
// //             <div>
// //               <FormLabel>Cover Image</FormLabel>
// //               <div className="flex items-center gap-4">
// //                 {coverImagePreview && (
// //                   <div className="relative">
// //                     <img
// //                       src={coverImagePreview}
// //                       alt="Cover preview"
// //                       className="w-32 h-20 object-cover rounded-lg"
// //                     />
// //                     <button
// //                       type="button"
// //                       onClick={() => {
// //                         setCoverImage(null);
// //                         setCoverImagePreview('');
// //                       }}
// //                       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
// //                     >
// //                       ✕
// //                     </button>
// //                   </div>
// //                 )}
// //                 <div>
// //                   <input
// //                     type="file"
// //                     id="cover-upload"
// //                     accept="image/*"
// //                     className="hidden"
// //                     onChange={handleCoverImageChange}
// //                   />
// //                   <Button
// //                     type="button"
// //                     variant="outline"
// //                     onClick={() => document.getElementById('cover-upload')?.click()}
// //                   >
// //                     <ImageIcon className="h-4 w-4 mr-2" />
// //                     Upload Cover
// //                   </Button>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Task Title */}
// //             <div>
// //               <FormLabel>Title</FormLabel>
// //               <Input
// //                 value={nameInput.value ?? ''}
// //                 onChange={nameInput.valueChangeHandler}
// //                 onBlur={nameInput.inputBlurHandler}
// //                 id="task-title"
// //                 placeholder="Enter title here"
// //               />
// //             </div>

// //             {/* Description */}
// //             <div>
// //               <FormLabel>Description</FormLabel>
// //               <Textarea
// //                 value={descriptionInput.value ?? ''}
// //                 onChange={descriptionInput.valueChangeHandler}
// //                 onBlur={descriptionInput.inputBlurHandler}
// //                 id="task-description"
// //                 placeholder="Enter description here"
// //                 className="min-h-[100px]"
// //               />
// //             </div>

// //             {/* Due Date */}
// //             <div>
// //               <FormLabel>Due Date</FormLabel>
// //               <Popover>
// //                 <PopoverTrigger asChild>
// //                   <Button
// //                     variant="outline"
// //                     className={cn(
// //                       'w-full justify-start text-left font-normal',
// //                       !dueDate && 'text-muted-foreground'
// //                     )}
// //                   >
// //                     <Calendar className="mr-2 h-4 w-4" />
// //                     {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
// //                   </Button>
// //                 </PopoverTrigger>
// //                 <PopoverContent className="w-auto p-0">
// //                   <CalendarComponent
// //                     mode="single"
// //                     selected={dueDate}
// //                     onSelect={setDueDate}
// //                     initialFocus
// //                   />
// //                 </PopoverContent>
// //               </Popover>
// //             </div>

// //             {/* Priority */}
// //             <div>
// //               <FormLabel>Priority</FormLabel>
// //               <div className="flex gap-2">
// //                 {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
// //                   <Button
// //                     key={p}
// //                     type="button"
// //                     variant={priority === p ? 'default' : 'outline'}
// //                     onClick={() => setPriority(p)}
// //                     className="capitalize"
// //                   >
// //                     {p}
// //                   </Button>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Labels */}
// //             {props.boardLabels && props.boardLabels.length > 0 && (
// //               <div>
// //                 <FormLabel>Labels</FormLabel>
// //                 <div className="flex flex-wrap gap-2">
// //                   {props.boardLabels.map((label) => (
// //                     <Badge
// //                       key={label.uuid}
// //                       className="cursor-pointer"
// //                       style={{
// //                         backgroundColor: selectedLabels.includes(label.uuid)
// //                           ? label.color
// //                           : `${label.color}20`,
// //                         color: selectedLabels.includes(label.uuid) ? 'white' : label.color,
// //                       }}
// //                       onClick={() => {
// //                         setSelectedLabels((prev) =>
// //                           prev.includes(label.uuid)
// //                             ? prev.filter((id) => id !== label.uuid)
// //                             : [...prev, label.uuid]
// //                         );
// //                       }}
// //                     >
// //                       {label.name}
// //                     </Badge>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Members */}
// //             {props.boardMembers && props.boardMembers.length > 0 && (
// //               <div>
// //                 <FormLabel>Assign to</FormLabel>
// //                 <div className="flex flex-wrap gap-2">
// //                   {props.boardMembers.map((member) => (
// //                     <div
// //                       key={member.id}
// //                       className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${
// //                         selectedMembers.includes(member.id)
// //                           ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
// //                           : ''
// //                       }`}
// //                       onClick={() => {
// //                         setSelectedMembers((prev) =>
// //                           prev.includes(member.id)
// //                             ? prev.filter((id) => id !== member.id)
// //                             : [...prev, member.id]
// //                         );
// //                       }}
// //                     >
// //                       <Avatar className="h-8 w-8">
// //                         <AvatarImage src={member.image} />
// //                         <AvatarFallback>
// //                           {member.name?.charAt(0) || member.email?.charAt(0)}
// //                         </AvatarFallback>
// //                       </Avatar>
// //                       <div>
// //                         <p className="text-sm font-medium">{member.name || member.email}</p>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Subtasks */}
// //             <div>
// //               <FormLabel>Checklist</FormLabel>
// //               <MultiValueInput
// //                 id="subtasks"
// //                 label=""
// //                 values={subtasksInput.value}
// //                 changeHandler={subtasksInput.customValueChangeHandler}
// //                 validationHandler={validateTitle}
// //                 addBtnText="Add New Item"
// //                 fieldType="textarea"
// //               />
// //             </div>

// //             {/* Status/Column (hidden but included in form data) */}
// //             {props.columns && (
// //               <div className="hidden">
// //                 <Dropdown
// //                   setValue={columnDropdown.setValue}
// //                   value={columnDropdown.value}
// //                   id="column-select"
// //                   label=""
// //                   options={props.columns.map((col) => col.name)}
// //                 />
// //               </div>
// //             )}

// //             {/* Submit Button */}
// //             <div className="mt-4">
// //               <Button
// //                 type="submit"
// //                 variant="default"
// //                 size="lg"
// //                 className="w-full"
// //                 data-testid="task-submit"
// //               >
// //                 {props.formType === 'new' ? 'Create Task' : 'Save Changes'}
// //               </Button>
// //             </div>
// //           </form>
// //         </ModalContent>
// //       </ModalBody>
// //     </Modal>
// //   );
// // };

// // export default TaskForm;

// "use client"

// import { useState } from 'react';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import {
//   X,
//   Calendar,
//   Tag,
//   Paperclip,
//   MessageSquare,
//   CheckSquare,
//   User,
//   Plus,
//   Trash2,
//   Edit2,
//   Clock,
//   MoreHorizontal,
//   Link as LinkIcon,
//   File,
//   MessageSquareIcon,
//   Ellipsis,
//   MoveUpRight,
//   EditIcon,
//   EllipsisIcon,
//   Check
// } from 'lucide-react';
// import { format } from 'date-fns';
// import { useSession } from 'next-auth/react';
// import { FileUpload } from './file-upload';
// import { CommentWithAttachments } from './comment-with-attachments';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from '@/components/ui/resizable';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Send,
//   Play,
//   Square,
//   Image as ImageIcon,
//   FileText
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import { cn } from '@/lib/utils';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// // import { Calendar as CalendarComponent } from '@/components/ui/calendar';
// // import TaskForm from './TaskForm';
// import Image from 'next/image';
// // import { DriveButton } from '../integrations/google/DriveButton';
// // import { JiraPanel } from '@/components/integrations/jira/JiraPanel'


// interface TaskModalProps {
//   task: any;
//   boardId: string;
//   boardMembers: any[];
//   labels: any[];
//   closeModal: () => void;
// }


// export function TaskModal({ task, boardId, boardMembers, labels, closeModal }: TaskModalProps) {
//   // const { data: session } = useSession();
//   const queryClient = useQueryClient();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedTask, setEditedTask] = useState(task);
//   const [newComment, setNewComment] = useState('');
//   const [newSubtask, setNewSubtask] = useState('');
  

//   const updateTaskMutation = useMutation({
//     mutationFn: async (updates: any) => {
//       const res = await fetch(`/api/tasks/${task.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//       });
//       if (!res.ok) throw new Error('Failed to update task');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//       setIsEditing(false);
//     },
//   });

//   const createCommentMutation = useMutation({
//     mutationFn: async (content: string) => {
//       const res = await fetch(`/api/tasks/${task.id}/comments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content }),
//       });
//       if (!res.ok) throw new Error('Failed to add comment');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//       setNewComment('');
//     },
//   });

//   // Add this mutation with your other mutations
//   const setCoverImageMutation = useMutation({
//     mutationFn: async (coverImage: string | null) => {
//       const res = await fetch(`/api/tasks/${task.id}/cover`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ coverImage }),
//       });
//       if (!res.ok) throw new Error('Failed to set cover image');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const deleteAttachmentMutation = useMutation({
//     mutationFn: async (attachmentId: string) => {
//       const res = await fetch(`/api/attachments/${attachmentId}`, {
//         method: 'DELETE',
//       });
//       if (!res.ok) throw new Error('Failed to delete attachment');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const updatePriorityMutation = useMutation({
//     mutationFn: async (priority: string) => {
//       const res = await fetch(`/api/tasks/${task.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ priority }),
//       });
//       if (!res.ok) throw new Error('Failed to update priority');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const createSubtaskMutation = useMutation({
//     mutationFn: async (title: string) => {
//       const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title }),
//       });
//       if (!res.ok) throw new Error('Failed to add subtask');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//       setNewSubtask('');
//     },
//   });

//   const toggleSubtaskMutation = useMutation({
//     mutationFn: async ({ subtaskId, isCompleted }: { subtaskId: string; isCompleted: boolean }) => {
//       const res = await fetch(`/api/subtasks/${subtaskId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ isCompleted }),
//       });
//       if (!res.ok) throw new Error('Failed to update subtask');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const assignUserMutation = useMutation({
//     mutationFn: async (userId: string) => {
//       const isAssigned = task.assignees.some((a: any) => a.user.id === userId);
//       const res = await fetch(`/api/tasks/${task.id}/assignees${isAssigned ? `?userId=${userId}` : ''}`, {
//         method: isAssigned ? 'DELETE' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         ...(isAssigned ? {} : { body: JSON.stringify({ userId }) }),
//       });
//       if (!res.ok) throw new Error('Failed to update assignees');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const addLabelMutation = useMutation({
//     mutationFn: async (labelId: string) => {
//       const hasLabel = task.labels.some((l: any) => l.label.id === labelId);
//       const res = await fetch(`/api/tasks/${task.id}/labels${hasLabel ? `?labelId=${labelId}` : ''}`, {
//         method: hasLabel ? 'DELETE' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         ...(hasLabel ? {} : { body: JSON.stringify({ labelId }) }),
//       });
//       if (!res.ok) throw new Error('Failed to update labels');
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//     },
//   });

//   const completedSubtasks = task.subtasks.filter((s: any) => s.isCompleted).length;
//   const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

//   return (

//     <Dialog open={true} onOpenChange={() => closeModal()}>
//       <DialogContent className="max-h-[95%] mt-[1rem] ml-[1.3rem] border lg:h-[92%] h-[92%] md:min-w-[90rem] lg:min-w-[92rem] rounded-lg max-w-[92rem] overflow-hidden p-0 dark:border-[#333333] bg-white dark:bg-[#111111] shadow-none">
//         <ResizablePanelGroup
//           direction="horizontal"
//           className="h-full w-full border-none"
//         >
//           <ResizablePanel>
//             <ResizablePanelGroup direction="vertical">
//               <div className="p-6 border-b h-10 flex justify-between border-[#eee] dark:border-[#222]">
          
//         </div>
//          <ScrollArea className="h-full overflow-auto">
//               <ResizablePanel
//                 defaultSize={30}
//                 minSize={30}
//                 maxSize={60}
//                 className="flex h-32 items-start"
//               >
//                 <div className="h-full w-full flex-grow">

//                   <Image
//                     className="h-full w-full object-cover "
//                     src={task.coverImage}
//                     alt=""
//                     height={1000}
//                     width={1000}
//                   />
//                 </div>
               
                  
//                   {/* <Popover>
//                     <PopoverTrigger asChild>
//                       <Button

//                         variant="outline"
//                         size={'icon'}
//                         className=""
//                       >
//                         <EllipsisIcon className="pointer-events-none" />
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-[250px] p-0">
//                       <div className=""> hello</div>
//                     </PopoverContent>
//                   </Popover> */}
                
//               </ResizablePanel>


//               <ResizableHandle className="bg-transparent border-none" />

//               <ResizablePanel>
//                 <ResizablePanelGroup direction="horizontal" className='!min-w-full flex justify-center '>
//                   <ResizablePanel
//                     defaultSize={60}
//                     className="max-w-[80%] px-6"
//                   >
//                       <>

                      
//                         {/* <div className="mb-6 ">
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               value={editedTask.title}
//                               onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
//                               className="text-xl font-bold text-gray-900 border-b-2 border-indigo-500 focus:outline-none"
//                             />
//                           ) : (
//                             <h2
//                               data-testid="task-name"
//                               className="text-2xl font-bold dark:text-white/70"
//                             >
//                               {task.title}
//                             </h2>
//                           )}

//                         </div>
//                         <div className="flex gap-2">

//                           {!isEditing ? (
//                             <button
//                               onClick={() => setIsEditing(true)}
//                               className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
//                             >
//                               <Edit2 className="size-5" />
//                             </button>
//                           ) : (
//                             <button
//                               onClick={() => updateTaskMutation.mutate(editedTask)}
//                               className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
//                             >
//                               Save
//                             </button>
//                           )}



//                           <Button variant="outline" className={`text-xs px-2 py-1 rounded-full border ${task.priority === 'URGENT' ? 'bg-red-100 text-red-700 border-red-200' :
//                             task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200' :
//                               task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
//                                 'bg-green-100 text-green-700 border-green-200'
//                             }`}>
//                             {task.priority}
//                           </Button>


                          
//                           <div>
//                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Due Date</h4>
//                             {isEditing ? (
//                               <input
//                                 type="datetime-local"
//                                 value={editedTask.dueDate ? format(new Date(editedTask.dueDate), "yyyy-MM-dd'T'HH:mm") : ''}
//                                 onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                               />
//                             ) : (
//                               <div className="flex items-center gap-2 text-sm text-gray-700">
//                                 <Clock className="size-4 />
//                                 {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy HH:mm') : 'No due date'}
//                               </div>
//                             )}
//                           </div>

                         
//                           <div>
//                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</h4>
//                             <div className="relative">
//                               <select
//                                 value={task.priority}
//                                 onChange={(e) => updatePriorityMutation.mutate(e.target.value)}
//                                 disabled={updatePriorityMutation.isPending}
//                                 className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 ${task.priority === 'URGENT' ? 'bg-red-50 text-red-700 border-red-200' :
//                                   task.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
//                                     task.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
//                                       'bg-green-50 text-green-700 border-green-200'
//                                   }`}
//                               >
//                                 <option value="LOW">🟢 Low</option>
//                                 <option value="MEDIUM">🟡 Medium</option>
//                                 <option value="HIGH">🟠 High</option>
//                                 <option value="URGENT">🔴 Urgent</option>
//                               </select>
//                             </div>
//                           </div>

                         
//                           <div>
//                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignees</h4>
//                             <div className="gap-y-2">
//                               {task.assignees.map((assignee: any) => (
//                                 <div key={assignee.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
//                                   <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
//                                     {assignee.user.name ? assignee.user.name.charAt(0).toUpperCase() : <User className="size-3" />}
//                                   </div>
//                                   <span className="text-sm text-gray-700 flex-1">{assignee.user.name}</span>
//                                   <button
//                                     onClick={() => assignUserMutation.mutate(assignee.user.id)}
//                                     className="p-1 hover:bg-red-100 text-red-600 rounded"
//                                   >
//                                     <X className="size-3" />
//                                   </button>
//                                 </div>
//                               ))}

//                               <div className="relative group">
//                                 <button className="w-full flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors text-sm">
//                                   <Plus className="size-4 />
//                                   Add assignee
//                                 </button>
//                                 <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:block z-10">
//                                   {boardMembers
//                                     .filter((m: any) => !task.assignees.some((a: any) => a.user.id === m.user.id))
//                                     .map((member: any) => (
//                                       <button
//                                         key={member.user.id}
//                                         onClick={() => assignUserMutation.mutate(member.user.id)}
//                                         className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-left text-sm"
//                                       >
//                                         <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
//                                           {member.user.name ? member.user.name.charAt(0).toUpperCase() : <User className="size-3" />}
//                                         </div>
//                                         {member.user.name}
//                                       </button>
//                                     ))}
//                                 </div>
//                               </div>

//                             </div>

                            
//                             <div>
//                               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Labels</h4>
//                               <div className="flex flex-wrap gap-2">
//                                 {task.labels.map(({ label }: any) => (
//                                   <span
//                                     key={label.id}
//                                     className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
//                                     style={{
//                                       backgroundColor: `${label.color}20`,
//                                       color: label.color,
//                                     }}
//                                   >
//                                     {label.name}
//                                     <button
//                                       onClick={() => addLabelMutation.mutate(label.id)}
//                                       className="hover:bg-black/10 rounded-full p-0.5"
//                                     >
//                                       <X className="size-3" />
//                                     </button>
//                                   </span>
//                                 ))}

//                                 <div className="relative group">
//                                   <button className="inline-flex items-center gap-1 px-2 py-1 border border-dashed border-gray-300 rounded-full hover:border-indigo-500 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors text-xs">
//                                     <Plus className="size-3" />
//                                     Add label
//                                   </button>
//                                   <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:block z-10 min-w-[150px]">
//                                     {labels
//                                       .filter((l: any) => !task.labels.some((tl: any) => tl.label.id === l.id))
//                                       .map((label: any) => (
//                                         <button
//                                           key={label.id}
//                                           onClick={() => addLabelMutation.mutate(label.id)}
//                                           className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-left text-sm"
//                                         >
//                                           <span
//                                             className="size-3 rounded-full"
//                                             style={{ backgroundColor: label.color }}
//                                           ></span>
//                                           {label.name}
//                                         </button>
//                                       ))}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

                            
//                             <div>
//                               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</h4>
//                               <div className="gap-y-2">
//                                 <button className="w-full flex items-center gap-2 p-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//                                   <LinkIcon className="size-4 />
//                                   Copy link
//                                 </button>
//                                 <button className="w-full flex items-center gap-2 p-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
//                                   <Trash2 className="size-4 />
//                                   Delete task
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         </div> */}

//                         {/* <div className="flex justify-between items-start w-full mt-6 mb-2">
//                           <div className="flex items-center gap-2">
                           
//                             <p className="font-bold dark:text-white/70">
//                               Description
//                             </p>
//                           </div>
//                           <Button

//                             variant="outline"
//                             className="bg-transparent"
//                           >
//                             <EditIcon /> Edit
//                           </Button>
//                         </div> */}
//                         <div className=" text-white/70 rounded-md overflow-hidden">

//                           {isEditing ? (
//                             <textarea
//                               value={editedTask.description || ''}
//                               onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
//                               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
//                               placeholder="Add a description..."
//                             />
//                           ) : (
//                             <div className="text-gray-600 text-sm leading-relaxed">
//                               {task.description || <span className="text-gray-400 italic">No description</span>}
//                             </div>
//                           )}
//                         </div>

//                         <div className="flex justify-between items-start w-full mt-6 mb-2">
//                           <div className="flex items-center gap-2">
                            
//                             <p className="font-bold dark:text-white/70">
//                               Attachments
//                             </p>
//                           </div>
                          
                           
//                             <FileUpload
//                               taskId={task.id}
//                               type="task"
//                               onUploadComplete={() => {
//                                 queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//                               }}
//                             />
                          
//                         </div>
                      
// {/* <DriveButton
//   mode="import"
//   teamId={task.column?.board?.teamId ?? undefined}
//   onSelect={async (file, action, result) => {
//   if (action === 'import' && result?.file) {
//     const importedFile = result.file

//     await fetch('/api/uploads/confirm', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         type: 'task',                           // ← this was missing
//         taskId: task.id,
//         key: importedFile.storageKey,
//         contentType: importedFile.mimeType,     // ← confirm reads req.body.contentType
//         size: importedFile.size,
//       }),
//     })

//     queryClient.invalidateQueries({ queryKey: ['board', boardId] })
//   }
// }}
//   label="Import from Drive"
// /> */}
// {/* 
// <JiraPanel onLinkToTask={(issue) => {
//   // Store as task metadata — add jiraIssueKey to your task or use ActivityLog
//   fetch(`/api/tasks/${task.id}`, {
//     method: 'PATCH',
//     body: JSON.stringify({ 
//       metadata: { jiraIssueKey: issue.key, jiraIssueUrl: issue.url }
//     })
//   })
// }} /> */}
//                         <div>

//                           <div className="grid grid-cols-2 gap-3 mt-4">
//                             {task.attachments.map((attachment: any) => (
//                               <div key={attachment.id} className="relative group">


//                                 {/* Cover Image Button - Only for images */}
//                                 {attachment.mimeType?.startsWith('image/') && (
//                                   <button
//                                     onClick={() => {
//                                       const isCurrentCover = task.coverImage === attachment.url;
//                                       setCoverImageMutation.mutate(isCurrentCover ? null : attachment.url);
//                                     }}
//                                     className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${task.coverImage === attachment.url
//                                       ? 'bg-yellow-100 text-yellow-700'
//                                       : 'bg-white text-gray-600 hover:text-yellow-600'
//                                       }`}
//                                     title={task.coverImage === attachment.url ? 'Remove cover' : 'Set as cover'}
//                                   >
//                                     {task.coverImage === attachment.url ? (
//                                       <svg className="size-4 fill="currentColor" viewBox="0 0 20 20">
//                                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                       </svg>
//                                     ) : (
//                                       <svg className="size-4 fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//                                       </svg>
//                                     )}
//                                   </button>
//                                 )}

//                                 <button
//                                   onClick={(e) => {
//                                     e.preventDefault();
//                                     if (confirm('Delete this attachment?')) {
//                                       deleteAttachmentMutation.mutate(attachment.id);
//                                     }
//                                   }}
//                                   className="absolute bottom-2 right-2 p-1.5 bg-white text-red-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity"
//                                 >
//                                   <Trash2 className="size-4 />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>

//                           {/* Current Cover Preview */}
//                           {/* {task.coverImage && (
//                         <div className="mt-4">
//                           <p className="text-xs text-gray-500 mb-2">Current Cover:</p>
//                           <div className="relative w-full h-32 rounded-lg overflow-hidden">
//                             <img src={task.coverImage} alt="Cover" className="w-full h-full object-cover" />
//                             <button
//                               onClick={() => setCoverImageMutation.mutate(null)}
//                               className="absolute top-2 right-2 p-1.5 bg-white/80 text-red-600 rounded-lg hover:bg-white"
//                             >
//                               <X className="size-4 />
//                             </button>
//                           </div>
//                         </div>
//                       )} */}
//                         </div>
//                         <div className="gap-y-4">
//                           <p> Files</p>
//                           {task.attachments.map((attachment: any) => (
//                             <div key={attachment.id} className="flex justify-between items-center">
//                               <div className="flex items-center gap-4">
//                                 <div className=" bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                   {attachment.mimeType?.startsWith('image/') ? (
//                                     <Image
//                                       onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
//                                       src={attachment.url}
//                                       alt=""
//                                       className="h-12 w-16 rounded-md object-cover cursor-pointer"
//                                       height={1000}
//                                       width={1000}
//                                     />
//                                   ) : (
//                                     <File className="size-5 text-indigo-600" />
//                                   )}

//                                 </div>

//                                 <div className="">
//                                   <p>{attachment.filename.slice(0, 25)}</p>
//                                   <p>{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'} . sep 24, 2025, 8:44 PM {attachment.createdAt}</p>
//                                 </div>
//                               </div>
//                               <div className="flex gap-2 justify-center items-center ">
//                                 <MoveUpRight onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')} className="h-3 w-3 text-white/70 cursor-pointer" />
//                                 <Button
//                                   variant="secondary"
//                                   className="px-2 bg-transparent text-white/70"
//                                 >
//                                   <Ellipsis />
//                                 </Button>
//                               </div>
//                               {attachment.mimeType?.startsWith('image/') && (
//                                 <button
//                                   onClick={() => {
//                                     const isCurrentCover = task.coverImage === attachment.url;
//                                     setCoverImageMutation.mutate(isCurrentCover ? null : attachment.url);
//                                   }}
//                                   className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${task.coverImage === attachment.url
//                                     ? 'bg-yellow-100 text-yellow-700'
//                                     : 'bg-white text-gray-600 hover:text-yellow-600'
//                                     }`}
//                                   title={task.coverImage === attachment.url ? 'Remove cover' : 'Set as cover'}
//                                 >
//                                   {task.coverImage === attachment.url ? (
//                                     <svg className="size-4 fill="currentColor" viewBox="0 0 20 20">
//                                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                     </svg>
//                                   ) : (
//                                     <svg className="size-4 fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//                                     </svg>
//                                   )}
//                                 </button>
//                               )}

//                               <button
//                                 onClick={(e) => {
//                                   e.preventDefault();
//                                   if (confirm('Delete this attachment?')) {
//                                     deleteAttachmentMutation.mutate(attachment.id);
//                                   }
//                                 }}
//                                 className="absolute bottom-2 right-2 p-1.5 bg-white text-red-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity"
//                               >
//                                 <Trash2 className="size-4 />
//                               </button>
//                             </div>
//                           ))}
//                         </div>
//                         {task.coverImage && (
//                           <div className="mt-4">
//                             <p className="text-xs text-gray-500 mb-2">Current Cover:</p>
//                             <div className="relative w-full h-32 rounded-lg overflow-hidden">
//                               <img src={task.coverImage} alt="Cover" className="w-full h-full object-cover" />
//                               <button
//                                 onClick={() => setCoverImageMutation.mutate(null)}
//                                 className="absolute top-2 right-2 p-1.5 bg-white/80 text-red-600 rounded-lg hover:bg-white"
//                               >
//                                 <X className="size-4 />
//                               </button>
//                             </div>
//                           </div>
//                         )}


//                         <div>
//                           <div className="flex items-center justify-between mb-3 mt-3">
//                             <div className="flex justify-start items-center gap-2">
//                               <h3 className="text-sm font-semibold flex items-center gap-2">
//                                 <CheckSquare className="size-4 />
//                                 Subtasks
//                               </h3>
//                               <span
//                                 data-testid="subtasks-header"
//                                 className="text-sm font-bold text-mid-grey dark:text-white"
//                               >
//                                 {`Subtasks (hello of 2)`}
//                               </span></div>
//                             {/* <span className="text-xs text-gray-500">{completedSubtasks}/{task.subtasks.length}</span> */}
//                           </div>

//                           {/* Progress bar */}
//                           <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
//                             <div
//                               className="bg-indigo-600 h-2 rounded-full transition-all"
//                               style={{ width: `${progress}%` }}
//                             ></div>
//                           </div>

//                           <div className="gap-y-2">
//                             {task.subtasks.map((subtask: any) => (
//                               <div
//                                 key={subtask.id}
//                                 className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={subtask.isCompleted}
//                                   onChange={(e) => toggleSubtaskMutation.mutate({
//                                     subtaskId: subtask.id,
//                                     isCompleted: e.target.checked
//                                   })}
//                                   className="size-4text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
//                                 />
//                                 <span className={`text-sm flex-1 ${subtask.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
//                                   {subtask.title}
//                                 </span>
//                                 <button
//                                   onClick={() => {/* delete subtask */ }}
//                                   className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-600 rounded"
//                                 >
//                                   <Trash2 className="size-3" />
//                                 </button>
//                               </div>
//                             ))}

//                             <div className="flex gap-2 mt-3">
//                               <input
//                                 type="text"
//                                 value={newSubtask}
//                                 onChange={(e) => setNewSubtask(e.target.value)}
//                                 onKeyDown={(e) => {
//                                   if (e.key === 'Enter' && newSubtask.trim()) {
//                                     createSubtaskMutation.mutate(newSubtask);
//                                   }
//                                 }}
//                                 placeholder="Add a subtask..."
//                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                               />
//                               <button
//                                 onClick={() => newSubtask.trim() && createSubtaskMutation.mutate(newSubtask)}
//                                 className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
//                               >
//                                 <Plus className="size-4 />
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </>

                   
//                   </ResizablePanel>
//                   {/* <ResizableHandle className="dark:bg-neutral-900" /> */}
//                   {/* <ResizablePanel
//                     defaultSize={40}
//                     className="dark:bg-neutral-950"
//                   >
//                     <ScrollArea className="h-full overflow-auto px-4 py-6 ">
//                       <div className="flex justify-between items-start w-full">
//                         <span className="flex items-center gap-2">
//                           {' '}
//                           <MessageSquareIcon className="text-white/70" />{' '}
//                           <p className=" text-white/70 font-medium">
//                             Comments and activity
//                           </p>
//                         </span>
//                         <Button
//                           variant="default"
//                           className=" text-white bg-neutral-900"
//                         >
//                           Show details
//                         </Button>
//                       </div>



//                       <div className="gap-y-4">
//                         {task.activities?.map((activity: any) => (
//                           <div key={activity.id} className="flex gap-3">
//                             <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0">
//                               {activity.user.image ? (
//                                 <img src={activity.user.image} alt="" className="size-8 rounded-full" />
//                               ) : (
//                                 <User className="size-4text-gray-600" />
//                               )}
//                             </div>
//                             <div className="flex-1">
//                               <p className="text-sm text-gray-700">
//                                 <span className="font-medium text-gray-900">{activity.user.name}</span>
//                                 {' '}{activity.description}
//                               </p>
//                               <p className="text-xs text-gray-500 mt-1">
//                                 {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                       <div className="space-y-6">
//                         {/* Description 

//                         <div>

//                           <CommentWithAttachments
//                             taskId={task.id}
//                             comments={task.boardComments || []}
//                             onAddComment={(content, attachments) => {
//                               // Create comment with attachments
//                               fetch(`/api/tasks/${task.id}/comments`, {
//                                 method: 'POST',
//                                 headers: { 'Content-Type': 'application/json' },
//                                 body: JSON.stringify({ content, attachments }),
//                               }).then(() => {
//                                 queryClient.invalidateQueries({ queryKey: ['board', boardId] });
//                               });
//                             }}
//                             onDeleteComment={(commentId) => {
//                               if (confirm('Delete this comment?')) {
//                                 fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
//                                   .then(() => queryClient.invalidateQueries({ queryKey: ['board', boardId] }));
//                               }
//                             }}
//                           />

//                         </div>
//                       </div>

//                     </ScrollArea>
//                   </ResizablePanel> */}
//                 </ResizablePanelGroup>
//               </ResizablePanel>
//               </ScrollArea>
//             </ResizablePanelGroup>
//           </ResizablePanel>
//         </ResizablePanelGroup>
//       </DialogContent>
//     </Dialog>
//   );
// }
