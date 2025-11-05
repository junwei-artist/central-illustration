'use client'

import { useState, useEffect } from 'react'
import { apiService, Demonstration } from '@/lib/api'
import DemoCard from '@/components/DemoCard'
import { motion } from 'framer-motion'

export default function DemosPage() {
  const [demos, setDemos] = useState<Demonstration[]>([])
  const [demoStatuses, setDemoStatuses] = useState<Record<number, { status: string; url?: string }>>({})
  const [isLoading, setIsLoading] = useState(true)

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="mt-4 text-gray-500 font-light">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 bg-white relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-20 right-20 w-96 h-96 text-teal-100 opacity-30" viewBox="0 0 400 400" fill="none">
          <path d="M50 100 Q150 50 250 100 T450 100" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6">
            <animate attributeName="d" dur="8s" repeatCount="indefinite"
              values="M50 100 Q150 50 250 100 T450 100;
                      M50 120 Q150 70 250 120 T450 120;
                      M50 100 Q150 50 250 100 T450 100"/>
          </path>
          <circle cx="150" cy="150" r="3" fill="currentColor" opacity="0.4">
            <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="120" r="2" fill="currentColor" opacity="0.5">
            <animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </svg>
        
        <svg className="absolute bottom-32 left-10 w-80 h-80 text-cyan-100 opacity-20" viewBox="0 0 300 300" fill="none">
          <path d="M20 150 L80 80 L140 120 L200 60 L260 100 L280 140" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
          <circle cx="80" cy="80" r="2" fill="currentColor" opacity="0.4"/>
          <circle cx="200" cy="60" r="2" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight"
          >
            Demonstrations
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Technology that thinks with you, not for you
          </motion.p>
        </motion.div>

        {demos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-400 text-lg font-light">No demonstrations available yet.</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {demos.map((demo, index) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
              >
                <DemoCard
                  id={demo.id}
                  title={demo.title}
                  description={demo.description}
                  folderName={demo.folder_name}
                  status={demoStatuses[demo.id]?.status || 'unknown'}
                  url={demoStatuses[demo.id]?.url}
                  index={index}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
