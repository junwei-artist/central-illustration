import axios from 'axios'

// Get base URL dynamically - use environment variable or construct from current location
const getBaseURL = () => {
  // Check for explicit API URL in environment
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('🔧 Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Construct API URL based on current host
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const constructedURL = `${protocol}//${hostname}:8000`
    console.log('🔧 Constructed API URL from window:', constructedURL)
    return constructedURL
  }
  
  console.log('⚠️ No window object, falling back to localhost')
  return 'http://localhost:8000'
}

const api = axios.create({
  baseURL: '/', // Will be overridden dynamically
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests and set dynamic base URL
api.interceptors.request.use((config) => {
  // Get token
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Set dynamic base URL for each request
  const baseURL = getBaseURL()
  config.baseURL = baseURL
  
  // Debug: Log the base URL being used - ALWAYS log in development
  if (typeof window !== 'undefined') {
    console.log('🚀 API Interceptor:')
    console.log('   Request URL:', config.url)
    console.log('   Base URL:', baseURL)
    console.log('   Full URL:', baseURL + config.url)
    console.log('   window.location:', window.location.href)
  }
  
  return config
})

export interface Demonstration {
  id: number
  title: string
  description: string | null
  folder_name: string
  url: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Comment {
  id: number
  content: string
  demo_id: number
  created_at: string
  author_username: string | null
}

export const apiService = {
  // Auth
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    
    // Get dynamic base URL
    const baseURL = getBaseURL()
    const fullURL = `${baseURL}/auth/login`
    
    // Debug log
    if (typeof window !== 'undefined') {
      console.log('🌐 Current hostname:', window.location.hostname)
      console.log('🌐 API base URL:', baseURL)
      console.log('🌐 Login request to:', fullURL)
    }
    
    const response = await axios.post(fullURL, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  // Demos
  getDemos: async (visibleOnly: boolean = true) => {
    const response = await api.get(`/demos/?visible_only=${visibleOnly}`)
    return response.data
  },
  
  getDemo: async (demoId: number) => {
    const response = await api.get(`/demos/${demoId}`)
    return response.data
  },
  
  createDemo: async (demo: Partial<Demonstration>) => {
    const response = await api.post('/demos/', demo)
    return response.data
  },
  
  updateDemo: async (demoId: number, demo: Partial<Demonstration>) => {
    const response = await api.put(`/demos/${demoId}`, demo)
    return response.data
  },
  
  deleteDemo: async (demoId: number) => {
    await api.delete(`/demos/${demoId}`)
  },
  
  // Comments
  getComments: async (demoId: number) => {
    const response = await api.get(`/comments/${demoId}`)
    return response.data
  },
  
  createComment: async (demoId: number, content: string) => {
    const response = await api.post('/comments/', {
      demo_id: demoId,
      content,
    })
    return response.data
  },
  
  // Demo Manager
  startDemo: async (demoId: number) => {
    const response = await api.post(`/demo-manager/start/${demoId}`)
    return response.data
  },
  
  stopDemo: async (demoId: number) => {
    const response = await api.post(`/demo-manager/stop/${demoId}`)
    return response.data
  },
  
  getDemoStatus: async (demoId: number) => {
    const response = await api.get(`/demo-manager/status/${demoId}`)
    return response.data
  },
  
  getDemoRedirectUrl: async (demoId: number) => {
    const response = await api.get(`/demo-manager/redirect/${demoId}`)
    return response.data
  },
}

export default api

