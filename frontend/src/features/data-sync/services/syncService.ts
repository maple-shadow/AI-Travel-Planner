import axios from 'axios';
import { SyncChange, SyncConflict, SyncStatus } from '../types/sync.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class SyncService {
    private static instance: SyncService;
    private baseURL: string;

    private constructor() {
        this.baseURL = `${API_BASE_URL}/sync`;
    }

    static getInstance(): SyncService {
        if (!SyncService.instance) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }

    // 获取同步状态
    async getSyncStatus(): Promise<SyncStatus> {
        try {
            const response = await axios.get(`${this.baseURL}/status`);
            return response.data;
        } catch (error) {
            console.error('获取同步状态失败:', error);
            throw error;
        }
    }

    // 同步变更
    async syncChanges(changes: SyncChange[]): Promise<{
        applied: SyncChange[];
        conflicts: SyncConflict[];
        failed: SyncChange[];
    }> {
        try {
            const response = await axios.post(`${this.baseURL}/changes`, { changes });
            return response.data;
        } catch (error) {
            console.error('同步变更失败:', error);
            throw error;
        }
    }

    // 获取远程变更
    async getRemoteChanges(lastSyncTime: string | null): Promise<SyncChange[]> {
        try {
            const params = lastSyncTime ? { since: lastSyncTime } : {};
            const response = await axios.get(`${this.baseURL}/changes`, { params });
            return response.data;
        } catch (error) {
            console.error('获取远程变更失败:', error);
            throw error;
        }
    }

    // 解决冲突
    async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
        try {
            await axios.post(`${this.baseURL}/conflicts/${conflictId}/resolve`, { resolution });
        } catch (error) {
            console.error('解决冲突失败:', error);
            throw error;
        }
    }

    // 获取冲突列表
    async getConflicts(): Promise<SyncConflict[]> {
        try {
            const response = await axios.get(`${this.baseURL}/conflicts`);
            return response.data;
        } catch (error) {
            console.error('获取冲突列表失败:', error);
            throw error;
        }
    }

    // 清理已解决的冲突
    async cleanupResolvedConflicts(): Promise<void> {
        try {
            await axios.delete(`${this.baseURL}/conflicts/resolved`);
        } catch (error) {
            console.error('清理冲突失败:', error);
            throw error;
        }
    }

    // 检查网络连接
    async checkNetwork(): Promise<boolean> {
        try {
            await axios.get(`${this.baseURL}/health`);
            return true;
        } catch (error) {
            return false;
        }
    }

    // 批量同步（用于离线后重新上线）
    async batchSync(offlineData: any): Promise<{
        success: boolean;
        applied: number;
        conflicts: number;
        errors: string[];
    }> {
        try {
            const response = await axios.post(`${this.baseURL}/batch`, offlineData);
            return response.data;
        } catch (error) {
            console.error('批量同步失败:', error);
            throw error;
        }
    }
}

export default SyncService.getInstance();