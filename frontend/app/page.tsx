'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Target, Users, Shield, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600 text-white py-32">
        {/* Animated Background SVG */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            <motion.circle
              cx="200"
              cy="200"
              r="100"
              fill="currentColor"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="800"
              cy="300"
              r="150"
              fill="currentColor"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="1000"
              cy="600"
              r="120"
              fill="currentColor"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.55, 0.25],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-16 h-16 mx-auto" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              Central Illustration
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-50">
              Showcase your innovative projects with modern demonstrations. 
              Beautiful, interactive, and powered by cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demos" className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-all duration-200 shadow-xl hover:shadow-2xl">
                Explore Demos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/admin" className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200">
                Admin Dashboard
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating SVG Elements */}
        <motion.div
          className="absolute bottom-0 left-1/4"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="w-12 h-12 text-white opacity-40" />
        </motion.div>
        <motion.div
          className="absolute top-20 right-1/4"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Target className="w-10 h-10 text-white opacity-30" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Central Illustration?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to showcase your projects beautifully
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Beautiful Demos",
                description: "Create stunning visual demonstrations with SVG animations and Tailwind CSS",
              },
              {
                icon: Users,
                title: "Interactive Discussions",
                description: "Engage with your audience through comments and feedback",
              },
              {
                icon: Shield,
                title: "Admin Control",
                description: "Full control over visibility, descriptions, and project management",
              },
              {
                icon: Zap,
                title: "Fast & Modern",
                description: "Built with Next.js and FastAPI for lightning-fast performance",
              },
              {
                icon: BarChart3,
                title: "Organized Structure",
                description: "Each project in its own folder with clean organization",
              },
              {
                icon: Target,
                title: "Easy Integration",
                description: "Seamlessly integrate with PostgreSQL and your existing tools",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card p-6"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl md:text-2xl mb-8 text-primary-50">
              Join our platform and start showcasing your projects today
            </p>
            <Link href="/demos" className="inline-block px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-all duration-200 shadow-xl">
              Explore All Demos
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

