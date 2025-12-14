import { NextRequest, NextResponse } from 'next/server';
import { TEST_MODE, mockShotsAndCharacter } from '../test-mode';

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode';

export async function POST(request: NextRequest) {
  try {
    const { story } = await request.json();

    if (!story) {
      return NextResponse.json(
        { error: 'Story is required' },
        { status: 400 }
      );
    }

    // Test mode - return mock data
    if (TEST_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json(mockShotsAndCharacter);
    }

    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3-max',
        messages: [
          {
            role: 'system',
            content: '你是一个影视编剧助手��请根据用户提供的故事梗概，生成恰好只有一个主角，没有别的人物的4个剧情连贯的分镜头脚本（字段：scene_number, description）和一个主角描述词（主角描述词必须优先描述图片为白色背景，全身照，字段：character_prompt）。输出必须是严格JSON格式，包含shots数组和character_prompt字符串。'
          },
          {
            role: 'user',
            content: story
          }
        ],
        response_format: { 'type': 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: `${BASE_URL}/v1/chat/completions`,
        errorBody: errorData,
        headers: {
          'Authorization': API_KEY ? '[Present]' : '[Missing]',
          'Content-Type': 'application/json'
        }
      });
      return NextResponse.json(
        {
          error: 'Failed to generate shots and character',
          details: errorData,
          status: response.status,
          url: `${BASE_URL}/v1/chat/completions`
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}