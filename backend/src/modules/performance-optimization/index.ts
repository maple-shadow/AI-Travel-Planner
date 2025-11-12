/**
 * 性能优化模块主入口文件
 * 导出所有类型、服务、控制器、路由和配置
 */

// 导出类型定义
export * from './types/performance.types';

// 导出配置
export * from './config/performance.config';

// 导出服务
export { default as cacheService } from './services/cache.service';
export { default as monitoringService } from './services/monitoring.service';
export { default as performanceService, PerformanceOptimization } from './services/performance.service';

// 导出控制器
export { default as performanceController, PerformanceController } from './controllers/performance.controller';

// 导出路由
export { default as performanceRoutes } from './routes/performance.routes';

// 导出验证器
export { default as PerformanceValidators } from './validators/performance.validators';

// 默认配置
export const DEFAULT_PERFORMANCE_CONFIG = {
    cache: {
        ttl: 3600, // 1小时
        maxSize: 1000,
        strategy: 'lru' as const
    },
    monitoring: {
        enabled: true,
        interval: 5000, // 5秒
        thresholds: {
            cpu: 80,
            memory: 85,
            responseTime: 500
        }
    }
};

/**
 * 性能优化模块初始化函数
 */
export async function initializePerformanceModule(config?: any): Promise<void> {
    try {
        const performanceService = (await import('./services/performance.service')).default;
        await performanceService.initialize();

        console.log('性能优化模块初始化完成');
    } catch (error) {
        console.error('性能优化模块初始化失败:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
}

/**
 * 获取性能优化模块配置
 */
export function getPerformanceModuleConfig() {
    return {
        name: 'performance-optimization',
        version: '1.0.0',
        description: 'AI旅行规划器性能优化模块',
        dependencies: ['express', 'node-cron'],
        routes: ['/api/performance'],
        services: ['cache', 'monitoring', 'performance'],
        controllers: ['performance']
    };
}

/**
 * 性能优化工具函数
 */
export class PerformanceUtils {
    /**
     * 格式化性能指标
     */
    static formatMetrics(metrics: any): string {
        return JSON.stringify(metrics, null, 2);
    }

    /**
     * 计算性能得分
     */
    static calculatePerformanceScore(metrics: any): number {
        let score = 100;

        // CPU使用率扣分
        if (metrics.cpuUsage > 80) score -= 20;
        else if (metrics.cpuUsage > 60) score -= 10;

        // 内存使用率扣分
        if (metrics.memoryUsage > 85) score -= 20;
        else if (metrics.memoryUsage > 70) score -= 10;

        // 响应时间扣分
        if (metrics.averageResponseTime > 500) score -= 15;
        else if (metrics.averageResponseTime > 300) score -= 8;

        // 错误率扣分
        if (metrics.apiErrorRate > 0.05) score -= 15;
        else if (metrics.apiErrorRate > 0.02) score -= 7;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * 生成性能报告摘要
     */
    static generateReportSummary(report: any): string {
        const score = this.calculatePerformanceScore(report.metrics);

        return `
性能报告摘要:
- 总体得分: ${score}/100
- CPU使用率: ${report.metrics.cpuUsage}%
- 内存使用率: ${report.metrics.memoryUsage}%
- 平均响应时间: ${report.metrics.averageResponseTime}ms
- 错误率: ${(report.metrics.apiErrorRate * 100).toFixed(2)}%
- 活跃连接数: ${report.metrics.activeConnections}
- 未解决事件: ${report.events.filter((e: any) => !e.resolved).length}
- 生成时间: ${report.timestamp}
    `.trim();
    }

    /**
     * 检查是否需要性能优化
     */
    static needsOptimization(metrics: any): boolean {
        return (
            metrics.cpuUsage > 80 ||
            metrics.memoryUsage > 85 ||
            metrics.averageResponseTime > 500 ||
            metrics.apiErrorRate > 0.05
        );
    }

    /**
     * 获取优化优先级
     */
    static getOptimizationPriority(metrics: any): number {
        let priority = 0;

        if (metrics.cpuUsage > 80) priority += 3;
        if (metrics.memoryUsage > 85) priority += 3;
        if (metrics.averageResponseTime > 500) priority += 2;
        if (metrics.apiErrorRate > 0.05) priority += 3;

        return priority;
    }
}

/**
 * 性能优化中间件
 */
export function performanceMiddleware(req: any, res: any, next: any) {
    const startTime = Date.now();

    // 记录请求开始时间
    req._startTime = startTime;

    // 响应结束时记录性能数据
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const performanceService = require('./services/performance.service').default;

        // 记录请求性能
        performanceService.addEvent({
            type: 'request',
            severity: duration > 1000 ? 'medium' : 'low',
            message: `${req.method} ${req.path} - ${duration}ms`,
            data: {
                method: req.method,
                path: req.path,
                duration,
                statusCode: res.statusCode
            }
        });
    });

    next();
}

/**
 * 性能监控装饰器
 */
export function monitorPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        const startTime = Date.now();
        const performanceService = require('./services/performance.service').default;

        try {
            const result = await method.apply(this, args);
            const duration = Date.now() - startTime;

            // 记录方法执行时间
            if (duration > 100) {
                performanceService.addEvent({
                    type: 'method_execution',
                    severity: duration > 1000 ? 'medium' : 'low',
                    message: `${target.constructor.name}.${propertyName} - ${duration}ms`,
                    data: {
                        className: target.constructor.name,
                        methodName: propertyName,
                        duration
                    }
                });
            }

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;

            // 记录错误
            performanceService.addEvent({
                type: 'method_error',
                severity: 'high',
                message: `${target.constructor.name}.${propertyName} - 错误: ${error instanceof Error ? error.message : 'Unknown error'}`,
                data: {
                    className: target.constructor.name,
                    methodName: propertyName,
                    duration,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            });

            throw error;
        }
    };

    return descriptor;
}