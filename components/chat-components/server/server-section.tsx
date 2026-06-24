"use client";

import { ChannelType, MemberRole } from "@prisma/client";
import { Plus, Settings } from "lucide-react";
import { ServerWithMembersWithProfiles } from "types";
import { ActionTooltip } from "@/components/chat-components/action-tooltip";
// import { useModal } from "hooks/use-modal-store";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/router";
import qs from "query-string";
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
import { DialogDescription } from "../ui/dialog";
// import { useModal } from "hooks/use-modal-store";
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/chat-components/user-avatar";
import { PlusIcon } from "@/components/animate-ui/icons/plus";
// import { useModal } from "hooks/use-modal-store";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal';
import { Ellipsis } from "@/components/animate-ui/icons/ellipsis";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Channel name is required." })
    .refine((name) => name !== "general", {
      message: "Channel name cannot be 'general'"
    }),
  type: z.nativeEnum(ChannelType)
});

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
};

interface ServerSectionProps {
  label: string;
  role?: MemberRole;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
  server?: ServerWithMembersWithProfiles;
}

export function ServerSection({
  channelType,
  label,
  sectionType,
  role,
  server
}: ServerSectionProps) {
  // const { onOpen } = useModal();
  // const { isOpen, onClose, type, data } = useModal();
  const routerNext = useRouter();
  const { serverId } = routerNext.query;
  const [loadingId, setLoadingId] = useState("");
  const { reload } = useRouter()

  // const { server } = data as { server: ServerWithMembersWithProfiles };

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id }
      });

      const response = await axios.delete(url);

      reload();
      ({ server: response.data });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id }
      });

      const response = await axios.patch(url, { role });

      reload();
      ({ server: response.data });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId("");
    }
  };

  // const isModalOpen = isOpen && type === "createChannel";
  // const { channelType } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channelType || ChannelType.TEXT
    }
  });

  useEffect(() => {
    if (channelType) {
      form.setValue("type", channelType);
    } else {
      form.setValue("type", ChannelType.TEXT);
    }
  }, [channelType, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: "/api/channels",
        query: { serverId }
      });

      await axios.post(url, values);

      form.reset();
      reload();
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div className="flex items-center !justify-between !py-0 w-full">
      <p className="text-xs Capitalize  text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {role !== MemberRole.GUEST && sectionType === "channels" && (
        <ActionTooltip label="Create Channel" side="top">

          <Modal >
            <ModalTrigger
              className="text-zinc-500 p-1 w-fit text-center hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            >
              <PlusIcon animateOnHover className="h-4 w-4" />


            </ModalTrigger>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="">
                <ModalBody className=" !max-w-[32%] !min-h-[48%] !h-[52%] !max-h-[70%] !w-[20%] !py-0">
                  <ModalContent className="!px-0 space-y-5 !pb-0">
                    <div className="pt-4 px-6 flex flex-col gap-2 text-center sm:text-left">
                      <h1 className="text-2xl text-center font-semibold leading-none ">
                        Create Channel
                      </h1>
                    </div>

                    <div className="space-y-8 px-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase text-xs font-bold ">
                              Channel Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={isLoading}
                                placeholder="Enter channel name"
                                className=" border focus-visible: ring-0 focus-visible:ring-offset-0"
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
                                <SelectTrigger className=" border focus:ring-0 ring-offset-0 focus:ring-offset-0 capitalize outline-none">
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


                  </ModalContent>
                  <ModalFooter className="bg-gray-100 px-6 py-4">
                    <Button disabled={isLoading} type="submit" variant="default">
                      Create
                    </Button>
                  </ModalFooter>
                </ModalBody>
              </form>
            </Form>
          </Modal>
        </ActionTooltip>
      )}
      {role === MemberRole.ADMIN && sectionType === "members" && (
        <ActionTooltip label="Manage Members" side="top">

          <Modal>

            <ModalTrigger>
              <button type="button"
                className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              >
                <Ellipsis className="h-4 w-4" />
              </button>
            </ModalTrigger>
            <ModalBody className=" !max-w-[32%] !min-h-[48%] !h-[52%] !max-h-[70%] !w-[20%] !py-0 dark:!bg-[#111]">
              <ModalContent className="!px-6 space-y-5 !pb-0">
                <div className="pt-0 px-4 flex flex-col gap-2 text-center sm:text-left">
                  <h1 className="text-2xl text-center font-semibold leading-none text-[#262626] dark:text-[#E4E4E6]">
                    Manage Members
                  </h1>
                  <p className="text-center text-[#B4B4B4]">
                    {server?.members?.length} Members
                  </p>
                </div>
                <ScrollArea className="mt-12 max-h-[450px]">
                  {server?.members?.map((member) => (
                    <div key={member.id} className="flex items-center gap-x-2 px-2 py-1 mb-3 rounded-md hover:bg-[#f1f1f1] hover:dark:bg-[#222222]">
                      <UserAvatar src={member.user.image as string} />
                      <div className="flex flex-col gap-y-1">
                        <div className="text-xs font-semibold dark:text-[#E4E4E6] flex items-center">
                          {member.user.name}
                          {roleIconMap[member.role]}
                        </div>
                        <p className="text-xs text-zinc-500">{member.user.email}</p>
                      </div>
                      {server.userId !== member.user.id &&
                        loadingId !== member.id && (
                          <div className="ml-auto">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <MoreVertical className="h-4 w-4 text-zinc-500" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="left" className="dark:!bg-[#000] dark:border-[#262626]">
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="flex items-center">
                                    <ShieldQuestion className="size-4 mr-2" />
                                    <span>Role</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="dark:!border-[#262626] dark:bg-[#000]">
                                      <DropdownMenuItem
                                        onClick={() => onRoleChange(member.id, "GUEST")}
                                      >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Guest
                                        {member.role === "GUEST" && (
                                          <Check className="h4 w-4 ml-auto" />
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          onRoleChange(member.id, "MODERATOR")
                                        }
                                      >
                                        <ShieldCheck className="h-4 w-4 mr-2" />
                                        Moderator
                                        {member.role === "MODERATOR" && (
                                          <Check className="h4 w-4 ml-auto" />
                                        )}
                                      </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator className="dark:border-[#262626]" />
                                <DropdownMenuItem onClick={() => onKick(member.id)}>
                                  <Gavel className="h-4 w-4 mr-2" />
                                  Kick
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      {loadingId === member.id && (
                        <Loader2 className="animate-spin text-zinc-500 ml-auto size-4" />
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </ModalContent>
            </ModalBody>
          </Modal>
        </ActionTooltip>
      )}
    </div>
  );
}
