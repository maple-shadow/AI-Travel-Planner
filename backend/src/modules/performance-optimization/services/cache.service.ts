import { CacheConfig, CacheItem, CacheOperationResult, CacheStats } from '../types/performance.types';
import { getCacheConfig } from '../config/performance.config';

/**
 * 缓存服务
 * 提供多级缓存策略和缓存管理功能
 */
export class CacheService {
    private config: CacheConfig;
    private memoryCache: Map<string, CacheItem>;
    private stats: CacheStats;
    private isRedisAvailable: boolean;

    constructor(config?: CacheConfig) {
        this.config = config || getCacheConfig();
        this.memoryCache = new Map();
        this.isRedisAvailable = this.checkRedisAvailability();
        this.stats = this.initializeStats();
    }

    /**
     * 检查Redis可用性
     */
    private checkRedisAvailability(): boolean {
        // 这里实现Redis连接检查
        // 暂时返回false，表示使用内存缓存
        return false;
    }

    /**
     * 初始化统计信息
     */
    private initializeStats(): CacheStats {
        return {
            hitCount: 0,
            missCount: 0,
            hitRate: 0,
            size: 0,
            itemCount: 0,
            memoryUsage: 0,
            evictionCount: 0,
            byType: {}
        };
    }

    /**
     * 获取缓存值
     */
    async get<T = any>(key: string): Promise<CacheItem<T> | null> {
        const fullKey = this.getFullKey(key);

        try {
            // 根据策略选择缓存层
            let item: CacheItem<T> | null = null;

            if (this.config.strategy === 'memory' || this.config.strategy === 'hybrid') {
                item = this.getFromMemory<T>(fullKey);
            }

            if (!item && (this.config.strategy === 'redis' || this.config.strategy === 'hybrid') && this.isRedisAvailable) {
                item = await this.getFromRedis<T>(fullKey);

                // 如果从Redis获取到，同时更新内存缓存
                if (item && this.config.strategy === 'hybrid') {
                    this.setToMemory(fullKey, item);
                }
            }

            if (item) {
                this.updateAccessStats(fullKey, true);

                // 检查是否过期
                if (item.expiresAt && item.expiresAt < new Date()) {
                    await this.delete(fullKey);
                    this.updateAccessStats(fullKey, false);
                    return null;
                }

                // 更新访问信息
                item.accessCount++;
                item.lastAccessed = new Date();

                return item;
            } else {
                this.updateAccessStats(fullKey, false);
                return null;
            }
        } catch (error) {
            console.error('Cache get error:', error);
            this.updateAccessStats(fullKey, false);
            return null;
        }
    }

    /**
     * 设置缓存值
     */
    async set<T = any>(key: string, value: T, ttl?: number): Promise<CacheOperationResult> {
        const fullKey = this.getFullKey(key);
        const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : new Date(Date.now() + this.config.defaultTTL * 1000);

        const item: CacheItem<T> = {
            key: fullKey,
            value,
            createdAt: new Date(),
            expiresAt,
            accessCount: 0,
            lastAccessed: new Date()
        };

        try {
            let success = true;

            // 根据策略设置缓存
            if (this.config.strategy === 'memory' || this.config.strategy === 'hybrid') {
                success = success && this.setToMemory(fullKey, item);
            }

            if ((this.config.strategy === 'redis' || this.config.strategy === 'hybrid') && this.isRedisAvailable) {
                success = success && await this.setToRedis(fullKey, item, ttl);
            }

            // 检查缓存大小限制
            await this.enforceSizeLimit();

            return {
                success,
                operation: 'set',
                key: fullKey,
                duration: 0 // 可以添加实际耗时
            };
        } catch (error) {
            console.error('Cache set error:', error);
            return {
                success: false,
                operation: 'set',
                key: fullKey,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 删除缓存
     */
    async delete(key: string): Promise<CacheOperationResult> {
        const fullKey = this.getFullKey(key);

        try {
            let success = true;

            if (this.config.strategy === 'memory' || this.config.strategy === 'hybrid') {
                success = success && this.deleteFromMemory(fullKey);
            }

            if ((this.config.strategy === 'redis' || this.config.strategy === 'hybrid') && this.isRedisAvailable) {
                success = success && await this.deleteFromRedis(fullKey);
            }

            return {
                success,
                operation: 'delete',
                key: fullKey
            };
        } catch (error) {
            console.error('Cache delete error:', error);
            return {
                success: false,
                operation: 'delete',
                key: fullKey,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 清空缓存
     */
    async clear(): Promise<CacheOperationResult> {
        try {
            if (this.config.strategy === 'memory' || this.config.strategy === 'hybrid') {
                this.memoryCache.clear();
            }

            if ((this.config.strategy === 'redis' || this.config.strategy === 'hybrid') && this.isRedisAvailable) {
                await this.clearRedis();
            }

            // 重置统计信息
            this.stats = this.initializeStats();

            return {
                success: true,
                operation: 'clear'
            };
        } catch (error) {
            console.error('Cache clear error:', error);
            return {
                success: false,
                operation: 'clear',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 获取缓存统计信息
     */
    getStats(): CacheStats {
        // 更新统计信息
        this.stats.itemCount = this.memoryCache.size;
        this.stats.hitRate = this.stats.hitCount + this.stats.missCount > 0
            ? (this.stats.hitCount / (this.stats.hitCount + this.stats.missCount)) * 100
            : 0;

        // 计算内存使用量
        this.stats.memoryUsage = this.calculateMemoryUsage();

        return { ...this.stats };
    }

    /**
     * 获取完整的缓存键
     */
    private getFullKey(key: string): string {
        return this.config.namespace ? `${this.config.namespace}:${key}` : key;
    }

    /**
     * 从内存获取缓存
     */
    private getFromMemory<T = any>(key: string): CacheItem<T> | null {
        return this.memoryCache.get(key) as CacheItem<T> || null;
    }

    /**
     * 设置到内存缓存
     */
    private setToMemory<T = any>(key: string, item: CacheItem<T>): boolean {
        try {
            this.memoryCache.set(key, item);
            return true;
        } catch (error) {
            console.error('Memory cache set error:', error);
            return false;
        }
    }

    /**
     * 从内存删除缓存
     */
    private deleteFromMemory(key: string): boolean {
        return this.memoryCache.delete(key);
    }

    /**
     * 从Redis获取缓存
     */
    private async getFromRedis<T = any>(key: string): Promise<CacheItem<T> | null> {
        // 这里实现Redis获取逻辑
        // 暂时返回null
        return null;
    }

    /**
     * 设置到Redis缓存
     */
    private async setToRedis<T = any>(key: string, item: CacheItem<T>, ttl?: number): Promise<boolean> {
        // 这里实现Redis设置逻辑
        // 暂时返回true
        return true;
    }

    /**
     * 从Redis删除缓存
     */
    private async deleteFromRedis(key: string): Promise<boolean> {
        // 这里实现Redis删除逻辑
        // 暂时返回true
        return true;
    }

    /**
     * 清空Redis缓存
     */
    private async clearRedis(): Promise<boolean> {
        // 这里实现Redis清空逻辑
        // 暂时返回true
        return true;
    }

    /**
     * 更新访问统计
     */
    private updateAccessStats(key: string, hit: boolean): void {
        if (hit) {
            this.stats.hitCount++;
        } else {
            this.stats.missCount++;
        }

        // 按类型统计
        const type = this.getCacheType(key);
        if (!this.stats.byType[type]) {
            this.stats.byType[type] = { hitCount: 0, missCount: 0, size: 0 };
        }

        if (hit) {
            this.stats.byType[type].hitCount++;
        } else {
            this.stats.byType[type].missCount++;
        }
    }

    /**
     * 获取缓存类型
     */
    private getCacheType(key: string): string {
        const parts = key.split(':');
        return parts.length > 1 ? parts[0]! : 'default';
    }

    /**
     * 计算内存使用量
     */
    private calculateMemoryUsage(): number {
        let totalSize = 0;

        for (const [key, item] of this.memoryCache.entries()) {
            try {
                const keySize = Buffer.byteLength(key, 'utf8');
                const valueSize = Buffer.byteLength(JSON.stringify(item.value), 'utf8');
                totalSize += keySize + valueSize;
            } catch (error) {
                console.error('Error calculating memory usage for key:', key, error);
            }
        }

        return Math.round(totalSize / 1024 / 1024); // 转换为MB
    }

    /**
     * 强制执行大小限制
     */
    private async enforceSizeLimit(): Promise<void> {
        if (this.memoryCache.size <= this.config.maxSize) {
            return;
        }

        // 使用LRU策略删除最久未使用的缓存项
        const entries = Array.from(this.memoryCache.entries());
        entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());

        const itemsToRemove = entries.slice(0, this.memoryCache.size - this.config.maxSize);

        for (const [key] of itemsToRemove) {
            await this.delete(key);
            this.stats.evictionCount++;
        }
    }

    /**
     * 检查缓存是否存在
     */
    async exists(key: string): Promise<boolean> {
        const item = await this.get(key);
        return item !== null;
    }

    /**
     * 获取所有缓存键
     */
    async keys(): Promise<string[]> {
        const memoryKeys = Array.from(this.memoryCache.keys());

        if ((this.config.strategy === 'redis' || this.config.strategy === 'hybrid') && this.isRedisAvailable) {
            // 这里实现Redis keys获取
            // 暂时只返回内存键
        }

        return memoryKeys;
    }

    /**
     * 获取缓存数量
     */
    async size(): Promise<number> {
        let totalSize = this.memoryCache.size;

        if ((this.config.strategy === 'redis' || this.config.strategy === 'hybrid') && this.isRedisAvailable) {
            // 这里实现Redis size获取
        }

        return totalSize;
    }

    /**
     * 清理过期缓存
     */
    async cleanup(): Promise<number> {
        let cleanedCount = 0;
        const now = new Date();

        // 清理内存缓存
        for (const [key, item] of this.memoryCache.entries()) {
            if (item.expiresAt && item.expiresAt < now) {
                await this.delete(key);
                cleanedCount++;
            }
        }

        return cleanedCount;
    }
}

// 创建单例实例
const cacheService = new CacheService();

export default cacheService;