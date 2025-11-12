const WebSocket = require('ws');

// 测试实时语音识别WebSocket连接
async function testRealtimeVoiceAPI() {
    console.log('🚀 开始测试实时语音识别API...');

    const wsUrl = 'ws://localhost:3000/api/ai/voice/realtime';

    try {
        const ws = new WebSocket(wsUrl);

        ws.on('open', () => {
            console.log('✅ WebSocket连接成功建立');

            // 发送测试音频数据（模拟）
            const testAudio = Buffer.from('test audio data');
            ws.send(JSON.stringify({
                type: 'audio',
                data: testAudio.toString('base64')
            }));

            // 发送结束标记
            setTimeout(() => {
                ws.send(JSON.stringify({ type: 'end' }));
                console.log('📤 发送结束标记');
            }, 2000);
        });

        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            console.log('📥 收到消息:', message);

            if (message.type === 'transcription') {
                console.log('🎯 识别结果:', message.data);
            } else if (message.type === 'complete') {
                console.log('✅ 语音识别完成');
                ws.close();
            } else if (message.type === 'error') {
                console.error('❌ 识别错误:', message.data);
                ws.close();
            }
        });

        ws.on('error', (error) => {
            console.error('❌ WebSocket连接错误:', error.message);
        });

        ws.on('close', (code, reason) => {
            console.log('🔌 WebSocket连接关闭:', code, reason.toString());
        });

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 测试语音识别REST API
async function testVoiceRecognitionAPI() {
    console.log('\n🚀 开始测试语音识别REST API...');

    const url = 'http://localhost:3000/api/ai/voice/transcribe';

    try {
        // 这里应该发送真实的音频数据，但为了测试我们发送一个模拟请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audioData: 'test_base64_audio_data',
                audioFormat: 'wav',
                language: 'zh_cn'
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ REST API响应:', result);
        } else {
            console.error('❌ REST API错误:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ REST API测试失败:', error.message);
    }
}

// 运行测试
async function runTests() {
    console.log('🎯 AI语音API功能测试\n');

    // 测试实时语音识别
    await testRealtimeVoiceAPI();

    // 等待一段时间再测试REST API
    setTimeout(async () => {
        await testVoiceRecognitionAPI();
    }, 3000);
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testRealtimeVoiceAPI,
    testVoiceRecognitionAPI,
    runTests
};