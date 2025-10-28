'use client'

import { useState, useEffect } from 'react'
import { apiService, Demonstration } from '@/lib/api'
import DemoCard from '@/components/DemoCard'
import { motion } from 'framer-motion'

export default function DemosPage() {
  const [demos, setDemos] = useState<Demonstration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDemos()
  }, [])

  const loadDemos = async () => {
    try {
      const data = await apiService.getDemos(true)
      setDemos(data)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demos.map((demo) => (
              <DemoCard
                key={demo.id}
                id={demo.id}
                title={demo.title}
                description={demo.description}
                folderName={demo.folder_name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

