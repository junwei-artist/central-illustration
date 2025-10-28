'use client'

import { useState, useEffect } from 'react'
import { apiService, Comment } from '@/lib/api'
import { motion } from 'framer-motion'

interface CommentBoxProps {
  demoId: number
}

export default function CommentBox({ demoId }: CommentBoxProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadComments()
  }, [demoId])

  const loadComments = async () => {
    try {
      const data = await apiService.getComments(demoId)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      await apiService.createComment(demoId, newComment)
      setNewComment('')
      loadComments()
    } catch (error) {
      console.error('Failed to create comment:', error)
      alert('Please login to comment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Comments & Discussion</h2>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary mt-4"
        >
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {comment.author_username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-900">{comment.author_username || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </motion.div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  )
}

