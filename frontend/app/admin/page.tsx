'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, Demonstration } from '@/lib/api'
import { Edit, Trash2, Eye, EyeOff, Plus, Save, Upload, X } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [demos, setDemos] = useState<Demonstration[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingDemo, setEditingDemo] = useState<Demonstration | null>(null)
  const [selectedExtension, setSelectedExtension] = useState<string>('orange-template')
  const [extensions, setExtensions] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    folder_name: '',
    url: '',
    is_visible: true,
  })
  const [templateFormData, setTemplateFormData] = useState({
    title: '',
    description: '',
    folder_name: '',
    extension_name: 'orange-template',
    is_visible: true,
  })
  
  const [editorState, setEditorState] = useState({
    demoId: 0,
    pages: [] as any[],
    currentPage: 0,
    currentContentType: 'title' as 'title' | 'points' | 'detail',
    content: '',
    isEditing: false,
    mode: 'markdown' as 'markdown' | 'visual',
    layoutItems: [] as Array<any>,
  })

  useEffect(() => {
    loadExtensions()
  }, [])

  const loadExtensions = async () => {
    try {
      const data = await apiService.getExtensions()
      setExtensions(data)
    } catch (error) {
      console.error('Failed to load extensions:', error)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await apiService.getCurrentUser()
      if (user.role === 'admin') {
        setIsAuthenticated(true)
        loadDemos()
      } else {
        router.push('/')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDemos = async () => {
    try {
      const data = await apiService.getDemos(false)
      setDemos(data)
    } catch (error) {
      console.error('Failed to load demos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDemo) {
        await apiService.updateDemo(editingDemo.id, formData)
      } else {
        await apiService.createDemo(formData)
      }
      setShowModal(false)
      setEditingDemo(null)
      setFormData({ title: '', description: '', folder_name: '', url: '', is_visible: true })
      loadDemos()
    } catch (error) {
      console.error('Failed to save demo:', error)
      alert('Failed to save demo')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this demo?')) {
      try {
        await apiService.deleteDemo(id)
        loadDemos()
      } catch (error) {
        console.error('Failed to delete demo:', error)
      }
    }
  }
  
  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await apiService.createProjectFromExtension(
        templateFormData.extension_name,
        {
          title: templateFormData.title,
          description: templateFormData.description,
          folder_name: templateFormData.folder_name
        }
      )
      setShowTemplateModal(false)
      setTemplateFormData({ title: '', description: '', folder_name: '', extension_name: 'orange-template', is_visible: true })
      alert(`Demo created successfully! ID: ${result.demo_id}`)
      loadDemos()
    } catch (error: any) {
      console.error('Failed to create demo from extension:', error)
      alert('Failed to create demo from extension: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleEdit = (demo: Demonstration) => {
    setEditingDemo(demo)
    setFormData({
      title: demo.title,
      description: demo.description || '',
      folder_name: demo.folder_name,
      url: demo.url || '',
      is_visible: demo.is_visible,
    })
    setShowModal(true)
  }

  const handleOpenEditor = async (demo: Demonstration) => {
    try {
      // Detect which extension this project was created from
      const extInfo = await apiService.getProjectExtension(demo.id)
      const extName = (extInfo?.extension_name || '').toLowerCase()

      if (extName === 'orange-template') {
        const pagesData = await apiService.getProjectPages(demo.id)
        setEditorState({
          demoId: demo.id,
          pages: pagesData.pages || [],
          currentPage: 0,
          currentContentType: 'title',
          content: '',
          isEditing: true,
          mode: 'markdown',
          layoutItems: [],
        })
        setEditingDemo(demo)
        setShowEditor(true)
        loadCurrentContent()
      } else if (!extName) {
        alert('This project has no registered extension. Content editor is unavailable.')
      } else {
        alert(`Editor for extension "${extName}" is not implemented yet.`)
      }
    } catch (error) {
      console.error('Failed to open editor:', error)
      alert('Failed to open editor')
    }
  }

  const loadCurrentContent = async () => {
    if (!editorState.pages.length) return
    
    try {
      const pageIndex = editorState.pages[editorState.currentPage]?.page_index || editorState.currentPage + 1
      const data = await apiService.getPageContent(
        editorState.demoId,
        pageIndex,
        editorState.currentContentType
      )
      setEditorState(prev => ({ ...prev, content: data.content || '' }))
    } catch (error) {
      console.error('Failed to load content:', error)
      setEditorState(prev => ({ ...prev, content: '' }))
    }
  }

  const loadLayout = async () => {
    if (!editorState.pages.length) return
    try {
      const pageIndex = editorState.pages[editorState.currentPage]?.page_index || editorState.currentPage + 1
      const data = await apiService.getLayout(editorState.demoId, pageIndex)
      setEditorState(prev => ({ ...prev, layoutItems: data.items || [] }))
    } catch (error) {
      console.error('Failed to load layout:', error)
      setEditorState(prev => ({ ...prev, layoutItems: [] }))
    }
  }

  const handleSaveContent = async () => {
    try {
      const pageIndex = editorState.pages[editorState.currentPage]?.page_index || editorState.currentPage + 1
      await apiService.updatePageContent(
        editorState.demoId,
        pageIndex,
        editorState.currentContentType,
        editorState.content
      )
      alert('Content saved successfully!')
    } catch (error) {
      console.error('Failed to save content:', error)
      alert('Failed to save content')
    }
  }

  const handleAddPage = async (basePageIndex: number) => {
    if (!confirm(`Add a new page based on ${basePageIndex === 0 ? 'page-1' : 'page-2'} style?`)) {
      return
    }
    
    try {
      const result = await apiService.addPage(editorState.demoId, basePageIndex)
      // Reload pages
      const pagesData = await apiService.getProjectPages(editorState.demoId)
      setEditorState(prev => ({
        ...prev,
        pages: pagesData.pages || [],
        currentPage: pagesData.pages.length - 1
      }))
      loadCurrentContent()
      alert(`Page ${result.page_index} added successfully!`)
    } catch (error) {
      console.error('Failed to add page:', error)
      alert('Failed to add page')
    }
  }

  const handlePublishChanges = async () => {
    if (!confirm('Publish changes? This will update the live project.')) {
      return
    }
    
    try {
      await apiService.publishChanges(editorState.demoId)
      alert('Changes published successfully!')
    } catch (error) {
      console.error('Failed to publish changes:', error)
      alert('Failed to publish changes')
    }
  }

  useEffect(() => {
    if (showEditor && editorState.pages.length > 0 && editorState.isEditing) {
      loadCurrentContent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState.currentPage, editorState.currentContentType, showEditor])

  const currentPage = editorState.pages[editorState.currentPage]

  // Helper to reload content when editor state changes
  const handleContentTypeChange = (type: 'title' | 'points' | 'detail') => {
    setEditorState(prev => ({ ...prev, currentContentType: type, content: '' }))
  }

  const handlePageChange = (index: number) => {
    setEditorState(prev => ({ ...prev, currentPage: index, content: '' }))
  }

  // Reload content when page or content type changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showEditor && editorState.pages.length > 0) {
        if (editorState.mode === 'markdown') loadCurrentContent()
        else loadLayout()
      }
    }, 100)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState.currentPage, editorState.currentContentType, editorState.mode])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingDemo(null)
                setFormData({ title: '', description: '', folder_name: '', url: '', is_visible: true })
                setShowModal(true)
              }}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Demo
            </button>
            <button
              onClick={() => router.push('/admin/create-from-extension')}
              className="btn-secondary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create from Extension
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {demos.map((demo) => (
            <div key={demo.id} className="card p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{demo.title}</h3>
                  <p className="text-gray-600 mb-2">{demo.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Folder: {demo.folder_name}</span>
                    {demo.url && <span>URL: {demo.url}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/editor/${demo.id}`)}
                    className="btn-secondary px-3 py-2"
                    title="Edit Content"
                  >
                    Edit Content
                  </button>
                  <button
                    onClick={() => handleEdit(demo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Demo"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(demo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete Demo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6">
                {editingDemo ? 'Edit Demo' : 'Add New Demo'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={formData.folder_name}
                    onChange={(e) => setFormData({ ...formData, folder_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                    disabled={!!editingDemo}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Visible to public</label>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    {editingDemo ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingDemo(null)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6">Create Demo from Template</h2>
              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extension Template
                  </label>
                  <select
                    value={templateFormData.extension_name}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, extension_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {extensions.map((ext) => (
                      <option key={ext.path} value={ext.path}>
                        {ext.icon} {ext.name}
                      </option>
                    ))}
                  </select>
                  {extensions.find(e => e.path === templateFormData.extension_name)?.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {extensions.find(e => e.path === templateFormData.extension_name)?.description}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={templateFormData.title}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateFormData.description}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={templateFormData.folder_name}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, folder_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Lowercase, no spaces (e.g., my-demo)</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={templateFormData.is_visible}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, is_visible: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Visible to public</label>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    Create Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateModal(false)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {showEditor && editingDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Content Editor</h2>
                  <p className="text-sm text-gray-500">{editingDemo.title} - Page Content</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePublishChanges}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Publish
                  </button>
                  <button
                    onClick={() => {
                      setShowEditor(false)
                      setEditingDemo(null)
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Page and Content Type Selection */}
                <div className="w-64 border-r border-gray-200 p-4 bg-gray-50">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Content Type</h3>
                    <div className="space-y-2">
                      {(['title', 'points', 'detail'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleContentTypeChange(type)}
                          className={`w-full text-left px-3 py-2 rounded transition ${
                            editorState.currentContentType === type
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Pages</h3>
                    <div className="space-y-2">
                      {editorState.pages.map((page, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`w-full text-left px-3 py-2 rounded transition ${
                            editorState.currentPage === index
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Page {page.page_index}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <button
                        onClick={() => handleAddPage(0)}
                        className="w-full text-left px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition mb-2"
                      >
                        + Add Page (Style 1)
                      </button>
                      <button
                        onClick={() => handleAddPage(1)}
                        className="w-full text-left px-3 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
                      >
                        + Add Page (Style 2)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col p-6">
                  {/* Mode Toggle */}
                  <div className="mb-4 flex items-center gap-2">
                    <button
                      className={`px-3 py-2 rounded ${editorState.mode==='markdown' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setEditorState(prev => ({ ...prev, mode: 'markdown' }))}
                    >
                      Markdown Editor
                    </button>
                    <button
                      className={`px-3 py-2 rounded ${editorState.mode==='visual' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setEditorState(prev => ({ ...prev, mode: 'visual' }))}
                    >
                      Visual Editor (Hero)
                    </button>
                  </div>
                  {editorState.mode === 'markdown' && (
                  <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {editorState.currentContentType.charAt(0).toUpperCase() + editorState.currentContentType.slice(1)} Content
                      {currentPage && ` - Page ${currentPage.page_index}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editorState.currentContentType === 'title' && 'Edit the title and subtitle (supports markdown)'}
                      {editorState.currentContentType === 'points' && 'Edit the main content and bullet points (supports markdown)'}
                      {editorState.currentContentType === 'detail' && 'Edit the detailed content shown in the modal (supports markdown)'}
                    </p>
                  </div>
                  <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                    <textarea
                      value={editorState.content}
                      onChange={(e) => setEditorState(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full h-full p-4 focus:outline-none resize-none font-mono text-sm"
                      placeholder="Enter your content here... (Markdown supported)"
                    />
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={loadCurrentContent}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Reload
                    </button>
                    <button
                      onClick={handleSaveContent}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Save Content
                    </button>
                  </div>
                  </>
                  )}

                  {editorState.mode === 'visual' && (
                    <VisualHeroEditor
                      items={editorState.layoutItems}
                      onChange={(items) => setEditorState(prev => ({ ...prev, layoutItems: items }))}
                      onUpload={async (file) => {
                        const res = await apiService.uploadAsset(editorState.demoId, file)
                        return res.path
                      }}
                      onSave={async () => {
                        const pageIndex = editorState.pages[editorState.currentPage]?.page_index || editorState.currentPage + 1
                        await apiService.saveLayout(editorState.demoId, pageIndex, editorState.layoutItems)
                        alert('Layout saved')
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

type VisualItem = {
  id: string
  type: 'text' | 'image' | 'svg'
  content?: string
  x: number
  y: number
  width: number
  height: number
  style?: Record<string, any>
}

function VisualHeroEditor({
  items,
  onChange,
  onUpload,
  onSave,
}: {
  items: VisualItem[]
  onChange: (items: VisualItem[]) => void
  onUpload: (file: File) => Promise<string>
  onSave: () => Promise<void>
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
      if (it.id === draggingId) {
        return { ...it, x: localX - offset.x, y: localY - offset.y }
      }
      if (it.id === resizingId) {
        const newW = Math.max(40, localX - it.x)
        const newH = Math.max(30, localY - it.y)
        return { ...it, width: newW, height: newH }
      }
      return it
    }))
  }

  const handleMouseUp = () => {
    setDraggingId(null)
    setResizingId(null)
  }

  const addText = () => {
    const id = `text_${Date.now()}`
    onChange([
      ...items,
      { id, type: 'text', content: 'Edit me', x: 80, y: 80, width: 200, height: 80, style: { fontSize: 24, color: '#ffffff' } },
    ])
  }

  const addImage = async (file?: File) => {
    try {
      let path = ''
      if (file) path = await onUpload(file)
      const id = `img_${Date.now()}`
      onChange([
        ...items,
        { id, type: 'image', content: path || '/uploads/placeholder.png', x: 120, y: 120, width: 240, height: 160 },
      ])
    } catch (e) {
      alert('Upload failed')
    }
  }

  const addSvg = () => {
    const id = `svg_${Date.now()}`
    onChange([
      ...items,
      { id, type: 'svg', content: '<svg viewBox="0 0 200 100"><circle cx="50" cy="50" r="30" fill="orange"/></svg>', x: 160, y: 160, width: 200, height: 100 },
    ])
  }

  const removeItem = (id: string) => {
    onChange(items.filter((it) => it.id !== id))
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="mb-3 flex items-center gap-3">
        <button className="btn-secondary" onClick={addText}>Add Text</button>
        <label className="btn-secondary cursor-pointer">
          Upload Image
          <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])} />
        </label>
        <button className="btn-secondary" onClick={addSvg}>Add SVG</button>
        <div className="flex-1" />
        <button className="btn-primary" onClick={onSave}>Save Layout</button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg border border-orange-200"
        style={{ height: 520 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {items.map((it) => (
          <div
            key={it.id}
            className="absolute group"
            style={{ left: it.x, top: it.y, width: it.width, height: it.height }}
          >
            {/* Drag handle overlay */}
            <div
              className="absolute inset-0 cursor-move"
              onMouseDown={(e) => {
                const rect = (e.currentTarget.parentElement as HTMLDivElement).getBoundingClientRect()
                setDraggingId(it.id)
                setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
              }}
            />

            {/* Content */}
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

            {/* Resize handle */}
            <div
              className="absolute right-0 bottom-0 w-4 h-4 bg-white rounded-sm border border-gray-300 cursor-se-resize"
              onMouseDown={() => setResizingId(it.id)}
            />

            {/* Item controls */}
            <div className="absolute -top-8 left-0 hidden group-hover:flex gap-2">
              <button className="px-2 py-1 text-xs bg-white/90 rounded" onClick={() => removeItem(it.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

