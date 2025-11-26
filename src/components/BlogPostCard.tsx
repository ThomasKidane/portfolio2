import { BlogPost } from '@/types/blog'

interface BlogPostCardProps {
  post: BlogPost
  onClick: () => void
}

export function BlogPostCard({ post, onClick }: BlogPostCardProps) {
  return (
    <article 
      className="border-l-2 border-gray-200 hover:border-primary pl-6 py-6 cursor-pointer transition-all duration-200 group"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <time className="pixel-title text-xs text-gray-500 tracking-wider">
            {new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </time>
          <span className="serif-text text-sm text-gray-500">
            {post.readTime} min read
          </span>
        </div>
        
        <h2 className="pixel-title text-lg text-gray-900 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        
        <p className="serif-text text-gray-700 leading-relaxed">
          {post.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span 
              key={tag}
              className="pixel-title text-xs text-primary bg-primary-50 px-2 py-1 rounded"
            >
              {tag.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
