// // components/workload/MemberDetailModal.tsx
// import { useState, useEffect } from "react";

// interface MemberDetail {
//   member: {
//     id: string;
//     name: string;
//     email: string;
//     image: string | null;
//     role: string;
//   };
//   tasks: Array<{
//     id: string;
//     title: string;
//     status: string;
//     priority: string;
//     dueDate: string | null;
//     board: { id: string; title: string };
//     subtasksTotal: number;
//     subtasksDone: number;
//     labels: Array<{ name: string; color: string }>;
//     isOverdue: boolean;
//   }>;
//   pages: Array<{
//     id: string;
//     title: string;
//     emoji: string | null;
//     visibility: string;
//     createdAt: string;
//     updatedAt: string;
//   }>;
//   files: Array<{
//     id: string;
//     originalName: string;
//     size: number;
//     mimeType: string;
//     createdAt: string;
//   }>;
//   reminders: Array<{
//     id: string;
//     title: string;
//     dueDate: string;
//     taskId: string | null;
//   }>;
// }

// interface Props {
//   teamSlug: string;
//   memberId: string;
//   onClose: () => void;
// }

// const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
//   URGENT: { color: "#ef4444", label: "Urgent" },
//   HIGH: { color: "#f97316", label: "High" },
//   MEDIUM: { color: "#eab308", label: "Medium" },
//   LOW: { color: "#22c55e", label: "Low" },
// };

// const STATUS_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
//   TODO: { color: "#818cf8", label: "Todo", bg: "rgba(99,102,241,0.1)" },
//   IN_PROGRESS: { color: "#60a5fa", label: "In Progress", bg: "rgba(59,130,246,0.1)" },
//   REVIEW: { color: "#c084fc", label: "Review", bg: "rgba(168,85,247,0.1)" },
//   DONE: { color: "#4ade80", label: "Done", bg: "rgba(34,197,94,0.1)" },
// };

// function formatBytes(bytes: number) {
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
// }

// function formatDate(d: string) {
//   return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
// }

// export default function MemberDetailModal({ teamSlug, memberId, onClose }: Props) {
//   const [data, setData] = useState<MemberDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<"tasks" | "pages" | "files" | "reminders">("tasks");
//   const [taskFilter, setTaskFilter] = useState<string>("all");

//   useEffect(() => {
//     const fetchDetail = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/teams/${teamSlug}/workload/member/${memberId}`);
//         const json = await res.json();
//         setData(json.data);
//       } catch {}
//       finally { setLoading(false); }
//     };
//     fetchDetail();
//   }, [teamSlug, memberId]);

//   // Close on escape
//   useEffect(() => {
//     const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handle);
//     return () => window.removeEventListener("keydown", handle);
//   }, [onClose]);

//   const filteredTasks = data?.tasks.filter((t) => {
//     if (taskFilter === "all") return true;
//     if (taskFilter === "overdue") return t.isOverdue;
//     return t.status === taskFilter;
//   }) || [];

//   const initials = data?.member.name
//     .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

//   const avatarColors = ["#6366f1", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];
//   const avatarBg = avatarColors[(data?.member.name.charCodeAt(0) || 0) % avatarColors.length];

//   return (
//     <>
//       <style>{modalStyles}</style>
//       <div className="mdm-overlay" onClick={onClose} />
//       <div className="mdm-panel">
//         {/* Header */}
//         <div className="mdm-header">
//           <div className="mdm-header-info">
//             {data?.member.image ? (
//               <img src={data.member.image} alt={data.member.name} className="mdm-avatar" />
//             ) : (
//               <div className="mdm-avatar mdm-avatar--text" style={{ background: avatarBg }}>
//                 {initials}
//               </div>
//             )}
//             <div>
//               <h2 className="mdm-name">{data?.member.name || "Loading..."}</h2>
//               <p className="mdm-email">{data?.member.email}</p>
//             </div>
//           </div>
//           <button type="button" className="mdm-close" onClick={onClose}>✕</button>
//         </div>

//         {loading ? (
//           <div className="mdm-loading">
//             <div className="mdm-spinner" />
//             <p>Loading member details...</p>
//           </div>
//         ) : data ? (
//           <>
//             {/* Quick stats */}
//             <div className="mdm-quick-stats">
//               <div className="mdm-qs">
//                 <span className="mdm-qs-val">{data.tasks.length}</span>
//                 <span className="mdm-qs-key">Total Tasks</span>
//               </div>
//               <div className="mdm-qs">
//                 <span className="mdm-qs-val" style={{ color: "#f87171" }}>{data.tasks.filter(t => t.isOverdue).length}</span>
//                 <span className="mdm-qs-key">Overdue</span>
//               </div>
//               <div className="mdm-qs">
//                 <span className="mdm-qs-val">{data.pages.length}</span>
//                 <span className="mdm-qs-key">Pages</span>
//               </div>
//               <div className="mdm-qs">
//                 <span className="mdm-qs-val">{data.files.length}</span>
//                 <span className="mdm-qs-key">Files</span>
//               </div>
//               <div className="mdm-qs">
//                 <span className="mdm-qs-val">{data.reminders.length}</span>
//                 <span className="mdm-qs-key">Reminders</span>
//               </div>
//             </div>

//             {/* Tabs */}
//             <div className="mdm-tabs">
//               {(["tasks", "pages", "files", "reminders"] as const).map((tab) => (
//                 <button type="button"
//                   key={tab}
//                   className={`mdm-tab ${activeTab === tab ? "mdm-tab--active" : ""}`}
//                   onClick={() => setActiveTab(tab)}
//                 >
//                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                   <span className="mdm-tab-count">
//                     {tab === "tasks" ? data.tasks.length
//                       : tab === "pages" ? data.pages.length
//                       : tab === "files" ? data.files.length
//                       : data.reminders.length}
//                   </span>
//                 </button>
//               ))}
//             </div>

//             <div className="mdm-body">
//               {/* Tasks */}
//               {activeTab === "tasks" && (
//                 <>
//                   <div className="mdm-task-filters">
//                     {["all", "overdue", "TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((f) => (
//                       <button type="button"
//                         key={f}
//                         className={`mdm-filter-btn ${taskFilter === f ? "mdm-filter-btn--active" : ""}`}
//                         onClick={() => setTaskFilter(f)}
//                       >
//                         {f === "all" ? "All" : f === "overdue" ? "🔴 Overdue"
//                           : STATUS_CONFIG[f]?.label || f}
//                       </button>
//                     ))}
//                   </div>
//                   <div className="mdm-task-list">
//                     {filteredTasks.length === 0 ? (
//                       <div className="mdm-empty">No tasks found</div>
//                     ) : filteredTasks.map((task) => {
//                       const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
//                       const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
//                       return (
//                         <div key={task.id} className={`mdm-task ${task.isOverdue ? "mdm-task--overdue" : ""}`}>
//                           <div className="mdm-task-left">
//                             <span
//                               className="mdm-task-status"
//                               style={{ background: statusCfg.bg, color: statusCfg.color }}
//                             >
//                               {statusCfg.label}
//                             </span>
//                             <div className="mdm-task-info">
//                               <span className="mdm-task-title">{task.title}</span>
//                               <span className="mdm-task-board">{task.board?.title}</span>
//                             </div>
//                           </div>
//                           <div className="mdm-task-right">
//                             {task.isOverdue && <span className="mdm-overdue-tag">Overdue</span>}
//                             <span
//                               className="mdm-task-priority"
//                               style={{ color: priorityCfg.color }}
//                             >
//                               ● {priorityCfg.label}
//                             </span>
//                             {task.dueDate && (
//                               <span className="mdm-task-due">{formatDate(task.dueDate)}</span>
//                             )}
//                             {task.subtasksTotal > 0 && (
//                               <span className="mdm-task-subtasks">
//                                 {task.subtasksDone}/{task.subtasksTotal}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </>
//               )}

//               {/* Pages */}
//               {activeTab === "pages" && (
//                 <div className="mdm-page-list">
//                   {data.pages.length === 0 ? (
//                     <div className="mdm-empty">No pages assigned</div>
//                   ) : data.pages.map((page) => (
//                     <div key={page.id} className="mdm-page-item">
//                       <span className="mdm-page-emoji">{page.emoji || "📄"}</span>
//                       <div className="mdm-page-info">
//                         <span className="mdm-page-title">{page.title}</span>
//                         <span className="mdm-page-meta">
//                           {page.visibility} · Updated {formatDate(page.updatedAt)}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Files */}
//               {activeTab === "files" && (
//                 <div className="mdm-file-list">
//                   {data.files.length === 0 ? (
//                     <div className="mdm-empty">No files assigned</div>
//                   ) : data.files.map((file) => (
//                     <div key={file.id} className="mdm-file-item">
//                       <div className="mdm-file-icon">📎</div>
//                       <div className="mdm-file-info">
//                         <span className="mdm-file-name">{file.originalName}</span>
//                         <span className="mdm-file-meta">
//                           {formatBytes(file.size)} · {file.mimeType.split("/").pop()} · {formatDate(file.createdAt)}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Reminders */}
//               {activeTab === "reminders" && (
//                 <div className="mdm-reminder-list">
//                   {data.reminders.length === 0 ? (
//                     <div className="mdm-empty">No pending reminders</div>
//                   ) : data.reminders.map((r) => (
//                     <div key={r.id} className="mdm-reminder-item">
//                       <span className="mdm-reminder-icon">🔔</span>
//                       <div>
//                         <span className="mdm-reminder-title">{r.title}</span>
//                         <span className="mdm-reminder-due">Due {formatDate(r.dueDate)}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </>
//         ) : null}
//       </div>
//     </>
//   );
// }

// const modalStyles = `
//   .mdm-overlay {
//     position: fixed; inset: 0;
//     background: rgba(0,0,0,0.6);
//     z-index: 100; backdrop-filter: blur(4px);
//     animation: fadeIn 0.2s ease;
//   }
//   @keyframes fadeIn { from { opacity: 0; } }

//   .mdm-panel {
//     position: fixed; right: 0; top: 0; bottom: 0;
//     width: 520px; max-width: 95vw;
//     background: #0d1220;
//     border-left: 1px solid #1e293b;
//     z-index: 101; overflow: hidden;
//     display: flex; flex-direction: column;
//     animation: slideIn 0.25s cubic-bezier(0.4,0,0.2,1);
//     font-family: 'DM Sans', sans-serif;
//   }
//   @keyframes slideIn { from { transform: translateX(100%); } }

//   .mdm-header {
//     display: flex; align-items: center; justify-content: space-between;
//     padding: 20px 22px; border-bottom: 1px solid #1e293b;
//     background: #111827;
//   }
//   .mdm-header-info { display: flex; align-items: center; gap: 12px; }
//   .mdm-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; }
//   .mdm-avatar--text {
//     display: flex; align-items: center; justify-content: center;
//     font-size: 17px; font-weight: 700; color: white; flex-shrink: 0;
//   }
//   .mdm-name { font-size: 16px; font-weight: 700; margin: 0; color: #f1f5f9; }
//   .mdm-email { font-size: 12px; color: #64748b; margin: 0; }
//   .mdm-close {
//     width: 32px; height: 32px; border-radius: 8px;
//     background: #1e293b; border: none; color: #94a3b8;
//     cursor: pointer; font-size: 13px; display: flex;
//     align-items: center; justify-content: center;
//     transition: background 0.15s;
//   }
//   .mdm-close:hover { background: #334155; color: #f1f5f9; }

//   .mdm-quick-stats {
//     display: flex; gap: 0;
//     border-bottom: 1px solid #1e293b;
//   }
//   .mdm-qs {
//     flex: 1; padding: 12px 16px; text-align: center;
//     border-right: 1px solid #1e293b;
//   }
//   .mdm-qs:last-child { border-right: none; }
//   .mdm-qs-val { display: block; font-size: 20px; font-weight: 800; color: #f8fafc; font-family: 'JetBrains Mono', monospace; }
//   .mdm-qs-key { display: block; font-size: 10px; color: #475569; margin-top: 2px; }

//   .mdm-tabs {
//     display: flex; padding: 0 22px;
//     border-bottom: 1px solid #1e293b;
//   }
//   .mdm-tab {
//     display: flex; align-items: center; gap: 6px;
//     padding: 10px 14px; background: none; border: none;
//     color: #64748b; font-size: 13px; font-weight: 500;
//     cursor: pointer; border-bottom: 2px solid transparent;
//     margin-bottom: -1px; transition: all 0.15s;
//     font-family: 'DM Sans', sans-serif;
//   }
//   .mdm-tab:hover { color: #94a3b8; }
//   .mdm-tab--active { color: #6366f1; border-bottom-color: #6366f1; }
//   .mdm-tab-count {
//     background: #1e293b; color: #94a3b8;
//     font-size: 10px; padding: 1px 5px; border-radius: 8px;
//   }

//   .mdm-body { flex: 1; overflow-y: auto; padding: 16px 22px; }

//   .mdm-task-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
//   .mdm-filter-btn {
//     padding: 4px 10px; border-radius: 6px;
//     font-size: 11px; cursor: pointer;
//     background: transparent; border: 1px solid #334155;
//     color: #64748b; transition: all 0.15s;
//     font-family: 'DM Sans', sans-serif;
//   }
//   .mdm-filter-btn:hover { border-color: #6366f1; color: #f1f5f9; }
//   .mdm-filter-btn--active { background: #6366f1; border-color: #6366f1; color: white; }

//   .mdm-task-list { display: flex; flex-direction: column; gap: 6px; }
//   .mdm-task {
//     display: flex; align-items: center; justify-content: space-between;
//     padding: 10px 12px; background: #111827;
//     border: 1px solid #1e293b; border-radius: 8px; gap: 10px;
//     transition: border-color 0.15s;
//   }
//   .mdm-task:hover { border-color: #334155; }
//   .mdm-task--overdue { border-color: rgba(239,68,68,0.2); }
//   .mdm-task-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
//   .mdm-task-status {
//     font-size: 10px; font-weight: 600; padding: 3px 7px;
//     border-radius: 5px; white-space: nowrap; flex-shrink: 0;
//   }
//   .mdm-task-info { min-width: 0; }
//   .mdm-task-title { display: block; font-size: 13px; font-weight: 500; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//   .mdm-task-board { display: block; font-size: 10px; color: #475569; }
//   .mdm-task-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
//   .mdm-task-priority { font-size: 11px; font-weight: 500; }
//   .mdm-task-due { font-size: 11px; color: #64748b; }
//   .mdm-task-subtasks { font-size: 10px; color: #475569; background: #1e293b; padding: 2px 6px; border-radius: 4px; }
//   .mdm-overdue-tag { font-size: 10px; background: rgba(239,68,68,0.15); color: #f87171; padding: 2px 6px; border-radius: 4px; }

//   .mdm-page-list, .mdm-file-list, .mdm-reminder-list { display: flex; flex-direction: column; gap: 6px; }

//   .mdm-page-item {
//     display: flex; align-items: center; gap: 10px;
//     padding: 10px 12px; background: #111827;
//     border: 1px solid #1e293b; border-radius: 8px;
//   }
//   .mdm-page-emoji { font-size: 18px; }
//   .mdm-page-title { display: block; font-size: 13px; font-weight: 500; color: #e2e8f0; }
//   .mdm-page-meta { display: block; font-size: 10px; color: #475569; }

//   .mdm-file-item {
//     display: flex; align-items: center; gap: 10px;
//     padding: 10px 12px; background: #111827;
//     border: 1px solid #1e293b; border-radius: 8px;
//   }
//   .mdm-file-icon { font-size: 20px; }
//   .mdm-file-name { display: block; font-size: 13px; font-weight: 500; color: #e2e8f0; }
//   .mdm-file-meta { display: block; font-size: 10px; color: #475569; }

//   .mdm-reminder-item {
//     display: flex; align-items: center; gap: 10px;
//     padding: 10px 12px; background: #111827;
//     border: 1px solid #1e293b; border-radius: 8px;
//   }
//   .mdm-reminder-icon { font-size: 18px; }
//   .mdm-reminder-title { display: block; font-size: 13px; font-weight: 500; color: #e2e8f0; }
//   .mdm-reminder-due { display: block; font-size: 11px; color: #64748b; }

//   .mdm-empty {
//     text-align: center; padding: 32px;
//     color: #475569; font-size: 13px;
//   }

//   .mdm-loading {
//     display: flex; flex-direction: column;
//     align-items: center; justify-content: center;
//     flex: 1; gap: 10px; color: #64748b;
//   }
//   .mdm-spinner {
//     width: 32px; height: 32px;
//     border: 3px solid #1e293b;
//     border-top-color: #6366f1;
//     border-radius: 50%;
//     animation: spin 0.8s linear infinite;
//   }
//   @keyframes spin { to { transform: rotate(360deg); } }
// `;

// components/workload/MemberDetailModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, AlertTriangle, CheckCircle2, FileText, FolderOpen, Bell, Video, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MemberDetail {
  member: { id: string; name: string; email: string; image: string | null; role: string };
  tasks: Array<{
    id: string; title: string; status: string; priority: string;
    dueDate: string | null; board: { id: string; title: string };
    subtasksTotal: number; subtasksDone: number;
    labels: Array<{ name: string; color: string }>; isOverdue: boolean;
  }>;
  pages: Array<{ id: string; title: string; emoji: string | null; visibility: string; updatedAt: string }>;
  files: Array<{ id: string; originalName: string; size: number; mimeType: string; createdAt: string }>;
  reminders: Array<{ id: string; title: string; dueDate: string; taskId: string | null }>;
}

interface Props { teamSlug: string; memberId: string; onClose: () => void; }

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  URGENT: { color: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-950", label: "Urgent" },
  HIGH: { color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-950", label: "High" },
  MEDIUM: { color: "text-yellow-700 dark:text-yellow-300", bg: "bg-yellow-100 dark:bg-yellow-950", label: "Medium" },
  LOW: { color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-950", label: "Low" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TODO: { label: "To Do", color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-100 dark:bg-indigo-950" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-950" },
  REVIEW: { label: "Review", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-950" },
  DONE: { label: "Done", color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-950" },
};

const AVATAR_COLORS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#0891B2"];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MemberDetailModal({ teamSlug, memberId, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"tasks" | "pages" | "files" | "reminders">("tasks");
  const [taskFilter, setTaskFilter] = useState("all");

  const { data, isLoading: loading } = useQuery({
    queryKey: ['memberDetail', teamSlug, memberId],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamSlug}/workload/member/${memberId}`);
      const json = await res.json();
      return json.data;
    }
  });

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const filteredTasks = data?.tasks.filter(t => {
    if (taskFilter === "all") return true;
    if (taskFilter === "overdue") return t.isOverdue;
    return t.status === taskFilter;
  }) || [];

  const avatarBg = AVATAR_COLORS[(data?.member.name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[520px] max-w-[95vw] bg-white dark:bg-[#121212] border-l border-gray-200 dark:border-[#333] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#333] px-5 py-4 flex items-center justify-between bg-gray-50 dark:bg-[#121212] shrink-0">
          {data && (
            <div className="flex items-center gap-3">
              <Avatar className=" size-11 ">
                {data.member.image && <AvatarImage src={data.member.image} />}
                <AvatarFallback className="font-bold text-white text-sm" style={{ background: avatarBg }}>
                  {getInitials(data.member.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{data.member.name}</h2>
                <p className="text-xs text-gray-500">{data.member.email}</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="size-6 border-2 border-violet-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
              {[
                { label: "Tasks", value: data.tasks.length, icon: CheckCircle2 },
                { label: "Overdue", value: data.tasks.filter(t => t.isOverdue).length, icon: AlertTriangle, alert: true },
                { label: "Pages", value: data.pages.length, icon: FileText },
                { label: "Files", value: data.files.length, icon: FolderOpen },
                { label: "Reminders", value: data.reminders.length, icon: Bell },
              ].map(({ label, value, icon: Icon, alert }) => (
                <div key={label} className="flex flex-col items-center py-3 border-r border-gray-200 dark:border-gray-800 last:border-r-0">
                  <p className={cn("text-xl font-black", alert && value > 0 ? "text-red-500" : "text-gray-900 dark:text-white")}>{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
              {(["tasks", "pages", "files", "reminders"] as const).map((tab) => (
                <button type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5",
                    activeTab === tab
                      ? "border-blue-600 text-blue-600 dark:text-blue-500"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] px-1.5 py-0 rounded-full">
                    {tab === "tasks" ? data.tasks.length : tab === "pages" ? data.pages.length
                      : tab === "files" ? data.files.length : data.reminders.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "tasks" && (
                <>
                  {/* Filter pills */}
                  <div className="flex gap-1.5 flex-wrap pb-2">
                    {["all", "overdue", "TODO", "IN_PROGRESS", "REVIEW", "DONE"].map(f => (
                      <button type="button"
                        key={f}
                        onClick={() => setTaskFilter(f)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border",
                          taskFilter === f
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300"
                        )}
                      >
                        {f === "all" ? "All" : f === "overdue" ? "Overdue" : STATUS_CONFIG[f]?.label || f}
                      </button>
                    ))}
                  </div>
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-400">No tasks found</div>
                  ) : filteredTasks.map(task => {
                    const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
                    const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                    return (
                      <div key={task.id} className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
                        task.isOverdue
                          ? "border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10"
                          : "border-gray-200 dark:border-gray-800"
                      )}>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 mt-0.5", sc.bg, sc.color)}>
                          {sc.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{task.board?.title}</p>
                          {task.subtasksTotal > 0 && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <Progress value={(task.subtasksDone / task.subtasksTotal) * 100} className="h-1 flex-1" />
                              <span className="text-[10px] text-gray-400">{task.subtasksDone}/{task.subtasksTotal}</span>
                            </div>
                          )}
                          {task.labels.length > 0 && (
                            <div className="flex gap-1 mt-1.5">
                              {task.labels.map((l, i) => (
                                <span key={`${i}-${l.name}`} className="text-[9px] px-1.5 py-0.5 rounded text-white font-medium" style={{ background: l.color }}>
                                  {l.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", pc.bg, pc.color)}>
                            {pc.label}
                          </span>
                          {task.isOverdue && (
                            <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-semibold">
                              Overdue
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-[10px] text-gray-400">{formatDate(task.dueDate)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {activeTab === "pages" && (
                data.pages.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">No pages assigned</div>
                ) : data.pages.map(page => (
                  <div key={page.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <span className="text-lg shrink-0">{page.emoji || "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{page.title}</p>
                      <p className="text-[10px] text-gray-400">{page.visibility} · Updated {formatDate(page.updatedAt)}</p>
                    </div>
                  </div>
                ))
              )}

              {activeTab === "files" && (
                data.files.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">No files assigned</div>
                ) : data.files.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="size-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                      <FolderOpen className="size-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{file.originalName}</p>
                      <p className="text-[10px] text-gray-400">{formatBytes(file.size)} · {file.mimeType.split("/").pop()} · {formatDate(file.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}

              {activeTab === "reminders" && (
                data.reminders.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">No pending reminders</div>
                ) : data.reminders.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="size-8 bg-amber-50 dark:bg-amber-950 rounded-lg flex items-center justify-center shrink-0">
                      <Bell className="size-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{r.title}</p>
                      <p className="text-[10px] text-gray-400">Due {formatDate(r.dueDate)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
