/**
 * 语音处理工具函数
 */

/**
 * 语音命令处理器
 */
export class VoiceCommandProcessor {
    private commands: Map<string, { pattern: RegExp; action: () => void; enabled: boolean }> = new Map();

    /**
     * 注册语音命令
     */
    registerCommand(id: string, pattern: string | RegExp, action: () => void, enabled: boolean = true): void {
        const regexPattern = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
        this.commands.set(id, { pattern: regexPattern, action, enabled });
    }

    /**
     * 取消注册语音命令
     */
    unregisterCommand(id: string): void {
        this.commands.delete(id);
    }

    /**
     * 启用语音命令
     */
    enableCommand(id: string): void {
        const command = this.commands.get(id);
        if (command) {
            command.enabled = true;
        }
    }

    /**
     * 禁用语音命令
     */
    disableCommand(id: string): void {
        const command = this.commands.get(id);
        if (command) {
            command.enabled = false;
        }
    }

    /**
     * 处理语音文本
     */
    processText(text: string): string | null {
        for (const [id, command] of this.commands.entries()) {
            if (command.enabled && command.pattern.test(text)) {
                try {
                    command.action();
                    return id;
                } catch (error) {
                    console.error(`执行语音命令 ${id} 失败:`, error);
                }
            }
        }
        return null;
    }

    /**
     * 获取所有命令
     */
    getAllCommands(): Array<{ id: string; pattern: string; enabled: boolean }> {
        return Array.from(this.commands.entries()).map(([id, command]) => ({
            id,
            pattern: command.pattern.toString(),
            enabled: command.enabled
        }));
    }

    /**
     * 清空所有命令
     */
    clearCommands(): void {
        this.commands.clear();
    }
}

/**
 * 语音意图分析器
 */
export class VoiceIntentAnalyzer {
    private intents: Map<string, { keywords: string[]; confidence: number }> = new Map();

    constructor() {
        // 初始化默认意图
        this.initializeDefaultIntents();
    }

    /**
     * 初始化默认意图
     */
    private initializeDefaultIntents(): void {
        this.intents.set('plan_trip', {
            keywords: ['计划', '规划', '安排', '行程', '旅行', '旅游', '想去', '要去'],
            confidence: 0.8
        });

        this.intents.set('budget_analysis', {
            keywords: ['预算', '花费', '费用', '开销', '省钱', '多少钱', '预算多少'],
            confidence: 0.8
        });

        this.intents.set('search_destination', {
            keywords: ['搜索', '查找', '目的地', '地方', '景点', '推荐', '哪里'],
            confidence: 0.7
        });

        this.intents.set('weather_info', {
            keywords: ['天气', '气温', '气候', '温度', '下雨', '晴天', '多云'],
            confidence: 0.9
        });

        this.intents.set('accommodation', {
            keywords: ['住宿', '酒店', '旅馆', '民宿', '住', '房间', '预订'],
            confidence: 0.8
        });

        this.intents.set('transportation', {
            keywords: ['交通', '飞机', '火车', '汽车', '自驾', '怎么去', '路线'],
            confidence: 0.8
        });
    }

    /**
     * 分析语音意图
     */
    analyzeIntent(text: string): { intent: string; confidence: number; entities: Record<string, any> } {
        let bestIntent = 'unknown';
        let bestConfidence = 0;
        const entities: Record<string, any> = {};

        // 提取实体
        this.extractEntities(text, entities);

        // 匹配意图
        for (const [intent, config] of this.intents.entries()) {
            const matches = config.keywords.filter(keyword => text.includes(keyword));
            const confidence = matches.length > 0 ? config.confidence : 0;

            if (confidence > bestConfidence) {
                bestIntent = intent;
                bestConfidence = confidence;
            }
        }

        return {
            intent: bestIntent,
            confidence: bestConfidence,
            entities
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
            entities.people = peopleMatch.map(p => parseInt(p.replace(/[人个]/g, '')));
        }

        // 提取时间
        const timeMatch = text.match(/(\d{1,2}点|\d{1,2}时|\d{1,2}:\d{2}|上午|下午|晚上)/g);
        if (timeMatch) {
            entities.times = timeMatch;
        }
    }

    /**
     * 添加自定义意图
     */
    addIntent(intent: string, keywords: string[], confidence: number = 0.7): void {
        this.intents.set(intent, { keywords, confidence });
    }

    /**
     * 移除意图
     */
    removeIntent(intent: string): void {
        this.intents.delete(intent);
    }
}

/**
 * 语音识别结果处理器
 */
export class RecognitionResultProcessor {
    /**
     * 清理识别结果
     */
    static cleanResult(text: string): string {
        // 移除多余的空格和标点
        return text
            .replace(/\s+/g, ' ')
            .replace(/[，。！？；：""'']/g, '')
            .trim();
    }

    /**
     * 计算识别置信度
     */
    static calculateConfidence(text: string): number {
        const lengthScore = Math.min(text.length / 50, 1);
        const complexityScore = Math.min(text.split(/[，。！？]/).length / 3, 1);
        return (lengthScore + complexityScore) / 2;
    }

    /**
     * 检查是否为有效语音
     */
    static isValidSpeech(text: string, minLength: number = 3): boolean {
        const cleanedText = this.cleanResult(text);
        return cleanedText.length >= minLength;
    }

    /**
     * 提取关键词
     */
    static extractKeywords(text: string, keywords: string[]): string[] {
        return keywords.filter(keyword => text.includes(keyword));
    }
}

/**
 * 语音反馈生成器
 */
export class VoiceFeedbackGenerator {
    /**
     * 生成语音反馈
     */
    static generateFeedback(intent: string, entities: Record<string, any>): string {
        const feedbacks: Record<string, string> = {
            'plan_trip': '好的，我来帮您规划行程。',
            'budget_analysis': '收到，我来分析预算。',
            'search_destination': '明白，我来搜索目的地。',
            'weather_info': '好的，我来查询天气信息。',
            'accommodation': '收到，我来查找住宿。',
            'transportation': '明白，我来规划交通。',
            'unknown': '抱歉，我没有理解您的意思，请再说一遍。'
        };

        let feedback = feedbacks[intent] || feedbacks.unknown;

        // 根据实体丰富反馈
        if (entities.locations && entities.locations.length > 0) {
            feedback += ` 目的地：${entities.locations.join('、')}`;
        }

        if (entities.dates && entities.dates.length > 0) {
            feedback += ` 时间：${entities.dates.join('、')}`;
        }

        return feedback;
    }

    /**
     * 生成错误反馈
     */
    static generateErrorFeedback(errorCode: string): string {
        const errorFeedbacks: Record<string, string> = {
            'NO_AUDIO': '没有检测到语音输入，请检查麦克风权限。',
            'AUDIO_CAPTURE': '音频捕获失败，请检查麦克风设置。',
            'NETWORK_ERROR': '网络连接失败，请检查网络设置。',
            'SERVICE_UNAVAILABLE': '语音服务暂时不可用，请稍后重试。',
            'UNKNOWN_ERROR': '发生未知错误，请重试。'
        };

        return errorFeedbacks[errorCode] || errorFeedbacks.UNKNOWN_ERROR;
    }
}

export default {
    VoiceCommandProcessor,
    VoiceIntentAnalyzer,
    RecognitionResultProcessor,
    VoiceFeedbackGenerator
};