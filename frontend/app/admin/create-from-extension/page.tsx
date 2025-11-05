'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/lib/api'

export default function CreateFromExtensionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [extensions, setExtensions] = useState<any[]>([])
  const [form, setForm] = useState({
    extension_name: 'orange-template',
    title: '',
    description: '',
    folder_name: '',
  })

  useEffect(() => {
    const init = async () => {
      try {
        // Ensure admin
        const user = await apiService.getCurrentUser()
        if (user.role !== 'admin') {
          router.push('/')
          return
        }
        const exts = await apiService.getExtensions()
        setExtensions(exts)
        if (!exts.find((e: any) => e.path === 'orange-template') && exts[0]) {
          setForm((f) => ({ ...f, extension_name: exts[0].path }))
        }
      } catch {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.folder_name) return
    setIsSubmitting(true)
    try {
      const res = await apiService.createProjectFromExtension(form.extension_name, {
        title: form.title,
        description: form.description,
        folder_name: form.folder_name,
      })
      alert(`Demo created successfully! ID: ${res.demo_id}`)
      router.push('/admin')
    } catch (err: any) {
      alert('Failed to create demo: ' + (err?.response?.data?.detail || err?.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
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

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create From Extension</h1>
          <p className="text-gray-600 mt-2">Select an extension template (default: orange-template) and create a new demo project.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Extension</label>
            <select
              value={form.extension_name}
              onChange={(e) => setForm({ ...form, extension_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {extensions.map((ext) => (
                <option key={ext.path} value={ext.path}>
                  {ext.icon} {ext.name}
                </option>
              ))}
            </select>
            {extensions.find((e) => e.path === form.extension_name)?.description && (
              <p className="text-xs text-gray-500 mt-1">
                {extensions.find((e) => e.path === form.extension_name)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
            <input
              type="text"
              value={form.folder_name}
              onChange={(e) => setForm({ ...form, folder_name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lowercase, hyphen-separated (e.g., my-new-demo)</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Demo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


