import { Router } from 'express';
import { syncController } from '../controllers/sync.controller';

const router = Router();

// 批量同步接口
router.post('/batch-sync', syncController.batchSync.bind(syncController));

// 获取同步状态
router.get('/status/:userId', syncController.getSyncStatus.bind(syncController));

// 获取冲突列表
router.get('/conflicts/:userId', syncController.getConflicts.bind(syncController));

// 解决冲突
router.post('/conflicts/:userId/:conflictId/resolve', syncController.resolveConflict.bind(syncController));

// 清理已解决的冲突
router.delete('/conflicts/:userId/cleanup', syncController.cleanupConflicts.bind(syncController));

// 获取用户配置
router.get('/config/:userId', syncController.getUserConfig.bind(syncController));

// 更新用户配置
router.put('/config/:userId', syncController.updateUserConfig.bind(syncController));

// 健康检查
router.get('/health', syncController.healthCheck.bind(syncController));

export default router;