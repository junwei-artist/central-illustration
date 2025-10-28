'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TQM</span>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-blue-600 font-semibold">Home</Link>
            <Link href="/principles" className="text-gray-700 hover:text-blue-600 transition">Principles</Link>
            <Link href="/tools" className="text-gray-700 hover:text-blue-600 transition">Tools</Link>
            <Link href="/benefits" className="text-gray-700 hover:text-blue-600 transition">Benefits</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

