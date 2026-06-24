import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { Clip } from '@prisma/client'
import { useRef, useState } from 'react'

interface SharePageProps {
  clip: Clip | null
}

export default function SharePage({ clip }: SharePageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!clip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Clip Not Found</h1>
          <p className="text-gray-600 mt-2">
            The requested clip does not exist or is no longer available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold">{clip.title}</h1>
            {clip.description && (
              <p className="text-gray-600 mt-2">{clip.description}</p>
            )}
          </div>

          <video
          aria-label='clip-video'
            ref={videoRef}
            src={clip.fileUrl}
            controls
            className="w-full bg-black"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <track kind="captions" />
          </video>

          <div className="p-6 border-t text-sm text-gray-500 flex justify-between">
            <span>
              Shared on {new Date(clip.createdAt).toLocaleDateString()}
            </span>
            <span>
              Size: {Math.round(clip.fileSize / 1024 / 1024)} MB
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const token = params?.token as string

//   if (!token) {
//     return { props: { clip: null } }
//   }

//   const clip = await prisma.clip.findFirst({
//     where: {
//       shareToken: token,
//       // isPublic: true,
//     },
//   })

//   return {
//     props: {
//       clip: clip ? JSON.parse(JSON.stringify(clip)) : null,
//     },
//   }
// }
//   for aws above

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const token = params?.token as string
  if (!token) return { props: { clip: null } }

  const clip = await prisma.clip.findFirst({
    where: { shareToken: token },
  })

  if (!clip) return { props: { clip: null } }

  // FIX: Override with public URL
  const publicUrl = `${process.env.S3_PUBLIC_URL}/${clip.fileName}`

  return {
    props: {
      clip: {
        ...JSON.parse(JSON.stringify(clip)),
        fileUrl: publicUrl,
      },
    },
  }
}
