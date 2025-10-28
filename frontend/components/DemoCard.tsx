'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface DemoCardProps {
  id: number
  title: string
  description: string | null
  folderName: string
}

export default function DemoCard({ id, title, description, folderName }: DemoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/demos/${folderName}`}>
        <div className="card h-full">
          <div className="p-6">
            <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-300 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-32 h-32 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                <path d="M7 7h10M7 12h10M7 17h7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {description || 'No description available'}
            </p>
            
            <div className="flex items-center text-primary-600 font-semibold">
              View Demo
              <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

