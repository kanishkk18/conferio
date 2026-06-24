// import { MailIcon } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import RecordingInterface from "./RecordingInterface"
// import { useState } from "react"
// import { Clip } from '@prisma/client';


// interface DashboardProps {
//   initialClips: Clip[];
// }

// export default function ClipButton({ initialClips }: DashboardProps) {
//   const [isRecording, setIsRecording] = useState(false);
//   const [clips, setClips] = useState<Clip[]>(initialClips);


//   const handleRecordingComplete = async (blob: Blob, title: string) => {
//     const formData = new FormData();
//     formData.append('file', blob, `${title}.webm`);
//     formData.append('title', title);
//     formData.append('description', 'video Clip');

//     try {
//       const response = await fetch('/api/clips/upload', {
//         method: 'POST',
//         body: formData,
//         // Don't set Content-Type header - let the browser set it with boundary
//       });

//       if (response.ok) {
//         const newClip = await response.json();
//         setClips((prev) => [newClip, ...prev]);
//       } else {
//         console.error('Upload failed:', await response.text());
//       }
//     } catch (error) {
//       console.error('Upload failed:', error);
//     }
//   };
 
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//        <Button variant="default" className="bg-[#6347EA] hover:bg-primary/90 px-2 rounded-lg py-4 h-0 text-white">
//                         New Clip
//                       </Button>
//       </DialogTrigger>
//       <DialogContent className="absolute top-48 right-1 ml-auto max-w-[340px] w-[340px] " >
//       <RecordingInterface
//             onRecordingComplete={handleRecordingComplete}
//             onRecordingStateChange={setIsRecording}
//           />
//       </DialogContent>
//     </Dialog>
//   )
// }

// import { MailIcon } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import RecordingInterface from "./RecordingInterface"
// import { useState } from "react"
// import { Clip } from '@prisma/client';

// interface DashboardProps {
//   initialClips: Clip[];
// }

// export default function ClipButton({ initialClips }: DashboardProps) {
//   const [isRecording, setIsRecording] = useState(false);

//   const handleRecordingComplete = async (blob: Blob, title: string, type: 'audio' | 'video' | 'both') => {
//     const formData = new FormData();
//     const ext = type === 'audio' ? 'webm' : 'webm';
//     formData.append('file', blob, `${title}.${ext}`);
//     formData.append('title', title);
//     formData.append('description', 'video Clip');
//     formData.append('clipType', type);

//     try {
//       const response = await fetch('/api/clips/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         console.error('Upload failed:', await response.text());
//       }
//     } catch (error) {
//       console.error('Upload failed:', error);
//     }
//   };
 
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//        <Button variant="default" className="bg-[#6347EA] hover:bg-primary/90 px-2 rounded-lg py-4 h-0 text-white">
//                         New Clip
//                       </Button>
//       </DialogTrigger>
//       <DialogContent className="absolute top-48 right-1 ml-auto max-w-[340px] w-[340px] " >
//       <RecordingInterface
//             onRecordingComplete={handleRecordingComplete}
//             onRecordingStateChange={setIsRecording}
//           />
//       </DialogContent>
//     </Dialog>
//   )
// }

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import RecordingInterface from "./RecordingInterface"
import { useState } from "react"
import { Disc3 } from "../animate-ui/icons/disc-3";
import { Plus } from "../animate-ui/icons/plus";

export default function ClipButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
       <Button variant="default" size="sm" className="bg-[#6347EA] dark:bg-[#fff] gap-1 hover:bg-primary/90 px-2 rounded-lg py-0 h-8 dark:text-black text-white">
        <Plus size={12}/> New Clip
        </Button>
      </DialogTrigger>
      <DialogContent className="absolute top-48 right-1 ml-auto max-w-[340px] w-[340px]" >
        <RecordingInterface
          onRecordingStateChange={() => {}}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}