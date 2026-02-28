import ReactMarkdown from 'react-markdown';
import type { CareerTrack } from '../types';

interface AIAdvisorPanelProps {
  recommendation: string;
  isLoading: boolean;
  careerTrack: CareerTrack;
  onRefresh: () => void;
}


export default function AIAdvisorPanel({
  recommendation,
  isLoading,
  careerTrack,
  onRefresh
}: AIAdvisorPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">
           ✨ AI Advisor
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50 border border-green-600 rounded-lg px-3 py-1 hover:bg-green-50 transition"
        >
          {isLoading ? '⏳ Thinking...' : '↻ Refresh'}
        </button>
      </div>

      {/* Career track badge */}
      <div className="text-xs bg-green-50 text-green-700 rounded-lg px-3 py-2 font-medium border border-green-100">
        🎯 Career Track: {careerTrack}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Analyzing your degree plan...</p>
        </div>
      ) : recommendation ? (
        <div className="prose prose-sm max-w-none text-gray-700 overflow-y-auto">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-base font-bold text-gray-800 mt-4 mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold text-gray-800 mt-4 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-bold text-gray-700 mt-3 mb-1">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-800">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="space-y-1 mb-3 pl-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="space-y-2 mb-3 pl-2 list-decimal list-inside">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-gray-600 flex gap-2 items-start">
                  <span className="text-green-500 mt-0.5 shrink-0">•</span>
                  <span>{children}</span>
                </li>
              ),
            }}
          >
            {recommendation}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          {/* <div className="text-4xl mb-3">🤔</div> */}
          <p className="text-sm font-medium text-gray-500">No recommendations yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add courses to your semester plan then click "Get AI Advice"
          </p>
        </div>
      )}
    </div>
  );
}