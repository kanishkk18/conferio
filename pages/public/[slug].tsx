'use client'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import SafeHTML from '@/components/SafeHTML'

interface PublicPage {
  id: string
  title: string
  content: any
  emoji?: string
  coverImage?: string
  createdAt: string
  updatedAt: string
  author: {
    name: string
    image?: string
  }
  workspace: {
    name: string
  }
}

export default function PublicPage() {
  const router = useRouter()
  const { slug } = router.query
  const [page, setPage] = useState<PublicPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchPublicPage()
    }
  }, [slug])

  const fetchPublicPage = async () => {
    try {
      const response = await fetch(`/api/public/${slug}`)

      if (response.ok) {
        const data = await response.json()
        setPage(data)
      } else if (response.status === 404) {
        setError('Page not found')
      } else {
        setError('Failed to load page')
      }
    } catch (error) {
      setError('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
          <p className="text-gray-600">{error || 'The page you\'re looking for doesn\'t exist.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center !gap-x-3">
              <div className="text-4xl">{page.emoji || '📄'}</div>
              <div>
                <h1 className="text-3xl font-semibold">{page.title}</h1>
                <div className="flex items-center !gap-x-4 text-sm text-gray-500 mt-2">
                  <div className="flex items-center !gap-x-1">
                    <User className="h-4 w-4" />
                    <span>{page.author.name}</span>
                  </div>
                  <div className="flex items-center !gap-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              <Link href="/" target="_blank">Open in WorkSpace</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        {page.coverImage && (
          <img
            src={page.coverImage}
            alt="Cover"
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}

        {/* <div className="prose prose-lg max-w-none">
          {page.content && page.content.blocks ? (
            page.content.blocks.map((block: any, index: number) => (
              <div key={`${index}-${block}`} className="mb-4">
                {block.type === 'paragraph' && (
                  <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                )}
                {block.type === 'header' && (
                  <div>
                    {block.data.level === 1 && (
                      <h1 dangerouslySetInnerHTML={{ __html: block.data.text }} />
                    )}
                    {block.data.level === 2 && (
                      <h2 dangerouslySetInnerHTML={{ __html: block.data.text }} />
                    )}
                    {block.data.level === 3 && (
                      <h3 dangerouslySetInnerHTML={{ __html: block.data.text }} />
                    )}
                  </div>
                )}
                {block.type === 'list' && (
                  <div>
                    {block.data.style === 'ordered' ? (
                      <ol>
                        {block.data.items.map((item: string, i: number) => (
                          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                      </ol>
                    ) : (
                      <ul>
                        {block.data.items.map((item: string, i: number) => (
                          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {block.type === 'quote' && (
                  <blockquote>
                    <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                    {block.data.caption && (
                      <cite dangerouslySetInnerHTML={{ __html: block.data.caption }} />
                    )}
                  </blockquote>
                )}
                {block.type === 'code' && (
                  <pre><code>{block.data.code}</code></pre>
                )}
                {block.type === 'image' && (
                  <div className="text-center">
                    <img
                      src={block.data.file?.url}
                      alt={block.data.caption || ''}
                      className="max-w-full h-auto rounded-lg"
                    />
                    {block.data.caption && (
                      <p className="text-sm text-gray-500 mt-2">{block.data.caption}</p>
                    )}
                  </div>
                )}
                {block.type === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <tbody>
                        {block.data.content.map((row: string[], rowIndex: number) => (
                          <tr key={rowIndex}>
                            {row.map((cell: string, cellIndex: number) => (
                              <td
                                key={cellIndex}
                                className="border border-gray-300 px-4 py-2"
                                dangerouslySetInnerHTML={{ __html: cell }}
                              />
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No content available</p>
          )}
        </div> */}
        <div className="prose prose-lg max-w-none">
  {page.content && page.content.blocks ? (
    page.content.blocks.map((block: any, index: number) => (
      <div key={`${index}-${block.type}`} className="mb-4">
        {block.type === 'paragraph' && (
          <SafeHTML html={block.data.text} tag="p" />
        )}
        {block.type === 'header' && (
          <>
            {block.data.level === 1 && <SafeHTML html={block.data.text} tag="h1" />}
            {block.data.level === 2 && <SafeHTML html={block.data.text} tag="h2" />}
            {block.data.level === 3 && <SafeHTML html={block.data.text} tag="h3" />}
          </>
        )}
        {block.type === 'list' && (
          <>
            {block.data.style === 'ordered' ? (
              <ol>
                {block.data.items.map((item: string, i: number) => (
                  <li key={`${index}-item-${i}`}>
                    <SafeHTML html={item} tag="span" />
                  </li>
                ))}
              </ol>
            ) : (
              <ul>
                {block.data.items.map((item: string, i: number) => (
                  <li key={`${index}-item-${i}`}>
                    <SafeHTML html={item} tag="span" />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {block.type === 'quote' && (
          <blockquote>
            <SafeHTML html={block.data.text} tag="p" />
            {block.data.caption && (
              <cite><SafeHTML html={block.data.caption} tag="span" /></cite>
            )}
          </blockquote>
        )}
        {block.type === 'code' && (
          <pre><code>{block.data.code}</code></pre>
        )}
        {block.type === 'image' && (
          <div className="text-center">
            <img
              src={block.data.file?.url}
              alt={block.data.caption || ''}
              className="max-w-full h-auto rounded-lg"
            />
            {block.data.caption && (
              <p className="text-sm text-gray-500 mt-2">{block.data.caption}</p>
            )}
          </div>
        )}
        {block.type === 'table' && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <tbody>
                {block.data.content.map((row: string[], rowIndex: number) => (
                  <tr key={`${index}-row-${rowIndex}`}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td
                        key={`${index}-cell-${rowIndex}-${cellIndex}`}
                        className="border border-gray-300 px-4 py-2"
                      >
                        <SafeHTML html={cell} tag="span" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ))
  ) : (
    <p className="text-gray-500">No content available</p>
  )}
</div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          <p>Published with WorkSpace</p>
        </div>
      </div>
    </div>
  )
}