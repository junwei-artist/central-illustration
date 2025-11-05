'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiService } from '@/lib/api'
import { Save, Upload, ArrowLeft, Play, Square } from 'lucide-react'

// Visual editor removed; markdown-only editor

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const demoId = parseInt(String(params?.id || '0'), 10)

  const [loading, setLoading] = useState(true)
  const [demoTitle, setDemoTitle] = useState<string>('')
  const [pages, setPages] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [currentContentType, setCurrentContentType] = useState<'title' | 'points' | 'detail'>('title')
  // Markdown-only (visual mode removed)
  const [content, setContent] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  // Left panel is always visible (no floating panel)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const user = await apiService.getCurrentUser()
        if (user?.role !== 'admin') {
          router.push('/login')
          return
        }
        const ext = await apiService.getProjectExtension(demoId)
        if (ext?.extension_name?.toLowerCase() !== 'orange-template') {
          alert(`Editor for extension "${ext?.extension_name || 'unknown'}" not implemented yet.`)
          router.push('/admin')
          return
        }
        const pagesData = await apiService.getProjectPages(demoId)
        setPages(pagesData.pages || [])
        // Visual layout removed
        // Load preview status/url if running
        try {
          const status = await apiService.getDemoStatus(demoId)
          setIsRunning(status?.status === 'running')
          setPreviewUrl(status?.url || null)
        } catch {}
        // Fetch title as default content
        await loadContent(0, 'title')
        // Fetch demo data for title (best effort via getDemo if exists)
        try {
          const demo = await apiService.getDemo(demoId)
          setDemoTitle(demo?.title || '')
        } catch {}
      } finally {
        setLoading(false)
      }
    }
    if (demoId) init()
  }, [demoId, router])

  // Reload content when page changes
  useEffect(() => {
    if (!loading && pages.length > 0) {
      loadContent(currentPage, currentContentType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // Reload content when content type changes
  useEffect(() => {
    if (!loading && pages.length > 0) {
      loadContent(currentPage, currentContentType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentContentType])

  // Don't send messages to iframe when page changes - let user navigate freely in hero

  // Listen for slide changes from iframe (when user clicks navigation in hero)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our preview iframe
      if (event.data?.type === 'SLIDE_CHANGED' && typeof event.data.slide === 'number') {
        const newSlide = event.data.slide
        // Sync editor's current page to match the slide user clicked
        if (newSlide !== currentPage && pages[newSlide]) {
          setCurrentPage(newSlide)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [currentPage, pages])

  const getPageIndex = (index: number) => pages[index]?.page_index || index + 1

  const loadContent = async (index: number, type: 'title' | 'points' | 'detail') => {
    try {
      const res = await apiService.getPageContent(demoId, getPageIndex(index), type)
      setContent(res?.content || '')
      // Don't change hero preview - let user navigate freely
    } catch {
      setContent('')
    }
  }

  const saveContent = async () => {
    await apiService.updatePageContent(demoId, getPageIndex(currentPage), currentContentType, content)
    alert('Content saved')
    // Notify live preview to reload content for this page
    iframeRef.current?.contentWindow?.postMessage({ type: 'CONTENT_UPDATED', page: currentPage }, '*')
  }

  // Visual layout removed

  const publish = async () => {
    await apiService.publishChanges(demoId)
    alert('Published')
  }

  const startPreview = async () => {
    await apiService.startDemo(demoId)
    const status = await apiService.getDemoStatus(demoId)
    setIsRunning(status?.status === 'running')
    setPreviewUrl(status?.url || null)
  }

  const stopPreview = async () => {
    await apiService.stopDemo(demoId)
    const status = await apiService.getDemoStatus(demoId)
    setIsRunning(status?.status === 'running')
    setPreviewUrl(status?.url || null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 text-sm">
          <button className="btn-secondary inline-flex items-center px-2 py-1" onClick={() => router.push('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <h1 className="text-sm font-semibold text-gray-900">Editor: {demoTitle || `Demo #${demoId}`}</h1>
          <div className="flex-1" />
           {pages.length > 0 && (
             <select
               value={currentPage}
               onChange={async (e) => {
                 const idx = parseInt(e.target.value, 10)
                 setCurrentPage(idx)
                 await loadContent(idx, currentContentType)
                 // Don't change hero preview - let user navigate freely
               }}
               className="px-2 py-1 border rounded text-sm"
             >
               {(pages||[]).map((p, i) => (
                 <option key={i} value={i}>Page {p.page_index}</option>
               ))}
             </select>
           )}
          {isRunning ? (
            <button className="btn-secondary ml-2 px-2 py-1" onClick={stopPreview}>
              <Square className="w-4 h-4 mr-1 inline" /> Stop
            </button>
          ) : (
            <button className="btn-primary ml-2 px-2 py-1" onClick={startPreview}>
              <Play className="w-4 h-4 mr-1 inline" /> Start
            </button>
          )}
          <button className="btn-secondary ml-2 px-2 py-1" onClick={publish}>
            <Upload className="w-4 h-4 mr-1 inline" /> Publish
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left-side panel */}
          <aside className="w-64 shrink-0 bg-white border rounded-lg p-3 text-sm h-fit">
            <div className="mb-3">
              <div className="font-semibold text-gray-700 mb-1">Page</div>
              {pages.length > 0 && (
                <select
                  value={currentPage}
                  onChange={async (e) => {
                    const idx = parseInt(e.target.value, 10)
                    setCurrentPage(idx)
                    await loadContent(idx, currentContentType)
                  }}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  {(pages||[]).map((p, i) => (
                    <option key={i} value={i}>Page {p.page_index}</option>
                  ))}
                </select>
              )}
            </div>
            {/* Mode removed (markdown-only) */}
            <div className="mb-3">
              <div className="font-semibold text-gray-700 mb-1">Content Type</div>
              {(['title','points','detail'] as const).map((t) => (
                <button key={t} className={`w-full text-left px-2 py-1 rounded mb-1 ${currentContentType===t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={async () => { setCurrentContentType(t); await loadContent(currentPage, t) }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <button onClick={saveContent} className="btn-primary w-full inline-flex items-center px-2 py-1"><Save className="w-4 h-4 mr-1"/>Save</button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="font-semibold text-gray-700 mb-1">Pages</div>
              <button
                className="btn-secondary w-full px-2 py-1"
                onClick={async () => {
                  // Add based on style 1 (page-1)
                  const res = await apiService.addPage(demoId, 0)
                  const pagesData = await apiService.getProjectPages(demoId)
                  setPages(pagesData.pages || [])
                  // Select the last page
                  const next = (pagesData.pages?.length || 1) - 1
                  setCurrentPage(next)
                  await loadContent(next, currentContentType)
                  // Notify preview to refresh
                  iframeRef.current?.contentWindow?.postMessage({ type: 'CONTENT_UPDATED', page: res.page_index }, '*')
                }}
              >
                + Add Page (Style 1)
              </button>
              <button
                className="btn-secondary w-full px-2 py-1"
                onClick={async () => {
                  // Add based on style 2 (page-2)
                  const res = await apiService.addPage(demoId, 1)
                  const pagesData = await apiService.getProjectPages(demoId)
                  setPages(pagesData.pages || [])
                  const next = (pagesData.pages?.length || 1) - 1
                  setCurrentPage(next)
                  await loadContent(next, currentContentType)
                  iframeRef.current?.contentWindow?.postMessage({ type: 'CONTENT_UPDATED', page: res.page_index }, '*')
                }}
              >
                + Add Page (Style 2)
              </button>
              <button
                className="btn-secondary w-full px-2 py-1 text-red-700 border-red-300"
                onClick={async () => {
                  if (!confirm(`Delete Page ${getPageIndex(currentPage)}? This cannot be undone.`)) return
                  const pageNum = getPageIndex(currentPage)
                  await apiService.deletePage(demoId, pageNum)
                  // Reload pages
                  const pagesData = await apiService.getProjectPages(demoId)
                  setPages(pagesData.pages || [])
                  const newLen = pagesData.pages?.length || 0
                  const newIndex = Math.max(0, Math.min(currentPage, newLen - 1))
                  setCurrentPage(newIndex)
                  if (newLen > 0) await loadContent(newIndex, currentContentType)
                  iframeRef.current?.contentWindow?.postMessage({ type: 'CONTENT_UPDATED', page: newIndex + 1 }, '*')
                }}
              >
                Delete Current Page
              </button>
            </div>
          </aside>

          {/* Stage with live preview and overlay */}
          <div className="flex-1">
            <div className="relative rounded-lg overflow-hidden border shadow-sm" style={{ minHeight: 600 }}>
          {previewUrl ? (
                 <iframe 
                   ref={iframeRef}
                   key={`preview-${previewUrl}`}
                   src={previewUrl || ''} 
                   className="w-full h-[70vh]" 
                   style={{ pointerEvents: 'auto' }} 
                   title="Hero Preview"
                 />
          ) : (
            <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100 text-gray-500">
              <div className="text-center">
                <p>No live preview. Start the preview to see the actual hero.</p>
                <div className="mt-3">
                  <button className="btn-primary inline-flex items-center" onClick={startPreview}><Play className="w-4 h-4 mr-2"/>Start Preview</button>
                </div>
              </div>
            </div>
          )}
            </div>
            <div className="mt-4 bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-sm">Markdown - Page {getPageIndex(currentPage)} ({currentContentType})</h2>
                <button onClick={saveContent} className="btn-primary inline-flex items-center px-2 py-1 text-sm"><Save className="w-4 h-4 mr-1"/>Save</button>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-[36vh] border rounded p-2 font-mono text-sm focus:outline-none"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VisualHeroEditor({
  items,
  onChange,
  onUpload,
}: {
  items: VisualItem[]
  onChange: (items: VisualItem[]) => void
  onUpload: (file: File) => Promise<string>
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [resizingId, setResizingId] = useState<string | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId && !resizingId) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    onChange(items.map((it) => {
      if (it.id === draggingId) return { ...it, x: localX - offset.x, y: localY - offset.y }
      if (it.id === resizingId) return { ...it, width: Math.max(40, localX - it.x), height: Math.max(30, localY - it.y) }
      return it
    }))
  }
  const handleMouseUp = () => { setDraggingId(null); setResizingId(null) }

  const addText = () => {
    const id = `text_${Date.now()}`
    onChange([ ...items, { id, type: 'text', content: 'Edit me', x: 80, y: 80, width: 200, height: 80, style: { fontSize: 24, color: '#ffffff' } } ])
  }
  const onFile = async (f?: File) => {
    if (!f) return
    const path = await onUpload(f)
    const id = `img_${Date.now()}`
    onChange([ ...items, { id, type: 'image', content: path, x: 120, y: 120, width: 240, height: 160 } ])
  }
  const addSvg = () => {
    const id = `svg_${Date.now()}`
    onChange([ ...items, { id, type: 'svg', content: '<svg viewBox="0 0 200 100"><circle cx="50" cy="50" r="30" fill="orange"/></svg>', x: 160, y: 160, width: 200, height: 100 } ])
  }
  const removeItem = (id: string) => onChange(items.filter(i => i.id !== id))

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-3">
        <button className="btn-secondary" onClick={addText}>Add Text</button>
        <label className="btn-secondary cursor-pointer">
          Upload Image
          <input type="file" className="hidden" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || undefined)} />
        </label>
        <button className="btn-secondary" onClick={addSvg}>Add SVG</button>
      </div>
      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg border border-orange-200"
        style={{ height: 600 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {items.map((it) => (
          <div key={it.id} className="absolute group" style={{ left: it.x, top: it.y, width: it.width, height: it.height }}>
            <div
              className="absolute inset-0 cursor-move"
              onMouseDown={(e) => {
                const rect = (e.currentTarget.parentElement as HTMLDivElement).getBoundingClientRect()
                setDraggingId(it.id)
                setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
              }}
            />
            <div className="w-full h-full bg-white/5 backdrop-blur-sm rounded-md border border-white/10 overflow-hidden relative">
              {it.type === 'text' && (
                <textarea
                  value={it.content || ''}
                  onChange={(e) => onChange(items.map(obj => obj.id === it.id ? { ...obj, content: e.target.value } : obj))}
                  className="w-full h-full bg-transparent text-white p-2 resize-none focus:outline-none"
                  style={{ fontSize: it.style?.fontSize || 20 }}
                />
              )}
              {it.type === 'image' && it.content && (
                <img src={it.content} alt="" className="w-full h-full object-contain pointer-events-none select-none" />
              )}
              {it.type === 'svg' && it.content && (
                <div className="w-full h-full pointer-events-none select-none" dangerouslySetInnerHTML={{ __html: it.content }} />
              )}
            </div>
            <div className="absolute right-0 bottom-0 w-4 h-4 bg-white rounded-sm border border-gray-300 cursor-se-resize" onMouseDown={() => setResizingId(it.id)} />
            <div className="absolute -top-8 left-0 hidden group-hover:flex gap-2">
              <button className="px-2 py-1 text-xs bg-white/90 rounded" onClick={() => removeItem(it.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


