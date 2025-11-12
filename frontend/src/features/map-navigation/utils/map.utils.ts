import { Location } from '../types/map.types';

/**
 * 地图工具函数
 */

/**
 * 计算两个坐标点之间的距离（米）
 */
export const calculateDistance = (point1: Location, point2: Location): number => {
    const R = 6371000; // 地球半径（米）
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * 格式化距离显示
 */
export const formatDistance = (distance: number): string => {
    if (distance < 1000) {
        return `${Math.round(distance)}米`;
    }
    return `${(distance / 1000).toFixed(1)}公里`;
};

/**
 * 格式化时间显示
 */
export const formatDuration = (duration: number): string => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
};

/**
 * 计算多个点的中心点
 */
export const calculateCenter = (points: Location[]): Location => {
    if (points.length === 0) {
        return { lng: 116.397428, lat: 39.90923 }; // 默认北京
    }

    if (points.length === 1) {
        return points[0];
    }

    const sum = points.reduce((acc, point) => ({
        lng: acc.lng + point.lng,
        lat: acc.lat + point.lat
    }), { lng: 0, lat: 0 });

    return {
        lng: sum.lng / points.length,
        lat: sum.lat / points.length
    };
};

/**
 * 计算适合的缩放级别
 */
export const calculateZoomLevel = (points: Location[]): number => {
    if (points.length <= 1) {
        return 13; // 默认缩放级别
    }

    // 计算边界框
    const bounds = calculateBounds(points);
    const latDiff = bounds.maxLat - bounds.minLat;
    const lngDiff = bounds.maxLng - bounds.minLng;

    // 简单的缩放级别计算（可以根据需要调整）
    const maxDiff = Math.max(latDiff, lngDiff);

    if (maxDiff > 20) return 5;
    if (maxDiff > 10) return 6;
    if (maxDiff > 5) return 7;
    if (maxDiff > 2) return 8;
    if (maxDiff > 1) return 9;
    if (maxDiff > 0.5) return 10;
    if (maxDiff > 0.2) return 11;
    if (maxDiff > 0.1) return 12;
    if (maxDiff > 0.05) return 13;
    if (maxDiff > 0.02) return 14;
    if (maxDiff > 0.01) return 15;
    return 16;
};

/**
 * 计算边界框
 */
export const calculateBounds = (points: Location[]) => {
    if (points.length === 0) {
        return {
            minLng: 0,
            maxLng: 0,
            minLat: 0,
            maxLat: 0
        };
    }

    const lngs = points.map(p => p.lng);
    const lats = points.map(p => p.lat);

    return {
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats)
    };
};

/**
 * 验证坐标是否有效
 */
export const isValidCoordinate = (location: Location): boolean => {
    return (
        typeof location.lng === 'number' &&
        typeof location.lat === 'number' &&
        location.lng >= -180 && location.lng <= 180 &&
        location.lat >= -90 && location.lat <= 90
    );
};

/**
 * 坐标转换（如果需要）
 */
export const convertCoordinate = (location: Location): Location => {
    // 这里可以实现坐标系统转换
    // 目前直接返回原坐标
    return location;
};

/**
 * 创建标记图标URL
 */
export const createMarkerIcon = (): string => {
    // 这里可以返回自定义标记图标的URL
    // 目前返回空字符串，使用默认标记
    return '';
};

/**
 * 生成标记ID
 */
export const generateMarkerId = (prefix: string = 'marker'): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: number;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * 深拷贝对象
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
        const cloned = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }

    return obj;
};