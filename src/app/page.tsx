'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import StoryPage from '@/components/StoryPage';
import EditPage from '@/components/EditPage';
import PreviewPage from '@/components/PreviewPage';
import FinalPage from '@/components/FinalPage';
import { Page, Shot, StoryRequest } from '@/types';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('story');
  const [completedPages, setCompletedPages] = useState<Page[]>([]);
  const [storyData, setStoryData] = useState<StoryRequest>({
    story_outline: '',
    video_ratio: '16:9',
    resolution: '480P',
    style: 'cyberpunk'
  });
  const [shots, setShots] = useState<Shot[]>([]);
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [characterImage, setCharacterImage] = useState('');
  const [videos, setVideos] = useState<string[]>([]);
  const [finalVideo, setFinalVideo] = useState('');

  const handlePageComplete = (page: Page) => {
    setCompletedPages(prev => {
      if (!prev.includes(page)) {
        return [...prev, page];
      }
      return prev;
    });
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'story':
        return (
          <StoryPage
            storyData={storyData}
            setStoryData={setStoryData}
            onNext={async () => {
              // Generate shots and character
              setCurrentPage('edit');
            }}
            setShots={setShots}
            setCharacterPrompt={setCharacterPrompt}
            setCharacterImage={setCharacterImage}
            onPageComplete={() => handlePageComplete('story')}
          />
        );
      case 'edit':
        return (
          <EditPage
            shots={shots}
            setShots={setShots}
            characterImage={characterImage}
            characterPrompt={characterPrompt}
            onNext={async () => {
              // Page navigation is handled inside EditPage after video generation
            }}
            setVideos={setVideos}
            setCurrentPage={setCurrentPage}
            storyData={storyData}
            onPageComplete={() => handlePageComplete('edit')}
          />
        );
      case 'preview':
        return (
          <PreviewPage
            videos={videos}
            onNext={async () => {
              // Merge videos
              setCurrentPage('final');
            }}
            setFinalVideo={setFinalVideo}
            onPageComplete={() => handlePageComplete('preview')}
          />
        );
      case 'final':
        return (
          <FinalPage
            finalVideo={finalVideo}
            onPageComplete={() => handlePageComplete('final')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        completedPages={completedPages}
      />
      <main className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}