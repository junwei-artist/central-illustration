'use client'

import { CheckCircle, Maximize2, Minimize2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-10">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="ml-2 text-base font-bold text-gray-900">TQM</span>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-gray-700 hover:text-blue-600 transition rounded hover:bg-white/50"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

