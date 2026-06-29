// // components/notifications/NotificationBell.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { useNotifications } from "./NotificationContext";
// import type { AppNotification, NotificationAction } from "../../types/notifications";
// import { BellRing } from "../animate-ui/icons/bell-ring";

// const ICONS: Record<string, string> = {
//   TASK_ASSIGNED: "📋",
//   TASK_UNASSIGNED: "📋",
//   TASK_STATUS_CHANGED: "🔄",
//   BOARD_MEMBER_ADDED: "🗂️",
//   PAGE_ASSIGNED: "📄",
//   PAGE_COMMENT_ADDED: "💬",
//   REMINDER_DUE: "⏰",
//   TEAM_MEMBER_ADDED: "👥",
//   MEETING_SCHEDULED: "📅",
//   MEETING_CANCELLED: "❌",
//   CALL_INCOMING: "📞",
//   CALL_MISSED: "📵",
//   FILE_UPLOADED_TEAM: "📁",
//   FILE_ASSIGNED: "📎",
//   FILE_ASSIGNED_WITH_PASSWORD: "🔐",
//   TIMER_APPROVAL_PENDING: "⏳",
//   TIMESHEET_APPROVED: "✅",
//   TIMESHEET_REJECTED: "❌",
//   TIMER_STARTED: "▶️",
//   TIMER_PAUSED: "⏸️",
//   TIMER_STOPPED: "⏹️",
//   WORKFLOW_EXECUTED: "⚡",
//   WORKFLOW_FAILED: "🔥",
// };

// function NotificationItem({
//   notification,
//   onRead,
//   onDismiss,
// }: {
//   notification: AppNotification;
//   onRead: () => void;
//   onDismiss: () => void;
// }) {
//   const icon = ICONS[notification.type] ?? "🔔";
//   const isUnread = !notification.read;

//   const handleActionClick = (action: NotificationAction, e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (action.action === "navigate" && action.endpoint) {
//       window.location.href = action.endpoint;
//     } else if (action.action === "open_url" && action.endpoint) {
//       window.open(action.endpoint, "_blank");
//     } else if (["accept_call", "decline_call", "approve_time", "reject_time"].includes(action.action) && action.endpoint) {
//       fetch(action.endpoint, { method: "POST" });
//     }
//     onRead();
//   };

//   return (
//     <div
//       onClick={onRead}
//       style={{
//         padding: "14px 16px",
//         borderBottom: "1px solid #F3F4F6",
//         cursor: "pointer",
//         backgroundColor: isUnread ? "#F0F9FF" : "#fff",
//         display: "flex",
//         gap: "12px",
//         alignItems: "flex-start",
//         transition: "background-color 0.15s",
//         position: "relative",
//       }}
//       onMouseEnter={(e) => {
//         (e.currentTarget as HTMLDivElement).style.backgroundColor = isUnread
//           ? "#E0F2FE"
//           : "#F9FAFB";
//       }}
//       onMouseLeave={(e) => {
//         (e.currentTarget as HTMLDivElement).style.backgroundColor = isUnread
//           ? "#F0F9FF"
//           : "#fff";
//       }}
//     >
//       {/* Unread dot */}
//       {isUnread && (
//         <div
//           style={{
//             position: "absolute",
//             top: "16px",
//             left: "6px",
//             width: "7px",
//             height: "7px",
//             borderRadius: "50%",
//             backgroundColor: "#3B82F6",
//           }}
//         />
//       )}

//       {/* Icon */}
//       <div style={{ fontSize: "20px", flexShrink: 0, paddingLeft: "4px" }}>
//         {icon}
//       </div>

//       {/* Content */}
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <p
//           style={{
//             fontWeight: isUnread ? 600 : 400,
//             fontSize: "13px",
//             color: "#111827",
//             margin: "0 0 2px",
//             lineHeight: 1.35,
//           }}
//         >
//           {notification.title}
//         </p>
//         <p
//           style={{
//             fontSize: "12px",
//             color: "#6B7280",
//             margin: "0 0 6px",
//             lineHeight: 1.4,
//             wordBreak: "break-word",
//           }}
//         >
//           {notification.body}
//         </p>

//         {/* Actions */}
//         {notification.actions && notification.actions.length > 0 && (
//           <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//             {(notification.actions as NotificationAction[]).map((action) => (
//               <button
//                 key={action.action}
//                 onClick={(e) => handleActionClick(action, e)}
//                 style={{
//                   padding: "3px 10px",
//                   borderRadius: "5px",
//                   fontSize: "11.5px",
//                   fontWeight: 600,
//                   cursor: "pointer",
//                   border:
//                     action.variant === "primary" || action.variant === "danger"
//                       ? "none"
//                       : "1px solid #D1D5DB",
//                   backgroundColor:
//                     action.variant === "primary"
//                       ? "#3B82F6"
//                       : action.variant === "danger"
//                       ? "#EF4444"
//                       : "#fff",
//                   color:
//                     action.variant === "primary" || action.variant === "danger"
//                       ? "#fff"
//                       : "#374151",
//                 }}
//               >
//                 {action.label}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Time */}
//         <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "6px 0 0" }}>
//           {formatRelativeTime(notification.createdAt)}
//         </p>
//       </div>

//       {/* Dismiss */}
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onDismiss();
//         }}
//         title="Dismiss"
//         style={{
//           background: "none",
//           border: "none",
//           cursor: "pointer",
//           color: "#9CA3AF",
//           fontSize: "14px",
//           padding: "0",
//           flexShrink: 0,
//           lineHeight: 1,
//         }}
//       >
//         ✕
//       </button>
//     </div>
//   );
// }

// export function NotificationBell() {
//   const { notifications, unreadCount, markRead, markAllRead, dismiss, fetchMore, isLoading } =
//     useNotifications();
//   const [open, setOpen] = useState(false);
//   const panelRef = useRef<HTMLDivElement>(null);
//   const bellRef = useRef<HTMLButtonElement>(null);

//   // Close on outside click
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (
//         panelRef.current &&
//         !panelRef.current.contains(e.target as Node) &&
//         !bellRef.current?.contains(e.target as Node)
//       ) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   // Mark all visible as read when opening panel
//   const handleOpen = () => {
//     setOpen((prev) => !prev);
//   };

//   return (
//     <div style={{ position: "relative", display: "inline-block" }}>
//       {/* Bell Button */}
//       <button
//         ref={bellRef}
//         onClick={handleOpen}
//         aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        
//       >
//         <BellRing className="size-4" />
//         {unreadCount > 0 && (
//           <span
//             style={{
//               position: "absolute",
//               top: "2px",
//               right: "2px",
//               backgroundColor: "#EF4444",
//               color: "#fff",
//               fontSize: "10px",
//               fontWeight: 700,
//               borderRadius: "9999px",
//               minWidth: "17px",
//               height: "17px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: "0 3px",
//               lineHeight: 1,
//             }}
//           >
//             {unreadCount > 99 ? "99+" : unreadCount}
//           </span>
//         )}
//       </button>

//       {/* Dropdown Panel */}
//       {open && (
//         <div
//           ref={panelRef}
//           style={{
//             position: "absolute",
//             top: "calc(100% + 8px)",
//             right: 0,
//             width: "400px",
//             maxHeight: "540px",
//             backgroundColor: "#fff",
//             borderRadius: "14px",
//             boxShadow:
//               "0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
//             border: "1px solid #E5E7EB",
//             zIndex: 999,
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden",
//           }}
//         >
//           {/* Header */}
//           <div
//             style={{
//               padding: "16px 18px",
//               borderBottom: "1px solid #F3F4F6",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               backgroundColor: "#fff",
//               flexShrink: 0,
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//               <span style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
//                 Notifications
//               </span>
//               {unreadCount > 0 && (
//                 <span
//                   style={{
//                     backgroundColor: "#EFF6FF",
//                     color: "#3B82F6",
//                     fontSize: "12px",
//                     fontWeight: 600,
//                     padding: "1px 8px",
//                     borderRadius: "9999px",
//                   }}
//                 >
//                   {unreadCount} new
//                 </span>
//               )}
//             </div>
//             {unreadCount > 0 && (
//               <button
//                 onClick={markAllRead}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   color: "#3B82F6",
//                   fontSize: "12.5px",
//                   fontWeight: 600,
//                   padding: "4px 8px",
//                   borderRadius: "6px",
//                 }}
//               >
//                 Mark all read
//               </button>
//             )}
//           </div>

//           {/* List */}
//           <div style={{ overflowY: "auto", flex: 1 }}>
//             {isLoading && notifications.length === 0 ? (
//               <div style={{ padding: "40px 0", textAlign: "center", color: "#9CA3AF" }}>
//                 <div style={{ fontSize: "28px", marginBottom: "8px" }}>⏳</div>
//                 <p style={{ fontSize: "13px", margin: 0 }}>Loading notifications…</p>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div style={{ padding: "50px 20px", textAlign: "center", color: "#9CA3AF" }}>
//                 <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔔</div>
//                 <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>
//                   All caught up!
//                 </p>
//                 <p style={{ fontSize: "12px", margin: 0 }}>No notifications yet</p>
//               </div>
//             ) : (
//               notifications.map((n) => (
//                 <NotificationItem
//                   key={n.id}
//                   notification={n}
//                   onRead={() => markRead(n.id)}
//                   onDismiss={() => dismiss(n.id)}
//                 />
//               ))
//             )}
//           </div>

//           {/* Footer */}
//           {notifications.length > 0 && (
//             <div
//               style={{
//                 padding: "10px 16px",
//                 borderTop: "1px solid #F3F4F6",
//                 display: "flex",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               <button
//                 onClick={() => fetchMore(2)}
//                 disabled={isLoading}
//                 style={{
//                   background: "none",
//                   border: "1px solid #E5E7EB",
//                   cursor: "pointer",
//                   color: "#6B7280",
//                   fontSize: "12.5px",
//                   fontWeight: 600,
//                   padding: "6px 18px",
//                   borderRadius: "8px",
//                   width: "100%",
//                   transition: "background 0.15s",
//                 }}
//               >
//                 {isLoading ? "Loading…" : "Load more"}
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Helpers ───────────────────────────────────────────────────────────────
// function formatRelativeTime(dateStr: string): string {
//   const date = new Date(dateStr);
//   const diff = Date.now() - date.getTime();
//   const seconds = Math.floor(diff / 1000);
//   if (seconds < 5) return "just now";
//   if (seconds < 60) return `${seconds}s ago`;
//   const minutes = Math.floor(seconds / 60);
//   if (minutes < 60) return `${minutes}m ago`;
//   const hours = Math.floor(minutes / 60);
//   if (hours < 24) return `${hours}h ago`;
//   return `${Math.floor(hours / 24)}d ago`;
// }


// components/notifications/NotificationBell.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNotifications } from "./NotificationContext";
import {
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelForm,
  FloatingPanelLabel,
  FloatingPanelRoot,
  FloatingPanelSubmitButton,
  FloatingPanelTextarea,
  FloatingPanelTrigger,
  useFloatingPanel,
} from "@/components/ui/floatingPanel"
import type { AppNotification, NotificationAction } from "../../types/notifications";
import {
  ClipboardList,
  ClipboardX,
  RefreshCw,
  LayoutGrid,
  FileText,
  MessageSquare,
  Clock,
  Users,
  Calendar,
  CalendarX,
  Phone,
  PhoneMissed,
  Folder,
  Paperclip,
  Lock,
  Hourglass,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Square,
  Zap,
  Flame,
  Bell,
  X,
} from "lucide-react";
import { BellRing } from "../animate-ui/icons/bell-ring";

const ICONS: Record<string, React.ReactNode> = {
  TASK_ASSIGNED: <ClipboardList className="w-5 h-5 text-blue-500" />,
  TASK_UNASSIGNED: <ClipboardX className="w-5 h-5 text-gray-500" />,
  TASK_STATUS_CHANGED: <RefreshCw className="w-5 h-5 text-amber-500" />,
  BOARD_MEMBER_ADDED: <LayoutGrid className="w-5 h-5 text-purple-500" />,
  PAGE_ASSIGNED: <FileText className="w-5 h-5 text-blue-500" />,
  PAGE_COMMENT_ADDED: <MessageSquare className="w-5 h-5 text-green-500" />,
  REMINDER_DUE: <Clock className="w-5 h-5 text-amber-500" />,
  TEAM_MEMBER_ADDED: <Users className="w-5 h-5 text-blue-500" />,
  MEETING_SCHEDULED: <Calendar className="w-5 h-5 text-blue-500" />,
  MEETING_CANCELLED: <CalendarX className="w-5 h-5 text-red-500" />,
  CALL_INCOMING: <Phone className="w-5 h-5 text-green-500" />,
  CALL_MISSED: <PhoneMissed className="w-5 h-5 text-red-500" />,
  FILE_UPLOADED_TEAM: <Folder className="w-5 h-5 text-blue-500" />,
  FILE_ASSIGNED: <Paperclip className="w-5 h-5 text-gray-500" />,
  FILE_ASSIGNED_WITH_PASSWORD: <Lock className="w-5 h-5 text-amber-500" />,
  TIMER_APPROVAL_PENDING: <Hourglass className="w-5 h-5 text-amber-500" />,
  TIMESHEET_APPROVED: <CheckCircle className="w-5 h-5 text-green-500" />,
  TIMESHEET_REJECTED: <XCircle className="w-5 h-5 text-red-500" />,
  TIMER_STARTED: <Play className="w-5 h-5 text-green-500" />,
  TIMER_PAUSED: <Pause className="w-5 h-5 text-amber-500" />,
  TIMER_STOPPED: <Square className="w-5 h-5 text-red-500" />,
  WORKFLOW_EXECUTED: <Zap className="w-5 h-5 text-blue-500" />,
  WORKFLOW_FAILED: <Flame className="w-5 h-5 text-red-500" />,
};

function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: {
  notification: AppNotification;
  onRead: () => void;
  onDismiss: () => void;
}) {
  const icon = ICONS[notification.type] ?? <Bell className="w-5 h-5 text-gray-400" />;
  const isUnread = !notification.read;

  const handleActionClick = (action: NotificationAction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (action.action === "navigate" && action.endpoint) {
      window.location.href = action.endpoint;
    } else if (action.action === "open_url" && action.endpoint) {
      window.open(action.endpoint, "_blank");
    } else if (["accept_call", "decline_call", "approve_time", "reject_time"].includes(action.action) && action.endpoint) {
      fetch(action.endpoint, { method: "POST" });
    }
    onRead();
  };

  return (
    <div
      onClick={onRead}
      className={`
        flex w-full relative max-w-[370px] items-center justify-between gap-4 rounded-2xl border border-neutral-50 bg-white p-3.5 shadow-xl shadow-neutral-200 dark:border-neutral-900 dark:bg-neutral-950 dark:shadow-neutral-950/70
        ${isUnread ? 'bg-sky-50 hover:bg-sky-100' : ''}
      `}
    >
      {/* Unread dot */}
      {isUnread && (
        <div className="absolute top-4 left-[6px] w-[7px] h-[7px] rounded-full bg-blue-500" />
      )}

      {/* Icon */}
      <div className="shrink-0 h-10 w-10 rounded-full bg-[#181818] flex justify-center items-center">
        {icon}
      </div>

      {/* Content */}

      <div className="flex w-full flex-col">
        <div className="flex w-full items-start justify-between">
          <span className="text-sm font-medium"> {notification.title}</span>
          <span className="text-xs text-neutral-400">
           {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <span className="text-sm text-start text-neutral-600 dark:text-neutral-400 line-clamp-1">
           {notification.body}
        </span>

        {/* {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {(notification.actions as NotificationAction[]).map((action) => (
              <button
              type="button"
                key={action.action}
                onClick={(e) => handleActionClick(action, e)}
                className={`
                  px-2.5 py-[3px] rounded text-[11.5px] font-semibold cursor-pointer transition-colors
                  ${action.variant === "primary" ? 'bg-blue-500 text-white border-none hover:bg-blue-600' : ''}
                  ${action.variant === "danger" ? 'bg-red-500 text-white border-none hover:bg-red-600' : ''}
                  ${!action.variant || (action.variant !== "primary" && action.variant !== "danger") ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' : ''}
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )} */}

       
      </div>

      {/* Dismiss */}
      <button type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        title="Dismiss"
        className="bg-none border-none cursor-pointer text-gray-400 text-sm p-0 shrink-0 leading-none hover:text-gray-600 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss, fetchMore, isLoading } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !bellRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Mark all visible as read when opening panel
  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <FloatingPanelRoot className="!relative !flex !justify-center !items-center ">
      {/* Bell Button */}
      <FloatingPanelTrigger
        
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="h-fit w-fit p-0.5 !rounded-full !bg-transparent !border-none"
      >
        <BellRing className="w-4 h-4 !text-[#B4B4B4]" />
        {unreadCount > 0 && (
          <span className="absolute top-[2px] right-[2px] bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-[3px] leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </FloatingPanelTrigger>

      {/* Dropdown Panel */}
      
        <FloatingPanelContent
          className=" !-ml-96 w-[390px] max-h-[540px] dark:bg-[#111] rounded-[14px] shadow-[0_20px_60px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.08)] border !z-[999] flex flex-col overflow-hidden h-[500px] text-foreground items-start !gap-y-1"
        >
          {/* Header */}
          <div className="px-[18px] py-4  flex items-center justify-between  shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-blue-50 text-blue-500 text-xs font-semibold px-2 py-[1px] rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button type="button"
                onClick={markAllRead}
                className="bg-none border-none cursor-pointer text-blue-500 text-[12.5px] font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto scrollbar-thin2 py-2 overflow-x-hidden !space-y-1 flex-1 px-1.5">
            {isLoading && notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <div className="text-[28px] mb-2">⏳</div>
                <p className="text-[13px]">Loading notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-[50px] text-center text-gray-400">
                <div className="text-[36px] mb-2.5"><Bell className="w-9 h-9 mx-auto text-gray-300" /></div>
                <p className="text-[13.5px] font-semibold text-gray-700 mb-1">
                  All caught up!
                </p>
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClick={() => handleOpen(n.id)}
                  onRead={() => markRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <FloatingPanelFooter className="px-4 py-2.5 border-t border-gray-100 dark:border-[#222] flex justify-center shrink-0">
              <button type="button"
                onClick={() => fetchMore(2)}
                disabled={isLoading}
                className="bg-none border border-gray-200 cursor-pointer text-gray-500 text-[12.5px] font-semibold py-1.5 px-[18px] rounded-lg w-full transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoading ? "Loading…" : "Load more"}
              </button>
            </FloatingPanelFooter>
          )}
    </FloatingPanelContent>
    </FloatingPanelRoot>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
