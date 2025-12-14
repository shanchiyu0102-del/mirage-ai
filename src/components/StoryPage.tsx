'use client';

import { useState } from 'react';
import { Shot, StoryRequest } from '@/types';
import { generateShotsAndCharacter, generateCharacterImage } from '@/lib/api';

interface StoryPageProps {
  storyData: StoryRequest;
  setStoryData: (data: StoryRequest) => void;
  setShots: (shots: Shot[]) => void;
  setCharacterPrompt: (prompt: string) => void;
  setCharacterImage: (url: string) => void;
  onNext: () => void;
  onPageComplete: () => void;
}

const styleOptions = [
  { value: 'cyberpunk', label: '赛博朋克', icon: '🌃' },
  { value: 'pixar', label: '皮克斯', icon: '🎬' },
  { value: 'horror', label: '恐怖故事', icon: '👻' },
  { value: 'realistic', label: '写实', icon: '📷' },
  { value: 'chinese', label: '国风', icon: '🏮' },
  { value: 'anime', label: '动漫', icon: '🌸' },
];

export default function StoryPage({
  storyData,
  setStoryData,
  setShots,
  setCharacterPrompt,
  setCharacterImage,
  onNext,
  onPageComplete
}: StoryPageProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const stylePrompt = {
    cyberpunk: '赛博朋克风格，霓虹灯效果，未来科技感',
    pixar: '皮克斯动画风格，可爱卡通人物，鲜艳色彩',
    horror: '恐怖悬疑风格，阴暗色调，神秘氛围',
    realistic: '写实风格，真实感强，自然光影',
    chinese: '中国风水墨画风格，传统元素，古典韵味',
    anime: '日式动漫风格，大眼睛，精致线条'
  };

  const handleNext = async () => {
    if (!storyData.story_outline.trim()) {
      alert('请输入故事梗概');
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      // Step 1: Generate shots and character prompt
      setProgress(20);
      const response = await generateShotsAndCharacter(storyData.story_outline);
      setShots(response.shots);
      setCharacterPrompt(response.character_prompt);
      setProgress(50);

      // Step 2: Generate character image with style
      setProgress(60);
      const styledPrompt = `${response.character_prompt}，${stylePrompt[storyData.style]}`;
      const imageUrl = await generateCharacterImage(styledPrompt);
      setCharacterImage(imageUrl);
      setProgress(90);

      // Complete
      setProgress(100);
      onPageComplete();
      setTimeout(() => {
        setLoading(false);
        onNext();
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      alert('生成失败，请重试');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up">
      <div className="glass-card">
        <h2 className="text-3xl font-bold text-glass-text mb-8 text-center">
          开始创作你的AI视频故事
        </h2>

        <div className="space-y-6">
          {/* Story Input */}
          <div>
            <label className="block text-glass-text font-semibold mb-3">
              故事梗概
            </label>
            <textarea
              value={storyData.story_outline}
              onChange={(e) => setStoryData({ ...storyData, story_outline: e.target.value })}
              placeholder="请输入你的故事梗概，例如：一个少年在雨夜中奔跑，寻找失踪的妹妹..."
              className="glass-input w-full h-40 resize-none"
              disabled={loading}
            />
          </div>

          {/* Parameters */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Video Ratio */}
            <div>
              <label className="block text-glass-text font-semibold mb-3">
                视频比例
              </label>
              <div className="flex gap-2">
                {['16:9', '9:16'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setStoryData({ ...storyData, video_ratio: ratio as '16:9' | '9:16' })}
                    disabled={loading}
                    className={`flex-1 glass-button ${
                      storyData.video_ratio === ratio ? 'bg-glass-bg/30' : ''
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-glass-text font-semibold mb-3">
                视频分辨率
              </label>
              <div className="flex gap-2">
                {['480P', '720P'].map(res => (
                  <button
                    key={res}
                    onClick={() => setStoryData({ ...storyData, resolution: res as '480P' | '720P' })}
                    disabled={loading}
                    className={`flex-1 glass-button ${
                      storyData.resolution === res ? 'bg-glass-bg/30' : ''
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-glass-text font-semibold mb-3">
                画面风格
              </label>
              <select
                value={storyData.style}
                onChange={(e) => setStoryData({ ...storyData, style: e.target.value as any })}
                disabled={loading}
                className="glass-select w-full"
              >
                {styleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Style Preview */}
          <div className="glass p-4 rounded-xl">
            <p className="text-glass-text/80 text-sm">
              当前风格：{styleOptions.find(s => s.value === storyData.style)?.icon} {styleOptions.find(s => s.value === storyData.style)?.label}
            </p>
            <p className="text-glass-text/60 text-xs mt-1">
              {stylePrompt[storyData.style as keyof typeof stylePrompt]}
            </p>
          </div>

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-glass-text/80">
                <span>正在生成分镜头和主角图...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-glass-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleNext}
              disabled={loading || !storyData.story_outline.trim()}
              className="glass-button bg-gradient-to-r from-purple-500 to-blue-500 text-white px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '生成中...' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}