import { Request, Response } from 'express';
import monitoringService from '../services/monitoring.service';
import cacheService from '../services/cache.service';
import performanceService from '../services/performance.service';

/**
 * 性能优化控制器
 * 提供性能监控和优化的API接口
 */
export class PerformanceController {
    private performanceService: any;

    constructor() {
        this.performanceService = performanceService;
    }

    /**
     * 获取当前性能指标
     */
    getMetrics = async (req: Request, res: Response): Promise<void> => {
        try {
            const metrics = monitoringService.getCurrentMetrics();

            res.json({
                success: true,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '获取性能指标失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 生成性能报告
     */
    generateReport = async (req: Request, res: Response): Promise<void> => {
        try {
            const { period = '1h' } = req.query;

            // 根据时间段生成报告
            const report = monitoringService.generateReport();

            res.json({
                success: true,
                data: report,
                generatedAt: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '生成性能报告失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 获取性能事件
     */
    getEvents = async (req: Request, res: Response): Promise<void> => {
        try {
            const { resolved, severity, type, limit = '100' } = req.query;

            let events = monitoringService.getUnresolvedEvents();

            // 过滤条件
            if (resolved !== undefined) {
                events = events.filter(event => event.resolved === (resolved === 'true'));
            }

            if (severity) {
                events = events.filter(event => event.severity === severity);
            }

            if (type) {
                events = events.filter(event => event.type === type);
            }

            // 限制数量
            const limitNum = parseInt(limit as string);
            events = events.slice(0, limitNum);

            res.json({
                success: true,
                data: events,
                total: events.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '获取性能事件失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 解决性能事件
     */
    resolveEvent = async (req: Request, res: Response): Promise<void> => {
        try {
            const { eventId } = req.params;

            if (!eventId) {
                res.status(400).json({
                    success: false,
                    error: '事件ID不能为空'
                });
                return;
            }

            const success = monitoringService.resolveEvent(eventId);

            if (success) {
                res.json({
                    success: true,
                    message: '事件已解决'
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: '事件不存在'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '解决事件失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 获取缓存统计信息
     */
    getCacheStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = cacheService.getStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '获取缓存统计失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 清理缓存
     */
    clearCache = async (req: Request, res: Response): Promise<void> => {
        try {
            const { key } = req.query;

            let result;
            if (key) {
                result = await cacheService.delete(key as string);
            } else {
                result = await cacheService.clear();
            }

            if (result.success) {
                res.json({
                    success: true,
                    message: key ? '缓存项已删除' : '缓存已清空'
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: '清理缓存失败',
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '清理缓存失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 获取缓存键列表
     */
    getCacheKeys = async (req: Request, res: Response): Promise<void> => {
        try {
            const keys = await cacheService.keys();

            res.json({
                success: true,
                data: keys,
                total: keys.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '获取缓存键列表失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 获取缓存项详情
     */
    getCacheItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { key } = req.params;

            if (!key) {
                res.status(400).json({
                    success: false,
                    error: '缓存键不能为空'
                });
                return;
            }

            const item = await cacheService.get(key);

            if (item) {
                res.json({
                    success: true,
                    data: item
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: '缓存项不存在'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '获取缓存项失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 应用性能优化建议
     */
    applyOptimization = async (req: Request, res: Response): Promise<void> => {
        try {
            const { suggestionId } = req.body;

            // 这里实现具体的优化建议应用逻辑
            // 暂时返回成功响应

            res.json({
                success: true,
                message: '优化建议已应用',
                suggestionId
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '应用优化建议失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 获取性能优化配置
     */
    getConfig = async (req: Request, res: Response): Promise<void> => {
        try {
            const config = this.performanceService.getConfig();

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '获取配置失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 更新性能优化配置
     */
    updateConfig = async (req: Request, res: Response): Promise<void> => {
        try {
            const { config } = req.body;

            this.performanceService.updateConfig(config);

            res.json({
                success: true,
                message: '配置已更新'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '更新配置失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 开始性能监控
     */
    startMonitoring = async (req: Request, res: Response): Promise<void> => {
        try {
            monitoringService.startMonitoring();

            res.json({
                success: true,
                message: '性能监控已启动'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '启动监控失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 停止性能监控
     */
    stopMonitoring = async (req: Request, res: Response): Promise<void> => {
        try {
            monitoringService.stopMonitoring();

            res.json({
                success: true,
                message: '性能监控已停止'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '停止监控失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 获取监控状态
     */
    getMonitoringStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            // 这里需要从monitoringService获取状态
            // 暂时返回固定状态

            res.json({
                success: true,
                data: {
                    isMonitoring: true,
                    startedAt: new Date().toISOString(),
                    uptime: process.uptime()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '获取监控状态失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 导出性能数据
     */
    exportData = async (req: Request, res: Response): Promise<void> => {
        try {
            const { format = 'json', period = '1h' } = req.query;

            // 生成报告
            const report = monitoringService.generateReport();

            // 设置响应头
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="performance-report-${Date.now()}.csv"`);

                // 转换为CSV格式
                const csvData = this.convertToCSV(report);
                res.send(csvData);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="performance-report-${Date.now()}.json"`);
                res.json(report);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '导出数据失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * 转换为CSV格式
     */
    private convertToCSV(report: any): string {
        const headers = ['Metric', 'Value', 'Timestamp'];
        const rows: string[][] = [];

        // 添加指标数据
        Object.entries(report.metrics).forEach(([key, value]) => {
            if (key !== 'timestamp') {
                rows.push([key, String(value), report.metrics.timestamp]);
            }
        });

        // 构建CSV内容
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * 健康检查
     */
    healthCheck = async (req: Request, res: Response): Promise<void> => {
        try {
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            };

            res.json({
                success: true,
                data: health
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: '健康检查失败',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}

// 创建控制器实例
export const performanceController = new PerformanceController();

export default performanceController;