'use client';

import { useState } from 'react';
import { downloadFile } from '@/lib/utils';

interface FinalPageProps {
  finalVideo: string;
  onPageComplete: () => void;
}

export default function FinalPage({
  finalVideo,
  onPageComplete
}: FinalPageProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!finalVideo) return;

    setDownloading(true);
    try {
      downloadFile(finalVideo, `mirage-ai-video-${Date.now()}.mp4`);
    } catch (error) {
      console.error('Download error:', error);
      alert('下载失败，请右键视频选择另存为');
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MirageAI生成的视频',
          text: '我用MirageAI创建了一个AI视频故事！',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up">
      <div className="glass-card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 animate-float">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-4xl font-bold text-glass-text mb-2">
            视频生成完成！
          </h2>
          <p className="text-glass-text/80">
            你的AI视频故事已经成功生成
          </p>
        </div>

        {/* Final Video */}
        <div className="glass p-6 rounded-xl mb-8">
          <div className="aspect-video mb-4">
            {finalVideo ? (
              <video
                src={finalVideo}
                controls
                autoPlay
                className="w-full h-full rounded-lg shadow-2xl"
              >
                您的浏览器不支持视频播放
              </video>
            ) : (
              <div className="w-full h-full bg-glass-bg/30 rounded-lg flex items-center justify-center">
                <p className="text-glass-text/60">视频加载中...</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              disabled={!finalVideo || downloading}
              className="glass-button bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading ? '下载中...' : '下载视频'}
            </button>

            <button
              onClick={handleShare}
              className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m9.032 4.026A9.001 9.001 0 012.968 7.326" />
              </svg>
              分享作品
            </button>

            <button
              onClick={() => window.location.reload()}
              className="glass-button px-8 py-3 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              创建新视频
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-glass-text mb-3">
              🎉 恭喜你！
            </h3>
            <p className="text-glass-text/60 text-sm leading-relaxed">
              你已成功使用MirageAI创建了一个独特的AI视频故事。通过先进的AI技术，
              你的创意被转化为了生动的视觉作品。
            </p>
          </div>

          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-glass-text mb-3">
              🚀 下一步
            </h3>
            <ul className="text-glass-text/60 text-sm space-y-2">
              <li>• 尝试不同的故事梗概和风格</li>
              <li>• 调整视频参数获得不同效果</li>
              <li>• 分享你的作品给朋友</li>
              <li>• 探索更多AI创作可能</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-glass-border text-center">
          <p className="text-glass-text/60 text-sm">
            由 <span className="font-semibold">MirageAI</span> 强力驱动
          </p>
          <p className="text-glass-text/40 text-xs mt-2">
            让AI为你的创意插上翅膀
          </p>
        </div>
      </div>
    </div>
  );
}