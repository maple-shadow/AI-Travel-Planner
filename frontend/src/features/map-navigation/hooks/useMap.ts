import { useState, useEffect, useCallback } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { MapInstance, Location, MapMarker, RouteResult } from '../types/map.types';

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
    plugins = [] // 先不加载任何插件，确保地图能正常显示
}: UseMapOptions): UseMapReturn => {
    const [map, setMap] = useState<MapInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MapMarker[]>([]);

    // 初始化地图
    useEffect(() => {
        const initializeMap = async () => {
            try {
                // 加载高德地图API - 参考官方示例的简化配置
                const AMap = await AMapLoader.load({
                    key: apiKey,
                    version: '2.0',
                    plugins: plugins
                });

                // 创建地图容器元素
                const mapContainer = document.createElement('div');
                mapContainer.id = 'map-container';
                mapContainer.style.width = '100%';
                mapContainer.style.height = '100%';

                // 将地图容器添加到body中
                document.body.appendChild(mapContainer);

                // 创建地图实例 - 使用官方示例的简化配置
                const mapInstance = new AMap.Map(mapContainer, {
                    viewMode: '2D', // 使用2D模式，兼容性更好
                    zoom: initialZoom,
                    center: [initialCenter.lng, initialCenter.lat]
                });

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
            // 移除地图容器元素
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.remove();
            }
        };
    }, [apiKey]);

    // 添加标记
    const addMarker = useCallback((marker: MapMarker) => {
        if (!map) return;

        const AMap = (window as any).AMap;
        if (!AMap) return;

        // 验证标记的经纬度
        const validPosition = {
            lng: isNaN(marker.position.lng) ? 116.397428 : marker.position.lng,
            lat: isNaN(marker.position.lat) ? 39.90923 : marker.position.lat
        };

        console.log('添加标记坐标:', validPosition);

        const markerInstance = new AMap.Marker({
            position: [validPosition.lng, validPosition.lat],
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

        // 验证经纬度
        const validLocation = {
            lng: isNaN(location.lng) ? 116.397428 : location.lng,
            lat: isNaN(location.lat) ? 39.90923 : location.lat
        };

        console.log('设置地图中心:', validLocation);
        map.setCenter([validLocation.lng, validLocation.lat]);
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

        // 验证起点和终点的经纬度
        const validOrigin = {
            lng: isNaN(origin.lng) ? 116.397428 : origin.lng,
            lat: isNaN(origin.lat) ? 39.90923 : origin.lat
        };

        const validDestination = {
            lng: isNaN(destination.lng) ? 116.407428 : destination.lng,
            lat: isNaN(destination.lat) ? 39.91923 : destination.lat
        };

        console.log('路线规划参数:', { origin: validOrigin, destination: validDestination });

        return new Promise((resolve) => {
            const driving = new AMap.Driving({
                map: map,
                policy: AMap.DrivingPolicy.LEAST_TIME // 最短时间
            });

            driving.search(
                [validOrigin.lng, validOrigin.lat],
                [validDestination.lng, validDestination.lat],
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