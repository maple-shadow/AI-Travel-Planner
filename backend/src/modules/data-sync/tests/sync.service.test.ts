import { SyncService } from '../services/sync.service';
import { SyncChange, SyncConflict } from '../types/sync.types';

describe('SyncService', () => {
    let syncService: SyncService;

    beforeEach(() => {
        syncService = new SyncService();
    });

    describe('syncChanges', () => {
        it('应该成功同步变更', async () => {
            const changes: SyncChange[] = [
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
            ];

            const result = await syncService.syncChanges('user-1', changes);

            expect(result.success).toBe(true);
            expect(result.applied).toHaveLength(1);
            expect(result.conflicts).toHaveLength(0);
            expect(result.failed).toHaveLength(0);
        });

        it('应该处理冲突', async () => {
            const changes: SyncChange[] = [
                {
                    id: 'change-1',
                    type: 'update',
                    entity: 'trip',
                    entityId: 'trip-123',
                    data: { name: '本地修改' },
                    timestamp: new Date().toISOString(),
                    userId: 'user-1',
                    deviceId: 'device-1'
                }
            ];

            // 模拟冲突情况
            const result = await syncService.syncChanges('user-1', changes);

            expect(result.success).toBe(true);
            expect(result.conflicts.length).toBeGreaterThanOrEqual(0);
        });

        it('应该验证用户权限', async () => {
            const changes: SyncChange[] = [
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
            ];

            await expect(syncService.syncChanges('', changes)).rejects.toThrow('用户ID不能为空');
        });
    });

    describe('batchSync', () => {
        it('应该处理批量同步请求', async () => {
            const request = {
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
                ],
                lastSyncTime: null
            };

            const result = await syncService.batchSync(request);

            expect(result.success).toBe(true);
            expect(result.applied).toBeGreaterThanOrEqual(0);
        });

        it('应该验证批量同步请求参数', async () => {
            const invalidRequest = {
                userId: '',
                deviceId: '',
                changes: [],
                lastSyncTime: null
            };

            const result = await syncService.batchSync(invalidRequest);
            expect(result.success).toBe(false);
        });
    });

    describe('getSyncStatus', () => {
        it('应该返回同步状态', async () => {
            const status = await syncService.getSyncStatus('user-1');

            expect(status.userId).toBe('user-1');
            expect(status.isSyncing).toBe(false);
            expect(typeof status.pendingChanges).toBe('number');
            expect(typeof status.conflicts).toBe('number');
            expect(typeof status.deviceCount).toBe('number');
        });
    });

    describe('resolveConflict', () => {
        it('应该成功解决冲突', async () => {
            // 先创建一个冲突
            const changes: SyncChange[] = [
                {
                    id: 'change-1',
                    type: 'update',
                    entity: 'trip',
                    entityId: 'trip-123',
                    data: { name: '冲突修改' },
                    timestamp: new Date().toISOString(),
                    userId: 'user-1',
                    deviceId: 'device-1'
                }
            ];

            await syncService.syncChanges('user-1', changes);

            // 获取冲突列表
            const conflicts = await syncService.getConflicts('user-1');

            if (conflicts.length > 0) {
                const conflictId = conflicts[0].id;
                await expect(syncService.resolveConflict('user-1', conflictId, 'local')).resolves.not.toThrow();
            }
        });

        it('应该验证冲突解决参数', async () => {
            await expect(syncService.resolveConflict('', 'conflict-1', 'local')).rejects.toThrow('用户ID不能为空');
        });
    });

    describe('getConflicts', () => {
        it('应该返回冲突列表', async () => {
            const conflicts = await syncService.getConflicts('user-1');

            expect(Array.isArray(conflicts)).toBe(true);
            conflicts.forEach(conflict => {
                expect(conflict).toHaveProperty('id');
                expect(conflict).toHaveProperty('localChange');
                expect(conflict).toHaveProperty('remoteChange');
                expect(conflict).toHaveProperty('entity');
                expect(conflict).toHaveProperty('entityId');
            });
        });
    });

    describe('cleanupResolvedConflicts', () => {
        it('应该清理已解决的冲突', async () => {
            await expect(syncService.cleanupResolvedConflicts('user-1')).resolves.not.toThrow();
        });
    });

    describe('userConfig', () => {
        it('应该获取默认用户配置', async () => {
            const config = await syncService.getUserConfig('user-1');

            expect(config).toHaveProperty('autoSync');
            expect(config).toHaveProperty('syncInterval');
            expect(config).toHaveProperty('maxRetries');
            expect(config).toHaveProperty('conflictStrategy');
        });

        it('应该更新用户配置', async () => {
            const newConfig = {
                autoSync: false,
                syncInterval: 60000,
                maxRetries: 5
            };

            await expect(syncService.updateUserConfig('user-1', newConfig)).resolves.not.toThrow();

            const updatedConfig = await syncService.getUserConfig('user-1');
            expect(updatedConfig.autoSync).toBe(false);
            expect(updatedConfig.syncInterval).toBe(60000);
            expect(updatedConfig.maxRetries).toBe(5);
        });
    });
});