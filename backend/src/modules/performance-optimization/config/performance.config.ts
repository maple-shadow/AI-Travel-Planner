import { CacheConfig, MonitoringConfig } from '../types/performance.types';

/**
 * 性能优化模块配置
 */

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
    enabled: process.env.CACHE_ENABLED !== 'false',
    strategy: (process.env.CACHE_STRATEGY as 'memory' | 'redis' | 'hybrid') || 'memory',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'), // 1小时
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100'),
    compression: process.env.CACHE_COMPRESSION !== 'false',
    namespace: process.env.CACHE_NAMESPACE || 'performance'
};

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    sampleRate: parseFloat(process.env.MONITORING_SAMPLE_RATE || '0.1'),
    reportInterval: parseInt(process.env.MONITORING_REPORT_INTERVAL || '60000'), // 1分钟
    retentionPeriod: parseInt(process.env.MONITORING_RETENTION_PERIOD || '30'), // 30天

    thresholds: {
        apiResponseTime: parseInt(process.env.THRESHOLD_API_RESPONSE_TIME || '1000'),
        dbQueryTime: parseInt(process.env.THRESHOLD_DB_QUERY_TIME || '500'),
        memoryUsage: parseInt(process.env.THRESHOLD_MEMORY_USAGE || '500'),
        cpuUsage: parseInt(process.env.THRESHOLD_CPU_USAGE || '80'),
        apiErrorRate: parseFloat(process.env.THRESHOLD_ERROR_RATE || '5')
    },

    alerts: {
        enabled: process.env.ALERTS_ENABLED !== 'false',
        channels: process.env.ALERT_CHANNELS ? process.env.ALERT_CHANNELS.split(',') : ['console'],
        recipients: process.env.ALERT_RECIPIENTS ? process.env.ALERT_RECIPIENTS.split(',') : []
    }
};

/**
 * 获取缓存配置
 */
export const getCacheConfig = (): CacheConfig => {
    const config: CacheConfig = {
        ...DEFAULT_CACHE_CONFIG,
        // 环境变量覆盖
        enabled: process.env.CACHE_ENABLED ? process.env.CACHE_ENABLED === 'true' : DEFAULT_CACHE_CONFIG.enabled,
        strategy: (process.env.CACHE_STRATEGY as 'memory' | 'redis' | 'hybrid') || DEFAULT_CACHE_CONFIG.strategy,
        defaultTTL: process.env.CACHE_DEFAULT_TTL ? parseInt(process.env.CACHE_DEFAULT_TTL) : DEFAULT_CACHE_CONFIG.defaultTTL,
        maxSize: process.env.CACHE_MAX_SIZE ? parseInt(process.env.CACHE_MAX_SIZE) : DEFAULT_CACHE_CONFIG.maxSize,
        compression: process.env.CACHE_COMPRESSION ? process.env.CACHE_COMPRESSION === 'true' : DEFAULT_CACHE_CONFIG.compression
    };

    // 单独处理可选属性namespace
    const namespace = process.env.CACHE_NAMESPACE || DEFAULT_CACHE_CONFIG.namespace;
    if (namespace) {
        config.namespace = namespace;
    }

    return config;
};

/**
 * 获取监控配置
 */
export const getMonitoringConfig = (): MonitoringConfig => {
    return {
        ...DEFAULT_MONITORING_CONFIG,
        // 环境变量覆盖
        enabled: process.env.MONITORING_ENABLED ? process.env.MONITORING_ENABLED === 'true' : DEFAULT_MONITORING_CONFIG.enabled,
        sampleRate: process.env.MONITORING_SAMPLE_RATE ? parseFloat(process.env.MONITORING_SAMPLE_RATE) : DEFAULT_MONITORING_CONFIG.sampleRate,
        reportInterval: process.env.MONITORING_REPORT_INTERVAL ? parseInt(process.env.MONITORING_REPORT_INTERVAL) : DEFAULT_MONITORING_CONFIG.reportInterval,
        retentionPeriod: process.env.MONITORING_RETENTION_PERIOD ? parseInt(process.env.MONITORING_RETENTION_PERIOD) : DEFAULT_MONITORING_CONFIG.retentionPeriod,

        thresholds: {
            apiResponseTime: process.env.THRESHOLD_API_RESPONSE_TIME ? parseInt(process.env.THRESHOLD_API_RESPONSE_TIME) : DEFAULT_MONITORING_CONFIG.thresholds.apiResponseTime,
            dbQueryTime: process.env.THRESHOLD_DB_QUERY_TIME ? parseInt(process.env.THRESHOLD_DB_QUERY_TIME) : DEFAULT_MONITORING_CONFIG.thresholds.dbQueryTime,
            memoryUsage: process.env.THRESHOLD_MEMORY_USAGE ? parseInt(process.env.THRESHOLD_MEMORY_USAGE) : DEFAULT_MONITORING_CONFIG.thresholds.memoryUsage,
            cpuUsage: process.env.THRESHOLD_CPU_USAGE ? parseInt(process.env.THRESHOLD_CPU_USAGE) : DEFAULT_MONITORING_CONFIG.thresholds.cpuUsage,
            apiErrorRate: process.env.THRESHOLD_ERROR_RATE ? parseFloat(process.env.THRESHOLD_ERROR_RATE) : DEFAULT_MONITORING_CONFIG.thresholds.apiErrorRate
        },

        alerts: {
            enabled: process.env.ALERTS_ENABLED ? process.env.ALERTS_ENABLED === 'true' : DEFAULT_MONITORING_CONFIG.alerts.enabled,
            channels: process.env.ALERT_CHANNELS ? process.env.ALERT_CHANNELS.split(',') : DEFAULT_MONITORING_CONFIG.alerts.channels,
            recipients: process.env.ALERT_RECIPIENTS ? process.env.ALERT_RECIPIENTS.split(',') : DEFAULT_MONITORING_CONFIG.alerts.recipients
        }
    };
};

/**
 * 验证配置有效性
 */
export const validateConfig = (config: CacheConfig | MonitoringConfig): string[] => {
    const errors: string[] = [];

    if ('enabled' in config && typeof config.enabled !== 'boolean') {
        errors.push('enabled must be a boolean');
    }

    if ('strategy' in config && !['memory', 'redis', 'hybrid'].includes(config.strategy)) {
        errors.push('strategy must be one of: memory, redis, hybrid');
    }

    if ('defaultTTL' in config && (config.defaultTTL < 0 || config.defaultTTL > 31536000)) {
        errors.push('defaultTTL must be between 0 and 31536000 seconds (1 year)');
    }

    if ('maxSize' in config && config.maxSize < 0) {
        errors.push('maxSize must be a positive number');
    }

    if ('sampleRate' in config && (config.sampleRate < 0 || config.sampleRate > 1)) {
        errors.push('sampleRate must be between 0 and 1');
    }

    if ('reportInterval' in config && config.reportInterval < 1000) {
        errors.push('reportInterval must be at least 1000ms');
    }

    if ('retentionPeriod' in config && config.retentionPeriod < 1) {
        errors.push('retentionPeriod must be at least 1 day');
    }

    if ('thresholds' in config) {
        const { thresholds } = config;

        if (thresholds.apiResponseTime < 0) {
            errors.push('apiResponseTime threshold must be positive');
        }

        if (thresholds.dbQueryTime < 0) {
            errors.push('dbQueryTime threshold must be positive');
        }

        if (thresholds.memoryUsage < 0) {
            errors.push('memoryUsage threshold must be positive');
        }

        if (thresholds.cpuUsage < 0 || thresholds.cpuUsage > 100) {
            errors.push('cpuUsage threshold must be between 0 and 100');
        }

        if (thresholds.apiErrorRate < 0 || thresholds.apiErrorRate > 100) {
            errors.push('apiErrorRate threshold must be between 0 and 100');
        }
    }

    return errors;
};

/**
 * 获取完整的性能优化配置
 */
export const getPerformanceConfig = () => ({
    cache: getCacheConfig(),
    monitoring: getMonitoringConfig(),
    // 其他配置可以在这里添加
});

export default {
    cache: DEFAULT_CACHE_CONFIG,
    monitoring: DEFAULT_MONITORING_CONFIG,
    getCacheConfig,
    getMonitoringConfig,
    validateConfig,
    getPerformanceConfig
};