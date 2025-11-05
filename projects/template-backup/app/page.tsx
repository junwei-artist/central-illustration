'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, CheckCircle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentCarousel, setCurrentCarousel] = useState(0)

  const heroSlides = [
    {
      title: 'Total Quality',
      subtitle: 'Management',
      description: 'Achieving excellence through continuous improvement and customer focus',
      link: '#overview',
      linkText: 'Explore TQM'
    },
    {
      title: 'Continuous',
      subtitle: 'Improvement',
      description: 'PDCA cycle: Plan, Do, Check, Act for systematic improvement',
      link: '/principles',
      linkText: 'Learn More'
    }
  ]

  const carouselItems = [
    {
      title: 'Quality First Approach',
      description: 'Quality is not an accident, it is always the result of high intention, sincere effort, intelligent direction and skillful execution.',
      color: 'from-blue-600 to-purple-600'
    },
    {
      title: 'Process Excellence',
      description: 'Improving processes systematically ensures consistent quality outcomes and customer satisfaction.',
      color: 'from-green-600 to-teal-600'
    },
    {
      title: 'Leadership Commitment',
      description: 'Strong leadership drives quality culture and empowers teams to achieve excellence.',
      color: 'from-orange-600 to-red-600'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCarousel((prev) => (prev + 1) % carouselItems.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-gray-50">
      {/* Hero Slider Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 overflow-hidden h-screen">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 flex items-center transition-all duration-500 ${
              currentSlide === index ? 'z-10 visible' : 'z-0 pointer-events-none invisible'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
                    {slide.title}<br />{slide.subtitle}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-blue-100">
                    {slide.description}
                  </p>
                  <Link
                    href={slide.link}
                    className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition shadow-xl"
                  >
                    {slide.linkText}
                  </Link>
                </motion.div>
                <div className="hidden md:block">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <svg viewBox="0 0 500 400" className="w-full">
                      <circle cx="250" cy="200" r="80" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="3">
                        <animate attributeName="r" values="80;100;80" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="250" cy="200" r="50" fill="white" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;0.5;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <text x="250" y="210" textAnchor="middle" fill="#3B82F6" fontSize="24" fontWeight="bold">Quality</text>
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                currentSlide === index ? 'bg-white' : 'bg-white opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What is Total Quality Management?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive approach to long-term success through customer satisfaction
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Customer Focus', desc: 'Understanding and meeting customer needs is paramount.', color: 'blue' },
              { icon: CheckCircle, title: 'Continuous Improvement', desc: 'Regular assessment and improvement of processes.', color: 'green' },
              { icon: TrendingUp, title: 'Team Involvement', desc: 'Every employee participates in quality improvement.', color: 'purple' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-xl p-8 shadow-lg`}
              >
                <div className={`w-16 h-16 bg-${item.color}-600 rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">TQM in Action</h2>
            <p className="text-xl text-gray-600">Visual journey of quality management principles</p>
          </div>

          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden h-[500px]">
            <div className="relative h-full">
              {carouselItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{
                    opacity: currentCarousel === index ? 1 : 0,
                    x: currentCarousel === index ? 0 : 100
                  }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} flex items-center justify-center`}
                >
                  <div className="max-w-md bg-white/90 backdrop-blur-sm rounded-xl p-8 m-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Carousel Controls */}
            <button
              onClick={() => setCurrentCarousel((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentCarousel((prev) => (prev + 1) % carouselItems.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

