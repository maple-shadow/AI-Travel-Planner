import { Location } from '../types/map.types';

/**
 * 地理工具函数
 */

/**
 * 计算两点间的方位角（度）
 */
export const calculateBearing = (point1: Location, point2: Location): number => {
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
};

/**
 * 计算中点坐标
 */
export const calculateMidpoint = (point1: Location, point2: Location): Location => {
    const lat1 = point1.lat * Math.PI / 180;
    const lng1 = point1.lng * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const lng2 = point2.lng * Math.PI / 180;

    const Bx = Math.cos(lat2) * Math.cos(lng2 - lng1);
    const By = Math.cos(lat2) * Math.sin(lng2 - lng1);

    const latMid = Math.atan2(
        Math.sin(lat1) + Math.sin(lat2),
        Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
    );

    const lngMid = lng1 + Math.atan2(By, Math.cos(lat1) + Bx);

    return {
        lat: latMid * 180 / Math.PI,
        lng: lngMid * 180 / Math.PI
    };
};

/**
 * 检查点是否在多边形内
 */
export const isPointInPolygon = (point: Location, polygon: Location[]): boolean => {
    if (polygon.length < 3) return false;

    let inside = false;
    const x = point.lng;
    const y = point.lat;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng;
        const yj = polygon[j].lat;

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }

    return inside;
};

/**
 * 计算多边形面积（平方米）
 */
export const calculatePolygonArea = (polygon: Location[]): number => {
    if (polygon.length < 3) return 0;

    let area = 0;
    const R = 6371000; // 地球半径（米）

    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;

        const lat1 = polygon[i].lat * Math.PI / 180;
        const lng1 = polygon[i].lng * Math.PI / 180;
        const lat2 = polygon[j].lat * Math.PI / 180;
        const lng2 = polygon[j].lng * Math.PI / 180;

        area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs(area * R * R / 2);
    return area;
};

/**
 * 坐标转换：WGS84转GCJ02（中国火星坐标系）
 */
export const wgs84ToGcj02 = (wgsPoint: Location): Location => {
    // 转换参数
    const PI = Math.PI;
    const a = 6378245.0; // 长半轴
    const ee = 0.00669342162296594323; // 扁率

    const lat = wgsPoint.lat;
    const lng = wgsPoint.lng;

    if (outOfChina(lat, lng)) {
        return { lat, lng };
    }

    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);

    const radLat = lat / 180.0 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;

    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);

    return {
        lat: lat + dLat,
        lng: lng + dLng
    };
};

/**
 * 坐标转换：GCJ02转WGS84
 */
export const gcj02ToWgs84 = (gcjPoint: Location): Location => {
    const wgsPoint = wgs84ToGcj02(gcjPoint);
    const dLat = wgsPoint.lat - gcjPoint.lat;
    const dLng = wgsPoint.lng - gcjPoint.lng;

    return {
        lat: gcjPoint.lat - dLat,
        lng: gcjPoint.lng - dLng
    };
};

/**
 * 检查坐标是否在中国境外
 */
const outOfChina = (lat: number, lng: number): boolean => {
    if (lng < 72.004 || lng > 137.8347) {
        return true;
    }
    if (lat < 0.8293 || lat > 55.8271) {
        return true;
    }
    return false;
};

/**
 * 纬度转换
 */
const transformLat = (x: number, y: number): number => {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
};

/**
 * 经度转换
 */
const transformLng = (x: number, y: number): number => {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
};

/**
 * 计算海拔高度（简化版，实际需要调用API）
 */
export const calculateElevation = async (location: Location): Promise<number> => {
    // 这里可以调用高程API
    // 目前返回固定值
    return 0;
};

/**
 * 计算日出日落时间
 */
export const calculateSunTimes = (location: Location, date: Date = new Date()) => {
    // 简化版日出日落计算
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);

    // 近似计算
    const sunrise = 6 + Math.sin(dayOfYear * 2 * Math.PI / 365) * 2;
    const sunset = 18 - Math.sin(dayOfYear * 2 * Math.PI / 365) * 2;

    return {
        sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(sunrise), (sunrise % 1) * 60),
        sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(sunset), (sunset % 1) * 60)
    };
};

/**
 * 计算时区偏移
 */
export const calculateTimezoneOffset = (location: Location): number => {
    // 简化版时区计算
    const offset = Math.round(location.lng / 15);
    return Math.max(-12, Math.min(12, offset));
};

/**
 * 格式化坐标显示
 */
export const formatCoordinate = (location: Location, format: 'decimal' | 'dms' = 'decimal'): string => {
    if (format === 'dms') {
        const latDeg = Math.abs(Math.floor(location.lat));
        const latMin = Math.abs((location.lat % 1) * 60);
        const latSec = Math.abs((latMin % 1) * 60);
        const latDir = location.lat >= 0 ? 'N' : 'S';

        const lngDeg = Math.abs(Math.floor(location.lng));
        const lngMin = Math.abs((location.lng % 1) * 60);
        const lngSec = Math.abs((lngMin % 1) * 60);
        const lngDir = location.lng >= 0 ? 'E' : 'W';

        return `${latDeg}°${Math.floor(latMin)}'${latSec.toFixed(2)}\"${latDir} ${lngDeg}°${Math.floor(lngMin)}'${lngSec.toFixed(2)}\"${lngDir}`;
    }

    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
};