'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, Demonstration } from '@/lib/api'
import { Edit, Trash2, Eye, EyeOff, Plus } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [demos, setDemos] = useState<Demonstration[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingDemo, setEditingDemo] = useState<Demonstration | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    folder_name: '',
    url: '',
    is_visible: true,
  })

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
                    onClick={() => handleEdit(demo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(demo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
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
      </div>
    </div>
  )
}

