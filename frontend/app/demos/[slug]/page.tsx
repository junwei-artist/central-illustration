'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiService, Demonstration } from '@/lib/api'
import CommentBox from '@/components/CommentBox'
import { ExternalLink, Play, Square } from 'lucide-react'

export default function DemoDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [demo, setDemo] = useState<Demonstration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [demoStatus, setDemoStatus] = useState<{status: string, port: number | null}>({status: 'not_running', port: null})
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadDemo()
    checkAdminStatus()
  }, [slug])

  useEffect(() => {
    if (demo) {
      checkDemoStatus()
      // Poll status every 5 seconds
      const interval = setInterval(checkDemoStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [demo])

  const loadDemo = async () => {
    try {
      const demos = await apiService.getDemos(false)
      const foundDemo = demos.find((d: Demonstration) => d.folder_name === slug)
      setDemo(foundDemo || null)
    } catch (error) {
      console.error('Failed to load demo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkAdminStatus = async () => {
    try {
      const user = await apiService.getCurrentUser()
      setIsAdmin(user.role === 'admin')
    } catch {
      setIsAdmin(false)
    }
  }

  const checkDemoStatus = async () => {
    if (!demo) return
    try {
      const status = await apiService.getDemoStatus(demo.id)
      setDemoStatus(status)
    } catch (error) {
      console.error('Failed to check demo status:', error)
    }
  }

  const handleStartDemo = async () => {
    if (!demo) return
    setIsLoadingStatus(true)
    try {
      await apiService.startDemo(demo.id)
      checkDemoStatus()
    } catch (error) {
      console.error('Failed to start demo:', error)
      alert('Failed to start demo')
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleStopDemo = async () => {
    if (!demo) return
    setIsLoadingStatus(true)
    try {
      await apiService.stopDemo(demo.id)
      checkDemoStatus()
    } catch (error) {
      console.error('Failed to stop demo:', error)
      alert('Failed to stop demo')
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleLaunchDemo = async () => {
    if (!demo) return
    try {
      const redirectInfo = await apiService.getDemoRedirectUrl(demo.id)
      if (redirectInfo.status === 'running' && redirectInfo.url) {
        window.open(redirectInfo.url, '_blank')
      } else {
        alert('Demo is not running. Please start it first.')
      }
    } catch (error) {
      console.error('Failed to get redirect URL:', error)
      alert('Failed to launch demo')
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

  if (!demo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Demo Not Found</h1>
          <p className="text-gray-600">The demonstration you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const isRunning = demoStatus.status === 'running'

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{demo.title}</h1>
              {demo.description && (
                <p className="text-xl text-gray-600 mb-6">{demo.description}</p>
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                {!isRunning ? (
                  <button
                    onClick={handleStartDemo}
                    disabled={isLoadingStatus}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isLoadingStatus ? 'Starting...' : 'Start Demo'}
                  </button>
                ) : (
                  <button
                    onClick={handleStopDemo}
                    disabled={isLoadingStatus}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    {isLoadingStatus ? 'Stopping...' : 'Stop Demo'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            {isRunning ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                ● Running on port {demoStatus.port}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                ● Not Running
              </span>
            )}
          </div>
        </div>

        {/* Demo Content */}
        <div className="card p-8 mb-8">
          <div className="min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8">
            <svg className="w-32 h-32 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mb-6 text-center">
              {isRunning 
                ? 'Demo is running. Click the button below to launch the demo in a new tab.'
                : 'This demo needs to be started before you can view it. If you are an admin, use the Start Demo button above.'}
            </p>
            {isRunning && (
              <button
                onClick={handleLaunchDemo}
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Launch Demo Project
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <CommentBox demoId={demo.id} />
      </div>
    </div>
  )
}
