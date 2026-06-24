// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { Label } from "./label";
// import { Input } from "./input";
// import { Button } from "./button";
// import { toast } from "react-hot-toast";
// import { LogIn } from "lucide-react";
// // ... your imports

// type JoinMeetingModalProps = {
//   open?: boolean;
//   onClose?: () => void;
//   onJoin: (meetingId: string) => void;
// };

// export default function ChartCard({ onJoin }: JoinMeetingModalProps) {
//   const [meetingId, setMeetingId] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleCreateMeeting = () => {
//     const roomId = `conferio-${Date.now()}`;
//     router.push(`/meeting/${roomId}`);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!meetingId.trim()) {
//       toast(
//         <div>
//           <div className="font-semibold text-destructive">Meeting ID required</div>
//           <div className="text-sm text-muted-foreground">Please enter a valid meeting ID</div>
//         </div>
//       );
//       return;
//     }

//     setIsLoading(true);
//     setTimeout(() => {
//       onJoin(meetingId);
//       setMeetingId("");
//       setIsLoading(false);
//     }, 1000);
//   };

//   return (
//     <section>
//       <div className="min-w-[22rem] min-h-[300px] px-4 pt-4 rounded-xl backdrop-blur-lg bg-zinc-900 border-border">
//         <h1 className="flex font-bold text-md items-center gap-2">
//           <LogIn className="h-5 w-5 text-primary" />
//           Join Meeting
//         </h1>
//         <p className="text-sm pt-2 text-muted-foreground">
//           Enter the meeting ID to join a meet
//         </p>

//         <form onSubmit={handleSubmit} className="gap-y-2 py-4">
//           <div className="gap-y-2">
//             <Label htmlFor="meeting-id">Meeting ID</Label>
//             <Input
//               id="meeting-id"
//               placeholder="Enter meeting ID"
//               value={meetingId}
//               onChange={(e) => setMeetingId(e.target.value)}
//               className="bg-background/50"
//               autoFocus
//             />
//           </div>
//           <div className="gap-y-2">
//             <Label htmlFor="meeting-password">Enter Password (optional)</Label>
//             <Input id="meeting-password" placeholder="Enter Password" className="bg-background/50" />
//           </div>

//           <div className="flex items-center gap-4 pt-2">
//             <Button type="button" className="bg-black text-white" onClick={handleCreateMeeting}>
//               Create a meeting
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? "Joining..." : "Join Meeting"}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }

// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { Label } from "./label";
// import { Input } from "./input";
// import { Button } from "./button";
// import { toast } from "react-hot-toast";
// import { LogIn } from "lucide-react";

// export default function ChartCard() {
//   const [meetingId, setMeetingId] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleCreateMeeting = () => {
//     const roomId = `conferio-${Date.now()}`;
//     router.push(`/meeting/${roomId}`);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!meetingId.trim()) {
//       toast(
//         <div>
//           <div className="font-semibold text-destructive">Meeting ID required</div>
//           <div className="text-sm text-muted-foreground">Please enter a valid meeting ID</div>
//         </div>
//       );
//       return;
//     }

//     setIsLoading(true);
//     setTimeout(() => {
//       router.push(`/meeting/${meetingId.trim()}`);
//       setIsLoading(false);
//     }, 1000);
//   };

//   return (
//     <section>
//       <div className="min-w-[22rem] min-h-[300px] px-4 pt-4 rounded-xl backdrop-blur-lg bg-zinc-900 border-border">
//         <h1 className="flex font-bold text-md items-center gap-2">
//           <LogIn className="h-5 w-5 text-primary" />
//           Join Meeting
//         </h1>
//         <p className="text-sm pt-2 text-muted-foreground">
//           Enter the meeting ID to join a meet
//         </p>

//         <form onSubmit={handleSubmit} className="gap-y-2 py-4">
//           <div className="gap-y-2">
//             <Label htmlFor="meeting-id">Meeting ID</Label>
//             <Input
//               id="meeting-id"
//               placeholder="Enter meeting ID"
//               value={meetingId}
//               onChange={(e) => setMeetingId(e.target.value)}
//               className="bg-background/50"
//               autoFocus
//             />
//           </div>
//           <div className="gap-y-2">
//             <Label htmlFor="meeting-password">Enter Password (optional)</Label>
//             <Input id="meeting-password" placeholder="Enter Password" className="bg-background/50" />
//           </div>

//           <div className="flex items-center gap-4 pt-2">
//             <Button type="button" className="bg-black text-white" onClick={handleCreateMeeting}>
//               Create a meeting
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? "Joining..." : "Join Meeting"}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }


// "use client";

// import { useState } from "react";
// import { Label } from "./label";
// import { Input } from "./input";
// import { Button } from "./button";
// import { toast } from "react-hot-toast";
// // import { LogIn } from "lucide-react";
// import { AnimateIcon } from "../animate-ui/icons/icon";
// import { LogIn } from "../animate-ui/icons/log-in";

// type JoinMeetingModalProps = {
//   open?: boolean;
//   onClose?: () => void;
//   onJoin?: (meetingId: string) => void; // Optional now
// };

// export default function ChartCard({ onJoin }: JoinMeetingModalProps) {
//   const [meetingId, setMeetingId] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleCreateMeeting = () => {
//     const roomId = `${Date.now()}`;
//     const url = `/meeting/conferio-meeting/${roomId}`;
//     window.open(url, "_blank"); // opens in a new tab
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!meetingId.trim()) {
//       toast(
//         <div>
//           <div className="font-semibold text-destructive">Meeting ID required</div>
//           <div className="text-sm text-muted-foreground">Please enter a valid meeting ID</div>
//         </div>
//       );
//       return;
//     }

//     setIsLoading(true);
//     setTimeout(() => {
//       const url = `/meeting/${meetingId.trim()}`;
//       window.open(url, "_blank"); // open meeting in a new tab
//       setMeetingId("");
//       setIsLoading(false);
//     }, 1000);
//   };

//   return (
//     <section>
//       <div className="min-w-[25rem] min-h-[300px] h-[300px] max-h-[300px] px-4 pt-4 flex flex-col rounded-xl backdrop-blur-lg bg-[#F4F4F5] dark:bg-[#111111] border dark:border-[#1D1D1D]">
//         <h1 className="flex font-bold text-md items-center gap-2">
//           <AnimateIcon animateOnHover>
//             <LogIn className="h-5 w-5 text-primary" />
//           </AnimateIcon>
//           Join Meeting
//         </h1>
//         <p className="text-sm pt-2 text-muted-foreground">
//           Enter the meeting ID to join a meet
//         </p>

//         <form onSubmit={handleSubmit} className="gap-y-2 py-4">
//           <div className="gap-y-2">
//             <Label htmlFor="meeting-id">Meeting ID</Label>
//             <Input
//               id="meeting-id"
//               placeholder="Enter meeting ID"
//               value={meetingId}
//               onChange={(e) => setMeetingId(e.target.value)}
//               className="bg-background/50 dark:bg-transparent border dark:border-[#262626] hover:dark:bg-[#262626]"
//               autoFocus
//             />
//           </div>
//           <div className="gap-y-2">
//             <Label htmlFor="meeting-password">Enter Password (optional)</Label>
//             <Input
//               id="meeting-password"
//               placeholder="Enter Password"
//               className="bg-background/50 dark:bg-transparent border dark:border-[#262626] hover:dark:bg-[#262626]"
//             />
//           </div>

//           <div className="flex items-center gap-4 pt-2">
//             <Button type="button" className="bg-black text-white" onClick={handleCreateMeeting}>
//               Create a meeting
//             </Button>
//             <Button type="submit" disabled={isLoading} className="text-white bg-gradient-to-br from-[#3793FF] to-[#0017E4]">
//               {isLoading ? "Joining..." : "Join Meeting"}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }

// "use client";

// import { useState } from "react";
// import { Label } from "./label";
// import { Input } from "./input";
// import { Button } from "./button";
// import { toast } from "react-hot-toast";
// import { AnimateIcon } from "../animate-ui/icons/icon";
// import { LogIn } from "../animate-ui/icons/log-in";

// type JoinMeetingModalProps = {
//   open?: boolean;
//   onClose?: () => void;
//   onJoin?: (meetingId: string) => void;
// };

// export default function ChartCard({ onJoin }: JoinMeetingModalProps) {
//   const [meetingId, setMeetingId] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleCreateMeeting = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch("/api/video-call", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title: "New Meeting" }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       window.open(`/meeting/lobby/${data.roomName}`, "_blank");
//     } catch (err: any) {
//       toast.error(err.message || "Failed to create meeting");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!meetingId.trim()) {
//       toast("Please enter a valid meeting ID");
//       return;
//     }
//     window.open(`/meeting/lobby/${meetingId.trim()}`, "_blank");
//     setMeetingId("");
//   };

//   return (
//     <section>
//       <div className="min-w-[25rem] min-h-[300px] h-[300px] max-h-[300px] px-4 pt-4 flex flex-col rounded-xl backdrop-blur-lg bg-[#F4F4F5] dark:bg-[#111111] border dark:border-[#1D1D1D]">
//         <h1 className="flex font-bold text-md items-center gap-2">
//           <AnimateIcon animateOnHover>
//             <LogIn className="h-5 w-5 text-primary" />
//           </AnimateIcon>
//           Join Meeting
//         </h1>
//         <p className="text-sm pt-2 text-muted-foreground">
//           Enter the meeting ID to join a meet
//         </p>

//         <form onSubmit={handleSubmit} className="gap-y-2 py-4">
//           <div className="gap-y-2">
//             <Label htmlFor="meeting-id">Meeting ID</Label>
//             <Input
//               id="meeting-id"
//               placeholder="Enter meeting ID"
//               value={meetingId}
//               onChange={(e) => setMeetingId(e.target.value)}
//               className="bg-background/50 dark:bg-transparent border dark:border-[#262626] hover:dark:bg-[#262626]"
//               autoFocus
//             />
//           </div>

//           <div className="flex items-center gap-4 pt-2">
//             <Button type="button" className="bg-black text-white" onClick={handleCreateMeeting} disabled={isLoading}>
//               {isLoading ? "Creating..." : "Create a meeting"}
//             </Button>
//             <Button type="submit" disabled={isLoading} className="text-white bg-gradient-to-br from-[#3793FF] to-[#0017E4]">
//               Join Meeting
//             </Button>
//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }

"use client";

import { useState } from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { toast } from "react-hot-toast";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { LogIn } from "../animate-ui/icons/log-in";
import {
  Video, Lock, Shield, Settings, X, Eye, EyeOff, Loader2, Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function ChartCard() {
  const [meetingId, setMeetingId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Create meeting settings
  const [showCreateSettings, setShowCreateSettings] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showJoinPassword, setShowJoinPassword] = useState(false);

  const handleCreateMeeting = async () => {
    setIsCreateLoading(true);
    try {
      const res = await fetch("/api/video-meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingTitle.trim() || "My Meeting",
          requireApproval,
          password: createPassword || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create meeting");
      }

      const data = await res.json();
      const url = `/meeting/${data.meeting.roomId}`;
      window.open(url, "_blank");

      // Reset
      setMeetingTitle("");
      setCreatePassword("");
      setRequireApproval(false);
      setShowCreateSettings(false);

      toast.success(`Meeting created! Room: ${data.meeting.roomId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create meeting");
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = meetingId.trim();
    if (!id) {
      toast.error("Please enter a meeting ID");
      return;
    }

    setIsJoinLoading(true);
    setTimeout(() => {
      const url = `/meeting/${id}`;
      window.open(url, "_blank");
      setMeetingId("");
      setJoinPassword("");
      setIsJoinLoading(false);
    }, 600);
  };

  return (
    <section>
      <div className="min-w-[25rem] !min-h-[300px] h-[300px] max-h-[300px] px-4 pt-4 pb-4 flex flex-col rounded-xl backdrop-blur-lg bg-[#F4F4F5] dark:bg-[#111111] border dark:border-[#1D1D1D]">
      <div className="flex justify-between items-center">
   <div className="">
    <div className="flex justify-between items-center">
      <h1 className="flex font-semibold text-md items-center gap-2">
        <AnimateIcon animateOnHover>
          <LogIn className="h-5 w-5 text-primary" />
        </AnimateIcon>
       <p className="text-sm">Join Meeting</p>
      </h1>
      
    </div>
    <p className="text-sm pt-1 text-muted-foreground">
      Enter the meeting Id to join or create a new one
    </p>
    </div>
    <Button
        size="icon"
        variant="outline"
        onClick={() => setShowCreateSettings((v) => !v)}
        className=" text-white h-[1.85rem] bg-transparent"
      >
        {showCreateSettings ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Settings className="h-4 w-4" />
        )}
      </Button>
    </div>

<AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          {!showCreateSettings && (
            <>
          <div className="space-y-2">
            <Label htmlFor="meeting-id">Meeting ID</Label>
            <Input
              id="meeting-id"
              placeholder="abc-defg-hij"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="bg-background/50 dark:bg-transparent border dark:border-[#262626] hover:dark:bg-[#262626]"
              autoFocus
            />
          </div>

          <div className="space-y-2 pb-2">
            <Label htmlFor="meeting-password">Password (optional)</Label>
            <div className="relative">
              <Input
                id="meeting-password"
                type={showJoinPassword ? "text" : "password"}
                placeholder="Enter password if required"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                className="bg-background/50 dark:bg-transparent border dark:border-[#262626] hover:dark:bg-[#262626] pr-9"
              />
              <button
                type="button"
                onClick={() => setShowJoinPassword((v) => !v)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showJoinPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          </>
            )}
          
            {showCreateSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-0 pb-0">
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meeting Title</Label>
                    <Input
                      placeholder="My Meeting"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="bg-background/50 dark:bg-transparent border dark:border-[#262626] hover:dark:bg-[#262626] h-8 text-sm"
                    />
                  </div>

                 
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Password protection
                    </Label>
                    <div className="relative">
                      <Input
                        type={showCreatePassword ? "text" : "password"}
                        placeholder="Set a meeting password"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        className="bg-background/50 dark:bg-transparent border dark:border-[#262626] hover:dark:bg-[#262626] h-8 text-sm pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword((v) => !v)}
                        className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                      >
                        {showCreatePassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  
                  <div className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground">
                        Require approval to join
                      </span>
                    </div>
                    <button
                    aria-label="require approval"
                      type="button"
                      onClick={() => setRequireApproval((v) => !v)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        requireApproval
                          ? "bg-blue-600"
                          : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <motion.div
                        animate={{ x: requireApproval ? 16 : 2 }}
                        className="absolute top-0.5 size-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          

          <div className="flex items-center gap-3 pt-2">
             <Button
            type="button"
            onClick={handleCreateMeeting}
            disabled={isCreateLoading}
            className="w-1/2 bg-black text-white !h-[2rem] !py-0 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {isCreateLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Plus className="h-4 w-4 mr-1.5" />
            )}
            {isCreateLoading ? "Creating…" : "Create a meeting"}
          </Button>
            <Button
              type="submit"
              disabled={isJoinLoading}
              className=" w-1/2 text-white !h-[2rem] bg-gradient-to-br from-[#3793FF] to-[#0017E4]"
            >
              {isJoinLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <LogIn className="h-4 w-4 mr-1" />
              )}
              {isJoinLoading ? "Joining…" : "Join"}
            </Button>

          </div>

        </form>
       </AnimatePresence>
       
          {/* <button
            type="button"
            onClick={() => setShowCreateSettings((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg dark:bg-[#1A1A1A] dark:border-[#262626] border bg-white hover:dark:bg-[#222] transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Meeting settings</span>
            </div>
            <motion.div animate={{ rotate: showCreateSettings ? 180 : 0 }}>
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.div>
          </button> */}

      </div>
    </section>
  );
}

