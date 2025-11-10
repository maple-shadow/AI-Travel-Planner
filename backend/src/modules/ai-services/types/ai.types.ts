// AI服务配置类型
export interface AIServiceConfig {
    aliyun: {
        accessKeyId: string;
        accessKeySecret: string;
        endpoint: string;
    };
    iflytek: {
        appId: string;
        apiKey: string;
        apiSecret: string;
    };
    rateLimit: {
        requestsPerMinute: number;
        requestsPerHour: number;
    };
}

// AI模型配置类型
export interface ModelConfig {
    tripPlanning: {
        modelName: string;
        temperature: number;
        maxTokens: number;
    };
    budgetAnalysis: {
        modelName: string;
        temperature: number;
        maxTokens: number;
    };
    voiceRecognition: {
        modelName: string;
        sampleRate: number;
        format: string;
    };
}

// 行程规划请求类型
export interface TripPlanningRequest {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    preferences: {
        interests: string[];
        travelStyle: 'adventure' | 'relaxation' | 'cultural' | 'food';
        groupSize: number;
    };
    constraints?: {
        accessibility?: string[];
        dietary?: string[];
        language?: string;
    };
}

// 行程规划响应类型
export interface TripPlanningResponse {
    itinerary: {
        day: number;
        date: string;
        activities: {
            time: string;
            activity: string;
            location: string;
            description: string;
            estimatedCost: number;
        }[];
    }[];
    totalEstimatedCost: number;
    recommendations: string[];
    weatherAdvice?: string;
}

// 预算分析请求类型
export interface BudgetAnalysisRequest {
    tripData: TripPlanningRequest;
    historicalExpenses?: {
        category: string;
        amount: number;
        date: string;
    }[];
    userPreferences: {
        budgetPriority: 'saving' | 'comfort' | 'luxury';
        spendingCategories: string[];
    };
}

// 预算分析响应类型
export interface BudgetAnalysisResponse {
    budgetBreakdown: {
        category: string;
        estimatedAmount: number;
        percentage: number;
        recommendations: string[];
    }[];
    totalBudget: number;
    savingsOpportunities: string[];
    riskAssessment: {
        level: 'low' | 'medium' | 'high';
        reasons: string[];
    };
}

// 语音识别请求类型
export interface VoiceRecognitionRequest {
    audioData: Buffer;
    audioFormat: 'wav' | 'mp3' | 'ogg';
    language: string;
}

// 语音识别响应类型
export interface VoiceRecognitionResponse {
    text: string;
    confidence: number;
    language: string;
    duration: number;
}

// AI服务错误类型
export interface AIError {
    code: string;
    message: string;
    details?: any;
}

// AI服务状态类型
export interface AIServiceStatus {
    service: string;
    status: 'healthy' | 'degraded' | 'unavailable';
    lastCheck: Date;
    responseTime: number;
}