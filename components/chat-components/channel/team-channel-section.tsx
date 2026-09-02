"use client";

import { ChannelType } from "@prisma/client";
import { ActionTooltip } from "@/components/chat-components/action-tooltip";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal';
import { Ellipsis } from "@/components/animate-ui/icons/ellipsis";
import { FileUpload } from "../file-upload";

const formSchema = z.object({
  name: z.string().min(1, { message: "Channel name is required." })
    .refine((name) => name !== "general", { message: "Channel name cannot be 'general'" }),
  description: z.string().optional(),
  type: z.nativeEnum(ChannelType),
  visibility: z.enum(["TEAM", "RESTRICTED"]),
  memberIds: z.array(z.string()).optional(),
  coverImage: z.string().optional(), // NEW
});

// Team-wide role, not channel-specific
type TeamRole = "ADMIN" | "OWNER" | "MEMBER" | "CLIENT" | "MANAGER" | "INTERN";

const CAN_CREATE_CHANNEL: TeamRole[] = ["ADMIN", "OWNER", "MANAGER"];
const CAN_MANAGE_MEMBERS: TeamRole[] = ["ADMIN", "OWNER"];

const roleIconMap: Record<string, React.ReactNode> = {
  MEMBER: null,
  CLIENT: null,
  INTERN: null,
  MANAGER: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
  OWNER: <ShieldAlert className="h-4 w-4 ml-2 text-amber-500" />,
};

interface TeamMemberEntry {
  id: string; // TeamMember.id
  role: TeamRole;
  userId: string;
  user: { id: string; name: string; email: string; image?: string | null };
}

interface TeamChannelSectionProps {
  label: string;
  role?: TeamRole;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
  teamId?: string;      // for the "creator always has access" default in RESTRICTED
  members?: TeamMemberEntry[]; // full team roster, used both for member-picker and manage-members panel
}

export function TeamChannelSection({
  channelType,
  label,
  sectionType,
  role,
  teamId,
  members = [],
}: TeamChannelSectionProps) {
  const routerNext = useRouter();
  const { teamSlug } = routerNext.query;
  const [loadingId, setLoadingId] = useState("");
  const { reload } = useRouter();

  const onKick = async (teamMemberId: string) => {
    try {
      setLoadingId(teamMemberId);
      await fetch(`/api/team/${teamSlug}/members/${teamMemberId}`, {
        method: "DELETE",
      });
      reload();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (teamMemberId: string, newRole: TeamRole) => {
    try {
      setLoadingId(teamMemberId);
      await fetch(`/api/team/${teamSlug}/members/${teamMemberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      reload();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId("");
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: channelType || ChannelType.TEXT,
      visibility: "TEAM" as const,
      memberIds: [] as string[],
    }
  });

  useEffect(() => {
    form.setValue("type", channelType || ChannelType.TEXT);
  }, [channelType, form]);

  const isLoading = form.formState.isSubmitting;
  const visibility = form.watch("visibility");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    const res = await fetch(`/api/team/${teamSlug}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        description: values.description,
        type: values.type,
        visibility: values.visibility,
        memberIds: values.visibility === "RESTRICTED" ? values.memberIds : [],
        coverImage: values.coverImage || undefined, // NEW
      }),
    });
    if (!res.ok) throw new Error("Failed to create channel");
    form.reset();
    reload();
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="flex items-center !justify-between !py-0 w-full">
      <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
        {label}
      </p>

      {/* ── Create channel ─────────────────────────────────────────────── */}
      {role && CAN_CREATE_CHANNEL.includes(role) && sectionType === "channels" && (
        <ActionTooltip label="Create Channel" side="top">
          <Modal>
            <ModalTrigger
              className="text-zinc-500 p-1 w-fit text-center hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            >
              <PlusIcon animateOnHover className="h-4 w-4" />
            </ModalTrigger>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <ModalBody className="!max-w-[36%] !min-h-[95%] !h-[95%] !max-h-[95%] !w-[24%] !py-0">
                  <ModalContent className="!px-0 space-y-5 !pb-0">
                    <div className="pt-4 px-6 flex flex-col gap-2 text-center sm:text-left">
                      <h1 className="text-2xl text-center font-semibold leading-none">
                        Create Channel
                      </h1>
                    </div>

                    <ScrollArea className="max-h-[420px]">
                      <div className="space-y-6 px-6 pb-2">

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-bold">
                                Channel Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  disabled={isLoading}
                                  placeholder="Enter channel name"
                                  className="border focus-visible:ring-0 focus-visible:ring-offset-0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-bold">
                                Description (optional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  disabled={isLoading}
                                  placeholder="What's this channel for?"
                                  className="border resize-none"
                                  rows={2}
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
                                  <SelectTrigger className="border focus:ring-0 ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                                    <SelectValue placeholder="Select a channel type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.values(ChannelType).map((type) => (
                                    <SelectItem key={type} value={type} className="capitalize">
                                      {type.toLowerCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="coverImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-bold">
                                Cover Image (optional)
                              </FormLabel>
                              <FormControl>
                                <FileUpload
                                  endpoint="channelImage"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="visibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Who can access</FormLabel>
                              <Select
                                disabled={isLoading}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="border focus:ring-0 ring-offset-0 outline-none">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="TEAM">Everyone on the team</SelectItem>
                                  <SelectItem value="RESTRICTED">Selected members only</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {visibility === "RESTRICTED" && (
                          <FormField
                            control={form.control}
                            name="memberIds"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-bold">
                                  Select members
                                </FormLabel>
                                <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                                  {members.length === 0 && (
                                    <p className="text-xs text-zinc-500 px-1 py-2">No other team members</p>
                                  )}
                                  {members.map((m) => (
                                    <label
                                      key={m.id}
                                      className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm"
                                    >
                                      <Checkbox
                                        checked={field.value?.includes(m.id)}
                                        onCheckedChange={(checked) => {
                                          const cur = field.value || [];
                                          field.onChange(
                                            checked ? [...cur, m.id] : cur.filter((id) => id !== m.id)
                                          );
                                        }}
                                      />
                                      <UserAvatar src={m.user.image as string} />
                                      <span className="truncate">{m.user.name}</span>
                                    </label>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </ScrollArea>
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

      {/* ── Manage team members ───────────────────────────────────────── */}
      {role && CAN_MANAGE_MEMBERS.includes(role) && sectionType === "members" && (
        <ActionTooltip label="Manage Members" side="top">
          <Modal>
            <ModalTrigger>
              <button type="button"
                className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              >
                <Ellipsis className="h-4 w-4" />
              </button>
            </ModalTrigger>
            <ModalBody className="!max-w-[32%] !min-h-[48%] !h-[52%] !max-h-[70%] !w-[20%] !py-0 dark:!bg-[#111]">
              <ModalContent className="!px-6 space-y-5 !pb-0">
                <div className="pt-0 px-4 flex flex-col gap-2 text-center sm:text-left">
                  <h1 className="text-2xl text-center font-semibold leading-none text-[#262626] dark:text-[#E4E4E6]">
                    Manage Team Members
                  </h1>
                  <p className="text-center text-[#B4B4B4]">
                    {members.length} Members
                  </p>
                </div>
                <ScrollArea className="mt-12 max-h-[450px]">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-x-2 px-2 py-1 mb-3 rounded-md hover:bg-[#f1f1f1] hover:dark:bg-[#222222]">
                      <UserAvatar src={m.user.image as string} />
                      <div className="flex flex-col gap-y-1">
                        <div className="text-xs font-semibold dark:text-[#E4E4E6] flex items-center">
                          {m.user.name}
                          {roleIconMap[m.role]}
                        </div>
                        <p className="text-xs text-zinc-500">{m.user.email}</p>
                      </div>
                      {m.role !== "OWNER" && loadingId !== m.id && (
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
                                    <DropdownMenuItem onClick={() => onRoleChange(m.id, "MEMBER")}>
                                      <Shield className="h-4 w-4 mr-2" />
                                      Member
                                      {m.role === "MEMBER" && <Check className="h4 w-4 ml-auto" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onRoleChange(m.id, "MANAGER")}>
                                      <ShieldCheck className="h-4 w-4 mr-2" />
                                      Manager
                                      {m.role === "MANAGER" && <Check className="h4 w-4 ml-auto" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onRoleChange(m.id, "ADMIN")}>
                                      <ShieldAlert className="h-4 w-4 mr-2" />
                                      Admin
                                      {m.role === "ADMIN" && <Check className="h4 w-4 ml-auto" />}
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator className="dark:border-[#262626]" />
                              <DropdownMenuItem onClick={() => onKick(m.id)}>
                                <Gavel className="h-4 w-4 mr-2" />
                                Remove from team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      {loadingId === m.id && (
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