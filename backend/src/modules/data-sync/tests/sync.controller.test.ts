import { Request, Response } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { syncService } from '../services/sync.service';

// Mock syncService
jest.mock('../services/sync.service');

describe('SyncController', () => {
    let syncController: SyncController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        syncController = new SyncController();
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('batchSync', () => {
        it('应该成功处理批量同步请求', async () => {
            const mockBatchSyncResult = {
                success: true,
                applied: 1,
                conflicts: 0,
                errors: [],
                syncTime: new Date().toISOString()
            };

            (syncService.batchSync as jest.Mock).mockResolvedValue(mockBatchSyncResult);

            mockRequest.body = {
                userId: 'user-1',
                deviceId: 'device-1',
                changes: [
                    {
                        id: 'change-1',
                        type: 'create',
                        entity: 'trip',
                        entityId: 'trip-123',
                        data: { name: '测试行程' },
                        timestamp: new Date().toISOString(),
                        userId: 'user-1',
                        deviceId: 'device-1'
                    }
                ]
            };

            await syncController.batchSync(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockBatchSyncResult
            });
        });

        it('应该验证请求参数', async () => {
            mockRequest.body = {
                userId: '',
                deviceId: '',
                changes: []
            };

            await syncController.batchSync(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: '用户ID和设备ID不能为空'
            });
        });

        it('应该处理同步服务错误', async () => {
            (syncService.batchSync as jest.Mock).mockRejectedValue(new Error('同步失败'));

            mockRequest.body = {
                userId: 'user-1',
                deviceId: 'device-1',
                changes: []
            };

            await syncController.batchSync(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: '同步失败'
            });
        });
    });

    describe('getSyncStatus', () => {
        it('应该成功获取同步状态', async () => {
            const mockStatus = {
                userId: 'user-1',
                isSyncing: false,
                lastSyncTime: null,
                pendingChanges: 0,
                conflicts: 0,
                deviceCount: 1
            };

            (syncService.getSyncStatus as jest.Mock).mockResolvedValue(mockStatus);

            mockRequest.params = { userId: 'user-1' };

            await syncController.getSyncStatus(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockStatus
            });
        });

        it('应该验证用户ID参数', async () => {
            mockRequest.params = { userId: '' };

            await syncController.getSyncStatus(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: '用户ID不能为空'
            });
        });
    });

    describe('getConflicts', () => {
        it('应该成功获取冲突列表', async () => {
            const mockConflicts = [
                {
                    id: 'conflict-1',
                    localChange: { id: 'change-1', type: 'update', entity: 'trip', entityId: 'trip-123' },
                    remoteChange: { id: 'change-2', type: 'update', entity: 'trip', entityId: 'trip-123' },
                    entity: 'trip',
                    entityId: 'trip-123',
                    description: '行程名称冲突'
                }
            ];

            (syncService.getConflicts as jest.Mock).mockResolvedValue(mockConflicts);

            mockRequest.params = { userId: 'user-1' };

            await syncController.getConflicts(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockConflicts
            });
        });
    });

    describe('resolveConflict', () => {
        it('应该成功解决冲突', async () => {
            (syncService.resolveConflict as jest.Mock).mockResolvedValue(undefined);

            mockRequest.params = { userId: 'user-1', conflictId: 'conflict-1' };
            mockRequest.body = { resolution: 'local' };

            await syncController.resolveConflict(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: '冲突解决成功'
            });
        });

        it('应该验证解决方案参数', async () => {
            mockRequest.params = { userId: 'user-1', conflictId: 'conflict-1' };
            mockRequest.body = { resolution: 'invalid' };

            await syncController.resolveConflict(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: '解决方案必须是 local、remote 或 merge'
            });
        });
    });

    describe('cleanupConflicts', () => {
        it('应该成功清理冲突', async () => {
            (syncService.cleanupResolvedConflicts as jest.Mock).mockResolvedValue(undefined);

            mockRequest.params = { userId: 'user-1' };

            await syncController.cleanupConflicts(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: '冲突清理成功'
            });
        });
    });

    describe('getUserConfig', () => {
        it('应该成功获取用户配置', async () => {
            const mockConfig = {
                autoSync: true,
                syncInterval: 30000,
                maxRetries: 3,
                conflictStrategy: 'smart'
            };

            (syncService.getUserConfig as jest.Mock).mockResolvedValue(mockConfig);

            mockRequest.params = { userId: 'user-1' };

            await syncController.getUserConfig(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockConfig
            });
        });
    });

    describe('updateUserConfig', () => {
        it('应该成功更新用户配置', async () => {
            (syncService.updateUserConfig as jest.Mock).mockResolvedValue(undefined);

            mockRequest.params = { userId: 'user-1' };
            mockRequest.body = { autoSync: false };

            await syncController.updateUserConfig(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: '配置更新成功'
            });
        });
    });

    describe('healthCheck', () => {
        it('应该返回健康状态', async () => {
            await syncController.healthCheck(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: '数据同步服务运行正常',
                timestamp: expect.any(String),
                version: '1.0.0'
            });
        });
    });
});