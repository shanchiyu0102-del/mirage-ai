import { NextRequest, NextResponse } from 'next/server';

// 代理视频请求，绕过CORS
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json(
      { error: 'Video URL is required' },
      { status: 400 }
    );
  }

  try {
    console.log(`Proxying video: ${videoUrl.substring(0, 100)}...`);

    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity', // 避免压缩
        'Range': request.headers.get('range') || ''
      }
    });

    if (!response.ok) {
      console.error(`Proxy error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.statusText}` },
        { status: response.status }
      );
    }

    // 获取视频内容类型
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    // 创建新的响应
    const videoBuffer = await response.arrayBuffer();

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Cache-Control': 'public, max-age=3600'
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }
    if (contentRange) {
      headers['Content-Range'] = contentRange;
    }
    if (acceptRanges) {
      headers['Accept-Ranges'] = acceptRanges;
    }

    return new NextResponse(videoBuffer, {
      status: response.status,
      headers
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy video' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    }
  });
}