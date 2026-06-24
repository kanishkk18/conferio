"use client";

import { Member, MemberRole, User, Server } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/chat-components/user-avatar";

interface ServerMemberProps {
  member: Member & { user: User };
  server: Server;
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: (
    <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
  )
};

export const ChatMember = ({ member }: ServerMemberProps) => {
  const params = useParams();
  const { push } = useRouter()
  const icon = roleIconMap[member.role];

  const onClick = () =>
  push(`/servers/${params?.serverId}/conversations/${member.id}`);

  return (
    <button type="button"
      onClick={onClick}
      className={cn(
        "group   p-2    rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.memberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      <UserAvatar
        src={member.user.image as string}
        className="h-8 w-8 md:h-8 md:w-8"
      />
      <p
        className={cn(
          "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params?.memberId === member.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {member.user.name}
      </p>
      {icon}
    </button>
  );
};

// "use client";

// import { Member, MemberRole, User, Server, Team } from "@prisma/client";
// import { ShieldAlert, ShieldCheck } from "lucide-react";
// import { useRouter } from "next/router";

// import { cn } from "@/lib/utils";
// import { UserAvatar } from "@/components/chat-components/user-avatar";
// import { TeamMemberWithUser } from "hooks/useTeamMembers";

// interface ServerMemberProps {
//   member: Member & { user: User };
//   server: Server;
// }

// const roleIconMap = {
//   [MemberRole.GUEST]: null,
//   [MemberRole.MODERATOR]: (
//     <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />
//   ),
//   [MemberRole.ADMIN]: (
//     <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
//   )
// };

// interface ServerMemberProps {
//   member: Member & { user: User };
//   server: Server;
//   team: Team;
//   onMemberSelect: (member: TeamMemberWithUser) => void;
//   selectedMemberId?: string;
//   isCurrentUser?: boolean;
// }

// export const ChatMember = ({
//   member, 
//   onMemberSelect, 
//   selectedMemberId,
//   isCurrentUser 
//  }: ServerMemberProps) => {
//   const router = useRouter();
//   const { serverId, memberId } = router.query; // 👈 Pages router way

//   const icon = roleIconMap[member.role];

//   const onClick = () => {
//     if (serverId) {
//       router.push(`/servers/${serverId}/conversations/${member.id}`);
//     }
//   };

//   return (
//     <button
//       onClick={onClick}
//       //  onClick={() => onMemberSelect(member.id)}
//       className={cn(
//         "group   p-1   rounded-md flex flex-col items-center !-space-y-5 w-fit hover:bg-neutral-900 hover:dark:bg-neutral-900 transition",
//         memberId === member.id && "bg-neutal-900 dark:bg-neutral-900"
//       )}
//     >
//       <UserAvatar
//         src={member.user.image ?? ""} // ✅ safe access to image
//         className="h-4 w-4 md:h-5 md:w-5"
//       />
//       {/* <p
//         className={cn(
//           " text-sm text-[#B4B4B4] capitalize group-hover:text-zinc-600 dark:text-[#B4B4B4] dark:group-hover:text-zinc-300 transition",
//           memberId === member.id &&
//             "text-primary dark:text-zinc-200 dark:group-hover:text-white"
//         )}
//       >
//         {member.user.name}
//       </p> */}
      
//     </button>
//   );
// };


// "use client";

// import { Member, MemberRole, User, Server } from "@prisma/client";
// import { ShieldAlert, ShieldCheck } from "lucide-react";
// import { useRouter } from "next/navigation"; // Use next/navigation for App Router

// import { cn } from "@/lib/utils";
// import { UserAvatar } from "@/components/chat-components/user-avatar";

// interface ChatMemberProps {
//   member: Member & { user: User };
//   server?: Server;
//   onMemberSelect?: (member: Member & { user: User }) => void;
//   selectedMemberId?: string;
//   isCurrentUser?: boolean;
// }

// const roleIconMap = {
//   [MemberRole.GUEST]: null,
//   [MemberRole.MODERATOR]: (
//     <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />
//   ),
//   [MemberRole.ADMIN]: (
//     <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
//   )
// };

// export const ChatMember = ({
//   member, 
//   server,
//   onMemberSelect, 
//   selectedMemberId,
//   isCurrentUser 
//  }: ChatMemberProps) => {
//   const router = useRouter();

//   const icon = roleIconMap[member.role];

//   const handleClick = () => {
//     // Call the member select handler if provided
//     if (onMemberSelect) {
//       onMemberSelect(member);
//     }
    
//     // Navigate to conversation if server context exists
//     if (server?.id) {
//       router.push(`/servers/${server.id}/conversations/${member.id}`);
//     }
//   };

//   if (isCurrentUser) return null;

//   return (
//     <button
//       onClick={handleClick}
//       className={cn(
//         "group   p-2    rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
//         selectedMemberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700/50"
//       )}
//     >
//       <UserAvatar
//         src={member.user.image ?? ""}
//         className="h-8 w-8 md:h-8 md:w-8"
//       />
//       <p
//         className={cn(
//           "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
//           selectedMemberId === member.id &&
//             "text-primary dark:text-zinc-200 dark:group-hover:text-white"
//         )}
//       >
//         {member.user.name}
//       </p>
//       {icon}
//     </button>
//   );
// };
