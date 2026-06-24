// "use client";

// import React from "react";
// import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
// import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
// import { useParams, useRouter } from "next/navigation";

// import { cn } from "@/lib/utils";
// import { ActionTooltip } from "@/components/action-tooltip";
// import { ModalType, useModal } from "hooks/use-modal-store";

// interface ServerChannelProps {
//   channel: Channel;
//   server: Server;
//   role?: MemberRole;
// }

// const iconMap = {
//   [ChannelType.TEXT]: Hash,
//   [ChannelType.AUDIO]: Mic,
//   [ChannelType.VIDEO]: Video
// };

// export function ServerChannel({
//   channel,
//   server,
//   role
// }: ServerChannelProps) {
//   const { onOpen } = useModal();
//   const params = useParams();
//   const router = useRouter();

//   const Icon = iconMap[channel.type];

//   const onClick = () =>
//     push(`/servers/${params?.serverId}/channels/${channel.id}`);

//   const onAction = (e: React.MouseEvent, action: ModalType) => {
//     e.stopPropagation();

//     onOpen(action, { channel, server });
//   };

//   return (
//     <button
//       className={cn(
//         "group   p-2    rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
//         params?.channelId === channel.id &&
//           "bg-zinc-700/20 dark:bg-zinc-700"
//       )}
//       onClick={onClick}
//     >
//       <Icon className="flex-shrink-0 size-5 text-zinc-500 dark:text-zinc-400" />
//       <p
//         className={cn(
//           "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
//           params?.channelId === channel.id &&
//             "text-primary dark:text-zinc-200 dark:group-hover:text-white"
//         )}
//       >
//         {channel.name}
//       </p>
//       {channel.name !== "general" && role !== MemberRole.GUEST && (
//         <div className="ml-auto flex items-center gap-x-2">
//           <ActionTooltip label="Edit">
//             <Edit
//               onClick={(e) => onAction(e, "editChannel")}
//               className="hidden group-hover:block size-4text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
//             />
//           </ActionTooltip>
//           <ActionTooltip label="Delete">
//             <Trash
//               onClick={(e) => onAction(e, "deleteChannel")}
//               className="hidden group-hover:block size-4text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
//             />
//           </ActionTooltip>
//         </div>
//       )}
//       {channel.name === "general" && (
//         <Lock className="ml-auto size-4text-zinc-500 dark:text-zinc-400" />
//       )}
//     </button>
//   );
// }

"use client";

import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
// import { useModal, ModalType } from "hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/chat-components/action-tooltip";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/router";
import qs from "query-string";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/animate-ui/icons/lock";
import HashtagIcon from "@/components/ui/hashtag-icon";
// import { useModal } from "hooks/use-modal-store";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Channel name is required." })
    .refine((name) => name !== "general", {
      message: "Channel name cannot be 'general'"
    }),
  type: z.nativeEnum(ChannelType)
});

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: HashtagIcon,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video
};

export function ServerChannel({ channel, server, role }: ServerChannelProps) {
  // const { onOpen } = useModal();
  const { push } = useRouter();
  const { reload } = useRouter();
  const router = useRouter();

  const Icon = iconMap[channel.type];

  const onClick = () => {
    push(`/servers/${server.id}/channels/${channel.id}`);
  };

  // const { isOpen, onClose, type, data } = useModal();

  // const isModalOpen = isOpen && type === "editChannel";
  // const { channel, server } = data;

  const [isLoading, setIsLoading] = useState(false);


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channel?.type || ChannelType.TEXT
    }
  });

  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [form, channel]);

  // const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: { serverId: server?.id }
      });

      await axios.patch(url, values);

      form.reset();
      reload();
    } catch (error) {
      console.error(error);
    }
  };

  const currentChannelId = router.query.channelId;

  const onClickDelete = async () => {
    try {
      setIsLoading(true);

      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id
        }
      });

      await axios.delete(url);
      reload();
      push(`/servers/${server?.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <button type="button"
      className={cn(
        "group px-2 py-1 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-neutral-900 transition mb-1",
        currentChannelId === channel.id && "bg-zinc-700 dark:bg-neutral-900"
      )}
      onClick={onClick}
    >
      <Icon className="flex-shrink-0 size-4 text-[#B4B4B4] dark:text-[#B4B4B4]" />
      <p
        className={cn(
          "line-clamp-1 capitalize font-normal text-sm text-[#B4B4B4] group-hover:text-zinc-600 dark:text-[#B4B4B4] dark:group-hover:text-zinc-300 transition",
          currentChannelId === channel.id &&
          "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {channel.name}
      </p>

      {channel.name !== "general" && role !== MemberRole.GUEST && (
        <div className="ml-auto flex items-center gap-x-2">

          <Dialog>
            <DialogTrigger>
              <ActionTooltip label="Edit">
                <Edit
                  className="hidden group-hover:block size-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                />
              </ActionTooltip>
            </DialogTrigger>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
              <DialogHeader className="pt-8 px-6">
                <DialogTitle className="text-2xl text-center font-bold">
                  Edit Channel
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-8 px-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                            Channel Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={isLoading}
                              placeholder="Enter channel name"
                              className="bg-zinc-300/50 border-0 focus-visible: ring-0 text-black focus-visible:ring-offset-0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel Type</FormLabel>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                                <SelectValue placeholder="Select a channel type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(ChannelType).map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  className="capitalize"
                                >
                                  {type.toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter className="bg-gray-100 px-6 py-4">
                    <Button disabled={isLoading} variant="default">
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger>
              <ActionTooltip label="Delete">
                <Trash
                  className="hidden group-hover:block size-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                />
              </ActionTooltip>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle> Delete Channel</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to do this?
                  <br />
                  <span className="font-semibold text-indigo-500">
                    #{channel?.name}
                  </span>{" "}
                  will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={isLoading} onClick={onClickDelete}> Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {channel.name === "general" && (
        <LockIcon animateOnHover
          className="ml-auto size-4 text-zinc-500 dark:text-zinc-400" />
      )}
    </button>
  );
}
