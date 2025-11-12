import {
    PerformanceMetrics,
    PerformanceEvent,
    PerformanceEventType,
    MonitorRequest,
    QueryMonitor,
    ResourceUsage,
    PerformanceAlert
} from '../types/performance.types';
import { getMonitoringConfig } from '../config/performance.config';

/**
 * 性能监控服务
 * 负责收集、分析和报告系统性能指标
 */
export class MonitoringService {
    private config: ReturnType<typeof getMonitoringConfig>;
    private metrics: PerformanceMetrics[];
    private events: PerformanceEvent[];
    private alerts: PerformanceAlert[];
    private requests: MonitorRequest[];
    private queries: QueryMonitor[];
    private resourceUsage: ResourceUsage[];
    private isMonitoring: boolean;
    private reportInterval: NodeJS.Timeout | null;

    constructor(config?: ReturnType<typeof getMonitoringConfig>) {
        this.config = config || getMonitoringConfig();
        this.metrics = [];
        this.events = [];
        this.alerts = [];
        this.requests = [];
        this.queries = [];
        this.resourceUsage = [];
        this.isMonitoring = false;
        this.reportInterval = null;
    }

    /**
     * 初始化监控服务
     */
    async initialize(): Promise<void> {
        // 验证配置
        const errors = this.validateConfig(this.config);
        if (errors.length > 0) {
            throw new Error(`监控配置验证失败: ${errors.join(', ')}`);
        }

        console.log('监控服务初始化完成');
    }

    /**
     * 开始性能监控
     */
    startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        // 记录开始监控事件
        this.recordEvent('monitoring_started', 'low', '性能监控已启动');

        // 设置定期报告
        if (this.config.reportInterval > 0) {
            this.reportInterval = setInterval(() => {
                this.generateReport();
            }, this.config.reportInterval);
        }

        // 开始收集系统资源使用情况
        this.startResourceMonitoring();

        console.log('性能监控服务已启动');
    }

    /**
     * 停止性能监控
     */
    stopMonitoring(): void {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;

        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
        }

        // 记录停止监控事件
        this.recordEvent('monitoring_stopped', 'low', '性能监控已停止');

        console.log('性能监控服务已停止');
    }

    /**
     * 开始资源监控
     */
    private startResourceMonitoring(): void {
        // 定期收集资源使用情况
        const resourceInterval = setInterval(() => {
            if (!this.isMonitoring) {
                clearInterval(resourceInterval);
                return;
            }

            this.collectResourceUsage();
        }, 5000); // 每5秒收集一次
    }

    /**
     * 收集资源使用情况
     */
    private collectResourceUsage(): void {
        const usage: ResourceUsage = {
            timestamp: new Date(),
            memory: this.getMemoryUsage(),
            cpu: this.getCpuUsage(),
            disk: this.getDiskUsage(),
            network: this.getNetworkUsage()
        };

        this.resourceUsage.push(usage);

        // 限制数据量，避免内存泄漏
        if (this.resourceUsage.length > 1000) {
            this.resourceUsage = this.resourceUsage.slice(-500);
        }

        // 检查资源使用阈值
        this.checkResourceThresholds(usage);
    }

    /**
     * 获取内存使用情况
     */
    private getMemoryUsage(): ResourceUsage['memory'] {
        const used = process.memoryUsage().heapUsed / 1024 / 1024; // MB
        const total = process.memoryUsage().heapTotal / 1024 / 1024; // MB
        const percentage = (used / total) * 100;

        return { used, total, percentage };
    }

    /**
     * 获取CPU使用情况
     */
    private getCpuUsage(): ResourceUsage['cpu'] {
        // 简化实现，实际应该使用更精确的CPU监控
        const usage = process.cpuUsage();
        const total = usage.user + usage.system;
        const percentage = (total / 1000000) * 100; // 转换为百分比

        return { used: percentage, total: 100, percentage };
    }

    /**
     * 获取磁盘使用情况
     */
    private getDiskUsage(): ResourceUsage['disk'] {
        // 简化实现，实际应该检查磁盘空间
        return { used: 0, total: 0, percentage: 0 };
    }

    /**
     * 获取网络使用情况
     */
    private getNetworkUsage(): ResourceUsage['network'] {
        // 简化实现，实际应该监控网络流量
        return { bytesIn: 0, bytesOut: 0 };
    }

    /**
     * 检查资源使用阈值
     */
    private checkResourceThresholds(usage: ResourceUsage): void {
        const { thresholds } = this.config;

        // 检查内存使用
        if (usage.memory.percentage > thresholds.memoryUsage) {
            this.recordAlert('high_memory_usage', 'high',
                `内存使用率过高: ${usage.memory.percentage.toFixed(1)}%`,
                'memoryUsage', thresholds.memoryUsage, usage.memory.percentage);
        }

        // 检查CPU使用
        if (usage.cpu.percentage > thresholds.cpuUsage) {
            this.recordAlert('high_cpu_usage', 'high',
                `CPU使用率过高: ${usage.cpu.percentage.toFixed(1)}%`,
                'cpuUsage', thresholds.cpuUsage, usage.cpu.percentage);
        }
    }

    /**
     * 记录API请求
     */
    recordRequest(request: Omit<MonitorRequest, 'startTime' | 'endTime' | 'duration'>): void {
        if (!this.isMonitoring || Math.random() > this.config.sampleRate) {
            return;
        }

        const fullRequest: MonitorRequest = {
            ...request,
            startTime: new Date(),
            endTime: new Date(),
            duration: 0
        };

        this.requests.push(fullRequest);

        // 限制数据量
        if (this.requests.length > 10000) {
            this.requests = this.requests.slice(-5000);
        }
    }

    /**
     * 完成API请求记录
     */
    completeRequest(requestId: string, statusCode: number, error?: string): void {
        const request = this.requests.find(req =>
            req.method && req.url && req.startTime && req.startTime.getTime().toString() === requestId
        );

        if (request) {
            request.endTime = new Date();
            request.duration = request.endTime.getTime() - request.startTime.getTime();
            request.statusCode = statusCode;

            if (error) {
                request.metadata = request.metadata || {};
                request.metadata.error = error;
            }

            // 检查响应时间阈值
            if (request.duration > this.config.thresholds.apiResponseTime) {
                this.recordEvent('api_slow_response', 'medium',
                    `API响应时间过长: ${request.duration}ms`,
                    { method: request.method, url: request.url, duration: request.duration });
            }

            // 检查错误率
            if (statusCode >= 400) {
                this.recordEvent('api_error', 'medium',
                    `API返回错误: ${statusCode}`,
                    { method: request.method, url: request.url, statusCode });
            }
        }
    }

    /**
     * 记录数据库查询
     */
    recordQuery(query: Omit<QueryMonitor, 'startTime' | 'duration'>): string {
        if (!this.isMonitoring || Math.random() > this.config.sampleRate) {
            return '';
        }

        const fullQuery: QueryMonitor = {
            ...query,
            startTime: new Date(),
            duration: 0
        };

        this.queries.push(fullQuery);

        // 限制数据量
        if (this.queries.length > 5000) {
            this.queries = this.queries.slice(-2500);
        }

        return fullQuery.startTime.getTime().toString();
    }

    /**
     * 完成查询记录
     */
    completeQuery(queryId: string, rowsAffected?: number, error?: string): void {
        const query = this.queries.find(q => q.startTime.getTime().toString() === queryId);

        if (query) {
            query.duration = Date.now() - query.startTime.getTime();
            if (rowsAffected !== undefined) {
                query.rowsAffected = rowsAffected;
            }

            if (error) {
                query.error = error;
            }

            // 检查查询时间阈值
            if (query.duration > this.config.thresholds.dbQueryTime) {
                this.recordEvent('db_slow_query', 'medium',
                    `数据库查询时间过长: ${query.duration}ms`,
                    { sql: query.sql, duration: query.duration, table: query.table });
            }
        }
    }

    /**
     * 记录性能事件
     */
    recordEvent(type: PerformanceEventType, severity: PerformanceEvent['severity'], message: string, data?: any): void {
        const event: PerformanceEvent = {
            id: this.generateId(),
            type,
            timestamp: new Date(),
            severity,
            message,
            data,
            resolved: false
        };

        this.events.push(event);

        // 限制事件数量
        if (this.events.length > 1000) {
            this.events = this.events.slice(-500);
        }

        // 发送告警
        if (this.config.alerts.enabled && ['high', 'critical'].includes(severity)) {
            this.sendAlert(event);
        }
    }

    /**
     * 记录性能告警
     */
    private recordAlert(
        type: PerformanceEventType,
        severity: PerformanceAlert['severity'],
        message: string,
        metric: keyof PerformanceMetrics,
        threshold: number,
        currentValue: number
    ): void {
        const alert: PerformanceAlert = {
            id: this.generateId(),
            type,
            severity,
            message,
            metric,
            threshold,
            currentValue,
            triggeredAt: new Date(),
            acknowledged: false
        };

        this.alerts.push(alert);

        // 限制告警数量
        if (this.alerts.length > 500) {
            this.alerts = this.alerts.slice(-250);
        }
    }

    /**
     * 发送告警
     */
    private sendAlert(event: PerformanceEvent): void {
        const { channels, recipients } = this.config.alerts;

        // 这里实现告警发送逻辑
        console.log(`性能告警 [${event.severity.toUpperCase()}]: ${event.message}`);

        if (channels.includes('console')) {
            console.warn('性能告警详情:', event);
        }

        // 可以添加邮件、Slack、Webhook等告警渠道
    }

    /**
     * 生成性能报告
     */
    generateReport(): {
        period: { start: Date; end: Date };
        metrics: PerformanceMetrics;
        events: PerformanceEvent[];
        alerts: PerformanceAlert[];
        summary: {
            totalRequests: number;
            averageResponseTime: number;
            errorRate: number;
            slowQueries: number;
            activeAlerts: number;
        };
    } {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // 过滤最近一小时的请求
        const recentRequests = this.requests.filter(req => req.startTime >= oneHourAgo);
        const recentQueries = this.queries.filter(q => q.startTime >= oneHourAgo);
        const recentEvents = this.events.filter(e => e.timestamp >= oneHourAgo);
        const activeAlerts = this.alerts.filter(a => !a.resolvedAt);

        // 计算性能指标
        const totalRequests = recentRequests.length;
        const successfulRequests = recentRequests.filter(req => req.statusCode && req.statusCode < 400).length;
        const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0;
        const averageResponseTime = totalRequests > 0
            ? recentRequests.reduce((sum, req) => sum + (req.duration || 0), 0) / totalRequests
            : 0;
        const slowQueries = recentQueries.filter(q => q.duration > this.config.thresholds.dbQueryTime).length;

        // 生成当前性能指标
        const currentMetrics: PerformanceMetrics = {
            apiResponseTime: averageResponseTime,
            apiThroughput: totalRequests / 3600, // 请求/秒
            apiErrorRate: errorRate,
            dbQueryTime: recentQueries.length > 0
                ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length
                : 0,
            dbConnectionCount: 0, // 需要从数据库连接池获取
            dbSlowQueryCount: slowQueries,
            memoryUsage: this.getMemoryUsage().used,
            cpuUsage: this.getCpuUsage().used,
            diskUsage: 0,
            networkLatency: 0,
            bandwidthUsage: 0,
            activeUsers: new Set(recentRequests.map(req => req.userId)).size,
            concurrentRequests: Math.max(...this.calculateConcurrentRequests(recentRequests)),
            activeConnections: 0, // 活跃连接数
            timestamp: now
        };

        return {
            period: { start: oneHourAgo, end: now },
            metrics: currentMetrics,
            events: recentEvents,
            alerts: activeAlerts,
            summary: {
                totalRequests,
                averageResponseTime,
                errorRate,
                slowQueries,
                activeAlerts: activeAlerts.length
            }
        };
    }

    /**
     * 计算并发请求数
     */
    private calculateConcurrentRequests(requests: MonitorRequest[]): number[] {
        if (requests.length === 0) return [0];

        const timeline: number[] = [];
        const startTime = Math.min(...requests.map(req => req.startTime.getTime()));
        const endTime = Math.max(...requests.map(req => req.endTime?.getTime() || req.startTime.getTime()));

        for (let time = startTime; time <= endTime; time += 1000) { // 每秒采样
            const concurrent = requests.filter(req =>
                req.startTime.getTime() <= time &&
                (req.endTime?.getTime() || time + 1000) >= time
            ).length;

            timeline.push(concurrent);
        }

        return timeline;
    }

    /**
     * 获取当前性能指标
     */
    getCurrentMetrics(): PerformanceMetrics {
        const recentRequests = this.requests.slice(-100); // 最近100个请求
        const totalRequests = recentRequests.length;
        const successfulRequests = recentRequests.filter(req => req.statusCode && req.statusCode < 400).length;
        const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0;
        const averageResponseTime = totalRequests > 0
            ? recentRequests.reduce((sum, req) => sum + (req.duration || 0), 0) / totalRequests
            : 0;

        return {
            apiResponseTime: averageResponseTime,
            apiThroughput: totalRequests / 60, // 请求/分钟
            apiErrorRate: errorRate,
            dbQueryTime: 0,
            dbConnectionCount: 0,
            dbSlowQueryCount: 0,
            memoryUsage: this.getMemoryUsage().used,
            cpuUsage: this.getCpuUsage().used,
            diskUsage: 0,
            networkLatency: 0,
            bandwidthUsage: 0,
            activeUsers: 0,
            concurrentRequests: 0,
            activeConnections: 0, // 活跃连接数
            timestamp: new Date()
        };
    }

    /**
     * 获取未解决的事件
     */
    getUnresolvedEvents(): PerformanceEvent[] {
        return this.events.filter(event => !event.resolved);
    }

    /**
     * 解决事件
     */
    resolveEvent(eventId: string): boolean {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            event.resolved = true;
            return true;
        }
        return false;
    }

    /**
     * 确认告警
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedBy = acknowledgedBy;
            alert.acknowledgedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * 生成唯一ID
     */
    private generateId(): string {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    /**
     * 验证监控配置
     */
    private validateConfig(config: ReturnType<typeof getMonitoringConfig>): string[] {
        const errors: string[] = [];

        if (typeof config.enabled !== 'boolean') {
            errors.push('enabled must be a boolean');
        }

        if (config.sampleRate < 0 || config.sampleRate > 1) {
            errors.push('sampleRate must be between 0 and 1');
        }

        if (config.reportInterval < 1000) {
            errors.push('reportInterval must be at least 1000ms');
        }

        if (config.retentionPeriod < 1) {
            errors.push('retentionPeriod must be at least 1 day');
        }

        // 验证阈值配置
        if (config.thresholds.apiResponseTime < 0) {
            errors.push('apiResponseTime threshold must be positive');
        }

        if (config.thresholds.dbQueryTime < 0) {
            errors.push('dbQueryTime threshold must be positive');
        }

        if (config.thresholds.memoryUsage < 0) {
            errors.push('memoryUsage threshold must be positive');
        }

        if (config.thresholds.cpuUsage < 0 || config.thresholds.cpuUsage > 100) {
            errors.push('cpuUsage threshold must be between 0 and 100');
        }

        if (config.thresholds.apiErrorRate < 0 || config.thresholds.apiErrorRate > 100) {
            errors.push('apiErrorRate threshold must be between 0 and 100');
        }

        return errors;
    }

    /**
     * 清理旧数据
     */
    cleanupOldData(): void {
        const retentionTime = Date.now() - (this.config.retentionPeriod * 24 * 60 * 60 * 1000);

        this.requests = this.requests.filter(req => req.startTime.getTime() > retentionTime);
        this.queries = this.queries.filter(q => q.startTime.getTime() > retentionTime);
        this.events = this.events.filter(e => e.timestamp.getTime() > retentionTime);
        this.alerts = this.alerts.filter(a => a.triggeredAt.getTime() > retentionTime);
        this.resourceUsage = this.resourceUsage.filter(r => r.timestamp.getTime() > retentionTime);
    }

    /**
     * 销毁服务
     */
    destroy(): void {
        this.stopMonitoring();
        this.metrics = [];
        this.events = [];
        this.alerts = [];
        this.requests = [];
        this.queries = [];
        this.resourceUsage = [];
    }
}

// 创建单例实例
const monitoringService = new MonitoringService();

export default monitoringService;