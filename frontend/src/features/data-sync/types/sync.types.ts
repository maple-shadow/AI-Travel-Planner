export interface SyncStatus {
    isSyncing: boolean;
    lastSyncTime: string | null;
    pendingChanges: number;
    conflicts: number;
    networkStatus: 'online' | 'offline';
    error?: string;
}

export interface SyncChange {
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: string; // 'trip' | 'budget' | 'expense' | 'user'
    entityId: string;
    data: any;
    timestamp: string;
    deviceId: string;
    version: number;
}

export interface SyncConflict {
    id: string;
    localChange: SyncChange;
    remoteChange: SyncChange;
    entity: string;
    entityId: string;
    resolved?: boolean;
    resolution?: 'local' | 'remote' | 'merge';
}

export interface SyncConfig {
    autoSync: boolean;
    syncInterval: number; // milliseconds
    maxRetries: number;
    conflictStrategy: 'manual' | 'auto';
}

export interface OfflineData {
    changes: SyncChange[];
    lastSyncTime: string | null;
    deviceId: string;
    version: string;
}