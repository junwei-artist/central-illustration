'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsLoggedIn(true)
      // Check if admin (you can decode the token or make an API call)
      const userRole = localStorage.getItem('user_role')
      setIsAdmin(userRole === 'admin')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    setIsLoggedIn(false)
    setIsAdmin(false)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Central Illustration
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/demos" className="text-gray-700 hover:text-primary-600 transition-colors">
              Demos
            </Link>
            
            {isAdmin && (
              <Link href="/admin" className="text-gray-700 hover:text-primary-600 transition-colors">
                Admin
              </Link>
            )}
            
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

