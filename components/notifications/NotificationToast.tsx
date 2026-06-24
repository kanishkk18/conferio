// // components/notifications/NotificationToast.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { useNotifications } from "./NotificationContext";
// import type { ToastNotification } from "../../types/notifications";

// // ── Icon map ──────────────────────────────────────────────────────────────
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

// const COLORS: Record<string, { bg: string; border: string; progress: string }> = {
//   TASK_ASSIGNED: { bg: "#EFF6FF", border: "#3B82F6", progress: "#3B82F6" },
//   TASK_STATUS_CHANGED: { bg: "#F0FDF4", border: "#22C55E", progress: "#22C55E" },
//   BOARD_MEMBER_ADDED: { bg: "#F5F3FF", border: "#8B5CF6", progress: "#8B5CF6" },
//   PAGE_ASSIGNED: { bg: "#FFF7ED", border: "#F97316", progress: "#F97316" },
//   PAGE_COMMENT_ADDED: { bg: "#F0F9FF", border: "#0EA5E9", progress: "#0EA5E9" },
//   REMINDER_DUE: { bg: "#FFFBEB", border: "#F59E0B", progress: "#F59E0B" },
//   TEAM_MEMBER_ADDED: { bg: "#F0FDF4", border: "#16A34A", progress: "#16A34A" },
//   MEETING_SCHEDULED: { bg: "#EFF6FF", border: "#2563EB", progress: "#2563EB" },
//   MEETING_CANCELLED: { bg: "#FEF2F2", border: "#EF4444", progress: "#EF4444" },
//   CALL_INCOMING: { bg: "#F0FDF4", border: "#16A34A", progress: "#16A34A" },
//   CALL_MISSED: { bg: "#FEF2F2", border: "#EF4444", progress: "#EF4444" },
//   FILE_UPLOADED_TEAM: { bg: "#F5F3FF", border: "#7C3AED", progress: "#7C3AED" },
//   FILE_ASSIGNED: { bg: "#F5F3FF", border: "#7C3AED", progress: "#7C3AED" },
//   FILE_ASSIGNED_WITH_PASSWORD: { bg: "#FFFBEB", border: "#D97706", progress: "#D97706" },
//   TIMER_APPROVAL_PENDING: { bg: "#FFFBEB", border: "#F59E0B", progress: "#F59E0B" },
//   TIMESHEET_APPROVED: { bg: "#F0FDF4", border: "#22C55E", progress: "#22C55E" },
//   TIMESHEET_REJECTED: { bg: "#FEF2F2", border: "#EF4444", progress: "#EF4444" },
//   TIMER_STARTED: { bg: "#F0FDF4", border: "#22C55E", progress: "#22C55E" },
//   TIMER_PAUSED: { bg: "#FFF7ED", border: "#F97316", progress: "#F97316" },
//   TIMER_STOPPED: { bg: "#F9FAFB", border: "#6B7280", progress: "#6B7280" },
//   WORKFLOW_EXECUTED: { bg: "#EFF6FF", border: "#3B82F6", progress: "#3B82F6" },
//   WORKFLOW_FAILED: { bg: "#FEF2F2", border: "#EF4444", progress: "#EF4444" },
// };

// const DEFAULT_COLOR = { bg: "#F9FAFB", border: "#6B7280", progress: "#6B7280" };

// // ── Single Toast ──────────────────────────────────────────────────────────
// function Toast({
//   toast,
//   onDismiss,
//   onMarkRead,
// }: {
//   toast: ToastNotification;
//   onDismiss: () => void;
//   onMarkRead: () => void;
// }) {
//   const [visible, setVisible] = useState(false);
//   const [progressWidth, setProgressWidth] = useState(100);
//   const duration = toast.autoDismissMs ?? 7000;
//   const startRef = useRef<number>(Date.now());
//   const rafRef = useRef<number>();
//   const color = COLORS[toast.type] ?? DEFAULT_COLOR;
//   const icon = ICONS[toast.type] ?? "🔔";

//   // Slide-in animation
//   useEffect(() => {
//     const t = setTimeout(() => setVisible(true), 30);
//     return () => clearTimeout(t);
//   }, []);

//   // Progress bar countdown
//   useEffect(() => {
//     const tick = () => {
//       const elapsed = Date.now() - startRef.current;
//       const pct = Math.max(0, 100 - (elapsed / duration) * 100);
//       setProgressWidth(pct);
//       if (pct > 0) {
//         rafRef.current = requestAnimationFrame(tick);
//       }
//     };
//     rafRef.current = requestAnimationFrame(tick);
//     return () => {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     };
//   }, [duration]);

//   const handleActionClick = (action: { action: string; endpoint?: string }) => {
//     if (action.action === "navigate" && action.endpoint) {
//       window.location.href = action.endpoint;
//     } else if (action.action === "open_url" && action.endpoint) {
//       window.open(action.endpoint, "_blank");
//     } else if (action.action === "accept_call" && action.endpoint) {
//       fetch(action.endpoint, { method: "POST" });
//     } else if (action.action === "decline_call" && action.endpoint) {
//       fetch(action.endpoint, { method: "POST" });
//     }
//     onMarkRead();
//     onDismiss();
//   };

//   return (
//     <div
//       role="alert"
//       aria-live="polite"
//       style={{
//         backgroundColor: color.bg,
//         borderLeft: `4px solid ${color.border}`,
//         borderRadius: "12px",
//         boxShadow:
//           "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
//         maxWidth: "380px",
//         width: "100%",
//         overflow: "hidden",
//         transform: visible ? "translateX(0)" : "translateX(120%)",
//         opacity: visible ? 1 : 0,
//         transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
//         position: "relative",
//         pointerEvents: "all",
//       }}
//     >
//       {/* Main content */}
//       <div style={{ padding: "14px 16px 10px", display: "flex", gap: "12px" }}>
//         {/* Icon */}
//         <div
//           style={{
//             fontSize: "22px",
//             flexShrink: 0,
//             lineHeight: 1,
//             marginTop: "2px",
//           }}
//         >
//           {icon}
//         </div>

//         {/* Text */}
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <p
//             style={{
//               fontWeight: 600,
//               fontSize: "13.5px",
//               color: "#111827",
//               margin: "0 0 3px",
//               lineHeight: 1.3,
//             }}
//           >
//             {toast.title}
//           </p>
//           <p
//             style={{
//               fontSize: "12.5px",
//               color: "#4B5563",
//               margin: 0,
//               lineHeight: 1.45,
//               wordBreak: "break-word",
//             }}
//           >
//             {toast.body}
//           </p>

//           {/* Timestamp */}
//           <p
//             style={{
//               fontSize: "11px",
//               color: "#9CA3AF",
//               margin: "5px 0 0",
//             }}
//           >
//             {formatRelativeTime(toast.createdAt)}
//           </p>

//           {/* Action buttons */}
//           {toast.actions && toast.actions.length > 0 && (
//             <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
//               {toast.actions.map((action) => (
//                 <button
//                   key={action.action}
//                   onClick={() => handleActionClick(action)}
//                   style={{
//                     padding: "5px 12px",
//                     borderRadius: "6px",
//                     fontSize: "12px",
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     border: "none",
//                     transition: "opacity 0.15s",
//                     backgroundColor:
//                       action.variant === "primary"
//                         ? color.border
//                         : action.variant === "danger"
//                         ? "#EF4444"
//                         : "#E5E7EB",
//                     color:
//                       action.variant === "primary" || action.variant === "danger"
//                         ? "#fff"
//                         : "#374151",
//                   }}
//                 >
//                   {action.label}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Dismiss button */}
//         <button
//           onClick={onDismiss}
//           aria-label="Dismiss notification"
//           style={{
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             color: "#9CA3AF",
//             fontSize: "16px",
//             padding: "0 0 0 4px",
//             flexShrink: 0,
//             lineHeight: 1,
//             alignSelf: "flex-start",
//           }}
//         >
//           ✕
//         </button>
//       </div>

//       {/* Progress bar */}
//       <div
//         style={{
//           height: "3px",
//           backgroundColor: "#E5E7EB",
//           position: "relative",
//         }}
//       >
//         <div
//           style={{
//             height: "100%",
//             width: `${progressWidth}%`,
//             backgroundColor: color.progress,
//             transition: "width 0.1s linear",
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// // ── Toast Container (portal at top-right) ─────────────────────────────────
// export function NotificationToastContainer() {
//   const { toasts, dismissToast, markRead } = useNotifications();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   return createPortal(
//     <div
//       aria-label="Notifications"
//       style={{
//         position: "fixed",
//         top: "20px",
//         right: "20px",
//         zIndex: 9999,
//         display: "flex",
//         flexDirection: "column",
//         gap: "10px",
//         pointerEvents: "none",
//         maxWidth: "390px",
//         width: "100%",
//       }}
//     >
//       {toasts.map((toast) => (
//         <Toast
//           key={toast.id}
//           toast={toast}
//           onDismiss={() => dismissToast(toast.id)}
//           onMarkRead={() => markRead(toast.id)}
//         />
//       ))}
//     </div>,
//     document.body
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


// components/notifications/NotificationToast.tsx
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useNotifications } from "./NotificationContext";
import type { ToastNotification } from "../../types/notifications";
import {
  ClipboardList, RotateCcw, FileText, MessageSquare, Clock, Users, Calendar, Phone, PhoneOff,
  FolderOpen, Paperclip, Lock, Hourglass, CheckCircle2, XCircle, Play, Pause, Square,
  Zap, Flame, Bell
} from "lucide-react";

// ── Icon map ──────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  TASK_ASSIGNED: <ClipboardList className="size-4" />,
  TASK_UNASSIGNED: <ClipboardList className="size-4" />,
  TASK_STATUS_CHANGED: <RotateCcw className="size-4" />,
  BOARD_MEMBER_ADDED: <FolderOpen className="size-4" />,
  PAGE_ASSIGNED: <FileText className="size-4" />,
  PAGE_COMMENT_ADDED: <MessageSquare className="size-4" />,
  REMINDER_DUE: <Clock className="size-4" />,
  TEAM_MEMBER_ADDED: <Users className="size-4" />,
  MEETING_SCHEDULED: <Calendar className="size-4" />,
  MEETING_CANCELLED: <XCircle className="size-4" />,
  CALL_INCOMING: <Phone className="size-4" />,
  CALL_MISSED: <PhoneOff className="size-4" />,
  FILE_UPLOADED_TEAM: <FolderOpen className="size-4" />,
  FILE_ASSIGNED: <Paperclip className="size-4" />,
  FILE_ASSIGNED_WITH_PASSWORD: <Lock className="size-4" />,
  TIMER_APPROVAL_PENDING: <Hourglass className="size-4" />,
  TIMESHEET_APPROVED: <CheckCircle2 className="size-4" />,
  TIMESHEET_REJECTED: <XCircle className="size-4" />,
  TIMER_STARTED: <Play className="size-4" />,
  TIMER_PAUSED: <Pause className="size-4" />,
  TIMER_STOPPED: <Square className="size-4" />,
  WORKFLOW_EXECUTED: <Zap className="size-4" />,
  WORKFLOW_FAILED: <Flame className="size-4" />,
};

const COLORS: Record<string, { bg: string; border: string; progress: string; darkBg: string; darkBorder: string }> = {
  TASK_ASSIGNED: { bg: "bg-blue-50", border: "border-blue-500", progress: "bg-blue-500", darkBg: "dark:bg-blue-900/20", darkBorder: "dark:border-blue-400" },
  TASK_STATUS_CHANGED: { bg: "bg-green-50", border: "border-green-500", progress: "bg-green-500", darkBg: "dark:bg-green-900/20", darkBorder: "dark:border-green-400" },
  BOARD_MEMBER_ADDED: { bg: "bg-purple-50", border: "border-purple-500", progress: "bg-purple-500", darkBg: "dark:bg-purple-900/20", darkBorder: "dark:border-purple-400" },
  PAGE_ASSIGNED: { bg: "bg-orange-50", border: "border-orange-500", progress: "bg-orange-500", darkBg: "dark:bg-orange-900/20", darkBorder: "dark:border-orange-400" },
  PAGE_COMMENT_ADDED: { bg: "bg-sky-50", border: "border-sky-500", progress: "bg-sky-500", darkBg: "dark:bg-sky-900/20", darkBorder: "dark:border-sky-400" },
  REMINDER_DUE: { bg: "bg-amber-50", border: "border-amber-500", progress: "bg-amber-500", darkBg: "dark:bg-amber-900/20", darkBorder: "dark:border-amber-400" },
  TEAM_MEMBER_ADDED: { bg: "bg-green-50", border: "border-green-600", progress: "bg-green-600", darkBg: "dark:bg-green-900/20", darkBorder: "dark:border-green-400" },
  MEETING_SCHEDULED: { bg: "bg-blue-50", border: "border-blue-600", progress: "bg-blue-600", darkBg: "dark:bg-blue-900/20", darkBorder: "dark:border-blue-400" },
  MEETING_CANCELLED: { bg: "bg-red-50", border: "border-red-500", progress: "bg-red-500", darkBg: "dark:bg-red-900/20", darkBorder: "dark:border-red-400" },
  CALL_INCOMING: { bg: "bg-green-50", border: "border-green-600", progress: "bg-green-600", darkBg: "dark:bg-green-900/20", darkBorder: "dark:border-green-400" },
  CALL_MISSED: { bg: "bg-red-50", border: "border-red-500", progress: "bg-red-500", darkBg: "dark:bg-red-900/20", darkBorder: "dark:border-red-400" },
  FILE_UPLOADED_TEAM: { bg: "bg-purple-50", border: "border-purple-600", progress: "bg-purple-600", darkBg: "dark:bg-purple-900/20", darkBorder: "dark:border-purple-400" },
  FILE_ASSIGNED: { bg: "bg-purple-50", border: "border-purple-600", progress: "bg-purple-600", darkBg: "dark:bg-purple-900/20", darkBorder: "dark:border-purple-400" },
  FILE_ASSIGNED_WITH_PASSWORD: { bg: "bg-amber-50", border: "border-amber-600", progress: "bg-amber-600", darkBg: "dark:bg-amber-900/20", darkBorder: "dark:border-amber-400" },
  TIMER_APPROVAL_PENDING: { bg: "bg-amber-50", border: "border-amber-500", progress: "bg-amber-500", darkBg: "dark:bg-amber-900/20", darkBorder: "dark:border-amber-400" },
  TIMESHEET_APPROVED: { bg: "bg-green-50", border: "border-green-500", progress: "bg-green-500", darkBg: "dark:bg-green-900/20", darkBorder: "dark:border-green-400" },
  TIMESHEET_REJECTED: { bg: "bg-red-50", border: "border-red-500", progress: "bg-red-500", darkBg: "dark:bg-red-900/20", darkBorder: "dark:border-red-400" },
  TIMER_STARTED: { bg: "bg-green-50", border: "border-green-500", progress: "bg-green-500", darkBg: "dark:bg-green-900/20", darkBorder: "dark:border-green-400" },
  TIMER_PAUSED: { bg: "bg-orange-50", border: "border-orange-500", progress: "bg-orange-500", darkBg: "dark:bg-orange-900/20", darkBorder: "dark:border-orange-400" },
  TIMER_STOPPED: { bg: "bg-gray-50", border: "border-gray-500", progress: "bg-gray-500", darkBg: "dark:bg-gray-800", darkBorder: "dark:border-gray-600" },
  WORKFLOW_EXECUTED: { bg: "bg-blue-50", border: "border-blue-500", progress: "bg-blue-500", darkBg: "dark:bg-blue-900/20", darkBorder: "dark:border-blue-400" },
  WORKFLOW_FAILED: { bg: "bg-red-50", border: "border-red-500", progress: "bg-red-500", darkBg: "dark:bg-red-900/20", darkBorder: "dark:border-red-400" },
};

const DEFAULT_COLOR = { bg: "bg-gray-50", border: "border-gray-500", progress: "bg-gray-500", darkBg: "dark:bg-[#222222]", darkBorder: "dark:border-[#333]" };

// ── Single Toast ──────────────────────────────────────────────────────────
function Toast({
  toast,
  onDismiss,
  onMarkRead,
}: {
  toast: ToastNotification;
  onDismiss: () => void;
  onMarkRead: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);
  const duration = toast.autoDismissMs ?? 7000;
  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number>();
  const color = COLORS[toast.type] ?? DEFAULT_COLOR;
  const icon = ICONS[toast.type] ?? <Bell className="size-4" />;

  // Slide-in animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgressWidth(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  const handleActionClick = (action: { action: string; endpoint?: string }) => {
    if (action.action === "navigate" && action.endpoint) {
      window.location.href = action.endpoint;
    } else if (action.action === "open_url" && action.endpoint) {
      window.open(action.endpoint, "_blank");
    } else if (action.action === "accept_call" && action.endpoint) {
      fetch(action.endpoint, { method: "POST" });
    } else if (action.action === "decline_call" && action.endpoint) {
      fetch(action.endpoint, { method: "POST" });
    }
    onMarkRead();
    onDismiss();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        ${color.bg} ${color.darkBg}
        border-l-4 ${color.border} ${color.darkBorder}
        rounded-xl shadow-lg
        max-w-[380px] w-full overflow-hidden
        relative pointer-events-auto
        transition-all duration-300 ease-out
        ${visible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"}
      `}
    >
      {/* Main content */}
      <div className="p-3.5 pb-2.5 flex gap-3">
        {/* Icon */}
        <div className="shrink-0 mt-0.5 text-gray-700 dark:text-gray-300">
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight mb-0.5">
            {toast.title}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed break-words">
            {toast.body}
          </p>

          {/* Timestamp */}
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            {formatRelativeTime(toast.createdAt)}
          </p>

          {/* Action buttons */}
          {toast.actions && toast.actions.length > 0 && (
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {toast.actions.map((action) => (
                <button
                  key={action.action}
                  type="button"
                  onClick={() => handleActionClick(action)}
                  className={`
                    px-3 py-1 rounded-md text-xs font-semibold
                    transition-opacity duration-150 hover:opacity-80
                    ${
                      action.variant === "primary"
                        ? `bg-${color.border.replace("border-", "")} text-white`
                        : action.variant === "danger"
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-base leading-none self-start transition-colors"
        >
          <XCircle className="size-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-gray-200 dark:bg-gray-700 relative">
        <div
          className={`h-full ${color.progress} transition-[width] duration-100 linear`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  );
}

const getServerSnapshot = () => false;
const getSnapshot = () => true;
const subscribe = () => () => {};
// ── Toast Container (portal at top-right) ─────────────────────────────────
export function NotificationToastContainer() {
  const { toasts, dismissToast, markRead } = useNotifications();
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) return null;

   const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isClient) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-[390px] w-full"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
          onMarkRead={() => markRead(toast.id)}
        />
      ))}
    </div>,
    document.body
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
