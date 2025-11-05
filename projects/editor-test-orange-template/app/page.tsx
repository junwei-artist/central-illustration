'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { MousePointer2 } from 'lucide-react'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showDetailViewer, setShowDetailViewer] = useState(false)
  const [detailContent, setDetailContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Dynamic content state - page-based
  const [pageContent, setPageContent] = useState<Record<number, {
    title: string
    points: string
  }>>({})

  // Helper function to get page folder name
  const getPageFolder = (pageIndex: number) => `page-${pageIndex + 1}`

  // Load page content (title and points) dynamically based on page index
  const loadPageContent = async (pageIndex: number) => {
    const pageFolder = getPageFolder(pageIndex)
    const currentPath = window.location.pathname
    
    const loadFile = async (filename: string) => {
      let contentUrl
      
      if (currentPath.startsWith('/proxy/')) {
        const proxyMatch = currentPath.match(/^\/proxy\/\d+/)
        if (proxyMatch) {
          contentUrl = `${window.location.origin}${proxyMatch[0]}/content/${pageFolder}/${filename}`
        } else {
          contentUrl = `/content/${pageFolder}/${filename}`
        }
      } else {
        contentUrl = `/content/${pageFolder}/${filename}`
      }
      
      try {
        const response = await fetch(contentUrl)
        if (response.ok) {
          return await response.text()
        }
      } catch (error) {
        console.error(`Error loading ${filename}:`, error)
      }
      return ''
    }
    
    const [title, points] = await Promise.all([
      loadFile('title.md'),
      loadFile('points.md')
    ])
    
    setPageContent(prev => ({
      ...prev,
      [pageIndex]: { title, points }
    }))
  }

  // Legacy function - keeping for backwards compatibility during refactor
  // Load markdown detail content
  const loadDetailContent = async () => {
    setIsLoading(true)
    // Detect if we're behind a proxy by checking the pathname
    const currentPath = window.location.pathname
    // Determine which page detail to load based on current slide
    const pageFolder = currentSlide === 0 ? 'page-1' : 'page-2'
    let contentUrl
    
    if (currentPath.startsWith('/proxy/')) {
      // We're behind a proxy, extract the proxy path
      const proxyMatch = currentPath.match(/^\/proxy\/\d+/)
      if (proxyMatch) {
        contentUrl = `${window.location.origin}${proxyMatch[0]}/content/${pageFolder}/detail.md`
      } else {
        contentUrl = `/content/${pageFolder}/detail.md`
      }
    } else {
      // Direct access, use relative path
      contentUrl = `/content/${pageFolder}/detail.md`
    }
    
    console.log('Loading from:', contentUrl)
    try {
      const response = await fetch(contentUrl)
      console.log('Response status:', response.status)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      console.log('Content loaded:', text.substring(0, 100))
      setDetailContent(text)
      setShowDetailViewer(true)
    } catch (error) {
      console.error('Error loading detail content:', error)
      setDetailContent('# Error\n\nUnable to load details.\n\nError: ' + String(error))
      setShowDetailViewer(true)
    }
    setIsLoading(false)
  }

  // Load content when component mounts
  useEffect(() => {
    // Load content for page 0 and page 1
    loadPageContent(0)
    loadPageContent(1)
  }, [])

  const heroSlides = [
    {
      title: 'Quality Management',
      subtitle: 'Redefined',
      description: 'Modern digital solutions for excellence through continuous improvement.',
      link: '#',
      linkText: 'Explore',
      colors: 'from-orange-500 to-amber-600',
      accentColor: 'orange'
    },
    {
      title: 'AI-Assisted Operations',
      subtitle: 'Local · Private · Insightful',
      description: 'On-prem AI models for manufacturing and quality intelligence.',
      points: [
        'AOI image analysis (defects, features).',
        'SPC drift prediction via local ML.',
        'NLP document assistant for key-field extraction.',
        'Chat interface: ask "PPM trend for Vendor A this quarter".'
      ],
      link: '#',
      linkText: 'AI Ops',
      colors: 'from-orange-600 to-amber-700'
    }
  ]

  function renderSlideGraphic(index: number, accentColor?: string) {
    if (index === 0) {
      // Minimalist line-based illustration with white tones for orange background
      const strokeColor = accentColor === 'orange' ? '#ffffff' : '#fff7ed'
      const lightColor = accentColor === 'orange' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 247, 237, 0.25)'
      
      return (
        <svg viewBox="0 0 600 400" className="w-full">
          <defs>
            <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="heroGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Animated flowing lines - abstract representation of quality flow */}
          <g stroke={strokeColor} strokeWidth="2" fill="none">
            {/* Flowing curve paths */}
            <path d="M 80 280 Q 200 200, 320 220 T 520 200" stroke="url(#heroGradient)" strokeWidth="2.5">
              <animate attributeName="d" dur="8s" repeatCount="indefinite"
                values="M 80 280 Q 200 200, 320 220 T 520 200; M 80 260 Q 200 220, 320 200 T 500 220; M 80 280 Q 200 200, 320 220 T 520 200" />
            </path>
            <path d="M 120 320 Q 250 240, 380 260 T 540 240" stroke="url(#heroGradient2)" strokeWidth="2">
              <animate attributeName="d" dur="10s" repeatCount="indefinite"
                values="M 120 320 Q 250 240, 380 260 T 540 240; M 120 300 Q 250 260, 380 240 T 540 260; M 120 320 Q 250 240, 380 260 T 540 240" />
            </path>
          </g>
          
          {/* Circular elements representing quality checkpoints */}
          <circle cx="180" cy="180" r="40" fill={lightColor} opacity="0.6">
            <animate attributeName="r" values="40;50;40" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="380" cy="200" r="50" fill={lightColor} opacity="0.4">
            <animate attributeName="r" values="50;45;50" dur="8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="8s" repeatCount="indefinite" />
          </circle>
          
          {/* Connecting lines between circles */}
          <line x1="220" y1="180" x2="330" y2="200" stroke={strokeColor} strokeWidth="2" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
          </line>
          
          {/* Additional geometric shapes for visual interest */}
          <polygon points="450,150 480,150 465,180" fill={strokeColor} opacity="0.3">
            <animate attributeName="transform" values="rotate(0 465 165); rotate(360 465 165)" dur="20s" repeatCount="indefinite" />
          </polygon>
          <rect x="100" y="320" width="60" height="60" rx="8" fill={strokeColor} opacity="0.2">
            <animate attributeName="y" values="320;310;320" dur="5s" repeatCount="indefinite" />
          </rect>
        </svg>
      )
    }
    if (index === 1) {
      return (
        <svg viewBox="0 0 600 400" className="w-full">
          <g>
            <circle cx="120" cy="120" r="8" fill="#fff">
              <animate attributeName="r" values="8;4;8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="220" cy="200" r="8" fill="#fff">
              <animate attributeName="r" values="8;4;8" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="320" cy="140" r="8" fill="#fff">
              <animate attributeName="r" values="8;4;8" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="420" cy="220" r="8" fill="#fff">
              <animate attributeName="r" values="8;4;8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <polyline points="120,120 220,200 320,140 420,220" stroke="#fff" strokeWidth="3" fill="none" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
            </polyline>
          </g>
        </svg>
      )
    }
    if (index === 2) {
      return (
        <svg viewBox="0 0 600 400" className="w-full">
          <rect x="80" y="140" width="120" height="120" rx="16" fill="white" opacity="0.15" />
          <rect x="240" y="100" width="140" height="160" rx="16" fill="white" opacity="0.15" />
          <rect x="420" y="160" width="100" height="100" rx="16" fill="white" opacity="0.15" />
        </svg>
      )
    }
    if (index === 3) {
      return (
        <svg viewBox="0 0 600 400" className="w-full">
          <defs>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffffff55" />
              <stop offset="100%" stopColor="#ffffff10" />
            </linearGradient>
          </defs>
          <path d="M80,240 C160,160 240,320 320,220 S480,180 520,260" stroke="url(#g2)" strokeWidth="10" fill="none">
            <animate attributeName="d" dur="5s" repeatCount="indefinite"
              values="M80,240 C160,160 240,320 320,220 S480,180 520,260;
                      M80,220 C160,200 240,280 320,200 S480,160 520,240;
                      M80,240 C160,160 240,320 320,220 S480,180 520,260" />
          </path>
        </svg>
      )
    }
    if (index === 4) {
      return (
        <svg viewBox="0 0 600 400" className="w-full">
          <g fill="#ffffff" opacity="0.15">
            <circle cx="130" cy="180" r="28">
              <animate attributeName="r" values="28;34;28" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="260" cy="200" r="34">
              <animate attributeName="r" values="34;28;34" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="390" cy="170" r="22">
              <animate attributeName="r" values="22;28;22" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      )
    }
    if (index === 1) {
      return (
        <svg viewBox="0 0 600 400" className="w-full">
          <g stroke="#fff" strokeWidth="2" fill="none" opacity="0.4">
            <circle cx="300" cy="200" r="60">
              <animate attributeName="r" values="60;80;60" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="200" r="100">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>
          <text x="300" y="205" textAnchor="middle" fill="#FFFFFF" opacity="0.9" fontSize="18" fontWeight="700">AI</text>
        </svg>
      )
    }
    return null
  }

  function renderSlideContent(index: number, slide: any) {
    // Layout variants per slide index
    // 0: Illustration hero (full graphic, overlay text)
    // 1: Text-focused (centered bullets)
    // 2: Split, graphic left
    // 3: Text-focused
    // 4: Split, graphic right
    // 5: Illustration hero
    // 6: Split, graphic left
    // 7: Text-focused

    const textBlock = (
      <>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          {slide.title}<br />{slide.subtitle}
        </h1>
        <p className="text-xl md:text-2xl mb-6 text-orange-50/90">{slide.description}</p>
        {Array.isArray(slide.points) && (
          <ul className="space-y-2 mb-8 text-orange-50/90 text-base md:text-lg list-disc list-inside">
            {slide.points.map((p: string, i: number) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        )}
        <Link
          href={slide.link}
          className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition shadow-xl"
        >
          {slide.linkText}
        </Link>
      </>
    )

    // Minimalist hero section for first slide
    if (index === 0) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Illustration positioned in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            {renderSlideGraphic(index, slide.accentColor)}
          </div>
          
          {/* Text content in foreground */}
          <motion.div 
            className="relative max-w-4xl px-4 sm:px-6 lg:px-8 text-center z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {pageContent[0]?.title ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="prose prose-invert prose-2xl max-w-none mb-12"
              >
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-7xl md:text-8xl font-light mb-4 text-white tracking-tight">{children}</h1>
                    ),
                    p: ({ children }) => (
                      <p className="text-3xl md:text-4xl font-light text-amber-100">{children}</p>
                    ),
                  }}
                >
                  {pageContent[0].title}
                </ReactMarkdown>
              </motion.div>
            ) : (
              <>
                <motion.h1 
                  className="text-7xl md:text-8xl font-light mb-8 text-white tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {slide.title}
                </motion.h1>
                <motion.p 
                  className="text-3xl md:text-4xl font-light mb-12 text-amber-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
              </>
            )}
            
            {pageContent[0]?.points ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="prose prose-invert max-w-2xl mx-auto mb-12"
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-lg md:text-xl text-orange-50">{children}</p>
                    ),
                  }}
                >
                  {pageContent[0].points}
                </ReactMarkdown>
              </motion.div>
            ) : (
              <motion.p 
                className="text-lg md:text-xl mb-12 text-orange-50 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {slide.description}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <button
                onClick={loadDetailContent}
                disabled={isLoading}
                className="inline-flex items-center justify-center w-16 h-16 bg-white text-orange-600 rounded-full hover:bg-orange-50 hover:scale-110 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="View Details"
              >
                {isLoading ? (
                  <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <MousePointer2 className="w-8 h-8" />
                )}
              </button>
            </motion.div>
          </motion.div>
        </div>
      )
    }

    // AI-Assisted Operations slide (index 1, formerly index 5)
    if (index === 1) {
      return (
        <div className="relative w-full h-full flex items-center">
          {/* Left side - Text content (2/3 width) */}
          <motion.div 
            className="w-2/3 px-8 md:px-12 lg:px-16 text-white"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {pageContent[1]?.title ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="prose prose-invert prose-2xl max-w-none mb-6"
              >
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{children}</h1>
                    ),
                    p: ({ children }) => (
                      <p className="text-3xl md:text-4xl font-light text-amber-100">{children}</p>
                    ),
                  }}
                >
                  {pageContent[1].title}
                </ReactMarkdown>
              </motion.div>
            ) : (
              <motion.h1 
                className="text-4xl md:text-5xl font-extrabold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {slide.title}<br />{slide.subtitle}
              </motion.h1>
            )}
            
            <motion.p 
              className="text-lg md:text-xl mb-6 text-orange-50/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {slide.description}
            </motion.p>
            
            {pageContent[1]?.points && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="prose prose-invert prose-lg max-w-none mb-8"
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-orange-50/90 mb-3">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-2 text-orange-50/90 text-base md:text-lg">{children}</ul>,
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="text-orange-300 font-bold">{children}</strong>,
                  }}
                >
                  {pageContent[1].points}
                </ReactMarkdown>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <button
                onClick={loadDetailContent}
                disabled={isLoading}
                className="inline-flex items-center justify-center w-16 h-16 bg-white text-orange-600 rounded-full hover:bg-orange-50 hover:scale-110 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                title="View Details"
              >
                {isLoading ? (
                  <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <MousePointer2 className="w-8 h-8" />
                )}
              </button>
            </motion.div>
          </motion.div>
          
          {/* Right side - SVG graphic (1/3 width) */}
          <motion.div 
            className="w-1/3 flex items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="w-full max-w-xs">
              {renderSlideGraphic(index)}
            </div>
          </motion.div>
        </div>
      )
    }
    
    // Default fallback
    return null
  }


  return (
    <div className="bg-gray-50">
      {/* Hero Slider Section */}
      <section className="relative overflow-hidden h-screen">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 flex items-center transition-all duration-500 bg-gradient-to-br ${slide.colors} ${
              currentSlide === index ? 'z-10 visible' : 'z-0 pointer-events-none invisible'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {renderSlideContent(index, slide as any)}
                  </motion.div>
            </div>
          </motion.div>
        ))}

        {/* Page Navigation - Numbered Buttons */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-10 h-10 rounded-full transition flex items-center justify-center font-bold text-sm ${
                currentSlide === index 
                  ? 'bg-white/90 text-orange-600 shadow-lg scale-110'
                  : 'bg-white/40 text-white hover:bg-white/60'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Previous/Next Buttons */}
            <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 p-4 rounded-full transition z-20 backdrop-blur-sm bg-white/40 hover:bg-white/60 text-white"
          aria-label="Previous page"
            >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
            </button>
            <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 p-4 rounded-full transition z-20 backdrop-blur-sm bg-white/40 hover:bg-white/60 text-white"
          aria-label="Next page"
            >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
            </button>
      </section>

      {/* Detail Viewer - Glassmorphism Modal */}
      <AnimatePresence>
        {showDetailViewer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailViewer(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Glassmorphism Content Box */}
            <motion.div
              className="relative w-full max-w-4xl max-h-[90vh] bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white">
                  {currentSlide === 0 ? 'Quality Management Digitalization' : 'AI-Assisted Operations'}
                </h2>
                <button
                  onClick={() => setShowDetailViewer(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
                <div className="prose prose-invert prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-6 mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold text-orange-300 mt-5 mb-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-semibold text-orange-200 mt-4 mb-2">{children}</h3>,
                      p: ({ children }) => <p className="text-white/90 mb-4 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-white/90">{children}</ul>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                      strong: ({ children }) => <strong className="text-orange-300 font-bold">{children}</strong>,
                    }}
                  >
                    {detailContent}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
