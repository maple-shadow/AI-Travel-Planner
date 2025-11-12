import React, { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { MapInstance, Location } from '../types/map.types';
import './MapContainer.css';

interface MapContainerProps {
    apiKey: string;
    initialCenter?: Location;
    zoom?: number;
    onMapReady?: (map: MapInstance) => void;
    onError?: (error: string) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
    apiKey,
    initialCenter = { lng: 116.397428, lat: 39.90923 },
    zoom = 13,
    onMapReady,
    onError
}) => {
    let map: MapInstance | null = null;
    const initializedRef = useRef(false);

    useEffect(() => {
        // 使用ref来跟踪是否已经初始化，避免重复初始化
        if (!initializedRef.current) {
            initializedRef.current = true;

            // 严格按照官方示例实现，但加载必要的插件
            const loaderConfig: any = {
                key: apiKey,
                version: '2.0',
                plugins: [
                    'AMap.Geolocation',      // 定位插件
                    'AMap.PlaceSearch',       // 地点搜索插件
                    'AMap.AutoComplete',      // 输入提示插件
                    'AMap.Driving',           // 驾车路线规划插件
                    'AMap.ToolBar',           // 工具条插件
                    'AMap.Scale'              // 比例尺插件
                ]
            };

            // 如果配置了安全密钥，添加到加载配置中
            const securityKey = import.meta.env.VITE_AMAP_SECURITY_KEY;
            if (securityKey) {
                loaderConfig.securityJsCode = securityKey;
                console.log('安全密钥已配置:', securityKey);

                // 同时设置安全密钥到全局配置，确保所有插件都能使用
                (window as any)._AMapSecurityConfig = {
                    securityJsCode: securityKey
                };
            } else {
                console.warn('安全密钥未配置，POI搜索可能失败');
            }

            AMapLoader.load(loaderConfig)
                .then((AMap) => {
                    // 创建地图实例 - 严格按照官方示例
                    map = new AMap.Map('mapcontainer', {
                        viewMode: '3D', // 使用官方示例的3D模式
                        zoom: zoom,
                        center: [initialCenter.lng, initialCenter.lat],
                        mapStyle: 'amap://styles/normal'
                    });

                    // 添加工具条控件
                    map.addControl(new AMap.ToolBar());
                    // 添加比例尺控件
                    map.addControl(new AMap.Scale());

                    if (onMapReady) {
                        onMapReady(map);
                    }
                })
                .catch((e) => {
                    console.error('地图初始化失败:', e);
                    if (onError) {
                        onError('地图加载失败，请检查网络连接和API密钥');
                    }
                });
        }

        // 清理函数 - 严格按照官方示例
        return () => {
            map?.destroy();
        };
    }, []); // 空依赖数组，确保只初始化一次

    // 严格按照官方示例的返回结构
    return (
        <div id="mapcontainer" className="map-container" style={{ height: '800px' }}></div>
    );
};

export default MapContainer;