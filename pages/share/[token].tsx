'use client'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, MessageCircle, CreditCard as Edit3 } from 'lucide-react'
import { toast } from 'sonner'
import SafeHTML from '@/components/SafeHTML'

interface SharedPage {
  id: string
  title: string
  content: any
  emoji?: string
  coverImage?: string
  author: {
    name: string
    image?: string
  }
  workspace: {
    name: string
  }
  share: {
    type: string
    expiresAt?: string
    password?: string
  }
}

export default function SharedPage() {
  const router = useRouter()
  const { token } = router.query
  const [page, setPage] = useState<SharedPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      fetchSharedPage()
    }
  }, [token])

  const fetchSharedPage = async (passwordAttempt?: string) => {
    try {
      const response = await fetch(`/api/share/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordAttempt }),
      })

      if (response.status === 401) {
        setNeedsPassword(true)
        setError('Password required')
        return
      }

      if (response.status === 403) {
        setError('Invalid password')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setPage(data)
        setNeedsPassword(false)
        setError('')
      } else {
        setError('Page not found or expired')
      }
    } catch (error) {
      setError('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim()) {
      fetchSharedPage(password)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error && !needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Lock className="mr-2 h-5 w-5" />
              Password Required
            </CardTitle>
            <CardDescription className="text-center">
              This page is password protected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                Access Page
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Page not found</div>
      </div>
    )
  }

  const getShareTypeIcon = (type: string) => {
    switch (type) {
      case 'VIEW':
        return <Eye className="h-4 w-4" />
      case 'COMMENT':
        return <MessageCircle className="h-4 w-4" />
      case 'EDIT':
        return <Edit3 className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getShareTypeText = (type: string) => {
    switch (type) {
      case 'VIEW':
        return 'View only'
      case 'COMMENT':
        return 'Can comment'
      case 'EDIT':
        return 'Can edit'
      default:
        return 'View only'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center !gap-x-3">
            <div className="text-2xl">{page.emoji || '📄'}</div>
            <div>
              <h1 className="text-lg font-semibold">{page.title}</h1>
              <p className="text-sm text-gray-500">
                Shared from {page.workspace.name} by {page.author.name}
              </p>
            </div>
          </div>
          <div className="flex items-center !gap-x-2 text-sm text-gray-500">
            {getShareTypeIcon(page.share.type)}
            <span>{getShareTypeText(page.share.type)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {page.coverImage && (
            <img
              src={page.coverImage}
              alt="Cover"
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}

          <div className="prose prose-lg max-w-none">
            {/* Render the page content here */}
            {/* {page.content && page.content.blocks ? (
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
                </div>
              ))
            ) : (
              <p className="text-gray-500">No content available</p>
            )} */}
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
    </div>
  ))
) : (
  <p className="text-gray-500">No content available</p>
)}
          </div>
        </div>
      </div>
    </div>
  )
}