// // components/workload/RebalanceModal.tsx
// import { useState } from "react";

// interface MemberWorkload {
//   memberId: string;
//   memberName: string;
//   memberEmail: string;
//   memberImage: string | null;
//   workloadScore: number;
//   tasks: { active: number; overdue: number };
//   pages: { total: number };
//   files: { total: number };
// }

// interface BalanceSuggestion {
//   from: string;
//   fromName: string;
//   to: string;
//   toName: string;
//   reason: string;
//   potentialItems: number;
// }

// interface Props {
//   teamSlug: string;
//   members: MemberWorkload[];
//   suggestions: BalanceSuggestion[];
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function RebalanceModal({ teamSlug, members, suggestions, onClose, onSuccess }: Props) {
//   const [fromMember, setFromMember] = useState(suggestions[0]?.from || "");
//   const [toMember, setToMember] = useState(suggestions[0]?.to || "");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [activeMode, setActiveMode] = useState<"suggestions" | "manual">("suggestions");

//   const applySuggestion = async (suggestion: BalanceSuggestion) => {
//     setFromMember(suggestion.from);
//     setToMember(suggestion.to);
//     setActiveMode("manual");
//   };

//   const handleRebalanceRequest = async () => {
//     if (!fromMember || !toMember || fromMember === toMember) {
//       setError("Please select two different members");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       // For manual rebalance we just mark it as a balance request
//       // The actual task reassignment would open a task picker flow
//       // Here we show success and let admin manually pick tasks
//       await new Promise(r => setTimeout(r, 800)); // simulate
//       setSuccess(`Workload analysis prepared. Use the task detail view to reassign specific tasks from ${members.find(m => m.memberId === fromMember)?.memberName} to ${members.find(m => m.memberId === toMember)?.memberName}.`);
//     } catch (e: any) {
//       setError(e.message || "Failed to process request");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const maxScore = Math.max(...members.map(m => m.workloadScore), 1);

//   const avatarColors = ["#6366f1", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];
//   const getAvatar = (m: MemberWorkload) => avatarColors[m.memberName.charCodeAt(0) % avatarColors.length];

//   return (
//     <>
//       <style>{rebalanceStyles}</style>
//       <div className="rb-overlay" onClick={onClose} />
//       <div className="rb-modal">
//         <div className="rb-header">
//           <div className="rb-title-row">
//             <span className="rb-icon">⚖</span>
//             <h2>Workload Rebalancing</h2>
//           </div>
//           <button className="rb-close" onClick={onClose}>✕</button>
//         </div>

//         <div className="rb-tabs">
//           <button
//             className={`rb-tab ${activeMode === "suggestions" ? "rb-tab--active" : ""}`}
//             onClick={() => setActiveMode("suggestions")}
//           >
//             AI Suggestions {suggestions.length > 0 && <span className="rb-tab-badge">{suggestions.length}</span>}
//           </button>
//           <button
//             className={`rb-tab ${activeMode === "manual" ? "rb-tab--active" : ""}`}
//             onClick={() => setActiveMode("manual")}
//           >
//             Manual
//           </button>
//         </div>

//         <div className="rb-body">
//           {activeMode === "suggestions" && (
//             <>
//               {suggestions.length === 0 ? (
//                 <div className="rb-balanced">
//                   <span>✅</span>
//                   <p>Team is currently well-balanced. No rebalancing needed.</p>
//                 </div>
//               ) : (
//                 <div className="rb-suggestion-list">
//                   {suggestions.map((s, i) => {
//                     const fromM = members.find(m => m.memberId === s.from);
//                     const toM = members.find(m => m.memberId === s.to);
//                     return (
//                       <div key={i} className="rb-suggestion">
//                         <div className="rb-suggestion-header">
//                           <span className="rb-suggestion-num">Suggestion {i + 1}</span>
//                           <span className="rb-suggestion-items">~{s.potentialItems} items to move</span>
//                         </div>
//                         <div className="rb-suggestion-body">
//                           <div className="rb-member-chip rb-member-chip--from">
//                             <div
//                               className="rb-chip-avatar"
//                               style={{ background: fromM ? getAvatar(fromM) : "#6366f1" }}
//                             >
//                               {s.fromName.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                               <p className="rb-chip-name">{s.fromName}</p>
//                               <p className="rb-chip-stat">Score: {fromM?.workloadScore} · {fromM?.tasks.active} tasks</p>
//                             </div>
//                             <span className="rb-chip-tag rb-chip-tag--red">Overloaded</span>
//                           </div>

//                           <div className="rb-arrow">
//                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
//                               <path d="M5 12h14M12 5l7 7-7 7" />
//                             </svg>
//                           </div>

//                           <div className="rb-member-chip rb-member-chip--to">
//                             <div
//                               className="rb-chip-avatar"
//                               style={{ background: toM ? getAvatar(toM) : "#22c55e" }}
//                             >
//                               {s.toName.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                               <p className="rb-chip-name">{s.toName}</p>
//                               <p className="rb-chip-stat">Score: {toM?.workloadScore} · {toM?.tasks.active} tasks</p>
//                             </div>
//                             <span className="rb-chip-tag rb-chip-tag--green">Available</span>
//                           </div>
//                         </div>

//                         <p className="rb-reason">{s.reason}</p>

//                         <button
//                           className="rb-apply-btn"
//                           onClick={() => applySuggestion(s)}
//                         >
//                           Apply this suggestion →
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}

//           {activeMode === "manual" && (
//             <div className="rb-manual">
//               <p className="rb-manual-hint">
//                 Select a source member and a target member to manually plan workload redistribution.
//               </p>

//               <div className="rb-select-row">
//                 <div className="rb-select-group">
//                   <label className="rb-label">Move work FROM</label>
//                   <select
//                     className="rb-select"
//                     value={fromMember}
//                     onChange={(e) => setFromMember(e.target.value)}
//                   >
//                     <option value="">Select member...</option>
//                     {members.map((m) => (
//                       <option key={m.memberId} value={m.memberId}>
//                         {m.memberName} (score: {m.workloadScore})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="rb-select-arrow">→</div>

//                 <div className="rb-select-group">
//                   <label className="rb-label">Move work TO</label>
//                   <select
//                     className="rb-select"
//                     value={toMember}
//                     onChange={(e) => setToMember(e.target.value)}
//                   >
//                     <option value="">Select member...</option>
//                     {members.filter(m => m.memberId !== fromMember).map((m) => (
//                       <option key={m.memberId} value={m.memberId}>
//                         {m.memberName} (score: {m.workloadScore})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Visual comparison */}
//               {fromMember && toMember && (() => {
//                 const fm = members.find(m => m.memberId === fromMember);
//                 const tm = members.find(m => m.memberId === toMember);
//                 if (!fm || !tm) return null;
//                 return (
//                   <div className="rb-comparison">
//                     <div className="rb-comparison-row">
//                       <span className="rb-cmp-name">{fm.memberName}</span>
//                       <div className="rb-cmp-bar-track">
//                         <div className="rb-cmp-bar" style={{ width: `${(fm.workloadScore / maxScore) * 100}%`, background: "#ef4444" }} />
//                       </div>
//                       <span className="rb-cmp-val">{fm.workloadScore}</span>
//                     </div>
//                     <div className="rb-comparison-row">
//                       <span className="rb-cmp-name">{tm.memberName}</span>
//                       <div className="rb-cmp-bar-track">
//                         <div className="rb-cmp-bar" style={{ width: `${(tm.workloadScore / maxScore) * 100}%`, background: "#22c55e" }} />
//                       </div>
//                       <span className="rb-cmp-val">{tm.workloadScore}</span>
//                     </div>
//                     <div className="rb-delta">
//                       Workload difference: <strong>{Math.abs(fm.workloadScore - tm.workloadScore)} pts</strong>
//                       {fm.workloadScore > tm.workloadScore
//                         ? ` — moving ~${Math.ceil((fm.workloadScore - tm.workloadScore) / 5)} items would balance them`
//                         : " — source has lower load than target"}
//                     </div>
//                   </div>
//                 );
//               })()}

//               {error && <div className="rb-error">{error}</div>}
//               {success && <div className="rb-success">{success}</div>}

//               {!success && (
//                 <button
//                   className="rb-submit-btn"
//                   onClick={handleRebalanceRequest}
//                   disabled={loading || !fromMember || !toMember}
//                 >
//                   {loading ? "Processing..." : "Prepare Rebalance Plan"}
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="rb-footer">
//           <p className="rb-footer-note">
//             💡 After rebalancing, open individual task cards to reassign them. Changes take effect immediately and are logged in the activity feed.
//           </p>
//           <button className="rb-close-btn" onClick={success ? onSuccess : onClose}>
//             {success ? "Done" : "Close"}
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// const rebalanceStyles = `
//   .rb-overlay {
//     position: fixed; inset: 0;
//     background: rgba(0,0,0,0.7); z-index: 200;
//     backdrop-filter: blur(4px);
//     animation: fadeIn 0.2s ease;
//   }
//   @keyframes fadeIn { from { opacity: 0; } }

//   .rb-modal {
//     position: fixed; top: 50%; left: 50%;
//     transform: translate(-50%, -50%);
//     width: 580px; max-width: 95vw; max-height: 90vh;
//     background: #0d1220; border: 1px solid #1e293b;
//     border-radius: 16px; z-index: 201;
//     display: flex; flex-direction: column;
//     overflow: hidden; font-family: 'DM Sans', sans-serif;
//     animation: scaleIn 0.25s cubic-bezier(0.4,0,0.2,1);
//   }
//   @keyframes scaleIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.95); } }

//   .rb-header {
//     display: flex; align-items: center; justify-content: space-between;
//     padding: 18px 22px; border-bottom: 1px solid #1e293b;
//     background: #111827;
//   }
//   .rb-title-row { display: flex; align-items: center; gap: 10px; }
//   .rb-icon { font-size: 22px; }
//   .rb-title-row h2 { margin: 0; font-size: 16px; font-weight: 700; color: #f1f5f9; }
//   .rb-close {
//     width: 32px; height: 32px; border-radius: 8px;
//     background: #1e293b; border: none; color: #94a3b8;
//     cursor: pointer; font-size: 12px;
//   }
//   .rb-close:hover { background: #334155; color: white; }

//   .rb-tabs { display: flex; padding: 0 22px; border-bottom: 1px solid #1e293b; }
//   .rb-tab {
//     display: flex; align-items: center; gap: 6px;
//     padding: 10px 16px; background: none; border: none;
//     color: #64748b; font-size: 13px; font-weight: 500;
//     cursor: pointer; border-bottom: 2px solid transparent;
//     margin-bottom: -1px; transition: all 0.15s;
//     font-family: 'DM Sans', sans-serif;
//   }
//   .rb-tab--active { color: #6366f1; border-bottom-color: #6366f1; }
//   .rb-tab-badge {
//     background: #ef4444; color: white;
//     font-size: 10px; padding: 1px 5px; border-radius: 8px;
//   }

//   .rb-body { flex: 1; overflow-y: auto; padding: 20px 22px; }

//   .rb-balanced {
//     display: flex; flex-direction: column; align-items: center;
//     gap: 8px; padding: 32px; text-align: center; color: #64748b;
//     font-size: 22px;
//   }
//   .rb-balanced p { font-size: 13px; margin: 0; }

//   .rb-suggestion-list { display: flex; flex-direction: column; gap: 14px; }
//   .rb-suggestion {
//     background: #111827; border: 1px solid #1e293b;
//     border-radius: 12px; padding: 16px;
//   }
//   .rb-suggestion-header {
//     display: flex; align-items: center; justify-content: space-between;
//     margin-bottom: 12px;
//   }
//   .rb-suggestion-num { font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px; }
//   .rb-suggestion-items { font-size: 11px; color: #64748b; }
//   .rb-suggestion-body { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
//   .rb-member-chip {
//     flex: 1; display: flex; align-items: center; gap: 10px;
//     padding: 10px; border-radius: 8px;
//   }
//   .rb-member-chip--from { background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15); }
//   .rb-member-chip--to { background: rgba(34,197,94,0.05); border: 1px solid rgba(34,197,94,0.15); }
//   .rb-chip-avatar {
//     width: 32px; height: 32px; border-radius: 50%;
//     display: flex; align-items: center; justify-content: center;
//     font-size: 14px; font-weight: 700; color: white; flex-shrink: 0;
//   }
//   .rb-chip-name { font-size: 13px; font-weight: 600; margin: 0; color: #f1f5f9; }
//   .rb-chip-stat { font-size: 10px; color: #64748b; margin: 0; }
//   .rb-chip-tag {
//     font-size: 10px; font-weight: 700; padding: 2px 6px;
//     border-radius: 6px; margin-left: auto; white-space: nowrap;
//   }
//   .rb-chip-tag--red { background: rgba(239,68,68,0.15); color: #f87171; }
//   .rb-chip-tag--green { background: rgba(34,197,94,0.15); color: #4ade80; }
//   .rb-arrow { color: #6366f1; flex-shrink: 0; }
//   .rb-reason { font-size: 11px; color: #64748b; margin-bottom: 12px; }
//   .rb-apply-btn {
//     width: 100%; padding: 9px;
//     background: linear-gradient(135deg, #6366f1, #4f46e5);
//     border: none; border-radius: 8px; color: white;
//     font-size: 13px; font-weight: 600; cursor: pointer;
//     font-family: 'DM Sans', sans-serif; transition: opacity 0.15s;
//   }
//   .rb-apply-btn:hover { opacity: 0.9; }

//   .rb-manual { display: flex; flex-direction: column; gap: 16px; }
//   .rb-manual-hint { font-size: 13px; color: #64748b; margin: 0; line-height: 1.6; }
//   .rb-select-row { display: flex; align-items: center; gap: 12px; }
//   .rb-select-group { flex: 1; }
//   .rb-label { display: block; font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; }
//   .rb-select {
//     width: 100%; padding: 9px 12px;
//     background: #111827; border: 1px solid #334155;
//     border-radius: 8px; color: #f1f5f9; font-size: 13px;
//     font-family: 'DM Sans', sans-serif; outline: none;
//   }
//   .rb-select:focus { border-color: #6366f1; }
//   .rb-select-arrow { font-size: 18px; color: #475569; margin-top: 18px; }

//   .rb-comparison {
//     background: #111827; border: 1px solid #1e293b;
//     border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px;
//   }
//   .rb-comparison-row { display: flex; align-items: center; gap: 10px; }
//   .rb-cmp-name { min-width: 100px; font-size: 12px; font-weight: 500; color: #94a3b8; }
//   .rb-cmp-bar-track { flex: 1; height: 8px; background: #1e293b; border-radius: 4px; overflow: hidden; }
//   .rb-cmp-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
//   .rb-cmp-val { min-width: 36px; text-align: right; font-size: 13px; font-weight: 700; color: #f1f5f9; font-family: 'JetBrains Mono', monospace; }
//   .rb-delta { font-size: 12px; color: #94a3b8; background: #0f172a; padding: 8px 12px; border-radius: 6px; }
//   .rb-delta strong { color: #f1f5f9; }

//   .rb-error { font-size: 12px; color: #f87171; background: rgba(239,68,68,0.1); padding: 10px 14px; border-radius: 8px; }
//   .rb-success { font-size: 12px; color: #4ade80; background: rgba(34,197,94,0.1); padding: 10px 14px; border-radius: 8px; line-height: 1.6; }

//   .rb-submit-btn {
//     padding: 11px; background: linear-gradient(135deg, #6366f1, #4f46e5);
//     border: none; border-radius: 8px; color: white;
//     font-size: 14px; font-weight: 600; cursor: pointer;
//     font-family: 'DM Sans', sans-serif; transition: opacity 0.15s;
//   }
//   .rb-submit-btn:hover:not(:disabled) { opacity: 0.9; }
//   .rb-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

//   .rb-footer {
//     padding: 14px 22px; border-top: 1px solid #1e293b;
//     display: flex; align-items: center; justify-content: space-between; gap: 12px;
//     background: #0d1220;
//   }
//   .rb-footer-note { font-size: 11px; color: #475569; margin: 0; flex: 1; line-height: 1.5; }
//   .rb-close-btn {
//     padding: 8px 18px; background: #1e293b;
//     border: 1px solid #334155; border-radius: 8px;
//     color: #94a3b8; font-size: 13px; cursor: pointer;
//     font-family: 'DM Sans', sans-serif; white-space: nowrap;
//     transition: all 0.15s; flex-shrink: 0;
//   }
//   .rb-close-btn:hover { background: #334155; color: #f1f5f9; }
// `;

// components/workload/RebalanceModal.tsx
"use client";

import { useState } from "react";
import { X, Scale, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MemberWorkload {
  memberId: string; memberName: string; memberEmail: string;
  memberImage: string | null; workloadScore: number;
  tasks: { active: number; overdue: number };
  pages: { total: number }; files: { total: number };
}

interface BalanceSuggestion {
  from: string; fromName: string;
  to: string; toName: string;
  reason: string; potentialItems: number;
}

interface Props {
  teamSlug: string; members: MemberWorkload[]; suggestions: BalanceSuggestion[];
  onClose: () => void; onSuccess: () => void;
}

const AVATAR_COLORS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#0891B2", "#4F46E5", "#BE185D"];
const getInitials = (name: string) => name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
const getColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function RebalanceModal({ teamSlug, members, suggestions, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<"suggestions" | "manual">("suggestions");
  const [fromMember, setFromMember] = useState(suggestions[0]?.from || "");
  const [toMember, setToMember] = useState(suggestions[0]?.to || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxScore = Math.max(...members.map(m => m.workloadScore), 1);

  const handleSubmit = async () => {
    if (!fromMember || !toMember || fromMember === toMember) {
      setError("Please select two different members");
      return;
    }
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 800));
    const fm = members.find(m => m.memberId === fromMember);
    const tm = members.find(m => m.memberId === toMember);
    setSuccess(`Rebalance plan ready. Open individual task cards to reassign from ${fm?.memberName} → ${tm?.memberName}.`);
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-w-[95vw] max-h-[90vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl z-50 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 bg-violet-100 dark:bg-violet-950 rounded-lg flex items-center justify-center">
              <Scale className="size-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Workload Rebalancing</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
          {(["suggestions", "manual"] as const).map(m => (
            <button type="button"
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-5 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5",
                mode === m
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {m === "suggestions" ? "AI Suggestions" : "Manual"}
              {m === "suggestions" && suggestions.length > 0 && (
                <span className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0 rounded-full">
                  {suggestions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {mode === "suggestions" && (
            suggestions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Team is balanced</p>
                <p className="text-xs text-gray-400 mt-1">No rebalancing needed right now.</p>
              </div>
            ) : suggestions.map((s) => (
              <div key={s.fromName + s.toName} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                    Suggestion {s.fromName} {s.toName} 
                  </span>
                  <span className="text-[11px] text-gray-400">~{s.potentialItems} items to move</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* From */}
                  <div className="flex-1 flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[10px] font-bold text-white" style={{ background: "#EF4444" }}>
                        {getInitials(s.fromName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{s.fromName}</p>
                      <p className="text-[10px] text-red-500">Overloaded</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-violet-500 shrink-0" />
                  {/* To */}
                  <div className="flex-1 flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[10px] font-bold text-white" style={{ background: "#059669" }}>
                        {getInitials(s.toName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{s.toName}</p>
                      <p className="text-[10px] text-emerald-600">Available capacity</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{s.reason}</p>
                <Button
                  size="sm" className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={() => { setFromMember(s.from); setToMember(s.to); setMode("manual"); }}
                >
                  Apply this suggestion →
                </Button>
              </div>
            ))
          )}

          {mode === "manual" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select source and target members to plan workload redistribution.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Move FROM
                  </div>
                  <Select value={fromMember} onValueChange={setFromMember}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map(m => (
                        <SelectItem key={m.memberId} value={m.memberId}>
                          {m.memberName} (score: {m.workloadScore})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Move TO
                  </div>
                  <Select value={toMember} onValueChange={setToMember}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {members.filter(m => m.memberId !== fromMember).map(m => (
                        <SelectItem key={m.memberId} value={m.memberId}>
                          {m.memberName} (score: {m.workloadScore})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Comparison */}
              {fromMember && toMember && (() => {
                const fm = members.find(m => m.memberId === fromMember);
                const tm = members.find(m => m.memberId === toMember);
                if (!fm || !tm) return null;
                return (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2.5">
                    {[fm, tm].map((m, i) => (
                      <div key={m.memberId} className="flex items-center gap-3">
                        <Avatar className="size-6 shrink-0">
                          <AvatarFallback className="text-[9px] font-bold text-white" style={{ background: i === 0 ? "#EF4444" : "#059669" }}>
                            {getInitials(m.memberName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-28 truncate shrink-0">{m.memberName}</span>
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(m.workloadScore / maxScore) * 100}%`, background: i === 0 ? "#EF4444" : "#059669" }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white w-7 text-right">{m.workloadScore}</span>
                      </div>
                    ))}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                      Score gap: <strong className="text-gray-900 dark:text-white">{Math.abs(fm.workloadScore - tm.workloadScore)} pts</strong>
                      {fm.workloadScore > tm.workloadScore
                        ? ` → move ~${Math.ceil((fm.workloadScore - tm.workloadScore) / 5)} items to balance`
                        : " — source has lower load than target"}
                    </p>
                  </div>
                );
              })()}

              {error && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-3 leading-relaxed">
                  ✅ {success}
                </div>
              )}

              {!success && (
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  disabled={loading || !fromMember || !toMember}
                  onClick={handleSubmit}
                >
                  {loading ? "Processing..." : "Prepare Rebalance Plan"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-950 shrink-0">
          <p className="text-[11px] text-gray-400 flex-1 mr-4">
            💡 Open individual task cards after rebalancing to reassign them. Changes are logged in the activity feed.
          </p>
          <Button
            variant="outline" size="sm"
            onClick={success ? onSuccess : onClose}
          >
            {success ? "Done" : "Close"}
          </Button>
        </div>
      </div>
    </>
  );
}
