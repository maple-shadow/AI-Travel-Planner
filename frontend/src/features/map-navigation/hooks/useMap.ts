import { useState, useEffect, useCallback } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { MapInstance, MapConfig, Location, MapMarker, RouteResult } from '../types/map.types';

interface UseMapOptions {
    apiKey: string;
    initialCenter?: Location;
    initialZoom?: number;
    plugins?: string[];
}

interface UseMapReturn {
    map: MapInstance | null;
    loading: boolean;
    error: string | null;
    addMarker: (marker: MapMarker) => void;
    removeMarker: (markerId: string) => void;
    clearMarkers: () => void;
    setCenter: (location: Location) => void;
    setZoom: (zoom: number) => void;
    calculateRoute: (origin: Location, destination: Location) => Promise<RouteResult | null>;
}

export const useMap = ({
    apiKey,
    initialCenter = { lng: 116.397428, lat: 39.90923 },
    initialZoom = 13,
    plugins = [
        'AMap.Geolocation',
        'AMap.PlaceSearch',
        'AMap.Driving',
        'AMap.Marker',
        'AMap.Polyline'
    ]
}: UseMapOptions): UseMapReturn => {
    const [map, setMap] = useState<MapInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MapMarker[]>([]);

    // 初始化地图
    useEffect(() => {
        const initializeMap = async () => {
            try {
                const AMap = await AMapLoader.load({
                    key: apiKey,
                    version: '2.0',
                    plugins: plugins
                });

                const mapInstance = new AMap.Map('map-container', {
                    viewMode: '3D',
                    zoom: initialZoom,
                    center: [initialCenter.lng, initialCenter.lat],
                    mapStyle: 'amap://styles/normal'
                });

                // 添加基本控件
                mapInstance.addControl(new AMap.Zoom());
                mapInstance.addControl(new AMap.Scale());
                mapInstance.addControl(new AMap.ToolBar());

                setMap(mapInstance);
                setLoading(false);
            } catch (err) {
                console.error('地图初始化失败:', err);
                setError('地图加载失败，请检查网络连接和API密钥');
                setLoading(false);
            }
        };

        initializeMap();

        return () => {
            if (map) {
                map.destroy();
            }
        };
    }, [apiKey]);

    // 添加标记
    const addMarker = useCallback((marker: MapMarker) => {
        if (!map) return;

        const AMap = (window as any).AMap;
        if (!AMap) return;

        const markerInstance = new AMap.Marker({
            position: [marker.position.lng, marker.position.lat],
            title: marker.title,
            content: marker.content || `<div>${marker.title}</div>`,
            offset: new AMap.Pixel(-13, -30)
        });

        markerInstance.setMap(map);
        setMarkers(prev => [...prev, { ...marker, instance: markerInstance }]);

        // 添加点击事件
        markerInstance.on('click', () => {
            // 可以在这里触发自定义事件
            console.log('标记被点击:', marker.title);
        });
    }, [map]);

    // 移除标记
    const removeMarker = useCallback((markerId: string) => {
        if (!map) return;

        const marker = markers.find(m => m.id === markerId);
        if (marker && (marker as any).instance) {
            (marker as any).instance.setMap(null);
            setMarkers(prev => prev.filter(m => m.id !== markerId));
        }
    }, [map, markers]);

    // 清除所有标记
    const clearMarkers = useCallback(() => {
        if (!map) return;

        markers.forEach(marker => {
            if ((marker as any).instance) {
                (marker as any).instance.setMap(null);
            }
        });
        setMarkers([]);
    }, [map, markers]);

    // 设置地图中心
    const setCenter = useCallback((location: Location) => {
        if (!map) return;
        map.setCenter([location.lng, location.lat]);
    }, [map]);

    // 设置缩放级别
    const setZoom = useCallback((zoom: number) => {
        if (!map) return;
        map.setZoom(zoom);
    }, [map]);

    // 计算路线
    const calculateRoute = useCallback(async (origin: Location, destination: Location): Promise<RouteResult | null> => {
        if (!map) return null;

        const AMap = (window as any).AMap;
        if (!AMap) return null;

        return new Promise((resolve) => {
            const driving = new AMap.Driving({
                map: map,
                policy: AMap.DrivingPolicy.LEAST_TIME // 最短时间
            });

            driving.search(
                [origin.lng, origin.lat],
                [destination.lng, destination.lat],
                (status: string, result: any) => {
                    if (status === 'complete' && result.routes && result.routes.length > 0) {
                        const route = result.routes[0];

                        const routeResult: RouteResult = {
                            distance: route.distance,
                            duration: route.time,
                            path: route.path.map((point: any) => ({
                                lng: point.lng,
                                lat: point.lat
                            })),
                            steps: route.steps.map((step: any) => ({
                                instruction: step.instruction,
                                distance: step.distance,
                                duration: step.time,
                                path: step.path.map((point: any) => ({
                                    lng: point.lng,
                                    lat: point.lat
                                }))
                            }))
                        };

                        resolve(routeResult);
                    } else {
                        console.error('路线规划失败:', status, result);
                        resolve(null);
                    }
                }
            );
        });
    }, [map]);

    return {
        map,
        loading,
        error,
        addMarker,
        removeMarker,
        clearMarkers,
        setCenter,
        setZoom,
        calculateRoute
    };
};