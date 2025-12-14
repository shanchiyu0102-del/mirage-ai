import { NextRequest, NextResponse } from 'next/server';
import { TEST_MODE, mockImageUrl } from '../test-mode';

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL = 'https://dashscope.aliyuncs.com';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Test mode - return mock data
    if (TEST_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      return NextResponse.json({ imageUrl: mockImageUrl });
    }

    const response = await fetch(`${BASE_URL}/api/v1/services/aigc/text2image/image-synthesis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wan2.5-t2i-preview',
        input: { prompt },
        parameters: {
          size: '720*1280',
          n: 1  // 明确指定只生成1张图片
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image', details: errorData },
        { status: response.status }
      );
    }

    const taskData = await response.json();
    const taskId = taskData.output.task_id;

    // Start polling for result
    const pollForResult = async (): Promise<string> => {
      let attempts = 0;
      const maxAttempts = 60; // 10 minutes with 10s intervals

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000));

        const resultResponse = await fetch(`${BASE_URL}/api/v1/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        });

        if (resultResponse.ok) {
          const result = await resultResponse.json();

          // 检查嵌套在 output 中的 task_status
          const taskStatus = result.output?.task_status || result.task_status;

          if (taskStatus === 'SUCCEEDED') {
            // 结果可能在 output.results 或 results 中
            return result.output?.results?.[0]?.url || result.results?.[0]?.url;
          } else if (taskStatus === 'FAILED') {
            throw new Error('Image generation failed');
          }
        }

        attempts++;
      }

      throw new Error('Image generation timeout');
    };

    const imageUrl = await pollForResult();

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}