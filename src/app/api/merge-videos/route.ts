import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

// 常见的FFmpeg安装路径
const FFMPEG_PATHS = [
  'ffmpeg',
  '/usr/local/bin/ffmpeg',
  '/opt/homebrew/bin/ffmpeg',
  '/opt/homebrew/Cellar/ffmpeg/*/bin/ffmpeg',
  '/usr/bin/ffmpeg',
  '/bin/ffmpeg',
  '/opt/ffmpeg/bin/ffmpeg'
];

// 查找FFmpeg可执行文件
async function findFFmpeg(): Promise<string | null> {
  for (const path of FFMPEG_PATHS) {
    try {
      if (path === 'ffmpeg') {
        // 尝试直接运行ffmpeg命令
        await execAsync('which ffmpeg');
        await execAsync('ffmpeg -version');
        return 'ffmpeg';
      } else if (path.includes('*')) {
        // 处理通配符路径（如Cellar路径）
        const { stdout } = await execAsync(`ls -d ${path} 2>/dev/null | head -1`);
        if (stdout.trim()) {
          await execAsync(`"${stdout.trim()}" -version`);
          return stdout.trim();
        }
      } else {
        // 检查具体路径
        if (existsSync(path)) {
          await execAsync(`"${path}" -version`);
          return path;
        }
      }
    } catch (error) {
      continue;
    }
  }
  return null;
}

// 临时文件目录
const TEMP_DIR = join(process.cwd(), 'temp');
const OUTPUT_DIR = join(process.cwd(), 'public', 'merged-videos');

// 确保目录存在
async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

// 清理临时文件
async function cleanup(files: string[]) {
  for (const file of files) {
    try {
      await unlink(file);
    } catch (error) {
      console.error('Failed to delete temp file:', file, error);
    }
  }
}

// 下载视频到临时文件
async function downloadVideo(url: string, filename: string): Promise<string> {
  console.log(`Attempting to download video from: ${url.substring(0, 100)}...`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': '*/*',
      'Origin': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  });

  if (!response.ok) {
    console.error(`Download failed for ${filename}: ${response.status} ${response.statusText}`);

    // 如果是403 (CORS/Forbidden)，尝试直接返回URL而不下载
    if (response.status === 403) {
      console.log('CORS/403 error detected, will use URL directly');
      // 返回特殊标记，表示使用原始URL
      throw new Error(`CORS_BLOCKED:${url}`);
    }

    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const filePath = join(TEMP_DIR, filename);
  await writeFile(filePath, Buffer.from(buffer));

  return filePath;
}

// 检查FFmpeg是否可用
async function checkFFmpeg(): Promise<{ available: boolean; path: string | null }> {
  try {
    const ffmpegPath = await findFFmpeg();
    if (ffmpegPath) {
      console.log(`FFmpeg found at: ${ffmpegPath}`);
      return { available: true, path: ffmpegPath };
    }
    console.error('FFmpeg not found in any location');
    return { available: false, path: null };
  } catch (error) {
    console.error('Error checking FFmpeg:', error);
    return { available: false, path: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrls, resolution = '480P' } = await request.json();

    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      return NextResponse.json(
        { error: 'Video URLs are required' },
        { status: 400 }
      );
    }

    // 过滤掉空URL
    const validVideos = videoUrls.filter(url => url && url.trim() !== '');

    if (validVideos.length === 0) {
      return NextResponse.json(
        { error: 'No valid video URLs provided' },
        { status: 400 }
      );
    }

    // 检查FFmpeg是否可用
    const ffmpegCheck = await checkFFmpeg();

    if (!ffmpegCheck.available) {
      console.log('FFmpeg not available, returning first video as fallback');
      // 如果FFmpeg不可用，返回第一个视频作为后备
      return NextResponse.json({
        mergedVideoUrl: validVideos[0],
        message: 'FFmpeg not available, returning first video'
      });
    }

    const ffmpegPath = ffmpegCheck.path!;

    // 确保目录存在
    await ensureDir(TEMP_DIR);
    await ensureDir(OUTPUT_DIR);

    const tempFiles: string[] = [];
    const videoFiles: string[] = [];

    try {
      // 下载所有视频
      console.log('Downloading videos...');
      const downloadableVideos: string[] = [];
      const corsBlockedVideos: string[] = [];

      for (let i = 0; i < validVideos.length; i++) {
        const url = validVideos[i];
        const filename = `video_${Date.now()}_${i}.mp4`;

        try {
          const filePath = await downloadVideo(url, filename);
          tempFiles.push(filePath);
          videoFiles.push(filePath);
          downloadableVideos.push(url);
        } catch (error: any) {
          if (error.message.startsWith('CORS_BLOCKED:')) {
            console.log(`Video ${i + 1} blocked by CORS, will handle separately`);
            corsBlockedVideos.push(error.message.split(':')[1]);
          } else {
            throw error;
          }
        }
      }

      // 如果有CORS阻塞的视频，使用不同的处理方式
      if (corsBlockedVideos.length > 0) {
        console.log(`${corsBlockedVideos.length} videos blocked by CORS`);

        // 如果所有视频都被CORS阻塞，返回第一个视频
        if (downloadableVideos.length === 0) {
          console.log('All videos blocked by CORS, returning first video');
          return NextResponse.json({
            mergedVideoUrl: validVideos[0],
            message: 'All videos blocked by CORS, returning first video'
          });
        }

        // 如果部分视频可以下载，只合并可下载的
        if (downloadableVideos.length === 1) {
          console.log('Only one video downloadable, returning it');
          // 清理临时文件
          await cleanup(tempFiles);
          return NextResponse.json({
            mergedVideoUrl: downloadableVideos[0],
            message: 'Only one video downloadable'
          });
        }
      }

      // 创建合并后的文件名
      const outputFileName = `merged_${Date.now()}.mp4`;
      const outputFilePath = join(OUTPUT_DIR, outputFileName);

      // 创建视频列表文件
      const listFilePath = join(TEMP_DIR, `list_${Date.now()}.txt`);
      const listContent = videoFiles.map(file => `file '${file}'`).join('\n');
      await writeFile(listFilePath, listContent);
      tempFiles.push(listFilePath);

      // 使用FFmpeg合并视频
      console.log('Merging videos using FFmpeg at:', ffmpegPath);
      const ffmpegCommand = `"${ffmpegPath}" -f concat -safe 0 -i "${listFilePath}" -c copy "${outputFilePath}"`;

      const { stdout, stderr } = await execAsync(ffmpegCommand);

      if (stderr && !stderr.includes('deprecated')) {
        console.error('FFmpeg stderr:', stderr);
      }

      // 检查输出文件是否创建成功
      if (!existsSync(outputFilePath)) {
        throw new Error('Failed to create merged video file');
      }

      // 返回合并后的视频URL
      const mergedVideoUrl = `/merged-videos/${outputFileName}`;

      console.log('Videos merged successfully:', mergedVideoUrl);

      // 异步清理临时文件
      cleanup(tempFiles).catch(error => {
        console.error('Cleanup error:', error);
      });

      return NextResponse.json({
        mergedVideoUrl,
        message: 'Videos merged successfully'
      });

    } catch (error) {
      // 清理临时文件
      await cleanup(tempFiles);
      throw error;
    }

  } catch (error) {
    console.error('Video merge error:', error);

    // 返回第一个视频作为后备
    const videoUrls = request.body?.videoUrls || [];
    const firstVideo = videoUrls.find((url: string) => url && url.trim() !== '');

    if (firstVideo) {
      console.log('Returning first video as fallback');
      return NextResponse.json({
        mergedVideoUrl: firstVideo,
        message: 'Merge failed, returning first video',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to merge videos',
        message: 'No fallback video available'
      },
      { status: 500 }
    );
  }
}