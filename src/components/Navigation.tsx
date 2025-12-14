'use client';

import { Page } from '@/types';
import { cn } from '@/lib/utils';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  completedPages: Page[];
}

const pageConfig = {
  story: { name: '故事梗概', icon: '📝' },
  edit: { name: '分镜头编辑', icon: '✂️' },
  preview: { name: '视频预览', icon: '🎬' },
  final: { name: '完成', icon: '✨' },
};

export default function Navigation({ currentPage, onNavigate, completedPages }: NavigationProps) {
  const pages: Page[] = ['story', 'edit', 'preview', 'final'];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl font-bold text-glass-text">MirageAI</h1>
        </div>

        <div className="hidden md:flex items-center space-x-1">
          {pages.map((page) => {
            const config = pageConfig[page];
            const isCompleted = completedPages.includes(page);
            const isCurrent = currentPage === page;
            const canNavigate = isCompleted || page === 'story' ||
                              (pages.indexOf(page) <= pages.indexOf(currentPage));

            return (
              <button
                key={page}
                onClick={() => canNavigate && onNavigate(page)}
                disabled={!canNavigate}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300",
                  isCurrent && "bg-glass-bg/30 text-glass-text",
                  isCompleted && !isCurrent && "text-glass-text/70 hover:text-glass-text hover:bg-glass-bg/20",
                  !canNavigate && "text-glass-text/30 cursor-not-allowed"
                )}
              >
                <span>{config.icon}</span>
                <span className="hidden lg:inline">{config.name}</span>
                {isCompleted && (
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="flex items-center space-x-2">
            {pages.map((page) => {
              const config = pageConfig[page];
              const isCompleted = completedPages.includes(page);
              const isCurrent = currentPage === page;

              return (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300",
                    isCurrent && "bg-glass-bg/30 text-glass-text",
                    isCompleted && !isCurrent && "text-glass-text/70",
                    !isCompleted && !isCurrent && "text-glass-text/30"
                  )}
                >
                  {config.icon}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}