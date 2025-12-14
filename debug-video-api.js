// 专门测试视频生成API的调试脚本
const API_KEY = 'sk-9c890ab0335e4c07b3b2f78dc34acd93';
const BASE_URL = 'https://dashscope.aliyuncs.com';

async function testVideoGeneration() {
  console.log('\n🎬 Testing wan2.5-i2v-preview API...\n');

  // 使用一个测试图片URL（可以是之前生成的图片）
  const testImageUrl = 'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=Test+Image';
  const prompt = '一个少年在雨夜中奔跑';

  // 步骤1：创建视频生成任务
  console.log('1. 创建视频生成任务...');
  const response = await fetch(`${BASE_URL}/api/v1/services/aigc/video-generation/video-synthesis`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    },
    body: JSON.stringify({
      model: 'wan2.5-i2v-preview',
      input: {
        prompt: prompt,
        img_url: testImageUrl
      },
      parameters: {
        resolution: '480P',
        duration: 5,
        audio: true
      }
    })
  });

  const data = await response.text();
  console.log('\n任务创建响应:');
  console.log('状态:', response.status, response.statusText);

  try {
    const jsonData = JSON.parse(data);
    console.log('响应数据:', JSON.stringify(jsonData, null, 2));

    if (response.ok && jsonData.output?.task_id) {
      const taskId = jsonData.output.task_id;
      console.log('\n✅ 任务创建成功，Task ID:', taskId);

      // 步骤2：轮询查询结果
      console.log('\n2. 开始轮询查询结果...');
      await pollVideoResult(taskId);
    } else {
      console.log('❌ 任务创建失败');
    }
  } catch (e) {
    console.log('❌ 解析响应失败');
    console.log('原始响应:', data);
  }
}

async function pollVideoResult(taskId) {
  let attempts = 0;
  const maxAttempts = 12; // 最多查询12次（2分钟）

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;

    console.log(`\n--- 第 ${attempts} 次查询 ---`);

    const response = await fetch(`${BASE_URL}/api/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('状态:', result.output?.task_status || result.task_status);
      console.log('提交时间:', result.output?.submit_time);

      // 打印完整的响应结构（第一次）
      if (attempts === 1) {
        console.log('\n完整响应结构:');
        console.log(JSON.stringify(result, null, 2));
      }

      const taskStatus = result.output?.task_status || result.task_status;

      if (taskStatus === 'SUCCEEDED') {
        console.log('\n✅ 视频生成成功!');
        const videoUrl = result.output?.results?.[0]?.url || result.results?.[0]?.url;
        console.log('视频URL:', videoUrl);
        return;
      } else if (taskStatus === 'FAILED') {
        console.log('\n❌ 视频生成失败');
        console.log('错误信息:', result.message || result.output?.message);
        return;
      } else if (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
        console.log(`状态: ${taskStatus}，继续等待...`);
      } else {
        console.log('未知状态:', taskStatus);
      }
    } else {
      console.log('查询失败:', response.status, response.statusText);
    }
  }

  console.log('\n⏰ 查询超时');
}

// 运行测试
testVideoGeneration().catch(console.error);