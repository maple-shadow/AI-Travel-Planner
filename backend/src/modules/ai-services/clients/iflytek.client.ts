import { AIError } from '../types/ai.types';

/**
 * 科大讯飞AI客户端
 * 用于调用科大讯飞语音识别和语音合成服务
 */
export class IflytekAIClient {
    private config: {
        appId: string;
        apiKey: string;
        apiSecret: string;
    };

    constructor(config: { appId: string; apiKey: string; apiSecret: string }) {
        this.config = config;
    }

    /**
     * 获取访问令牌
     */
    private async getAccessToken(): Promise<string> {
        try {
            const response = await fetch('https://openapi-v2.iflytek.com/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    appid: this.config.appId,
                    api_key: this.config.apiKey,
                    api_secret: this.config.apiSecret,
                }),
            });

            if (!response.ok) {
                throw new Error(`获取访问令牌失败: ${response.status}`);
            }

            const data = await response.json();

            if (data.code !== 0) {
                throw new Error(`科大讯飞API错误: ${data.message}`);
            }

            return data.access_token;
        } catch (error) {
            const aiError: AIError = {
                code: 'IFLYTEK_TOKEN_ERROR',
                message: error instanceof Error ? error.message : '获取访问令牌失败',
                details: error
            };
            throw aiError;
        }
    }

    /**
     * 语音识别（语音转文本）
     */
    async speechToText(audioData: Buffer, format: string = 'wav'): Promise<string> {
        try {
            const accessToken = await this.getAccessToken();

            const response = await fetch('https://iat-api.xfyun.cn/v2/iat', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    common: {
                        app_id: this.config.appId
                    },
                    business: {
                        language: 'zh_cn',
                        domain: 'iat',
                        accent: 'mandarin',
                        vad_eos: 10000,
                        dtype: 'audio',
                        format: format
                    },
                    data: {
                        status: 2,
                        format: 'audio/L16;rate=16000',
                        audio: audioData.toString('base64') as string,
                        encoding: 'raw'
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`语音识别API调用失败: ${response.status}`);
            }

            const data = await response.json();

            if (data.code !== 0) {
                throw new Error(`科大讯飞语音识别错误: ${data.message}`);
            }

            // 解析识别结果
            let resultText = '';
            if (data.data && data.data.result) {
                const ws = data.data.result.ws;
                for (const w of ws) {
                    for (const cw of w.cw) {
                        resultText += cw.w;
                    }
                }
            }

            return resultText;
        } catch (error) {
            const aiError: AIError = {
                code: 'IFLYTEK_STT_ERROR',
                message: error instanceof Error ? error.message : '语音识别失败',
                details: error
            };
            throw aiError;
        }
    }

    /**
     * 语音合成（文本转语音）
     */
    async textToSpeech(text: string, voice: string = 'xiaoyan'): Promise<Buffer> {
        try {
            const accessToken = await this.getAccessToken();

            const response = await fetch('https://tts-api.xfyun.cn/v2/tts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    common: {
                        app_id: this.config.appId
                    },
                    business: {
                        aue: 'raw',
                        auf: 'audio/L16;rate=16000',
                        voice_name: voice,
                        speed: 50,
                        volume: 50,
                        pitch: 50,
                        bgs: 0,
                        tte: 'UTF8'
                    },
                    data: {
                        status: 2,
                        text: Buffer.from(text as string).toString('base64'),
                        encoding: 'base64'
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`语音合成API调用失败: ${response.status}`);
            }

            const data = await response.json();

            if (data.code !== 0) {
                throw new Error(`科大讯飞语音合成错误: ${data.message}`);
            }

            // 返回音频数据
            return Buffer.from(data.data.audio as string, 'base64');
        } catch (error) {
            const aiError: AIError = {
                code: 'IFLYTEK_TTS_ERROR',
                message: error instanceof Error ? error.message : '语音合成失败',
                details: error
            };
            throw aiError;
        }
    }

    /**
     * 检查服务状态
     */
    async checkHealth(): Promise<boolean> {
        try {
            await this.getAccessToken();
            return true;
        } catch {
            return false;
        }
    }
}

export default IflytekAIClient;