import { VoiceRecognitionRequest, VoiceRecognitionResponse, AIError, AIServiceStatus } from '../types/ai.types';
import IflytekAIClient from '../clients/iflytek.client';
import AIUtils from '../utils/ai.utils';

/**
 * AI语音服务
 * 提供语音识别和语音合成功能
 */
export class AIVoiceService {
    private iflytekClient: IflytekAIClient;
    private serviceStatus: AIServiceStatus;

    constructor(iflytekConfig: any) {
        this.iflytekClient = new IflytekAIClient(iflytekConfig);
        this.serviceStatus = {
            service: 'voice-recognition',
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: 0
        };
    }

    /**
     * 语音转文本
     */
    async transcribeSpeech(request: VoiceRecognitionRequest): Promise<VoiceRecognitionResponse> {
        const startTime = Date.now();

        try {
            // 调用语音识别服务
            const text = await this.iflytekClient.speechToText(request.audioData, request.audioFormat);

            // 计算音频时长（估算）
            const duration = this.estimateAudioDuration(request.audioData.length, request.audioFormat);

            // 计算置信度（基于文本长度和复杂度估算）
            const confidence = this.calculateConfidence(text);

            // 更新服务状态
            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return {
                text,
                confidence,
                language: request.language,
                duration
            };
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 文本转语音
     */
    async generateSpeech(text: string, voice: string = 'xiaoyan'): Promise<Buffer> {
        const startTime = Date.now();

        try {
            // 调用语音合成服务
            const audioData = await this.iflytekClient.textToSpeech(text, voice);

            // 更新服务状态
            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return audioData;
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 分析语音意图
     */
    async analyzeVoiceIntent(audioData: Buffer, context: string = ''): Promise<{
        intent: string;
        confidence: number;
        entities: Record<string, any>;
        action: string;
    }> {
        const startTime = Date.now();

        try {
            // 先进行语音识别
            const transcription = await this.transcribeSpeech({
                audioData,
                audioFormat: 'wav',
                language: 'zh_cn'
            });

            // 分析文本意图
            const intentAnalysis = await this.analyzeTextIntent(transcription.text, context);

            // 更新服务状态
            this.updateServiceStatus(Date.now() - startTime, 'healthy');

            return {
                intent: intentAnalysis.intent,
                confidence: intentAnalysis.confidence * transcription.confidence,
                entities: intentAnalysis.entities,
                action: intentAnalysis.action
            };
        } catch (error) {
            this.updateServiceStatus(Date.now() - startTime, 'degraded');
            throw AIUtils.formatError(error);
        }
    }

    /**
     * 分析文本意图
     */
    private async analyzeTextIntent(text: string, context: string): Promise<{
        intent: string;
        confidence: number;
        entities: Record<string, any>;
        action: string;
    }> {
        // 简单的意图识别规则（实际项目中可以使用更复杂的NLP模型）
        const intents = {
            'plan_trip': ['计划', '规划', '安排', '行程', '旅行', '旅游'],
            'budget_analysis': ['预算', '花费', '费用', '开销', '省钱'],
            'search_destination': ['搜索', '查找', '目的地', '地方', '景点'],
            'weather_info': ['天气', '气温', '气候', '温度'],
            'accommodation': ['住宿', '酒店', '旅馆', '民宿', '住'],
            'transportation': ['交通', '飞机', '火车', '汽车', '自驾']
        };

        let bestIntent = 'unknown';
        let bestConfidence = 0;
        const entities: Record<string, any> = {};

        // 匹配意图
        for (const [intent, keywords] of Object.entries(intents)) {
            const matches = keywords.filter(keyword => text.includes(keyword));
            const confidence = matches.length / keywords.length;

            if (confidence > bestConfidence) {
                bestIntent = intent;
                bestConfidence = confidence;
            }
        }

        // 提取实体
        this.extractEntities(text, entities);

        // 确定动作
        const action = this.determineAction(bestIntent, entities);

        return {
            intent: bestIntent,
            confidence: bestConfidence,
            entities,
            action
        };
    }

    /**
     * 提取实体
     */
    private extractEntities(text: string, entities: Record<string, any>): void {
        // 提取日期
        const dateMatch = text.match(/(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}日?)|(\d{1,2}月\d{1,2}日)|(\d{1,2}日)/g);
        if (dateMatch) {
            entities.dates = dateMatch;
        }

        // 提取地点
        const locationMatch = text.match(/[\u4e00-\u9fa5]{2,10}(市|省|区|县|景点|地方)/g);
        if (locationMatch) {
            entities.locations = locationMatch;
        }

        // 提取金额
        const amountMatch = text.match(/\d+(?:\.\d+)?[万元元]/g);
        if (amountMatch) {
            entities.amounts = amountMatch.map(amt => {
                const value = parseFloat(amt.replace(/[万元元]/g, ''));
                const unit = amt.includes('万') ? '万' : '元';
                return { value, unit };
            });
        }

        // 提取人数
        const peopleMatch = text.match(/\d+[人个]/g);
        if (peopleMatch) {
            entities.people = peopleMatch.map(p => parseInt(p));
        }
    }

    /**
     * 确定动作
     */
    private determineAction(intent: string, entities: Record<string, any>): string {
        const actionMap: Record<string, string> = {
            'plan_trip': 'generate_trip_plan',
            'budget_analysis': 'analyze_budget',
            'search_destination': 'search_destination',
            'weather_info': 'get_weather',
            'accommodation': 'search_accommodation',
            'transportation': 'search_transportation',
            'unknown': 'ask_clarification'
        };

        return actionMap[intent] || 'unknown';
    }

    /**
     * 估算音频时长
     */
    private estimateAudioDuration(dataLength: number, format: string): number {
        // 基于常见音频格式的估算
        const bytesPerSecond: Record<string, number> = {
            'wav': 16000 * 2, // 16kHz, 16-bit
            'mp3': 16000,     // 压缩格式
            'ogg': 12000      // 压缩格式
        };

        const bps = bytesPerSecond[format] || 16000;
        return Math.round(dataLength / bps);
    }

    /**
     * 计算置信度
     */
    private calculateConfidence(text: string): number {
        // 基于文本长度和复杂度的简单置信度计算
        const lengthScore = Math.min(text.length / 50, 1); // 文本越长，置信度越高
        const complexityScore = text.split(/[，。！？]/).length / 5; // 句子越多，置信度越高

        return Math.min((lengthScore + complexityScore) / 2, 1);
    }

    /**
     * 更新服务状态
     */
    private updateServiceStatus(responseTime: number, status: AIServiceStatus['status']): void {
        this.serviceStatus = {
            ...this.serviceStatus,
            status,
            lastCheck: new Date(),
            responseTime
        };
    }

    /**
     * 获取服务状态
     */
    getServiceStatus(): AIServiceStatus {
        return this.serviceStatus;
    }

    /**
     * 检查服务健康状态
     */
    async checkHealth(): Promise<boolean> {
        try {
            const isHealthy = await this.iflytekClient.checkHealth();
            this.serviceStatus.status = isHealthy ? 'healthy' : 'unavailable';
            return isHealthy;
        } catch {
            this.serviceStatus.status = 'unavailable';
            return false;
        }
    }
}

export default AIVoiceService;