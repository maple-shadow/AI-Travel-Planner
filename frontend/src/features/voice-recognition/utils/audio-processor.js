// AudioWorklet 处理器 - 用于实时音频处理
class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.port.onmessage = this.handleMessage.bind(this);
        this.isProcessing = false;
    }

    handleMessage(event) {
        const { type, data } = event.data;

        if (type === 'start') {
            this.isProcessing = true;
        } else if (type === 'stop') {
            this.isProcessing = false;
        }
    }

    process(inputs, outputs, parameters) {
        if (!this.isProcessing) {
            return true;
        }

        const input = inputs[0];
        if (input && input.length > 0) {
            const inputData = input[0]; // 获取第一个通道的数据

            // 添加调试信息
            if (inputData && inputData.length > 0) {
                console.log(`[AudioWorklet] 接收到音频数据，长度: ${inputData.length}, 第一个样本值: ${inputData[0]}`);
            }

            // 将浮点音频数据转换为16位PCM格式
            const pcmData = this.float32ToPCM(inputData);

            // 发送处理后的音频数据到主线程
            this.port.postMessage({
                type: 'audioData',
                data: pcmData,
                sampleRate: 16000
            });

            // 添加调试信息
            if (pcmData && pcmData.length > 0) {
                console.log(`[AudioWorklet] 发送PCM数据，长度: ${pcmData.length} bytes`);
            }
        } else {
            console.log('[AudioWorklet] 没有接收到音频数据');
        }

        return true;
    }

    // 将浮点音频数据转换为16位PCM格式
    float32ToPCM(float32Array) {
        const buffer = new ArrayBuffer(float32Array.length * 2);
        const view = new DataView(buffer);

        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        return new Uint8Array(buffer);
    }
}

registerProcessor('audio-processor', AudioProcessor);