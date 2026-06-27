import { ExternalLink } from 'lucide-react'

export default function NewsCard({ article }) {
  const date = new Date(article.datetime * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#1a1a2e] border border-[#2a2a3d] rounded-xl p-4 hover:border-purple-500/50 hover:bg-[#1e1e35] transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">
              {article.source}
            </span>
            <span className="text-[#475569] text-xs">{date}</span>
          </div>
          <h4 className="text-white text-sm font-medium leading-snug group-hover:text-purple-300 transition-colors">
            {article.headline}
          </h4>
          {article.summary && (
            <p className="text-[#475569] text-xs mt-2 leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>
        <ExternalLink
          size={14}
          className="text-[#475569] group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1"
        />
      </div>
    </a>
  )
}