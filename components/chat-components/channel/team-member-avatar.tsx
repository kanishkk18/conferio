"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/chat-components/user-avatar";

type TeamRole = "ADMIN" | "OWNER" | "MEMBER" | "CLIENT" | "MANAGER" | "INTERN";

interface TeamMemberEntry {
  id: string;
  role: TeamRole;
  userId: string;
  user: { id: string; name: string; email: string; image?: string | null };
}

interface TeamMemberAvatarProps {
  member: TeamMemberEntry;
  teamSlug: string;
}

const roleIconMap: Record<string, React.ReactNode> = {
  MANAGER: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
  OWNER: <ShieldAlert className="h-4 w-4 ml-2 text-amber-500" />,
};

export const TeamMemberAvatar = ({ member, teamSlug }: TeamMemberAvatarProps) => {
  const router = useRouter();
  const { push } = router;
  const { memberId } = router.query;

  const icon = roleIconMap[member.role] ?? null;


  return (
    <div className="flex flex-col items-center -gap-y-2">
      <button
        type="button"
        title={member.user.name}
        className={cn(
          "rounded-md flex flex-col items-center w-fit p-0.5 hover:bg-neutral-900 hover:dark:bg-neutral-900 transition",
          memberId === member.id && "bg-neutral-900 dark:bg-neutral-900"
        )}
      >
        <UserAvatar src={member.user.image ?? ""} className="h-6 w-6 md:h-7 md:w-7" />
      </button>
    </div>
  );
};