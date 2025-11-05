'use client'

import { useState, useEffect } from 'react'
import { apiService, Demonstration } from '@/lib/api'
import DemoCard from '@/components/DemoCard'
import { motion, AnimatePresence } from 'framer-motion'

export default function DemosPage() {
  const [demos, setDemos] = useState<Demonstration[]>([])
  const [demoStatuses, setDemoStatuses] = useState<Record<number, { status: string; url?: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    loadDemos()
  }, [])

  const loadDemos = async () => {
    try {
      const data = await apiService.getDemos(true)
      setDemos(data)
      
      // Load status for each demo
      const statuses: Record<number, { status: string; url?: string }> = {}
      for (const demo of data) {
        try {
          const status = await apiService.getDemoStatus(demo.id)
          statuses[demo.id] = status
        } catch (error) {
          statuses[demo.id] = { status: 'not_running' }
        }
      }
      setDemoStatuses(statuses)
    } catch (error) {
      console.error('Failed to load demos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading demonstrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Demonstrations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of innovative projects and demos
          </p>
        </motion.div>

        {demos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No demonstrations available yet.</p>
          </div>
        ) : (
          <div className="relative" 
               onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex flex-wrap justify-center gap-6 p-8" style={{ perspective: '1000px' }}>
              {demos.map((demo, index) => {
                const isHovered = hoveredIndex === index
                const isStacked = hoveredIndex !== null && !isHovered
                
                return (
                  <motion.div
                    key={demo.id}
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: 1,
                      x: isStacked ? (index - hoveredIndex!) * 20 : 0,
                      y: isStacked ? (index - hoveredIndex!) * 30 : 0,
                      rotateZ: isStacked ? (index - hoveredIndex!) * 3 : 0,
                      scale: isHovered ? 1.05 : isStacked ? 0.95 : 1,
                      zIndex: isHovered ? 50 : isStacked ? 10 - Math.abs(index - hoveredIndex!) : 1,
                      filter: isStacked ? 'blur(2px)' : 'blur(0px)',
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateZ: 0,
                      y: -10,
                      zIndex: 50,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                    onHoverStart={() => setHoveredIndex(index)}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    style={{ 
                      position: 'relative',
                      willChange: 'transform'
                    }}
                  >
                    <DemoCard
                      id={demo.id}
                      title={demo.title}
                      description={demo.description}
                      folderName={demo.folder_name}
                      status={demoStatuses[demo.id]?.status || 'unknown'}
                      url={demoStatuses[demo.id]?.url}
                    />
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

