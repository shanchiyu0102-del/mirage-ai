import { NextRequest, NextResponse } from 'next/server';
import { TEST_MODE, mockVideoUrl } from '../test-mode';

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL = 'https://dashscope.aliyuncs.com';

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageUrl, resolution = '480P' } = await request.json();

    console.log('generate-video API called:', { prompt, imageUrl, resolution });

    if (!prompt || !imageUrl) {
      return NextResponse.json(
        { error: 'Prompt and imageUrl are required' },
        { status: 400 }
      );
    }

    // Test mode - return mock data
    if (TEST_MODE) {
      console.log('TEST_MODE is true, API_KEY:', API_KEY ? 'present' : 'missing');
      // Simulate API delay (shorter for testing)
      await new Promise(resolve => setTimeout(resolve, 5000));
      const result = NextResponse.json({ videoUrl: mockVideoUrl });
      console.log('Returning mock response:', { videoUrl: mockVideoUrl });
      return result;
    }

    const response = await fetch(`${BASE_URL}/api/v1/services/aigc/video-generation/video-synthesis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wanx2.1-i2v-turbo',
        input: {
          prompt,
          img_url: imageUrl
        },
        parameters: {
          resolution: resolution || '480P',  // 确保有默认值
          duration: 5,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate video', details: errorData },
        { status: response.status }
      );
    }

    const taskData = await response.json();
    const taskId = taskData.output.task_id;

    // Start polling for result
    const pollForResult = async (): Promise<string> => {
      let attempts = 0;
      const maxAttempts = 120; // 20 minutes with 10s intervals

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000));

        const resultResponse = await fetch(`${BASE_URL}/api/v1/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        });

        if (resultResponse.ok) {
          const result = await resultResponse.json();
          console.log('Poll result attempt', attempts + 1, ':', JSON.stringify(result, null, 2));

          // 检查嵌套在 output 中的 task_status
          const taskStatus = result.output?.task_status || result.task_status;
          console.log('Task status:', taskStatus);

          if (taskStatus === 'SUCCEEDED') {
            // 尝试多种可能的路径
            const possibleUrls = [
              result.output?.results?.[0]?.url,
              result.results?.[0]?.url,
              result.output?.result?.url,
              result.result?.url,
              result.output?.video_url,
              result.video_url
            ];

            console.log('Possible URLs found:', possibleUrls);

            const videoUrl = possibleUrls.find(url => url && typeof url === 'string');

            if (videoUrl) {
              console.log('Found video URL:', videoUrl);
              // Decode URL-encoded characters
              const decodedUrl = decodeURIComponent(videoUrl);
              console.log('Decoded URL:', decodedUrl);
              return decodedUrl;
            } else {
              console.error('No valid video URL found in response');
              console.log('Response structure:', {
                output: result.output,
                results: result.results,
                result: result.result,
                video_url: result.video_url
              });
            }
          } else if (taskStatus === 'FAILED') {
            console.error('Task failed:', result);
            throw new Error('Video generation failed');
          }
        }

        attempts++;
      }

      throw new Error('Video generation timeout');
    };

    const videoUrl = await pollForResult();

    console.log('Video generation successful, returning URL:', videoUrl);
    return NextResponse.json({ videoUrl });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}