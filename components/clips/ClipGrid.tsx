// // components/ClipGrid.tsx

import { useState } from 'react'
import { Clip } from '@prisma/client'
// import ClipCard from './ClipCard'
// import VideoModal from './VideoModal'

interface ClipGridProps {
  clips: Clip[]
  onClipUpdate: () => void
}

// export default function ClipGrid({ clips, onClipUpdate }: ClipGridProps) {
//   const [selectedClip, setSelectedClip] = useState<Clip | null>(null)

// if (clips.length === 0) {
//   return (
//     <div className="text-center py-12">
//       <div className="text-gray-500 text-lg">No clips yet</div>
//       <p className="text-gray-400 mt-2">Start by creating your first recording!</p>
//     </div>
//   )
// }

//   return (
//     <>
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//         {clips.map((clip) => (
//           <ClipCard
//             key={clip.id}
//             clip={clip}
//             onPlay={() => setSelectedClip(clip)}
//             onUpdate={onClipUpdate}
//           />
//         ))}
//       </div>

//       <VideoModal
//         clip={selectedClip}
//         isOpen={!!selectedClip}
//         onClose={() => setSelectedClip(null)}
//       />
//     </>
//   )
// }

import { ExpandableCard } from "@/components/ui/expandable-card"
import ClipButton from './clipButton'
import { Video } from 'lucide-react'

export default function ExpandableCardDemo({ clips, onClipUpdate }: ClipGridProps) {
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)

  if (clips.length === 0) {
    return (
      <div className="text-center h-screen justify-center flex items-center flex-col -ml-10 w-screen z-50 relative">
        <div className="flex flex-col items-center justify-center py-24 text-center !z-50">
          <div className=" size-14  rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
            <Video className='size-8 text-zinc-600' />
          </div>
          <p className="text-zinc-400 font-medium mb-1">No clips yet</p>
          <p className="text-zinc-600 text-sm mb-4">Create your first clip and share it with your team</p>
          <ClipButton initialClips={clips} />

        </div>
        <div className="absolute inset-0 -z-50 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      </div>
    )
  }

  return (
    <>
      {clips.map((clip) => (
        <ExpandableCard
          key={clip.id}
          onPlay={() => setSelectedClip(clip)}
          title={clip.title}
          src={clip.fileUrl || ""}
          description={clip.description || 'No description'}
          classNameExpanded="[&_h4]:text-black dark:[&_h4]:text-white [&_h4]:font-medium"
          clip={clip}
        >
        </ExpandableCard>
      ))}
    </>
  )
}
