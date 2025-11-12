import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * 性能优化验证器
 * 提供请求参数验证功能
 */

export class PerformanceValidators {
    /**
     * 验证获取性能事件参数
     */
    static validateGetEvents = [
        query('resolved')
            .optional()
            .isBoolean()
            .withMessage('resolved参数必须是布尔值'),
        query('severity')
            .optional()
            .isIn(['low', 'medium', 'high', 'critical'])
            .withMessage('severity参数必须是low、medium、high或critical'),
        query('type')
            .optional()
            .isString()
            .withMessage('type参数必须是字符串'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 1000 })
            .withMessage('limit参数必须是1-1000之间的整数'),
        this.handleValidationErrors
    ];

    /**
     * 验证解决事件参数
     */
    static validateResolveEvent = [
        param('eventId')
            .isMongoId()
            .withMessage('eventId必须是有效的MongoDB ID'),
        this.handleValidationErrors
    ];

    /**
     * 验证清理缓存参数
     */
    static validateClearCache = [
        query('key')
            .optional()
            .isString()
            .withMessage('key参数必须是字符串'),
        this.handleValidationErrors
    ];

    /**
     * 验证获取缓存项参数
     */
    static validateGetCacheItem = [
        param('key')
            .isString()
            .notEmpty()
            .withMessage('key参数不能为空'),
        this.handleValidationErrors
    ];

    /**
     * 验证应用优化建议参数
     */
    static validateApplyOptimization = [
        body('suggestionId')
            .isMongoId()
            .withMessage('suggestionId必须是有效的MongoDB ID'),
        this.handleValidationErrors
    ];

    /**
     * 验证更新配置参数
     */
    static validateUpdateConfig = [
        body('config')
            .isObject()
            .withMessage('config参数必须是对象'),
        body('config.cache')
            .optional()
            .isObject()
            .withMessage('cache配置必须是对象'),
        body('config.cache.ttl')
            .optional()
            .isInt({ min: 0 })
            .withMessage('cache.ttl必须是非负整数'),
        body('config.cache.maxSize')
            .optional()
            .isInt({ min: 1 })
            .withMessage('cache.maxSize必须是正整数'),
        body('config.monitoring')
            .optional()
            .isObject()
            .withMessage('monitoring配置必须是对象'),
        body('config.monitoring.enabled')
            .optional()
            .isBoolean()
            .withMessage('monitoring.enabled必须是布尔值'),
        body('config.monitoring.interval')
            .optional()
            .isInt({ min: 1000 })
            .withMessage('monitoring.interval必须大于等于1000毫秒'),
        this.handleValidationErrors
    ];

    /**
     * 验证导出数据参数
     */
    static validateExportData = [
        query('format')
            .optional()
            .isIn(['json', 'csv'])
            .withMessage('format参数必须是json或csv'),
        query('period')
            .optional()
            .isIn(['1h', '6h', '12h', '24h', '7d'])
            .withMessage('period参数必须是1h、6h、12h、24h或7d'),
        this.handleValidationErrors
    ];

    /**
     * 验证获取性能指标参数
     */
    static validateGetMetrics = [
        query('period')
            .optional()
            .isIn(['1h', '6h', '12h', '24h', '7d'])
            .withMessage('period参数必须是1h、6h、12h、24h或7d'),
        this.handleValidationErrors
    ];

    /**
     * 验证生成报告参数
     */
    static validateGenerateReport = [
        query('period')
            .optional()
            .isIn(['1h', '6h', '12h', '24h', '7d'])
            .withMessage('period参数必须是1h、6h、12h、24h或7d'),
        this.handleValidationErrors
    ];

    /**
     * 通用验证错误处理中间件
     */
    private static handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => ({
                field: error.type === 'field' ? error.path : error.type,
                message: error.msg,
                value: (error as any).value || ''
            }));

            res.status(400).json({
                success: false,
                error: '参数验证失败',
                details: errorMessages
            });
            return;
        }

        next();
    }

    /**
     * 验证MongoDB ID格式
     */
    static validateMongoId(id: string): boolean {
        const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
        return mongoIdRegex.test(id);
    }

    /**
     * 验证缓存键格式
     */
    static validateCacheKey(key: string): boolean {
        // 缓存键只能包含字母、数字、下划线和连字符
        const keyRegex = /^[a-zA-Z0-9_-]+$/;
        return keyRegex.test(key) && key.length <= 255;
    }

    /**
     * 验证时间范围
     */
    static validateTimeRange(startTime: string, endTime: string): boolean {
        try {
            const start = new Date(startTime);
            const end = new Date(endTime);

            return start < end && (end.getTime() - start.getTime()) <= 30 * 24 * 60 * 60 * 1000; // 最大30天
        } catch {
            return false;
        }
    }

    /**
     * 验证性能阈值
     */
    static validatePerformanceThreshold(threshold: number): boolean {
        return typeof threshold === 'number' && threshold >= 0 && threshold <= 100;
    }

    /**
     * 验证监控配置
     */
    static validateMonitoringConfig(config: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!config) {
            errors.push('配置不能为空');
            return { isValid: false, errors };
        }

        if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
            errors.push('enabled必须是布尔值');
        }

        if (config.interval !== undefined && (typeof config.interval !== 'number' || config.interval < 1000)) {
            errors.push('interval必须大于等于1000毫秒');
        }

        if (config.thresholds) {
            if (config.thresholds.cpu !== undefined && !this.validatePerformanceThreshold(config.thresholds.cpu)) {
                errors.push('CPU阈值必须在0-100之间');
            }

            if (config.thresholds.memory !== undefined && !this.validatePerformanceThreshold(config.thresholds.memory)) {
                errors.push('内存阈值必须在0-100之间');
            }

            if (config.thresholds.responseTime !== undefined && (typeof config.thresholds.responseTime !== 'number' || config.thresholds.responseTime < 0)) {
                errors.push('响应时间阈值必须是非负数');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证缓存配置
     */
    static validateCacheConfig(config: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!config) {
            errors.push('配置不能为空');
            return { isValid: false, errors };
        }

        if (config.ttl !== undefined && (typeof config.ttl !== 'number' || config.ttl < 0)) {
            errors.push('TTL必须是非负数');
        }

        if (config.maxSize !== undefined && (typeof config.maxSize !== 'number' || config.maxSize < 1)) {
            errors.push('maxSize必须是正整数');
        }

        if (config.strategy && !['lru', 'fifo', 'lfu'].includes(config.strategy)) {
            errors.push('缓存策略必须是lru、fifo或lfu');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证性能事件数据
     */
    static validatePerformanceEvent(event: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!event) {
            errors.push('事件数据不能为空');
            return { isValid: false, errors };
        }

        if (!event.type || typeof event.type !== 'string') {
            errors.push('事件类型不能为空且必须是字符串');
        }

        if (!event.severity || !['low', 'medium', 'high', 'critical'].includes(event.severity)) {
            errors.push('事件严重性必须是low、medium、high或critical');
        }

        if (!event.message || typeof event.message !== 'string') {
            errors.push('事件消息不能为空且必须是字符串');
        }

        if (event.timestamp && !this.isValidDate(event.timestamp)) {
            errors.push('时间戳格式无效');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证日期格式
     */
    private static isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
}

export default PerformanceValidators;