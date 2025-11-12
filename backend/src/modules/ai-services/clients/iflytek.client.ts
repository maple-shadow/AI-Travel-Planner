import { AIError } from '../types/ai.types';
import WebSocket from 'ws';
import crypto from 'crypto';
import { URLSearchParams } from 'url';

/**
 * 科大讯飞AI客户端
 * 使用WebSocket方式调用科大讯飞语音识别服务
 */
export class IflytekAIClient {
    private config: {
        appId: string;
        apiKey: string;
        apiSecret: string;
    };
    private ws: WebSocket | null = null;
    private isConnected = false;
    private sessionId: string | null = null;

    // 固定参数配置
    private readonly FIXED_PARAMS = {
        audio_encode: 'pcm_s16le',
        lang: 'autodialect',
        samplerate: '16000'
    };
    private readonly AUDIO_FRAME_SIZE = 1280; // 每帧音频字节数
    private readonly FRAME_INTERVAL_MS = 40;   // 每帧发送间隔
    private readonly BASE_WS_URL = 'wss://office-api-ast-dx.iflyaisol.com/ast/communicate/v1';

    constructor(config: { appId: string; apiKey: string; apiSecret: string }) {
        this.config = config;
    }

    /**
     * 验证配置
     */
    private validateConfig(): void {
        if (!this.config.appId || this.config.appId === 'your-iflytek-app-id') {
            throw new Error('科大讯飞AppID未配置');
        }
        if (!this.config.apiKey || this.config.apiKey === 'your-iflytek-api-key') {
            throw new Error('科大讯飞API Key未配置');
        }
        if (!this.config.apiSecret || this.config.apiSecret === 'your-iflytek-api-secret') {
            throw new Error('科大讯飞API Secret未配置');
        }
    }

    /**
     * 生成鉴权参数
     */
    private generateAuthParams(): Record<string, string> {
        const uuid = crypto.randomUUID().replace(/-/g, '');

        // 生成服务端要求的UTC时间格式：yyyy-MM-dd'T'HH:mm:ss+0800
        const now = new Date();
        const beijingOffset = 8 * 60; // 北京时区偏移量（分钟）
        const localOffset = now.getTimezoneOffset(); // 本地时区偏移量（分钟）
        const beijingTime = new Date(now.getTime() + (beijingOffset + localOffset) * 60 * 1000);

        const utc = beijingTime.toISOString()
            .replace('Z', '+0800')
            .replace(/\.\d{3}/, '');

        const authParams = {
            accessKeyId: this.config.apiKey,
            appId: this.config.appId,
            uuid: uuid,
            utc: utc,
            ...this.FIXED_PARAMS
        };

        // 计算签名：过滤空值 → 字典序排序 → URL编码 → 拼接基础字符串
        const sortedParams = Object.fromEntries(
            Object.entries(authParams)
                .filter(([_, v]) => v !== null && v !== undefined && String(v).trim() !== '')
                .sort(([a], [b]) => a.localeCompare(b))
        );

        // 使用Python版本的URL编码方式（包含空格替换为+）
        const baseStr = Object.entries(sortedParams)
            .map(([k, v]) => {
                const encodedKey = encodeURIComponent(k)
                    .replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
                    .replace(/%20/g, '+');
                const encodedValue = encodeURIComponent(v)
                    .replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
                    .replace(/%20/g, '+');
                return `${encodedKey}=${encodedValue}`;
            })
            .join('&');

        // HMAC-SHA1 加密 + Base64编码
        const signature = crypto
            .createHmac('sha1', this.config.apiSecret)
            .update(baseStr)
            .digest('base64');

        return {
            ...authParams,
            signature: signature
        };
    }

    /**
     * 获取访问令牌
     */
    private async getAccessToken(): Promise<string> {
        try {
            // 验证配置
            this.validateConfig();

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
     * 使用WebSocket方式调用科大讯飞实时语音识别API
     */
    async speechToText(audioData: Buffer, format: string = 'wav'): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                console.log('开始调用讯飞语音识别API，音频数据大小:', audioData.length, '字节');
                console.log('音频格式:', format);

                // 验证音频数据
                if (!audioData || audioData.length === 0) {
                    throw new Error('音频数据为空');
                }

                // 验证配置
                this.validateConfig();

                // 生成鉴权参数
                const authParams = this.generateAuthParams();
                const paramsStr = new URLSearchParams(authParams).toString();
                const wsUrl = `${this.BASE_WS_URL}?${paramsStr}`;

                console.log('建立WebSocket连接:', wsUrl);

                // 建立WebSocket连接
                this.ws = new WebSocket(wsUrl, {
                    handshakeTimeout: 15000, // 握手超时时间
                    perMessageDeflate: false, // 禁用压缩
                    origin: 'http://localhost:3000' // 设置origin头
                });
                let finalResult = '';
                let isFinal = false;

                this.ws.on('open', () => {
                    console.log('WebSocket连接已建立');
                    this.isConnected = true;

                    // 等待服务端初始化（模仿Python版本的行为）
                    setTimeout(() => {
                        console.log('服务端初始化完成，开始发送音频数据');
                        // 发送音频数据
                        this.sendAudioData(audioData);
                    }, 1500); // 等待1.5秒
                });

                this.ws.on('message', (data: Buffer) => {
                    try {
                        const message = JSON.parse(data.toString());
                        console.log('收到讯飞API消息:', message);

                        // 处理识别结果
                        if (message.msg_type === 'result') {
                            const transcript = this.extractTextFromResult(message.data);
                            if (transcript) {
                                finalResult += transcript;
                                console.log('识别结果:', transcript);
                            }
                        }

                        // 处理错误
                        if (message.msg_type === 'error') {
                            const errorMsg = `科大讯飞API错误: ${message.code || '未知'} - ${message.desc || '未知错误'}`;
                            console.error(errorMsg);
                            reject(new Error(errorMsg));
                        }

                        // 处理结束
                        if (message.msg_type === 'end') {
                            isFinal = true;
                            console.log('识别完成，最终结果:', finalResult);
                            resolve(finalResult);
                        }

                        // 更新会话ID
                        if (message.msg_type === 'action' && message.data?.sessionId) {
                            this.sessionId = message.data.sessionId;
                        }

                    } catch (parseError) {
                        console.error('解析讯飞API响应失败:', parseError);
                    }
                });

                this.ws.on('error', (error) => {
                    console.error('WebSocket连接错误:', error);
                    reject(new Error(`WebSocket连接失败: ${error.message}`));
                });

                this.ws.on('close', () => {
                    console.log('WebSocket连接已关闭');
                    this.isConnected = false;

                    // 如果连接关闭但还没有收到最终结果，返回当前结果
                    if (!isFinal && finalResult) {
                        console.log('连接关闭，返回当前识别结果:', finalResult);
                        resolve(finalResult);
                    } else if (!isFinal) {
                        reject(new Error('连接意外关闭，未收到识别结果'));
                    }
                });

                // 设置超时
                setTimeout(() => {
                    if (!isFinal) {
                        console.log('识别超时，返回当前结果:', finalResult);
                        if (finalResult) {
                            resolve(finalResult);
                        } else {
                            reject(new Error('语音识别超时'));
                        }
                    }
                }, 10000); // 10秒超时

            } catch (error) {
                console.error('讯飞语音识别失败:', error);
                const aiError: AIError = {
                    code: 'IFLYTEK_STT_ERROR',
                    message: error instanceof Error ? error.message : '语音识别失败',
                    details: error
                };
                reject(aiError);
            }
        });
    }

    /**
     * 发送音频数据
     */
    private sendAudioData(audioData: Buffer): void {
        if (!this.ws || !this.isConnected) {
            throw new Error('WebSocket未连接');
        }

        console.log('开始发送音频数据，总大小:', audioData.length, '字节');

        // 将音频数据分割成帧发送
        const frameSize = this.AUDIO_FRAME_SIZE;
        let offset = 0;

        const sendNextFrame = () => {
            if (offset >= audioData.length) {
                // 发送结束标记
                const endMsg = {
                    end: true,
                    ...(this.sessionId && { sessionId: this.sessionId })
                };
                this.ws?.send(JSON.stringify(endMsg));
                console.log('音频数据发送完成，发送结束标记');
                return;
            }

            const frame = audioData.slice(offset, offset + frameSize);
            this.ws?.send(frame);
            offset += frameSize;

            // 控制发送节奏
            setTimeout(sendNextFrame, this.FRAME_INTERVAL_MS);
        };

        sendNextFrame();
    }

    /**
     * 从识别结果中提取文本
     */
    private extractTextFromResult(data: any): string {
        try {
            let textParts: string[] = [];

            // 检查中文结果
            if (data.cn?.st?.rt) {
                for (const rtItem of data.cn.st.rt) {
                    if (rtItem.ws) {
                        for (const wsItem of rtItem.ws) {
                            if (wsItem.cw) {
                                for (const cwItem of wsItem.cw) {
                                    if (cwItem.w) {
                                        textParts.push(cwItem.w);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 尝试其他格式
            if (textParts.length === 0) {
                if (data.text) textParts.push(data.text);
                if (data.transcript) textParts.push(data.transcript);
            }

            return textParts.join('');
        } catch (error) {
            console.error('提取文本失败:', error);
            return '';
        }
    }

    /**
     * 关闭WebSocket连接
     */
    async close(): Promise<void> {
        if (this.isConnected && this.ws) {
            this.isConnected = false;
            try {
                this.ws.close();
                console.log('WebSocket连接已安全关闭');
            } catch (error) {
                console.error('关闭WebSocket连接时出错:', error);
            }
        }
    }

    /**
     * 语音合成（文本转语音）
     * 暂时不支持，返回空音频
     */
    async textToSpeech(text: string, voice: string = 'xiaoyan'): Promise<Buffer> {
        console.warn('科大讯飞语音合成功能暂未实现');
        // 返回空的音频数据
        return Buffer.from([]);
    }

    /**
     * 实时语音识别（WebSocket方式）
     */
    async realtimeSpeechToText(audioStream: AsyncIterable<Buffer>): Promise<AsyncIterable<string>> {
        const ws = await this.createWebSocketConnection();

        // 发送音频数据
        const sendAudio = async () => {
            let frameIndex = 0;
            const startTime = Date.now();

            for await (const audioChunk of audioStream) {
                if (audioChunk.length === 0) continue;

                // 精确控制发送节奏
                const expectedSendTime = startTime + (frameIndex * this.FRAME_INTERVAL_MS);
                const currentTime = Date.now();
                const timeDiff = expectedSendTime - currentTime;

                if (timeDiff > 1) {
                    await new Promise(resolve => setTimeout(resolve, timeDiff));
                }

                ws.send(audioChunk);
                frameIndex++;
            }

            // 发送结束标记
            const endMsg = JSON.stringify({ end: true });
            ws.send(endMsg);
        };

        // 接收识别结果
        const receiveResults = async function* (this: IflytekAIClient) {
            while (ws.readyState === WebSocket.OPEN) {
                try {
                    const message = await new Promise<string>((resolve, reject) => {
                        ws.once('message', resolve);
                        ws.once('error', reject);
                        ws.once('close', () => reject(new Error('WebSocket closed')));
                    });

                    const result = JSON.parse(message.toString());

                    if (result.msg_type === 'result' && result.data) {
                        const text = this.extractTextFromResult(result.data);
                        if (text) yield text;
                    } else if (result.msg_type === 'error') {
                        throw new Error(`科大讯飞API错误: ${result.code} - ${result.desc}`);
                    } else if (result.msg_type === 'end') {
                        break;
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : '未知错误';
                    if (errorMessage !== 'WebSocket closed') {
                        throw error;
                    }
                    break;
                }
            }
            ws.close();
        }.bind(this);

        // 并行执行发送和接收
        await Promise.all([
            sendAudio(),
            (async () => {
                for await (const text of receiveResults()) {
                    // 结果通过生成器返回
                }
            })()
        ]);

        return receiveResults();
    }

    /**
     * 创建WebSocket连接
     */
    private async createWebSocketConnection(): Promise<WebSocket> {
        const authParams = this.generateWebSocketAuthParams();
        const paramsStr = new URLSearchParams(authParams).toString();
        const wsUrl = `${this.BASE_WS_URL}?${paramsStr}`;

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(wsUrl);

            ws.on('open', () => resolve(ws));
            ws.on('error', reject);
            ws.on('close', (code, reason) => {
                reject(new Error(`WebSocket连接关闭: ${code} - ${reason}`));
            });

            // 设置超时
            setTimeout(() => reject(new Error('WebSocket连接超时')), 10000);
        });
    }

    /**
     * 生成WebSocket鉴权参数
     */
    private generateWebSocketAuthParams(): Record<string, string> {
        const timestamp = new Date().toISOString().replace(/\.\d+Z$/, '+0800');

        const params = {
            accessKeyId: this.config.apiKey,
            appId: this.config.appId,
            uuid: this.generateUUID(),
            utc: timestamp,
            audio_encode: 'pcm_s16le',
            lang: 'autodialect',
            samplerate: '16000'
        };

        // 计算签名
        const sortedParams = Object.fromEntries(
            Object.entries(params).sort(([a], [b]) => a.localeCompare(b))
        );

        const baseStr = Object.entries(sortedParams)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');

        const signature = require('crypto')
            .createHmac('sha1', this.config.apiSecret)
            .update(baseStr)
            .digest('base64');

        return { ...params, signature };
    }

    /**
     * 生成UUID
     */
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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