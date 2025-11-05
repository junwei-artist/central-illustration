'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Circle, Download, ExternalLink, Eye, Play, Square } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiService } from '@/lib/api'

interface DemoCardProps {
  id: number
  title: string
  description: string | null
  folderName: string
  status?: string
  url?: string
  index?: number
}

// Color gradients array
const CARD_GRADIENTS = [
  'from-teal-50 to-cyan-50',
  'from-purple-50 to-pink-50',
  'from-blue-50 to-indigo-50',
  'from-emerald-50 to-teal-50',
  'from-amber-50 to-orange-50',
  'from-violet-50 to-purple-50',
  'from-rose-50 to-pink-50',
  'from-sky-50 to-blue-50',
]

const CARD_ICON_COLORS = [
  'text-teal-400',
  'text-purple-400',
  'text-blue-400',
  'text-emerald-400',
  'text-amber-400',
  'text-violet-400',
  'text-rose-400',
  'text-sky-400',
]

export default function DemoCard({ id, title, description, folderName, status, url, index = 0 }: DemoCardProps) {
  const isRunning = status === 'running'
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoadingControl, setIsLoadingControl] = useState(false)
  
  useEffect(() => {
    checkAdminStatus()
  }, [])
  
  const checkAdminStatus = async () => {
    try {
      const user = await apiService.getCurrentUser()
      setIsAdmin(user.role === 'admin')
    } catch {
      setIsAdmin(false)
    }
  }
  
  const handleStartDemo = async () => {
    setIsLoadingControl(true)
    try {
      await apiService.startDemo(id)
      // Refresh status
      window.location.reload()
    } catch (error) {
      console.error('Failed to start demo:', error)
      alert('Failed to start demo')
    } finally {
      setIsLoadingControl(false)
    }
  }
  
  const handleStopDemo = async () => {
    setIsLoadingControl(true)
    try {
      await apiService.stopDemo(id)
      // Refresh status
      window.location.reload()
    } catch (error) {
      console.error('Failed to stop demo:', error)
      alert('Failed to stop demo')
    } finally {
      setIsLoadingControl(false)
    }
  }
  
  const handleExport = async (format: 'ppt_169' | 'ppt_43' | 'pdf_169' | 'pdf_43') => {
    setIsExporting(true)
    setShowExportMenu(false)
    try {
      const blob = await apiService.exportDemo(id, format)
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${folderName}_export_${format}.${format.includes('pdf') ? 'pdf' : 'pptx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export. Please ensure the demo is running.')
    } finally {
      setIsExporting(false)
    }
  }
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -5 }}
      >
        <div className={`h-full rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden ${
          index % 2 === 0 
            ? 'bg-gradient-to-br from-teal-50/50 to-cyan-50/50 border border-teal-100/50' 
            : 'bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100/50'
        }`}>
          <div className="p-6">
            <div className={`w-full h-48 bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} rounded-lg mb-4 flex items-center justify-center relative overflow-hidden`}>
              <svg className={`w-32 h-32 ${CARD_ICON_COLORS[index % CARD_ICON_COLORS.length]}`} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M40 60 Q60 40 80 60 T120 60" opacity="0.6"/>
                <path d="M40 100 Q60 80 80 100 T120 100" opacity="0.6"/>
                <path d="M40 140 Q60 120 80 140 T120 140" opacity="0.6"/>
                <circle cx="160" cy="100" r="20" fill="none" opacity="0.4"/>
              </svg>
              
              {/* Status indicator */}
              {status && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                  <Circle 
                    className={`w-2 h-2 ${isRunning ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                    style={{ animation: isRunning ? 'pulse 2s infinite' : 'none' }}
                  />
                  <span className={`text-xs font-light ${isRunning ? 'text-green-700' : 'text-gray-600'}`}>
                    {isRunning ? 'Running' : 'Offline'}
                  </span>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                {/* Export Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={isExporting}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition disabled:opacity-50"
                    title="Export"
                  >
                    <Download className={`w-4 h-4 ${index % 2 === 0 ? 'text-teal-600' : 'text-purple-600'}`} />
                  </button>
                </div>
                
                {/* View Details/Launch Button */}
                {isRunning && url ? (
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition"
                    title="Launch Demo"
                  >
                    <ExternalLink className="w-4 h-4 text-green-600" />
                  </Link>
                ) : (
                  <Link
                    href={`/demos/${folderName}`}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition"
                    title="View Details"
                  >
                    <Eye className={`w-4 h-4 ${index % 2 === 0 ? 'text-teal-600' : 'text-purple-600'}`} />
                  </Link>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-light text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-500 mb-4 line-clamp-3 font-light leading-relaxed">
              {description || 'No description available'}
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              {/* Admin Start/Stop Button */}
              {isAdmin && (
                <>
                  {isRunning ? (
                    <button
                      onClick={handleStopDemo}
                      disabled={isLoadingControl}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-full shadow-sm hover:shadow-md transition disabled:opacity-50"
                      title="Stop Demo"
                    >
                      <Square className="w-4 h-4 text-red-600" />
                    </button>
                  ) : (
                    <button
                      onClick={handleStartDemo}
                      disabled={isLoadingControl}
                      className="p-2 bg-green-50 hover:bg-green-100 rounded-full shadow-sm hover:shadow-md transition disabled:opacity-50"
                      title="Start Demo"
                    >
                      <Play className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                </>
              )}
              
              {/* View Details Button */}
              <Link
                href={`/demos/${folderName}`}
                className={`p-2 rounded-full shadow-sm hover:shadow-md transition ${index % 2 === 0 ? 'bg-teal-50 hover:bg-teal-100' : 'bg-purple-50 hover:bg-purple-100'}`}
                title="View Details"
              >
                <Eye className={`w-4 h-4 ${index % 2 === 0 ? 'text-teal-600' : 'text-purple-600'}`} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Export Dialog */}
      {showExportMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowExportMenu(false)}
          />
          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-light text-gray-900">Export Format</h3>
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                {/* PowerPoint */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">PowerPoint</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleExport('ppt_169')}
                      className="px-4 py-3 border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition rounded-lg text-sm font-light text-gray-700"
                    >
                      PPT 16:9
                    </button>
                    <button
                      onClick={() => handleExport('ppt_43')}
                      className="px-4 py-3 border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition rounded-lg text-sm font-light text-gray-700"
                    >
                      PPT 4:3
                    </button>
                  </div>
                </div>
                
                {/* PDF */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">PDF</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleExport('pdf_169')}
                      className="px-4 py-3 border-2 border-gray-200 hover:border-rose-500 hover:bg-rose-50 transition rounded-lg text-sm font-light text-gray-700"
                    >
                      PDF 16:9
                    </button>
                    <button
                      onClick={() => handleExport('pdf_43')}
                      className="px-4 py-3 border-2 border-gray-200 hover:border-rose-500 hover:bg-rose-50 transition rounded-lg text-sm font-light text-gray-700"
                    >
                      PDF 4:3
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </>
  )
}


