import React, { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { MapConfig, MapInstance, Location } from '../types/map.types';
import './MapContainer.css';

interface MapContainerProps {
    apiKey: string;
    initialCenter?: Location;
    zoom?: number;
    onMapReady?: (map: MapInstance) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
    apiKey,
    initialCenter = { lng: 116.397428, lat: 39.90923 },
    zoom = 13,
    onMapReady
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<MapInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeMap = async () => {
            if (!mapRef.current) return;

            try {
                // 加载高德地图API
                const AMap = await AMapLoader.load({
                    key: apiKey,
                    version: '2.0',
                    plugins: [
                        'AMap.Geolocation',
                        'AMap.PlaceSearch',
                        'AMap.Driving',
                        'AMap.Marker',
                        'AMap.Polyline'
                    ]
                });

                // 创建地图实例
                const map = new AMap.Map(mapRef.current, {
                    viewMode: '3D',
                    zoom: zoom,
                    center: [initialCenter.lng, initialCenter.lat],
                    mapStyle: 'amap://styles/normal'
                });

                // 添加缩放控件
                map.addControl(new AMap.Zoom());

                // 添加比例尺控件
                map.addControl(new AMap.Scale());

                // 添加工具条控件
                map.addControl(new AMap.ToolBar());

                setMapInstance(map);
                setLoading(false);

                if (onMapReady) {
                    onMapReady(map);
                }
            } catch (err) {
                console.error('地图初始化失败:', err);
                setError('地图加载失败，请检查网络连接和API密钥');
                setLoading(false);
            }
        };

        initializeMap();

        // 清理函数
        return () => {
            if (mapInstance) {
                mapInstance.destroy();
            }
        };
    }, [apiKey, initialCenter.lng, initialCenter.lat, zoom]);

    if (loading) {
        return (
            <div className="map-container loading">
                <div className="loading-spinner">地图加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="map-container error">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="map-container">
            <div ref={mapRef} className="map-element" />
        </div>
    );
};

export default MapContainer;