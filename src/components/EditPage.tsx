'use client';

import { useState } from 'react';
import { Shot, StoryRequest } from '@/types';
import { generateVideo } from '@/lib/api';

interface EditPageProps {
  shots: Shot[];
  setShots: (shots: Shot[]) => void;
  characterImage: string;
  characterPrompt: string;
  storyData: StoryRequest;
  setVideos: (videos: string[]) => void;
  setCurrentPage: (page: 'preview') => void;
  onNext: () => void;
  onPageComplete: () => void;
}

export default function EditPage({
  shots,
  setShots,
  characterImage,
  characterPrompt,
  storyData,
  setVideos,
  setCurrentPage,
  onNext,
  onPageComplete
}: EditPageProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentGenerating, setCurrentGenerating] = useState<number | null>(null);

  const handleShotChange = (index: number, description: string) => {
    const newShots = [...shots];
    newShots[index].description = description;
    setShots(newShots);
  };

  const handleNext = async () => {
    if (shots.some(shot => !shot.description.trim())) {
      alert('请填写所有分镜头描述');
      return;
    }

    setLoading(true);
    const videoUrls: string[] = [];

    try {
      for (let i = 0; i < shots.length; i++) {
        setCurrentGenerating(i + 1);
        setProgress((i / shots.length) * 100);

        console.log(`Generating video ${i + 1}/${shots.length}...`);
        console.log('Prompt:', shots[i].description);
        console.log('Character Image URL:', characterImage);
        console.log('Resolution:', storyData.resolution);

        try {
          const videoUrl = await generateVideo(
            shots[i].description,
            characterImage,
            storyData.resolution
          );

          console.log(`Video ${i + 1} generated successfully:`, videoUrl);
          videoUrls.push(videoUrl);
        } catch (error) {
          console.error(`Failed to generate video ${i + 1}:`, error);
          // Push empty string to maintain array index
          videoUrls.push('');
          // Continue generating other videos instead of failing completely
        }
      }

      setProgress(100);
      console.log('All videos generated:', videoUrls);
      setVideos(videoUrls);

      setTimeout(() => {
        setLoading(false);
        onPageComplete();
        setCurrentPage('preview');
      }, 500);

    } catch (error) {
      console.error('Error generating videos:', error);
      setLoading(false);
      alert('视频生成失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-slide-up">
      <div className="glass-card">
        <h2 className="text-3xl font-bold text-glass-text mb-8 text-center">
          编辑分镜头脚本
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Character Image */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-glass-text">主角形象</h3>
            {characterImage ? (
              <div className="glass p-4 rounded-xl">
                <img
                  src={characterImage}
                  alt="角色形象"
                  className="w-full rounded-lg"
                />
                <p className="text-glass-text/60 text-sm mt-2">{characterPrompt}</p>
              </div>
            ) : (
              <div className="glass p-8 rounded-xl text-center">
                <p className="text-glass-text/60">角色图片加载中...</p>
              </div>
            )}
          </div>

          {/* Shot Scripts */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-glass-text">分镜头脚本</h3>
            <div className="space-y-3">
              {shots.map((shot, index) => (
                <div key={index} className="glass p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-glass-text font-semibold">
                      镜头 {shot.scene_number}
                    </label>
                    {loading && currentGenerating === index + 1 && (
                      <span className="text-sm text-blue-400">生成中...</span>
                    )}
                  </div>
                  <textarea
                    value={shot.description}
                    onChange={(e) => handleShotChange(index, e.target.value)}
                    className="glass-input w-full h-20 resize-none text-sm"
                    placeholder="请输入分镜头描述..."
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        {loading && (
          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-sm text-glass-text/80">
              <span>
                正在生成视频 {currentGenerating}/{shots.length}...
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-glass-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-glass-text/60 text-xs text-center">
              视频生成需要几分钟时间，请耐心等待...
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 glass p-4 rounded-xl">
          <h4 className="text-glass-text font-semibold mb-2">💡 编辑提示</h4>
          <ul className="text-glass-text/60 text-sm space-y-1">
            <li>• 描述要具体，包含场景、动作、情感等元素</li>
            <li>• 确保每个镜头之间的连贯性</li>
            <li>• 可以调整描述来控制视频生成效果</li>
          </ul>
        </div>

        {/* Next Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNext}
            disabled={loading || shots.some(shot => !shot.description.trim())}
            className="glass-button bg-gradient-to-r from-purple-500 to-blue-500 text-white px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '生成中...' : 'API 免费额度不够了😜'}
          </button>
        </div>
      </div>
    </div>
  );
}