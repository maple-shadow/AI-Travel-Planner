import { Router } from 'express';
import AIController from '../controllers/ai.controller';
import AIValidators from '../validators/ai.validators';

/**
 * AI服务路由
 * 定义AI服务的HTTP路由
 */
export class AIRoutes {
    public router: Router;
    private aiController: AIController;

    constructor(aiConfig: any) {
        this.router = Router();
        this.aiController = new AIController(aiConfig);
        this.initializeRoutes();
    }

    /**
     * 初始化路由
     */
    private initializeRoutes(): void {
        // 行程规划相关路由
        this.router.post('/trip/plan', AIValidators.validateTripPlanningRequest, this.aiController.generateTripPlan);
        this.router.post('/trip/optimize', this.aiController.optimizeTripRoute);

        // 预算分析相关路由
        this.router.post('/budget/analyze', AIValidators.validateBudgetAnalysisRequest, this.aiController.analyzeBudgetPatterns);
        this.router.post('/budget/predict', this.aiController.predictExpenseTrends);

        // 语音服务相关路由
        this.router.post('/voice/transcribe', AIValidators.validateVoiceRecognitionRequest, this.aiController.transcribeSpeech);
        this.router.post('/voice/generate', AIValidators.validateTextToSpeechRequest, this.aiController.generateSpeech);
        this.router.post('/voice/intent', AIValidators.validateVoiceIntentRequest, this.aiController.analyzeVoiceIntent);

        // 服务状态路由
        this.router.get('/status', this.aiController.getServiceStatus);

        // 健康检查路由
        this.router.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'ai-services'
            });
        });
    }

    /**
     * 获取路由实例
     */
    public getRoutes(): Router {
        return this.router;
    }
}

export default AIRoutes;