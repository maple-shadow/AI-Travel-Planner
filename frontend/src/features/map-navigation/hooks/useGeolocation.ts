import { useState, useEffect, useCallback } from 'react';
import { Location } from '../types/map.types';

interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

interface UseGeolocationReturn {
    location: Location | null;
    loading: boolean;
    error: string | null;
    getCurrentLocation: () => void;
    watchPosition: () => void;
    clearWatch: () => void;
}

export const useGeolocation = (options: GeolocationOptions = {}): UseGeolocationReturn => {
    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [watchId, setWatchId] = useState<number | null>(null);

    const defaultOptions: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
        ...options
    };

    // 获取当前位置
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('您的浏览器不支持地理位置功能');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation: Location = {
                    lng: position.coords.longitude,
                    lat: position.coords.latitude
                };
                setLocation(newLocation);
                setLoading(false);
            },
            (err) => {
                let errorMessage = '获取当前位置失败';

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = '位置访问被拒绝，请检查浏览器权限设置';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = '位置信息不可用';
                        break;
                    case err.TIMEOUT:
                        errorMessage = '获取位置信息超时';
                        break;
                    default:
                        errorMessage = '未知错误';
                        break;
                }

                setError(errorMessage);
                setLoading(false);
            },
            defaultOptions
        );
    }, [defaultOptions]);

    // 监听位置变化
    const watchPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError('您的浏览器不支持地理位置功能');
            return;
        }

        if (watchId) {
            clearWatch();
        }

        setLoading(true);
        setError(null);

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation: Location = {
                    lng: position.coords.longitude,
                    lat: position.coords.latitude
                };
                setLocation(newLocation);
                setLoading(false);
            },
            (err) => {
                let errorMessage = '监听位置失败';

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = '位置访问被拒绝，请检查浏览器权限设置';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = '位置信息不可用';
                        break;
                    case err.TIMEOUT:
                        errorMessage = '获取位置信息超时';
                        break;
                    default:
                        errorMessage = '未知错误';
                        break;
                }

                setError(errorMessage);
                setLoading(false);
            },
            defaultOptions
        );

        setWatchId(id);
    }, [defaultOptions, watchId]);

    // 清除位置监听
    const clearWatch = useCallback(() => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
    }, [watchId]);

    // 组件卸载时清除监听
    useEffect(() => {
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    // 自动获取位置（可选）
    useEffect(() => {
        // 可以根据需要自动获取位置
        // getCurrentLocation();
    }, []);

    return {
        location,
        loading,
        error,
        getCurrentLocation,
        watchPosition,
        clearWatch
    };
};

// 反向地理编码Hook
export const useReverseGeocoding = (apiKey: string) => {
    const [address, setAddress] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reverseGeocode = useCallback(async (location: Location): Promise<string | null> => {
        if (!location) return null;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://restapi.amap.com/v3/geocode/regeo?location=${location.lng},${location.lat}&key=${apiKey}`
            );

            const data = await response.json();

            if (data.status === '1' && data.regeocode) {
                const formattedAddress = data.regeocode.formatted_address;
                setAddress(formattedAddress);
                setLoading(false);
                return formattedAddress;
            } else {
                setError('地址解析失败');
                setLoading(false);
                return null;
            }
        } catch (err) {
            console.error('反向地理编码失败:', err);
            setError('网络错误，请稍后重试');
            setLoading(false);
            return null;
        }
    }, [apiKey]);

    return {
        address,
        loading,
        error,
        reverseGeocode
    };
};