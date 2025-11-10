export interface SyncChange {
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: string; // 'trip' | 'budget' | 'expense' | 'user'
    entityId: string;
    data: any;
    timestamp: string;
    deviceId: string;
    version: number;
    userId: string;
}

export interface SyncConflict {
    id: string;
    localChange: SyncChange;
    remoteChange: SyncChange;
    entity: string;
    entityId: string;
    userId: string;
    resolved: boolean;
    resolution?: 'local' | 'remote' | 'merge';
    resolvedAt?: string;
    resolvedBy?: string;
}

export interface SyncStatus {
    userId: string;
    isSyncing: boolean;
    lastSyncTime: string | null;
    pendingChanges: number;
    conflicts: number;
    deviceCount: number;
}

export interface SyncResult {
    applied: SyncChange[];
    conflicts: SyncConflict[];
    failed: SyncChange[];
    syncTime: string;
}

export interface SyncConfig {
    userId: string;
    autoSync: boolean;
    syncInterval: number;
    maxRetries: number;
    conflictStrategy: 'manual' | 'auto';
}

export interface BatchSyncRequest {
    userId: string;
    deviceId: string;
    changes: SyncChange[];
    lastSyncTime?: string;
}

export interface BatchSyncResult {
    success: boolean;
    applied: number;
    conflicts: number;
    errors: string[];
    syncTime: string;
}

export interface ConflictResolution {
    conflictId: string;
    resolution: 'local' | 'remote' | 'merge';
    resolvedBy: string;
    resolvedAt: string;
}