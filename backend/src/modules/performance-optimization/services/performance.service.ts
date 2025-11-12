import { PerformanceMetrics, PerformanceEvent, OptimizationSuggestion, PerformanceConfig } from '../types/performance.types';
import monitoringService from './monitoring.service';
import cacheService from './cache.service';
import { getPerformanceConfig } from '../config/performance.config';

/**
 * 性能优化服务
 * 整合监控和缓存服务，提供统一的性能优化接口
 */
export class PerformanceOptimization {
    private static instance: PerformanceOptimization;
    private config: PerformanceConfig;
    private isInitialized: boolean = false;

    private constructor() {
        this.config = getPerformanceConfig();
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): PerformanceOptimization {
        if (!PerformanceOptimization.instance) {
            PerformanceOptimization.instance = new PerformanceOptimization();
        }
        return PerformanceOptimization.instance;
    }

    /**
     * 初始化性能优化服务
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            // 验证配置
            const validationResult = this.validateConfig(this.config);
            if (!validationResult.isValid) {
                throw new Error(`配置验证失败: ${validationResult.errors.join(', ')}`);
            }

            // 初始化监控服务
            if (this.config.monitoring.enabled) {
                await monitoringService.initialize();
                monitoringService.startMonitoring();
            }

            try {
                // 缓存服务在构造函数中已初始化，无需额外调用initialize()
                // await cacheService.initialize();

                this.isInitialized = true;
                console.log('性能优化服务初始化完成');
            } catch (error) {
                console.error('性能优化服务初始化失败:', error);
                throw error;
            }
        } catch (error) {
            console.error('性能优化服务初始化过程中发生错误:', error);
            throw error;
        }
    }

    /**
     * 获取当前配置
     */
    public getConfig(): PerformanceConfig {
        return { ...this.config };
    }

    /**
     * 更新配置
     */
    public updateConfig(newConfig: Partial<PerformanceConfig>): void {
        const updatedConfig = { ...this.config, ...newConfig };

        // 验证新配置
        const validationResult = this.validateConfig(updatedConfig);
        if (!validationResult.isValid) {
            throw new Error(`配置验证失败: ${validationResult.errors.join(', ')}`);
        }

        this.config = updatedConfig;

        // 根据配置更新服务状态
        if (this.config.monitoring.enabled) {
            monitoringService.startMonitoring();
        } else {
            monitoringService.stopMonitoring();
        }
    }

    /**
     * 获取性能指标
     */
    public getMetrics(): PerformanceMetrics {
        return monitoringService.getCurrentMetrics();
    }

    /**
     * 获取历史性能数据
     */
    public getHistoricalMetrics(startTime: Date, endTime: Date): PerformanceMetrics[] {
        // 这里实现获取历史数据的逻辑
        // 暂时返回空数组
        return [];
    }

    /**
     * 获取性能事件
     */
    public getEvents(filters?: {
        resolved?: boolean;
        severity?: string;
        type?: string;
        limit?: number;
    }): PerformanceEvent[] {
        let events = monitoringService.getUnresolvedEvents();

        if (filters) {
            if (filters.resolved !== undefined) {
                events = events.filter(event => event.resolved === filters.resolved);
            }

            if (filters.severity) {
                events = events.filter(event => event.severity === filters.severity);
            }

            if (filters.type) {
                events = events.filter(event => event.type === filters.type);
            }

            if (filters.limit) {
                events = events.slice(0, filters.limit);
            }
        }

        return events;
    }

    /**
     * 解决性能事件
     */
    public resolveEvent(eventId: string): boolean {
        return monitoringService.resolveEvent(eventId);
    }

    /**
     * 添加性能事件
     */
    public addEvent(event: Omit<PerformanceEvent, 'id' | 'timestamp' | 'resolved'>): string {
        monitoringService.recordEvent(event.type, event.severity, event.message, event.data);
        return this.generateId();
    }

    /**
     * 生成性能报告
     */
    public generateReport(): {
        metrics: PerformanceMetrics;
        events: PerformanceEvent[];
        suggestions: OptimizationSuggestion[];
        cacheStats: any;
        timestamp: string;
    } {
        const metrics = this.getMetrics();
        const events = this.getEvents({ limit: 100 });
        const suggestions = this.generateOptimizationSuggestions(metrics, events);
        const cacheStats = cacheService.getStats();

        return {
            metrics,
            events,
            suggestions,
            cacheStats,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 生成优化建议
     */
    private generateOptimizationSuggestions(
        metrics: PerformanceMetrics,
        events: PerformanceEvent[]
    ): OptimizationSuggestion[] {
        const suggestions: OptimizationSuggestion[] = [];

        // 基于CPU使用率生成建议
        if (metrics.cpuUsage > 80) {
            suggestions.push({
                id: this.generateId(),
                title: 'CPU使用率过高',
                description: '当前CPU使用率超过80%，建议优化代码或增加服务器资源',
                priority: 'high',
                action: 'scale_resources',
                impact: 'large',
                estimatedSavings: 200,
                parameters: { targetCpuUsage: 60 }
            });
        }

        // 基于内存使用率生成建议
        if (metrics.memoryUsage > 85) {
            suggestions.push({
                id: this.generateId(),
                title: '内存使用率过高',
                description: '当前内存使用率超过85%，建议优化内存使用或增加内存',
                priority: 'high',
                action: 'optimize_memory',
                impact: 'large',
                estimatedSavings: 200,
                parameters: { targetMemoryUsage: 70 }
            });
        }

        // 基于响应时间生成建议
        if (metrics.apiResponseTime > 500) {
            suggestions.push({
                id: this.generateId(),
                title: '响应时间过长',
                description: '平均响应时间超过500ms，建议优化数据库查询或代码逻辑',
                priority: 'medium',
                action: 'optimize_query',
                impact: 'medium',
                estimatedSavings: 150,
                parameters: { targetResponseTime: 300 }
            });
        }

        // 基于缓存命中率生成建议
        const cacheStats = cacheService.getStats();
        if (cacheStats.hitRate < 0.7) {
            suggestions.push({
                id: this.generateId(),
                title: '缓存命中率较低',
                description: '缓存命中率低于70%，建议优化缓存策略或增加缓存容量',
                priority: 'medium',
                action: 'enable_caching',
                impact: 'medium',
                estimatedSavings: 100,
                parameters: { targetHitRate: 0.8 }
            });
        }

        // 基于错误率生成建议
        if (metrics.apiErrorRate > 0.05) {
            suggestions.push({
                id: this.generateId(),
                title: '错误率较高',
                description: '错误率超过5%，建议检查代码逻辑或增加错误处理',
                priority: 'high',
                action: 'optimize_query',
                impact: 'large',
                estimatedSavings: 200,
                parameters: { targetErrorRate: 0.02 }
            });
        }

        // 将字符串优先级转换为数字进行比较
        const priorityMap = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
        return suggestions.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
    }

    /**
     * 应用优化建议
     */
    public async applyOptimization(suggestionId: string): Promise<{ success: boolean; message: string }> {
        // 这里实现应用优化建议的逻辑
        // 暂时返回成功响应

        return {
            success: true,
            message: '优化建议已应用'
        };
    }

    /**
     * 获取缓存统计信息
     */
    public getCacheStats(): any {
        return cacheService.getStats();
    }

    /**
     * 清理缓存
     */
    public async clearCache(key?: string): Promise<{ success: boolean; message: string }> {
        if (key) {
            const result = await cacheService.delete(key);
            return {
                success: result.success,
                message: result.success ? '缓存项已删除' : '删除缓存项失败'
            };
        } else {
            const result = await cacheService.clear();
            return {
                success: result.success,
                message: result.success ? '缓存已清空' : '清空缓存失败'
            };
        }
    }

    /**
     * 获取缓存键列表
     */
    public async getCacheKeys(): Promise<string[]> {
        return await cacheService.keys();
    }

    /**
     * 获取缓存项
     */
    public async getCacheItem(key: string): Promise<any> {
        return await cacheService.get(key);
    }

    /**
     * 设置缓存项
     */
    public async setCacheItem(key: string, value: any, ttl?: number): Promise<{ success: boolean; message: string }> {
        const result = await cacheService.set(key, value, ttl);
        return {
            success: result.success,
            message: result.success ? '缓存项已设置' : '设置缓存项失败'
        };
    }

    /**
     * 性能分析
     */
    public async analyzePerformance(): Promise<{
        bottlenecks: string[];
        recommendations: string[];
        score: number;
    }> {
        const metrics = this.getMetrics();
        const events = this.getEvents({ limit: 50 });
        const cacheStats = this.getCacheStats();

        const bottlenecks: string[] = [];
        const recommendations: string[] = [];
        let score = 100; // 初始分数

        // 分析CPU瓶颈
        if (metrics.cpuUsage > 80) {
            bottlenecks.push('CPU使用率过高');
            recommendations.push('考虑优化代码或增加服务器资源');
            score -= 20;
        }

        // 分析内存瓶颈
        if (metrics.memoryUsage > 85) {
            bottlenecks.push('内存使用率过高');
            recommendations.push('优化内存使用或增加内存');
            score -= 20;
        }

        // 分析响应时间瓶颈
        if (metrics.apiResponseTime > 500) {
            bottlenecks.push('响应时间过长');
            recommendations.push('优化数据库查询和代码逻辑');
            score -= 15;
        }

        // 分析缓存瓶颈
        if (cacheStats.hitRate < 0.7) {
            bottlenecks.push('缓存命中率低');
            recommendations.push('优化缓存策略和容量');
            score -= 10;
        }

        // 分析错误率
        if (metrics.apiErrorRate > 0.05) {
            bottlenecks.push('错误率较高');
            recommendations.push('加强错误处理和代码测试');
            score -= 15;
        }

        // 分析活跃连接数
        if (metrics.activeConnections > 1000) {
            bottlenecks.push('连接数过多');
            recommendations.push('考虑负载均衡或连接池优化');
            score -= 10;
        }

        // 确保分数在合理范围内
        score = Math.max(0, Math.min(100, score));

        return {
            bottlenecks,
            recommendations,
            score
        };
    }

    /**
     * 生成性能优化报告
     */
    public async generateOptimizationReport(): Promise<{
        summary: {
            overallScore: number;
            status: 'excellent' | 'good' | 'fair' | 'poor';
            timestamp: string;
        };
        analysis: {
            bottlenecks: string[];
            recommendations: string[];
        };
        detailedMetrics: PerformanceMetrics;
        events: PerformanceEvent[];
        cacheStats: any;
    }> {
        const analysis = await this.analyzePerformance();
        const metrics = this.getMetrics();
        const events = this.getEvents({ limit: 100 });
        const cacheStats = this.getCacheStats();

        let status: 'excellent' | 'good' | 'fair' | 'poor';
        if (analysis.score >= 90) {
            status = 'excellent';
        } else if (analysis.score >= 75) {
            status = 'good';
        } else if (analysis.score >= 60) {
            status = 'fair';
        } else {
            status = 'poor';
        }

        return {
            summary: {
                overallScore: analysis.score,
                status,
                timestamp: new Date().toISOString()
            },
            analysis: {
                bottlenecks: analysis.bottlenecks,
                recommendations: analysis.recommendations
            },
            detailedMetrics: metrics,
            events,
            cacheStats
        };
    }

    /**
     * 停止性能优化服务
     */
    public async shutdown(): Promise<void> {
        try {
            monitoringService.stopMonitoring();
            await cacheService.clear();
            this.isInitialized = false;
            console.log('性能优化服务已停止');
        } catch (error) {
            console.error('停止性能优化服务失败:', error);
            throw error;
        }
    }

    /**
     * 验证配置
     */
    private validateConfig(config: PerformanceConfig): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // 验证监控配置
        if (config.monitoring.enabled && config.monitoring.sampleRate <= 0) {
            errors.push('监控采样率必须大于0');
        }

        if (config.monitoring.reportInterval <= 0) {
            errors.push('报告间隔必须大于0');
        }

        // 验证缓存配置
        if (config.cache.enabled && config.cache.defaultTTL <= 0) {
            errors.push('缓存默认TTL必须大于0');
        }

        if (config.cache.maxSize <= 0) {
            errors.push('缓存最大大小必须大于0');
        }

        // 验证阈值配置
        if (config.monitoring.thresholds.cpuUsage <= 0 || config.monitoring.thresholds.cpuUsage > 100) {
            errors.push('CPU使用率阈值必须在1-100之间');
        }

        if (config.monitoring.thresholds.memoryUsage <= 0 || config.monitoring.thresholds.memoryUsage > 100) {
            errors.push('内存使用率阈值必须在1-100之间');
        }

        if (config.monitoring.thresholds.apiResponseTime <= 0) {
            errors.push('API响应时间阈值必须大于0');
        }

        if (config.monitoring.thresholds.apiErrorRate < 0 || config.monitoring.thresholds.apiErrorRate > 100) {
            errors.push('API错误率阈值必须在0-100之间');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 生成唯一ID
     */
    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

// 创建服务实例
export const performanceService = PerformanceOptimization.getInstance();

export default performanceService;