/**
 * 性能优化模块类型定义
 */

/**
 * 性能配置接口
 */
export interface PerformanceConfig {
    cache: CacheConfig;
    monitoring: MonitoringConfig;
}

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
    // API性能指标
    apiResponseTime: number; // API平均响应时间(ms)
    apiThroughput: number;   // API吞吐量(请求/秒)
    apiErrorRate: number;    // API错误率(%)

    // 数据库性能指标
    dbQueryTime: number;     // 数据库查询平均时间(ms)
    dbConnectionCount: number; // 数据库连接数
    dbSlowQueryCount: number; // 慢查询数量

    // 系统资源指标
    memoryUsage: number;     // 内存使用量(MB)
    cpuUsage: number;        // CPU使用率(%)
    diskUsage: number;       // 磁盘使用率(%)

    // 网络指标
    networkLatency: number;  // 网络延迟(ms)
    bandwidthUsage: number;  // 带宽使用率(%)

    // 业务指标
    activeUsers: number;     // 活跃用户数
    concurrentRequests: number; // 并发请求数
    activeConnections: number; // 活跃连接数

    timestamp: Date;         // 指标时间戳
}

/**
 * 性能事件接口
 */
export interface PerformanceEvent {
    id: string;
    type: PerformanceEventType;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    data?: any;
    resolved?: boolean;
}

/**
 * 性能事件类型
 */
export type PerformanceEventType =
    | 'api_slow_response'
    | 'api_error'
    | 'db_slow_query'
    | 'high_memory_usage'
    | 'high_cpu_usage'
    | 'cache_miss'
    | 'connection_pool_exhausted'
    | 'memory_leak_detected'
    | 'disk_space_low'
    | 'monitoring_started'
    | 'monitoring_stopped';

/**
 * 优化建议接口
 */
export interface OptimizationSuggestion {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: 'small' | 'medium' | 'large';
    estimatedSavings: number; // 预计节省的时间(ms)或资源
    action: OptimizationAction;
    parameters?: Record<string, any>;
}

/**
 * 优化操作类型
 */
export type OptimizationAction =
    | 'add_index'
    | 'optimize_query'
    | 'enable_caching'
    | 'adjust_cache_ttl'
    | 'scale_resources'
    | 'optimize_memory'
    | 'enable_compression'
    | 'implement_cdn';

/**
 * 缓存统计接口
 */
export interface CacheStats {
    hitCount: number;        // 缓存命中次数
    missCount: number;       // 缓存未命中次数
    hitRate: number;         // 缓存命中率(%)
    size: number;            // 缓存大小(bytes)
    itemCount: number;       // 缓存项数量
    memoryUsage: number;     // 内存使用量(MB)
    evictionCount: number;   // 缓存驱逐次数

    // 按类型统计
    byType: Record<string, {
        hitCount: number;
        missCount: number;
        size: number;
    }>;
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
    id: string;
    period: {
        start: Date;
        end: Date;
    };
    metrics: PerformanceMetrics;
    events: PerformanceEvent[];
    suggestions: OptimizationSuggestion[];
    summary: {
        overallScore: number;      // 总体性能分数(0-100)
        status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
        trend: 'improving' | 'stable' | 'declining';
        keyIssues: string[];
        recommendations: string[];
    };
    generatedAt: Date;
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
    enabled: boolean;
    strategy: 'memory' | 'redis' | 'hybrid';
    defaultTTL: number;          // 默认过期时间(秒)
    maxSize: number;             // 最大缓存大小
    compression: boolean;        // 是否启用压缩
    namespace?: string;         // 缓存命名空间
}

/**
 * 监控配置接口
 */
export interface MonitoringConfig {
    enabled: boolean;
    sampleRate: number;         // 采样率(0-1)
    reportInterval: number;    // 报告间隔(ms)
    retentionPeriod: number;   // 数据保留时间(天)

    thresholds: {
        apiResponseTime: number; // API响应时间阈值(ms)
        dbQueryTime: number;     // 数据库查询时间阈值(ms)
        memoryUsage: number;     // 内存使用阈值(MB)
        cpuUsage: number;        // CPU使用阈值(%)
        apiErrorRate: number;       // API错误率阈值(%)
    };

    alerts: {
        enabled: boolean;
        channels: string[];      // 告警渠道: email, slack, webhook
        recipients: string[];    // 告警接收人
    };
}

/**
 * 数据库优化建议接口
 */
export interface DatabaseOptimization {
    tableName: string;
    issue: string;
    suggestion: string;
    impact: 'low' | 'medium' | 'high';
    sql?: string;              // 优化SQL语句
}

/**
 * 性能分析结果接口
 */
export interface PerformanceAnalysis {
    bottlenecks: Bottleneck[];
    recommendations: Recommendation[];
    metrics: PerformanceMetrics;
    timeline: PerformanceTimeline[];
}

/**
 * 性能瓶颈接口
 */
export interface Bottleneck {
    type: 'api' | 'database' | 'memory' | 'cpu' | 'network' | 'disk';
    location: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number;            // 影响程度(0-100)
    suggestions: string[];
}

/**
 * 优化建议详情接口
 */
export interface Recommendation {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high'; // 实施难度
    estimatedImpact: number;   // 预计影响(0-100)
    implementationSteps: string[];
    risks: string[];
}

/**
 * 性能时间线接口
 */
export interface PerformanceTimeline {
    timestamp: Date;
    metric: keyof PerformanceMetrics;
    value: number;
    trend: 'up' | 'down' | 'stable';
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
    key: string;
    value: T;
    createdAt: Date;
    expiresAt?: Date;
    accessCount: number;
    lastAccessed: Date;
    tags?: string[];
    metadata?: Record<string, any>;
}

/**
 * 缓存操作结果接口
 */
export interface CacheOperationResult {
    success: boolean;
    operation: 'get' | 'set' | 'delete' | 'clear';
    key?: string;
    error?: string;
    duration?: number;
}

/**
 * 性能监控请求接口
 */
export interface MonitorRequest {
    method: string;
    url: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    statusCode?: number;
    userAgent?: string;
    ip?: string;
    userId?: string;
    metadata?: Record<string, any>;
}

/**
 * 数据库查询监控接口
 */
export interface QueryMonitor {
    sql: string;
    duration: number;
    startTime: Date;
    table?: string;
    rowsAffected?: number;
    error?: string;
    explainPlan?: any;
}

/**
 * 资源使用监控接口
 */
export interface ResourceUsage {
    timestamp: Date;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    cpu: {
        used: number;
        total: number;
        percentage: number;
    };
    disk: {
        used: number;
        total: number;
        percentage: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
    };
}

/**
 * 性能告警接口
 */
export interface PerformanceAlert {
    id: string;
    type: PerformanceEventType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metric: keyof PerformanceMetrics;
    threshold: number;
    currentValue: number;
    triggeredAt: Date;
    resolvedAt?: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
}