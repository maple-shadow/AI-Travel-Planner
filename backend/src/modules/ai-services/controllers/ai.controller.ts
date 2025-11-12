import { Request, Response } from 'express';
import { WebSocket } from 'ws';
import { AITripService } from '../services/ai.trip.service';
import { AIBudgetService } from '../services/ai.budget.service';
import { AIVoiceService } from '../services/ai.voice.service';
import { AIError, AIServiceStatus } from '../types/ai.types';

/**
 * AI服务控制器
 * 提供AI服务的HTTP接口
 */
export class AIController {
    private tripService: AITripService;
    private budgetService: AIBudgetService;
    private voiceService: AIVoiceService;

    constructor(aiConfig: any) {
        this.tripService = new AITripService(aiConfig.bailian);
        this.budgetService = new AIBudgetService(aiConfig.bailian);
        this.voiceService = new AIVoiceService(aiConfig.iflytek);
    }

    /**
     * 生成行程规划
     */
    generateTripPlan = async (req: Request, res: Response): Promise<void> => {
        try {
            const tripRequest = req.body;

            // 验证请求数据
            if (!tripRequest.destination || !tripRequest.startDate || !tripRequest.endDate) {
                res.status(400).json({
                    error: '缺少必要的行程规划参数：destination, startDate, endDate'
                });
                return;
            }

            const result = await this.tripService.generateTripPlan(tripRequest);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(res, error, '生成行程规划失败');
        }
    };

    /**
     * 优化行程路线
     */
    optimizeTripRoute = async (req: Request, res: Response): Promise<void> => {
        try {
            const { itinerary, optimizationType = 'experience' } = req.body;

            if (!itinerary) {
                res.status(400).json({
                    error: '缺少必要的参数：itinerary'
                });
                return;
            }

            const result = await this.tripService.optimizeTripRoute(itinerary, optimizationType);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(res, error, '优化行程路线失败');
        }
    };

    /**
     * 分析预算模式
     */
    analyzeBudgetPatterns = async (req: Request, res: Response): Promise<void> => {
        try {
            const budgetRequest = req.body;

            if (!budgetRequest.tripData) {
                res.status(400).json({
                    error: '缺少必要的参数：tripData'
                });
                return;
            }

            const result = await this.budgetService.analyzeBudgetPatterns(budgetRequest);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(res, error, '分析预算模式失败');
        }
    };

    /**
     * 预测开销趋势
     */
    predictExpenseTrends = async (req: Request, res: Response): Promise<void> => {
        try {
            const { historicalData, futurePeriod = 7 } = req.body;

            if (!historicalData || !Array.isArray(historicalData)) {
                res.status(400).json({
                    error: '缺少必要的参数：historicalData（数组）'
                });
                return;
            }

            const result = await this.budgetService.predictExpenseTrends(historicalData, futurePeriod);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(res, error, '预测开销趋势失败');
        }
    };

    /**
     * 语音转文本
     */
    transcribeSpeech = async (req: Request, res: Response): Promise<void> => {
        try {
            const { audioData, audioFormat = 'wav', language = 'zh_cn' } = req.body;

            console.log('收到语音转文字请求，音频数据长度:', audioData?.length || 0);
            console.log('音频格式:', audioFormat);
            console.log('语言:', language);

            if (!audioData) {
                console.error('语音转文字失败：缺少音频数据');
                res.status(400).json({
                    error: '缺少必要的参数：audioData'
                });
                return;
            }

            // 将base64字符串转换为Buffer
            const audioBuffer = Buffer.from(audioData, 'base64');
            console.log('音频Buffer长度:', audioBuffer.length, '字节');

            const result = await this.voiceService.transcribeSpeech({
                audioData: audioBuffer,
                audioFormat,
                language
            });

            console.log('语音识别成功，识别结果:', result.text);
            console.log('置信度:', result.confidence);
            console.log('音频时长:', result.duration, '秒');

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('语音转文字处理失败:', error);
            this.handleError(res, error, '语音转文本失败');
        }
    };

    /**
     * 文本转语音
     */
    generateSpeech = async (req: Request, res: Response): Promise<void> => {
        try {
            const { text, voice = 'xiaoyan' } = req.body;

            if (!text) {
                res.status(400).json({
                    error: '缺少必要的参数：text'
                });
                return;
            }

            const audioData = await this.voiceService.generateSpeech(text, voice);

            // 返回base64编码的音频数据
            res.json({
                success: true,
                data: {
                    audioData: audioData.toString('base64'),
                    format: 'wav',
                    sampleRate: 16000
                }
            });
        } catch (error) {
            this.handleError(res, error, '文本转语音失败');
        }
    };

    /**
     * 实时语音识别（WebSocket）
     */
    realtimeSpeechTranscription = async (ws: WebSocket, req: Request): Promise<void> => {
        try {
            console.log('WebSocket连接建立，开始实时语音识别');

            // 创建音频流生成器
            const audioStream = this.createAudioStream(ws);

            // 开始实时识别
            const results = await this.voiceService.transcribeSpeechRealtime(audioStream);

            // 发送识别结果
            for await (const result of results) {
                ws.send(JSON.stringify({
                    type: 'transcription',
                    data: result
                }));

                if (result.isFinal) {
                    break;
                }
            }

            ws.send(JSON.stringify({
                type: 'complete',
                data: { message: '语音识别完成' }
            }));

            ws.close();
        } catch (error) {
            console.error('实时语音识别失败:', error);

            const errorMessage = error instanceof Error ? error.message : '未知错误';

            ws.send(JSON.stringify({
                type: 'error',
                data: { error: errorMessage }
            }));

            ws.close();
        }
    };

    /**
     * 创建音频流生成器
     */
    private createAudioStream(ws: WebSocket): AsyncIterable<Buffer> {
        return {
            [Symbol.asyncIterator]: () => ({
                next: () => new Promise((resolve, reject) => {
                    const messageHandler = (data: Buffer) => {
                        try {
                            const message = JSON.parse(data.toString());

                            if (message.type === 'audio' && message.data) {
                                const audioBuffer = Buffer.from(message.data, 'base64');
                                resolve({ value: audioBuffer, done: false });
                            } else if (message.type === 'end') {
                                resolve({ value: Buffer.alloc(0), done: true });
                            }
                        } catch (error) {
                            reject(error);
                        }
                    };

                    const errorHandler = (error: Error) => {
                        reject(error);
                    };

                    const closeHandler = () => {
                        resolve({ value: undefined, done: true });
                    };

                    ws.on('message', messageHandler);
                    ws.on('error', errorHandler);
                    ws.on('close', closeHandler);

                    // 清理函数
                    return () => {
                        ws.off('message', messageHandler);
                        ws.off('error', errorHandler);
                        ws.off('close', closeHandler);
                    };
                })
            })
        };
    }

    /**
     * 分析语音意图
     */
    analyzeVoiceIntent = async (req: Request, res: Response): Promise<void> => {
        try {
            const { audioData, context = '' } = req.body;

            if (!audioData) {
                res.status(400).json({
                    error: '缺少必要的参数：audioData'
                });
                return;
            }

            // 将base64字符串转换为Buffer
            const audioBuffer = Buffer.from(audioData, 'base64');

            const result = await this.voiceService.analyzeVoiceIntent(audioBuffer, context);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(res, error, '分析语音意图失败');
        }
    };

    /**
     * 获取服务状态
     */
    getServiceStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const [tripStatus, budgetStatus, voiceStatus] = await Promise.all([
                this.tripService.checkHealth(),
                this.budgetService.checkHealth(),
                this.voiceService.checkHealth()
            ]);

            const status = {
                tripPlanning: this.tripService.getServiceStatus(),
                budgetAnalysis: this.budgetService.getServiceStatus(),
                voiceRecognition: this.voiceService.getServiceStatus(),
                overall: tripStatus && budgetStatus && voiceStatus ? 'healthy' : 'degraded'
            };

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            this.handleError(res, error, '获取服务状态失败');
        }
    };

    /**
     * 处理错误
     */
    private handleError(res: Response, error: any, defaultMessage: string): void {
        console.error('AI服务错误:', error);

        if ((error as AIError).code) {
            const aiError = error as AIError;
            res.status(500).json({
                success: false,
                error: {
                    code: aiError.code,
                    message: aiError.message,
                    details: aiError.details
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: defaultMessage,
                    details: error.message
                }
            });
        }
    }
}

export default AIController;