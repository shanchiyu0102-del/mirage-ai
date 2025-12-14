'use client';

import { useState, useEffect } from 'react';
import { mergeVideos } from '@/lib/api';

interface PreviewPageProps {
  videos: string[];
  setFinalVideo: (url: string) => void;
  onNext: () => void;
  onPageComplete: () => void;
}

export default function PreviewPage({
  videos,
  setFinalVideo,
  onNext,
  onPageComplete
}: PreviewPageProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [videoStatus, setVideoStatus] = useState<{ [key: number]: 'loading' | 'loaded' | 'error' }>({});

  // 使用代理来绕过CORS
  const getProxyUrl = (url: string) => {
    return `/api/video-proxy?url=${encodeURIComponent(url)}`;
  };

  // Debug: Log videos when component mounts or updates
  useEffect(() => {
    console.log('PreviewPage - Videos received:', videos);
    console.log('PreviewPage - Videos length:', videos.length);
    videos.forEach((video, index) => {
      console.log(`PreviewPage - Videos[${index}]:`, video);
      console.log(`PreviewPage - Videos[${index}] type:`, typeof video);
      console.log(`PreviewPage - Videos[${index}] is empty:`, video === '');
    });
  }, [videos]);

  const handleNext = async () => {
    setLoading(true);
    setProgress(10);

    try {
      // 过滤掉空的视频URL
      const validVideos = videos.filter(video => video && video !== '');

      if (validVideos.length === 0) {
        throw new Error('没有有效的视频可以合并');
      }

      console.log('Starting video merge with valid videos:', validVideos.length);

      // 使用真实的视频合并API
      const mergedVideoUrl = await mergeVideos(validVideos, '480P');

      // 更新进度
      for (let i = 20; i <= 90; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setFinalVideo(mergedVideoUrl);
      setProgress(100);

      onPageComplete();
      setTimeout(() => {
        setLoading(false);
        onNext();
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      alert(`视频合并失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const getVideoDimensions = () => {
    // Adjust dimensions based on video resolution
    return { width: '100%', maxWidth: '800px', height: 'auto' };
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-slide-up">
      <div className="glass-card">
        <h2 className="text-3xl font-bold text-glass-text mb-8 text-center">
          分镜头视频预览
        </h2>

        {/* Main Preview */}
        <div className="mb-8">
          <div className="glass p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-glass-text mb-4">
              镜头 {selectedVideo + 1} 预览
            </h3>
            <div className="flex justify-center">
              {videos[selectedVideo] && videos[selectedVideo] !== '' ? (
                <video
                  key={videos[selectedVideo]} // Use URL as key to force reload
                  src={getProxyUrl(videos[selectedVideo])}
                  controls
                  muted
                  autoPlay
                  loop
                  style={getVideoDimensions()}
                  className="rounded-lg shadow-xl"
                  onLoadStart={() => {
                    setVideoStatus(prev => ({ ...prev, [selectedVideo]: 'loading' }));
                  }}
                  onCanPlay={() => {
                    setVideoStatus(prev => ({ ...prev, [selectedVideo]: 'loaded' }));
                  }}
                  onError={(e) => {
                    console.error(`Video ${selectedVideo + 1} load error:`, e);
                    console.error(`Failed URL:`, videos[selectedVideo]);
                    setVideoStatus(prev => ({ ...prev, [selectedVideo]: 'error' }));

                    const video = e.currentTarget;

                    // 如果代理失败，尝试原始URL
                    if (video.src.includes('/api/video-proxy')) {
                      console.log('Trying original URL...');
                      video.src = videos[selectedVideo];
                      video.load(); // 重新加载
                    } else {
                      // 原始URL也失败，显示错误
                      video.style.display = 'none';
                      const parent = video.parentElement;
                      if (parent) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'w-full h-96 bg-glass-bg/30 rounded-lg flex items-center justify-center';
                        errorDiv.innerHTML = '<p class="text-glass-text/60">视频无法加载</p>';
                        parent.appendChild(errorDiv);
                      }
                    }
                  }}
                >
                  您的浏览器不支持视频播放
                </video>
              ) : (
                <div className="w-full h-96 bg-glass-bg/30 rounded-lg flex items-center justify-center">
                  <p className="text-glass-text/60">
                    {videos[selectedVideo] === '' ? '视频生成失败' : '视频加载中...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Thumbnails */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-glass-text">所有镜头</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <button
                key={index}
                onClick={() => setSelectedVideo(index)}
                disabled={!video}
                className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                  selectedVideo === index
                    ? 'ring-2 ring-blue-400 scale-105'
                    : 'hover:scale-105'
                } ${!video ? 'opacity-50' : ''}`}
              >
                <div className="aspect-video bg-glass-bg/30">
                  {video && video !== '' ? (
                    <video
                      src={getProxyUrl(video)}
                      muted
                      className="w-full h-full object-cover"
                      onMouseEnter={(e) => {
                        e.currentTarget.play().catch(err => {
                          console.error('Video play error:', err);
                        });
                      }}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                      onError={(e) => {
                        // 静默处理缩略图错误
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.thumbnail-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'thumbnail-placeholder w-full h-full flex items-center justify-center';
                          placeholder.innerHTML = '<span class="text-glass-text/40 text-xs">视频预览</span>';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={`text-xs ${
                        video === '' ? 'text-red-400' :
                        videoStatus[index] === 'error' ? 'text-red-400' :
                        'text-glass-text/60'
                      }`}>
                        {video === '' ? '生成失败' :
                         videoStatus[index] === 'error' ? '加载失败' :
                         loading ? '生成中...' : '等待中'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-sm font-semibold">
                    镜头 {index + 1}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        {loading && (
          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-sm text-glass-text/80">
              <span>正在合并视频...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-glass-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-glass-text/60 text-xs text-center">
              ���在将分镜头合并为一个完整视频...
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 glass p-4 rounded-xl">
          <h4 className="text-glass-text font-semibold mb-2">💡 预览提示</h4>
          <ul className="text-glass-text/60 text-sm space-y-1">
            <li>• 点击下方缩略图切换预览不同镜头</li>
            <li>• 鼠标悬停在缩略图上可预览视频</li>
            <li>• 所有视频均采用统一的角色形象，确保一致性</li>
          </ul>
        </div>

        {/* Next Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNext}
            disabled={loading || videos.some(v => !v)}
            className="glass-button bg-gradient-to-r from-purple-500 to-blue-500 text-white px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '合并中...' : '生成最终视频'}
          </button>
        </div>
      </div>
    </div>
  );
}