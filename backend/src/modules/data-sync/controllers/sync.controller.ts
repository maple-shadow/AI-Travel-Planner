import { Request, Response } from 'express';
import { syncService } from '../services/sync.service';
import { BatchSyncRequest, ConflictResolution } from '../types/sync.types';

export class SyncController {
    // 批量同步接口
    async batchSync(req: Request, res: Response): Promise<void> {
        try {
            const request: BatchSyncRequest = {
                userId: req.body.userId,
                deviceId: req.body.deviceId,
                changes: req.body.changes || [],
                lastSyncTime: req.body.lastSyncTime
            };

            // 验证请求参数
            if (!request.userId || !request.deviceId) {
                res.status(400).json({
                    success: false,
                    error: '用户ID和设备ID不能为空'
                });
                return;
            }

            const result = await syncService.batchSync(request);

            res.json({
                success: result.success,
                data: result
            });
        } catch (error) {
            console.error('批量同步错误:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }

    // 获取同步状态
    async getSyncStatus(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    error: '用户ID不能为空'
                });
                return;
            }

            const status = await syncService.getSyncStatus(userId);

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            console.error('获取同步状态错误:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }

    // 获取冲突列表
    async getConflicts(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    error: '用户ID不能为空'
                });
                return;
            }

            const conflicts = await syncService.getConflicts(userId);

            res.json({
                success: true,
                data: conflicts
            });
        } catch (error) {
            console.error('获取冲突列表错误:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }

    // 解决冲突
    async resolveConflict(req: Request, res: Response): Promise<void> {
        try {
            const { userId, conflictId } = req.params;
            const { resolution } = req.body;

            if (!userId || !conflictId || !resolution) {
                res.status(400).json({
                    success: false,
                    error: '用户ID、冲突ID和解决方案不能为空'
                });
                return;
            }

            if (!['local', 'remote', 'merge'].includes(resolution)) {
                res.status(400).json({
                    success: false,
                    error: '解决方案必须是 local、remote 或 merge'
                });
                return;
            }

            await syncService.resolveConflict(userId, conflictId, resolution);

            res.json({
                success: true,
                message: '冲突解决成功'
            });
        } catch (error) {
            console.error('解决冲突错误:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }

    // 清理已解决的冲突
    async cleanupConflicts(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    error: '用户ID不能为空'
                });
                return;
            }

            await syncService.cleanupResolvedConflicts(userId);

            res.json({
                success: true,
                message: '冲突清理成功'
            });
        } catch (error) {
            console.error('清理冲突错误:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }

    // 获取用户配置
    async getUserConfig(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    error: '用户ID不能为空'
                });
                return;
            }

            const config = await syncService.getUserConfig(userId);

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            console.error('获取用户配置错误:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }

    // 更新用户配置
    async updateUserConfig(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const config = req.body;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    error: '用户ID不能为空'
                });
                return;
            }

            await syncService.updateUserConfig(userId, config);

            res.json({
                success: true,
                message: '配置更新成功'
            });
        } catch (error) {
            console.error('更新用户配置错误:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }

    // 健康检查
    async healthCheck(req: Request, res: Response): Promise<void> {
        try {
            res.json({
                success: true,
                message: '数据同步服务运行正常',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        } catch (error) {
            console.error('健康检查错误:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
}

// 创建控制器实例
export const syncController = new SyncController();