import React, { useState, useCallback } from 'react';
import { MapContainer, LocationPicker, RouteDisplay, useMap, useGeolocation, getApiKey, validateApiKey } from '../index';
import { Location, RouteResult, MapMarker } from '../types/map.types';
import './MapNavigationPage.css';

const MapNavigationPage: React.FC = () => {
    const [apiKey] = useState(getApiKey()); // 从配置获取API密钥
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [route, setRoute] = useState<RouteResult | null>(null);
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [searchMode, setSearchMode] = useState<'location' | 'route'>('location');

    // 使用地图Hook
    const { map, loading: mapLoading, error: mapError, addMarker, clearMarkers, calculateRoute } = useMap({
        apiKey,
        initialCenter: { lng: 116.397428, lat: 39.90923 } // 北京
    });

    // 使用地理位置Hook
    const { location: currentLocation, getCurrentLocation } = useGeolocation();

    // 处理位置选择
    const handleLocationSelect = useCallback((location: Location, address: string) => {
        setSelectedLocation(location);

        // 添加标记
        const marker: MapMarker = {
            id: `marker_${Date.now()}`,
            position: location,
            title: address,
            content: `<div style="padding: 8px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">${address}</div>`
        };

        addMarker(marker);
        setMarkers(prev => [...prev, marker]);

        // 移动地图到选中位置
        if (map) {
            map.setCenter([location.lng, location.lat]);
            map.setZoom(15);
        }
    }, [map, addMarker]);

    // 处理路线规划
    const handleRouteCalculation = useCallback(async () => {
        if (!selectedLocation || !currentLocation) {
            alert('请先选择目的地和确保当前位置可用');
            return;
        }

        try {
            const routeResult = await calculateRoute(currentLocation, selectedLocation);
            if (routeResult) {
                setRoute(routeResult);
            } else {
                alert('路线规划失败，请稍后重试');
            }
        } catch (error) {
            console.error('路线规划错误:', error);
            alert('路线规划失败，请检查网络连接');
        }
    }, [selectedLocation, currentLocation, calculateRoute]);

    // 清除所有标记
    const handleClearMarkers = useCallback(() => {
        clearMarkers();
        setMarkers([]);
        setSelectedLocation(null);
        setRoute(null);
    }, [clearMarkers]);

    // 使用当前位置
    const handleUseCurrentLocation = useCallback(() => {
        getCurrentLocation();
        if (currentLocation && map) {
            map.setCenter([currentLocation.lng, currentLocation.lat]);
            map.setZoom(15);
        }
    }, [getCurrentLocation, currentLocation, map]);

    if (mapError) {
        return (
            <div className="map-navigation-page error">
                <div className="error-container">
                    <h2>地图加载失败</h2>
                    <p>{mapError}</p>
                    <p>请检查API密钥配置和网络连接</p>
                </div>
            </div>
        );
    }

    return (
        <div className="map-navigation-page">
            <div className="map-header">
                <h1>AI旅行规划 - 地图导航</h1>
                <div className="header-controls">
                    <button
                        onClick={handleUseCurrentLocation}
                        className="btn btn-primary"
                        disabled={!navigator.geolocation}
                    >
                        使用当前位置
                    </button>
                    <button
                        onClick={handleClearMarkers}
                        className="btn btn-secondary"
                    >
                        清除标记
                    </button>
                </div>
            </div>

            <div className="map-content">
                <div className="map-sidebar">
                    <div className="search-section">
                        <h3>地点搜索</h3>
                        <LocationPicker
                            apiKey={apiKey}
                            onLocationSelect={handleLocationSelect}
                            placeholder="搜索目的地..."
                        />
                    </div>

                    <div className="mode-section">
                        <h3>功能模式</h3>
                        <div className="mode-buttons">
                            <button
                                className={`mode-btn ${searchMode === 'location' ? 'active' : ''}`}
                                onClick={() => setSearchMode('location')}
                            >
                                地点搜索
                            </button>
                            <button
                                className={`mode-btn ${searchMode === 'route' ? 'active' : ''}`}
                                onClick={() => setSearchMode('route')}
                            >
                                路线规划
                            </button>
                        </div>
                    </div>

                    {selectedLocation && searchMode === 'route' && (
                        <div className="route-section">
                            <h3>路线规划</h3>
                            <button
                                onClick={handleRouteCalculation}
                                className="btn btn-primary"
                                disabled={!currentLocation}
                            >
                                计算路线
                            </button>

                            {route && (
                                <div className="route-result">
                                    <RouteDisplay
                                        route={route}
                                        origin={currentLocation || undefined}
                                        destination={selectedLocation}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="info-section">
                        <h3>位置信息</h3>
                        {currentLocation && (
                            <div className="location-info">
                                <strong>当前位置：</strong>
                                <div>经度: {currentLocation.lng.toFixed(6)}</div>
                                <div>纬度: {currentLocation.lat.toFixed(6)}</div>
                            </div>
                        )}

                        {selectedLocation && (
                            <div className="location-info">
                                <strong>选中位置：</strong>
                                <div>经度: {selectedLocation.lng.toFixed(6)}</div>
                                <div>纬度: {selectedLocation.lat.toFixed(6)}</div>
                            </div>
                        )}

                        {markers.length > 0 && (
                            <div className="markers-info">
                                <strong>标记数量：</strong>
                                <span>{markers.length} 个</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="map-container-wrapper">
                    <MapContainer
                        apiKey={apiKey}
                        initialCenter={{ lng: 116.397428, lat: 39.90923 }}
                        zoom={13}
                    />
                </div>
            </div>
        </div>
    );
};

export default MapNavigationPage;