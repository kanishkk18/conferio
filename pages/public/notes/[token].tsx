import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import Head from 'next/head'

interface Block {
  id: string
  type: string
  content: any
  checked?: boolean
  position?: number
}

interface Note {
  id: string
  title: string
  emoji?: string
  blocks: Block[]
  author: {
    name: string
    image?: string
  }
  createdAt: string
  updatedAt: string
}

interface PublicNotePageProps {
  note: Note | null
  error?: string
}

export default function PublicNotePage({ note, error }: PublicNotePageProps) {
  // Debug: log what we received
  console.log('Received note:', note)
  console.log('Received blocks:', note?.blocks)
  console.log('Blocks length:', note?.blocks?.length)

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" aria-label="Button">
        <div className="text-center" aria-label="Button">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Note not found'}
          </h1>
          <p className="text-gray-500">This note may have been removed or the link has expired.</p>
        </div>
      </div>
    )
  }

  const renderBlock = (block: Block) => {
    // Handle both string content and object content
    const content = typeof block.content === 'string'
      ? block.content
      : block.content?.text || JSON.stringify(block.content)

    switch (block.type) {
      case 'text':
        return <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>

      case 'heading':
        return <h2 className="text-2xl font-semibold mt-6 mb-4 text-gray-900 dark:text-white">{content}</h2>

      case 'bullet':
        return (
          <li className="mb-1 text-gray-700 dark:text-gray-300 ml-6 list-disc">
            {content}
          </li>
        )

      case 'checklist':
        return (
          <div className="flex items-center gap-2 mb-2" aria-label="Button">
            <input
            aria-label='check-box'
              type="checkbox"
              checked={!!block.checked}
              readOnly
              className="rounded border-gray-300"
            />
            <span className={block.checked ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'} aria-label="Button">
              {content}
            </span>
          </div>
        )

      case 'image':
        return (
          <figure className="mb-6">
            <img
              src={content}
              alt="Note"
              className="max-w-full rounded-lg"
            />
          </figure>
        )

      default:
        return <p className="mb-4 text-gray-700">{String(content)}</p>
    }
  }

  return (
    <>
      <Head>
        <title>{note.title} | Shared Note</title>
        <meta name="description" content={`Shared note by ${note.author.name}`} />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900" aria-label="Button">
        <div className="max-w-3xl mx-auto px-6 py-12" aria-label="Button">
          {/* Header */}
          <div className="mb-8" aria-label="Button">
            <div className="flex items-center gap-3 mb-6" aria-label="Button">
              <span className="text-4xl" aria-label="Button">{note.emoji || '📝'}</span>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
                {note.title}
              </h1>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500 border-b pb-6" aria-label="Button">
              <img
                src={note.author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(note.author.name)}&background=random`}
                alt={note.author.name}
                className="size-8 rounded-full"
              />
              <span>Shared by <strong className="text-gray-700 dark:text-gray-300">{note.author.name}</strong></span>
              <span>•</span>
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2" aria-label="Button">
            {note.blocks && note.blocks.length > 0 ? (
              note.blocks.map((block) => (
                <div key={block.id} aria-label="Button">{renderBlock(block)}</div>
              ))
            ) : (
              <p className="text-gray-400 italic">No content in this note</p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-sm text-gray-400" aria-label="Button">
            <p>Shared via Notes App</p>
          </div>
        </div>
      </div>
    </>
  )
}

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const { token } = params as { token: string }

//   try {
//     console.log('Fetching share with token:', token)

//     // First, let's see what the raw share looks like without includes
//     const rawShare = await prisma.noteShare.findUnique({
//       where: { token },
//     })
//     console.log('Raw share noteId:', rawShare?.noteId)

//     // Get the note without includes to see its structure
//     const rawNote = await prisma.note.findUnique({
//       where: { id: rawShare?.noteId },
//     })
//     console.log('Raw note fields:', Object.keys(rawNote || {}))
//     console.log('Raw note content field:', rawNote?.content)

//     // Try to get blocks with different possible relation names
//     const shareWithBlocks = await prisma.noteShare.findUnique({
//       where: { token },
//       include: {
//         note: {
//           include: {
//             author: {
//               select: { name: true, image: true },
//             },
//             blocks: true, // Try lowercase
//              // Try uppercase
//           },
//         },
//       },
//     })

//     console.log('Note with blocks:', shareWithBlocks?.note ? 'found' : 'not found')
//     console.log('Blocks (lowercase):', (shareWithBlocks?.note as any)?.blocks?.length || 0)
//     console.log('Blocks (uppercase):', (shareWithBlocks?.note as any)?.Blocks?.length || 0)

//     // If content is stored as JSON
//     if (rawNote?.content && typeof rawNote.content === 'object') {
//       console.log('Content.blocks:', (rawNote.content as any)?.blocks?.length || 0)
//     }

//     if (!rawShare) {
//       return { props: { note: null, error: 'Share not found' } }
//     }

//     // Determine where blocks actually are
//     let blocks: any[] = []

//     if ((shareWithBlocks?.note as any)?.blocks?.length > 0) {
//       blocks = (shareWithBlocks?.note as any)?.blocks
//     } else if ((shareWithBlocks?.note as any)?.Blocks?.length > 0) {
//       blocks = (shareWithBlocks?.note as any)?.Blocks
//     } else if (rawNote?.content && typeof rawNote.content === 'object' && (rawNote.content as any)?.blocks) {
//       blocks = (rawNote.content as any).blocks
//     }

//     console.log('Final blocks count:', blocks.length)

//     const noteData = {
//       id: rawNote?.id || '',
//       title: rawNote?.title || '',
//       emoji: (rawNote as any)?.emoji || '📝',
//       author: shareWithBlocks?.note?.author || { name: 'Unknown' },
//       blocks: blocks.map((block: any) => ({
//         id: block.id || String(Math.random()),
//         type: block.type || 'text',
//         content: block.content || '',
//         checked: block.checked || false,
//       })),
//       createdAt: rawNote?.createdAt?.toISOString() || new Date().toISOString(),
//       updatedAt: rawNote?.updatedAt?.toISOString() || new Date().toISOString(),
//     }

//     return {
//       props: {
//         note: noteData,
//       },
//     }
//   } catch (error) {
//     console.error('Error in getServerSideProps:', error)
//     return { props: { note: null, error: 'Failed to load note: ' + String(error) } }
//   }
// }

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { token } = params as { token: string }

  try {
    const share = await prisma.noteShare.findUnique({
      where: { token },
      include: {
        note: {
          include: {
            author: {
              select: { name: true, image: true },
            },
          },
        },
      },
    })

    if (!share || !share.note) {
      return { props: { note: null, error: 'Note not found' } }
    }

    // Extract blocks from content JSON field
    let blocks: any[] = []
    if (share.note.content && typeof share.note.content === 'object') {
      blocks = (share.note.content as any)?.blocks || []
    }

    const noteData = {
      id: share.note.id,
      title: share.note.title,
      emoji: (share.note as any).emoji || '📝',
      author: share.note.author || { name: 'Unknown' },
      blocks: blocks.map((block: any) => ({
        id: block.id || String(Math.random()),
        type: block.type || 'text',
        content: block.content || '',
        checked: block.checked || false,
      })),
      createdAt: share.note.createdAt.toISOString(),
      updatedAt: share.note.updatedAt.toISOString(),
    }

    return { props: { note: noteData } }
  } catch (error) {
    console.error('Error:', error)
    return { props: { note: null, error: 'Failed to load note' } }
  }
}