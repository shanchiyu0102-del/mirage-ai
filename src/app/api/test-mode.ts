// Test mode flag - set to true when API key is not available
export const TEST_MODE = !process.env.DASHSCOPE_API_KEY ||
                        process.env.DASHSCOPE_API_KEY === 'sk-test' ||
                        process.env.DASHSCOPE_API_KEY.includes('your_api_key_here');

// Mock responses for testing
export const mockShotsAndCharacter = {
  shots: [
    { scene_number: 1, description: "雨夜中的街道，一个少年在奔跑，雨水打湿了他的头发" },
    { scene_number: 2, description: "少年在一栋旧楼前停下，抬头凝视着二楼亮灯的窗户" },
    { scene_number: 3, description: "少年冲进楼内，在昏暗的楼梯间快速攀爬" },
    { scene_number: 4, description: "少年推开房门，看到妹妹安然无恙地在房间里" }
  ],
  character_prompt: "一个16岁的少年，黑色短发，眼神坚定，穿着雨衣和牛仔裤"
};

export const mockImageUrl = "https://via.placeholder.com/800x600/4A5568/FFFFFF?text=Character+Image";

export const mockVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

