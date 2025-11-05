import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <CheckCircle className="w-8 h-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">TQM</span>
            </div>
            <p className="text-sm">Total Quality Management demonstration showcasing principles, tools, and benefits.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/principles" className="hover:text-white transition">Principles</Link></li>
              <li><Link href="/tools" className="hover:text-white transition">Tools</Link></li>
              <li><Link href="/benefits" className="hover:text-white transition">Benefits</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Learn More</h4>
            <ul className="space-y-2 text-sm">
              <li>Customer Focus</li>
              <li>Continuous Improvement</li>
              <li>Process Management</li>
              <li>Team Involvement</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p className="text-sm">This is a demonstration project from Central Illustration platform.</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 Total Quality Management Demo. Educational purposes.</p>
        </div>
      </div>
    </footer>
  )
}

