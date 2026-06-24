// // "use client";

// // import React, { useState } from "react";
// // import { useForm } from "react-hook-form";
// // import * as z from "zod";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { ArrowRightCircleIcon, Plus } from "lucide-react";
// // import axios from "axios";
// // import qs from "query-string";
// // import { useRouter } from "next/navigation";

// // import {
// //   FormControl,
// //   Form,
// //   FormField,
// //   FormItem
// // } from "@/components/ui/form";
// // import { Input } from "@/components/ui/input";
// // // import { useModal } from "hooks/use-modal-store";
// // import { EmojiPicker } from "@/components/chat-components/emoji-picker";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle
// // } from "@/components/ui/dialog";
// // import { Button } from "@/components/ui/button";
// // import { FileUpload } from "@/components/chat-components/file-upload";
// // import { DialogTrigger } from "../ui/dialog";

// // interface ChatInputProps {
// //   apiUrl: string;
// //   query: Record<string, any>;
// //   name: string;
// //   type: "conversation" | "channel";
// // }

// // const formSchema = z.object({
// //   content: z.string().min(1)
// // });

// // export function ChatInput({ apiUrl, query, name, type }: ChatInputProps) {
// //   // const { onOpen } = useModal();
// //   const router = useRouter();
// //   const [isLoading, setIsLoading] = useState(false)

// //   const form = useForm<z.infer<typeof formSchema>>({
// //     resolver: zodResolver(formSchema),
// //     defaultValues: { content: "" }
// //   });

// //   // const isLoading = form.formState.isSubmitting;

// //   // const onSubmit = async (values: z.infer<typeof formSchema>) => {
// //   //   try {
// //   //     const url = qs.stringifyUrl({
// //   //       url: apiUrl,
// //   //       query
// //   //     });

// //   //     await axios.post(url, values);

// //   //     form.reset();
// //   //     router.refresh();
// //   //   } catch (error) {
// //   //     console.error(error);
// //   //   }
// //   // };

// //   const onSubmit = async (values: z.infer<typeof formSchema>) => {
// //     try {
// //       setIsLoading(true);
// //       const url = qs.stringifyUrl({
// //         url: apiUrl,
// //         query   
// //       });

// //       await axios.post(url, values);
// //       form.reset();
// //     } catch (error) {
// //       console.error(error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if (e.key === 'Enter' && !e.shiftKey) {
// //       e.preventDefault();
// //       form.handleSubmit(onSubmit)();
// //     }
// //   };

// //   // const Fileform = useForm({
// //   //   resolver: zodResolver(formSchema),
// //   //   defaultValues: {
// //   //     fileUrl: ""
// //   //   }
// //   // });

// //   // const isLoading = form.formState.isSubmitting;

// //   const onFileSubmit = async (values: z.infer<typeof formSchema>) => {
// //     try {
// //       const url = qs.stringifyUrl({
// //         url: apiUrl || "",
// //         query
// //       });
// //       await axios.post(url, { ...values, content: values.content });

// //       form.reset();
// //       router.refresh();
// //     } catch (error) {
// //       console.error(error);
// //     }
// //   };

// //   return (
// //     <Form {...form}>
// //       <form onSubmit={form.handleSubmit(onSubmit)}>
// //         <FormField
// //           control={form.control}
// //           name="content"
// //           render={({ field }) => (
// //             <FormItem>
// //               <FormControl>
// //                 <div className="relative flex items-center p-3 px-4 pb-4">
                  
// //                   <Dialog >
// //                     <DialogTrigger>
// //                       <button
// //                     type="button"
// //                     // onClick={() =>
// //                     //   onOpen("messageFile", { apiUrl, query })
// //                     // }
// //                     className="absolute top-6 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
// //                   >
// //                     <Plus className="text-white dark:text-[#313338]" />
// //                   </button>
// //                     </DialogTrigger>
// //       <DialogContent className="bg-white text-black p-0 overflow-hidden">
// //         <DialogHeader className="pt-8 px-6">
// //           <DialogTitle className="text-2xl text-center font-bold">
// //             Add an attachment
// //           </DialogTitle>
// //           <DialogDescription className="text-center text-zinc-500">
// //             Send a file as a message.
// //           </DialogDescription>
// //         </DialogHeader>
// //         <Form {...form}>
// //           <form
// //             onSubmit={form.handleSubmit(onSubmit)}
// //             className="space-y-8"
// //           >
// //             <div className="space-y-8 px-6">
// //               <div className="flex items-center justify-center text-center">
// //                 <FormField
// //                   control={form.control}
// //                   name="fileUrl"
// //                   render={({ field }) => (
// //                     <FormItem>
// //                       <FormControl>
// //                         <FileUpload
// //                           endpoint="messageFile"
// //                           value={field.value}
// //                           onChange={field.onChange}
// //                         />
// //                       </FormControl>
// //                     </FormItem>
// //                   )}
// //                 />
// //               </div>
// //             </div>
// //             <DialogFooter className="bg-gray-100 px-6 py-4">
// //               <Button disabled={isLoading} variant="default">
// //                 Send
// //               </Button>
// //             </DialogFooter>
// //           </form>
// //         </Form>
// //       </DialogContent>
// //     </Dialog>
// //                       <Input
// //                      placeholder={`Message ${
// //                       type === "conversation" ? name : "#" + name
// //                     }`}
// //                     disabled={isLoading}
// //                     className="px-14 md:py-6 bg-zinc-200/90 dark:bg-neutral-900 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
// //                     {...field}
// //                   />
// //                   <div className="absolute top-7 right-8">
// //                     <EmojiPicker
// //                       onChange={(emoji: string) =>
// //                         field.onChange(`${field.value} ${emoji}`)
// //                       }
// //                     />
// //                   </div>
// //                   {/* <Button onClick={() => form.handleSubmit(onSubmit)()}> <ArrowRightCircleIcon/> </Button> */}
// //                 </div>
// //               </FormControl>
// //             </FormItem>
// //           )}
// //         />
// //       </form>
// //     </Form>
// //   );
// // }


// "use client";

// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { ArrowRightCircleIcon, Plus } from "lucide-react";
// import axios from "axios";
// import qs from "query-string";
// import { useRouter } from "next/navigation";

// import {
//   FormControl,
//   Form,
//   FormField,
//   FormItem
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { EmojiPicker } from "@/components/chat-components/emoji-picker";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { FileUpload } from "@/components/chat-components/file-upload";
// import { DialogTrigger } from "../ui/dialog";
// import { DriveButton } from "@/components/integrations/google/DriveButton";

// interface ChatInputProps {
//   apiUrl: string;
//   query: Record<string, any>;
//   name: string;
//   type: "conversation" | "channel";
// }

// const textFormSchema = z.object({
//   content: z.string().min(1)
// });

// const fileFormSchema = z.object({
//   fileUrl: z.string().min(1, { message: "File is required." })
// });

// export function ChatInput({ apiUrl, query, name, type }: ChatInputProps) {
//   const { refresh } = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [fileUrl, setFileUrl] = useState("");

//   // Form for text messages
//   const textForm = useForm<z.infer<typeof textFormSchema>>({
//     resolver: zodResolver(textFormSchema),
//     defaultValues: { content: "" }
//   });

//   // Form for file uploads
//   const fileForm = useForm<z.infer<typeof fileFormSchema>>({
//     resolver: zodResolver(fileFormSchema),
//     defaultValues: { fileUrl: "" }
//   });

//   const onSubmitText = async (values: z.infer<typeof textFormSchema>) => {
//     try {
//       setIsLoading(true);
//       const url = qs.stringifyUrl({
//         url: apiUrl,
//         query   
//       });

//       await axios.post(url, values);
//       textForm.reset();
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const onSubmitFile = async (values: z.infer<typeof fileFormSchema>) => {
//     try {
//       setIsLoading(true);
//       const url = qs.stringifyUrl({
//         url: apiUrl,
//         query
//       });

//       // Get file type from the URL
//       const fileExtension = values.fileUrl.split('.').pop() || '';
//       const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase());
//       const isPdf = fileExtension.toLowerCase() === 'pdf';

//       // Send the proper message structure
//       const messageData = {
//         content: values.fileUrl,
//         fileUrl: values.fileUrl, // Some backends expect this field
//         ...(isImage && { imageUrl: values.fileUrl }), // If it's an image
//         ...(isPdf && { pdfUrl: values.fileUrl }), // If it's a PDF
//         type: isImage ? 'image' : isPdf ? 'pdf' : 'file' // Add type field
//       };

//       console.log("Sending file message:", messageData);
      
//       await axios.post(url, messageData);
      
//       // Reset and close dialog
//       fileForm.reset();
//       setFileUrl("");
//       setIsDialogOpen(false);
//       refresh();
//     } catch (error) {
//       console.error("Error sending file message:", error);
//       // Check what error response contains
//       if (error.response) {
//         console.error("Server response:", error.response.data);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       textForm.handleSubmit(onSubmitText)();
//     }
//   };

//   const handleFileChange = (url: string | undefined) => {
//     if (url) {
//       setFileUrl(url);
//       fileForm.setValue("fileUrl", url);
//     }
//   };

//   return (
//     <>
//       {/* Text Message Form */}
//       <Form {...textForm}>
//         <form onSubmit={textForm.handleSubmit(onSubmitText)}>
//           <FormField
//             control={textForm.control}
//             name="content"
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <div className="relative bg-transparent flex items-center p-3 px-4 pb-4">
//                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                       <DialogTrigger asChild>
//                         <button
//                           type="button"
//                           className="absolute top-6 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
//                         >
//                           <Plus className="text-white dark:text-[#313338]" />
//                         </button>
//                       </DialogTrigger>
//                     {/*  <DialogContent className="bg-white text-black p-0 overflow-hidden !min-w-[30vw] w-[30vw] h-[50vh]">
//   <DialogHeader className="pt-8 px-6">
//     <DialogTitle className="text-2xl text-center font-bold">
//       Add an attachment
//     </DialogTitle>
//     <DialogDescription className="text-center text-zinc-500">
//       Send a file or Google Drive link.
//     </DialogDescription>
//   </DialogHeader>
  
//   <div className="space-y-6 px-6 pb-6">
  
//     <FormField
//       control={fileForm.control}
//       name="fileUrl"
//       render={({ field }) => (
//         <FormItem>
//           <FormControl>
//             <FileUpload
//               endpoint="messageFile"
//               value={field.value}
//               onChange={handleFileChange}
//             />
//           </FormControl>
//         </FormItem>
//       )}
//     />
//     <DialogFooter className="bg-gray-100 px-6 py-4">
//              <Button disabled={isLoading} onClick={onSubmitFile} variant="default">
//                  Send
//                </Button>
//              </DialogFooter>
    

   
//     {/* <DriveButton
//       mode="share"
//       onSelect={(file, action, result) => {
//         if (action === 'share' && result.shareUrl) {
//           // Convert Google Drive sharing URL to direct URL to avoid next/image errors
//           const fileId = result.shareUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
//           const directUrl = fileId 
//             ? `https://drive.google.com/uc?export=view&id=${fileId}`
//             : result.shareUrl;
            
//           onSubmitFile({ fileUrl: directUrl });
//         }
//       }}
//     /> *
//   </div>
// </DialogContent>
//                     </Dialog> */}
//                     <DialogContent className="bg-white text-black p-0 overflow-hidden !min-w-[30vw] w-[30vw] h-[50vh]">
//   <DialogHeader className="pt-8 px-6">
//     <DialogTitle className="text-2xl text-center font-bold">
//       Add an attachment
//     </DialogTitle>
//     <DialogDescription className="text-center text-zinc-500">
//       Send a file or Google Drive link.
//     </DialogDescription>
//   </DialogHeader>
  
//   {/* Wrap in Form provider and add form element */}
//   <Form {...fileForm}>
//     <form onSubmit={fileForm.handleSubmit(onSubmitFile)} className="flex flex-col h-full">
//       <div className="space-y-6 px-6 pb-6 flex-1">
//         <FormField
//           control={fileForm.control}
//           name="fileUrl"
//           render={({ field }) => (
//             <FormItem>
//               <FormControl>
//                 <FileUpload
//                   endpoint="messageFile"
//                   value={field.value}
//                   onChange={handleFileChange}
//                 />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//       </div>
      
//       {/* Move DialogFooter outside scrollable area */}
//       <DialogFooter className="bg-gray-100 px-6 py-4">
//         <Button disabled={isLoading || !fileUrl} type="submit" variant="default">
//           Send
//         </Button>
//       </DialogFooter>
//     </form>
//   </Form>
// </DialogContent>
// </Dialog>
                   

//                     <Input
//                       placeholder={`Message ${
//                         type === "conversation" ? name : "#" + name
//                       }`}
//                       disabled={isLoading}
//                       className="px-14 md:py-6 bg-zinc-200/90 dark:bg-neutral-900 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
//                       onKeyDown={handleKeyDown}
//                       {...field}
//                     />
//                     <div className="absolute top-7 right-8">
//                       <EmojiPicker
//                         onChange={(emoji: string) =>
//                           field.onChange(`${field.value} ${emoji}`)
//                         }
//                       />
//                     </div>
//                   </div>
//                 </FormControl>
//               </FormItem>
//             )}
//           />
//         </form>
//       </Form>
//     </>
//   );
// }
