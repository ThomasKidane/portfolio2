import { BlogPost } from '@/types/blog'
import { X } from 'lucide-react'

interface BlogPostModalProps {
  post: BlogPost | null
  isOpen: boolean
  onClose: () => void
}

export function BlogPostModal({ post, isOpen, onClose }: BlogPostModalProps) {
  if (!isOpen || !post) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative min-h-full flex items-start justify-center p-4">
        <div className="relative bg-white max-w-4xl w-full my-8 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h1 className="pixel-title text-xl text-primary mb-2">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <time className="serif-text text-gray-600">
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
                <span className="serif-text text-gray-600">
                  {post.readTime} min read
                </span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <div className="serif-text space-y-4">
                {post.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    return (
                      <h1 key={index} className="pixel-title text-2xl text-primary mb-6">
                        {paragraph.replace('# ', '')}
                      </h1>
                    )
                  } else if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="pixel-title text-lg text-primary mt-8 mb-4">
                        {paragraph.replace('## ', '')}
                      </h2>
                    )
                  } else if (paragraph.trim()) {
                    return (
                      <p key={index} className="serif-text text-gray-800 leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </div>
            
            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="pixel-title text-xs text-primary bg-primary-50 px-3 py-1 rounded"
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
