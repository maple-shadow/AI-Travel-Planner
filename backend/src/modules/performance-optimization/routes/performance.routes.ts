import { Router } from 'express';
import performanceController from '../controllers/performance.controller';

/**
 * 性能优化路由配置
 */
const performanceRouter = Router();

// 性能指标相关路由
performanceRouter.get('/metrics', performanceController.getMetrics);
performanceRouter.get('/report', performanceController.generateReport);
performanceRouter.get('/export', performanceController.exportData);

// 性能事件相关路由
performanceRouter.get('/events', performanceController.getEvents);
performanceRouter.patch('/events/:eventId/resolve', performanceController.resolveEvent);

// 缓存管理相关路由
performanceRouter.get('/cache/stats', performanceController.getCacheStats);
performanceRouter.get('/cache/keys', performanceController.getCacheKeys);
performanceRouter.get('/cache/:key', performanceController.getCacheItem);
performanceRouter.delete('/cache', performanceController.clearCache);
performanceRouter.delete('/cache/:key', performanceController.clearCache);

// 优化建议相关路由
performanceRouter.post('/optimizations/apply', performanceController.applyOptimization);

// 配置管理相关路由
performanceRouter.get('/config', performanceController.getConfig);
performanceRouter.put('/config', performanceController.updateConfig);

// 监控管理相关路由
performanceRouter.post('/monitoring/start', performanceController.startMonitoring);
performanceRouter.post('/monitoring/stop', performanceController.stopMonitoring);
performanceRouter.get('/monitoring/status', performanceController.getMonitoringStatus);

// 健康检查路由
performanceRouter.get('/health', performanceController.healthCheck);

/**
 * 性能优化API路由组
 */
export const performanceRoutes = Router();

// 所有性能优化相关路由都挂载到 /api/performance 路径下
performanceRoutes.use('/performance', performanceRouter);

export default performanceRoutes;