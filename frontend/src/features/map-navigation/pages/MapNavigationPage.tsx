import React, { useState, useCallback, useRef } from 'react';
import { Input, Button, message, Spin } from 'antd';
import { SearchOutlined, CarOutlined } from '@ant-design/icons';
import { MapContainer, useGeolocation, getApiKey } from '../index';
import { Location, MapMarker, MapInstance, POIResult } from '../types/map.types';
import './MapNavigationPage.css';

const { Search } = Input;

const MapNavigationPage: React.FC = () => {
    const [apiKey] = useState(getApiKey()); // 从配置获取API密钥
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    // const [route, setRoute] = useState<RouteResult | null>(null);
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [searchMode, setSearchMode] = useState<'route' | 'poi'>('poi');
    const [mapError, setMapError] = useState<string | null>(null);
    const [poiResults, setPoiResults] = useState<POIResult[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [routeOrigin, setRouteOrigin] = useState('');
    const [routeDestination, setRouteDestination] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [placeSearch, setPlaceSearch] = useState<any>(null); // AMap.PlaceSearch实例
    const [autoComplete, setAutoComplete] = useState<any>(null); // AMap.AutoComplete实例
    const [driving, setDriving] = useState<any>(null); // AMap.Driving实例
    const [routeInfo, setRouteInfo] = useState<any>(null); // 路线信息
    const [isPlanningRoute, setIsPlanningRoute] = useState(false); // 路线规划中状态
    const [routePolyline, setRoutePolyline] = useState<any>(null); // 路线折线
    const [routeMarkers, setRouteMarkers] = useState<any[]>([]); // 路线标记

    // 使用ref来存储地图实例
    const mapRef = useRef<MapInstance | null>(null);

    // 使用地理位置Hook
    const { location: currentLocation, getCurrentLocation } = useGeolocation();

    // 地图准备完成回调
    const handleMapReady = useCallback((map: MapInstance) => {
        mapRef.current = map;
        setMapError(null);

        // 确保AMap对象已加载
        if (!window.AMap) {
            console.error('AMap对象未加载');
            setMapError('地图SDK加载失败，请刷新页面重试');
            return;
        }

        // 初始化地点搜索插件 - 按照官方文档配置
        try {
            const placeSearchInstance = new window.AMap.PlaceSearch({
                city: '全国', // 全国范围搜索
                citylimit: false, // 不限制城市
                pageSize: 10, // 每页显示结果数
                pageIndex: 1, // 页码
                extensions: 'all' // 返回详细信息
            });
            setPlaceSearch(placeSearchInstance);
            console.log('地点搜索插件初始化成功');
        } catch (error) {
            console.error('地点搜索插件初始化失败:', error);
            setMapError('地点搜索功能初始化失败');
        }

        // 初始化输入提示插件 - 按照官方文档配置
        try {
            const autoCompleteInstance = new (window.AMap as any).AutoComplete({
                city: '全国', // 全国范围
                citylimit: false, // 不限制城市
                type: 'all', // 搜索类型：所有
                datatype: 'all' // 数据类型：所有
            });
            setAutoComplete(autoCompleteInstance);
            console.log('输入提示插件初始化成功');
        } catch (error) {
            console.error('输入提示插件初始化失败:', error);
            setMapError('输入提示功能初始化失败');
        }

        // 初始化路线规划插件 - 按照官方文档配置
        try {
            const drivingInstance = new window.AMap.Driving({
                policy: window.AMap.DrivingPolicy.LEAST_TIME, // 默认策略：最快路线
                ferry: 1, // 包含轮渡
                province: '京' // 车牌省份
            });
            setDriving(drivingInstance);
            console.log('路线规划插件初始化成功');
        } catch (error) {
            console.error('路线规划插件初始化失败:', error);
            setMapError('路线规划功能初始化失败');
        }
    }, []);

    // 地图加载失败回调
    const handleMapError = useCallback((error: string) => {
        setMapError(error);
    }, []);

    // 处理位置选择（预留功能，暂时注释）
    // const handleLocationSelect = useCallback((location: Location, address: string) => {
    //     setSelectedLocation(location);

    //     // 添加标记
    //     const marker: MapMarker = {
    //         id: `marker_${Date.now()}`,
    //         position: location,
    //         title: address,
    //         content: `<div style="padding: 8px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">${address}</div>`
    //     };

    //     // 这里需要实现添加标记的逻辑
    //     console.log('添加标记:', marker);
    //     setMarkers(prev => [...prev, marker]);

    //     // 移动地图到选中位置
    //     if (mapRef.current) {
    //         mapRef.current.setCenter([location.lng, location.lat]);
    //         mapRef.current.setZoom(15);
    //     }
    // }, []);

    // 输入提示功能
    const handleInputSuggest = useCallback((query: string) => {
        if (!query.trim() || !autoComplete) return;

        // 使用AutoComplete插件获取输入提示
        autoComplete.search(query, (status: string, result: any) => {
            if (status === 'complete' && result.tips) {
                console.log('输入提示结果:', result.tips);
                // 这里可以显示输入提示，但为了简化，我们只记录到控制台
            }
        });
    }, [autoComplete]);

    // POI搜索功能 - 按照官方文档完善
    const handlePOISearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            message.warning('请输入搜索关键词');
            return;
        }

        if (!placeSearch) {
            message.error('地点搜索功能未初始化');
            return;
        }

        setIsSearching(true);
        setPoiResults([]);

        try {
            // 执行POI搜索 - 按照官方文档调用
            placeSearch.search(query, (status: string, result: any) => {
                setIsSearching(false);
                console.log('POI搜索回调:', { status, result });

                if (status === 'complete' && result.poiList && result.poiList.pois) {
                    const pois = result.poiList.pois.map((poi: any) => ({
                        id: poi.id,
                        name: poi.name,
                        address: poi.address,
                        location: {
                            lng: poi.location.lng,
                            lat: poi.location.lat
                        },
                        type: poi.type,
                        tel: poi.tel,
                        distance: poi.distance,
                        businessArea: poi.businessArea, // 商圈信息
                        pname: poi.pname, // 省份
                        cityname: poi.cityname, // 城市
                        adname: poi.adname // 区域
                    }));

                    setPoiResults(pois);
                    message.success(`找到 ${pois.length} 个结果`);

                    // 如果有结果，移动地图到第一个结果位置
                    if (pois.length > 0 && mapRef.current) {
                        const firstPoi = pois[0];
                        mapRef.current.setCenter([firstPoi.location.lng, firstPoi.location.lat]);
                        mapRef.current.setZoom(15);
                    }
                } else if (status === 'no_data') {
                    message.info('未找到相关地点');
                } else {
                    console.error('POI搜索失败:', { status, result });
                    message.error('搜索失败，请重试');
                }
            });
        } catch (error) {
            setIsSearching(false);
            console.error('POI搜索错误:', error);
            message.error('搜索失败，请检查网络连接');
        }
    }, [placeSearch]);

    // 选择POI结果
    const handlePOISelect = useCallback((poi: POIResult) => {
        setSelectedLocation(poi.location);

        // 添加标记
        const marker: MapMarker = {
            id: `poi_${poi.id}`,
            position: poi.location,
            title: poi.name,
            content: `
                <div style="padding: 8px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 200px;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${poi.name}</div>
                    <div style="color: #666; font-size: 12px;">${poi.address}</div>
                    ${poi.tel ? `<div style="color: #1890ff; font-size: 12px;">${poi.tel}</div>` : ''}
                </div>
            `
        };

        setMarkers(prev => [...prev.filter(m => m.id !== marker.id), marker]);

        // 移动地图到选中位置
        if (mapRef.current) {
            mapRef.current.setCenter([poi.location.lng, poi.location.lat]);
            mapRef.current.setZoom(15);
        }

        message.success(`已选择: ${poi.name}`);
    }, []);

    // 路线规划功能 - 按照官方文档完善
    const handleRoutePlanning = useCallback(async (origin: string, destination: string) => {
        if (!origin.trim() || !destination.trim()) {
            message.warning('请输入起点和终点');
            return;
        }

        if (!driving) {
            message.error('路线规划功能未初始化');
            return;
        }

        setIsPlanningRoute(true);

        try {
            // 执行路线规划 - 按照官方文档调用
            driving.search([
                { keyword: origin, city: '全国' },
                { keyword: destination, city: '全国' }
            ], (status: string, result: any) => {
                setIsPlanningRoute(false);
                console.log('路线规划回调:', { status, result });

                if (status === 'complete' && result.routes && result.routes.length > 0) {
                    const route = result.routes[0];
                    setRouteInfo({
                        distance: route.distance,
                        time: route.time,
                        steps: route.steps,
                        tolls: route.tolls, // 收费信息
                        toll_distance: route.toll_distance, // 收费路段距离
                        traffic_lights: route.traffic_lights // 红绿灯数量
                    });
                    message.success('路线规划成功');

                    // 在地图上显示路线
                    if (mapRef.current) {
                        // 清除之前的路线和标记
                        if (routePolyline) {
                            mapRef.current.remove(routePolyline);
                        }
                        if (routeMarkers) {
                            routeMarkers.forEach(marker => mapRef.current.remove(marker));
                        }

                        // 创建起点和终点标记
                        const markers = [];
                        if (result.origin && result.origin.location) {
                            const startMarker = new window.AMap.Marker({
                                position: [result.origin.location.lng, result.origin.location.lat],
                                icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
                                offset: new window.AMap.Pixel(-13, -30)
                            });
                            mapRef.current.add(startMarker);
                            markers.push(startMarker);
                        }

                        if (result.destination && result.destination.location) {
                            const endMarker = new window.AMap.Marker({
                                position: [result.destination.location.lng, result.destination.location.lat],
                                icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
                                offset: new window.AMap.Pixel(-13, -30)
                            });
                            mapRef.current.add(endMarker);
                            markers.push(endMarker);
                        }

                        // 创建路线 - 修复路径访问问题
                        let path = [];
                        if (route.paths && route.paths.length > 0) {
                            path = route.paths[0];
                        } else if (route.steps && route.steps.length > 0) {
                            // 如果paths不存在，从steps中提取路径点
                            path = route.steps.reduce((acc: any[], step: any) => {
                                if (step.path && step.path.length > 0) {
                                    return [...acc, ...step.path];
                                }
                                return acc;
                            }, []);
                        }

                        if (path.length > 0) {
                            const polyline = new window.AMap.Polyline({
                                path: path,
                                strokeColor: '#1890ff',
                                strokeWeight: 6,
                                strokeOpacity: 0.8,
                                strokeStyle: 'solid',
                                showDir: true // 显示方向箭头
                            });

                            mapRef.current.add(polyline);
                            setRoutePolyline(polyline);
                            setRouteMarkers(markers);

                            // 调整地图视野
                            mapRef.current.setFitView([polyline, ...markers]);
                        } else {
                            console.warn('路线路径数据为空，无法绘制路线');
                            message.warning('路线数据不完整，无法在地图上显示');
                        }
                    }
                } else if (status === 'no_data') {
                    message.info('未找到可行路线');
                } else {
                    console.error('路线规划失败:', { status, result });
                    message.error('路线规划失败，请重试');
                }
            });
        } catch (error) {
            setIsPlanningRoute(false);
            console.error('路线规划错误:', error);
            message.error('路线规划失败，请检查网络连接');
        }
    }, [driving, routePolyline, routeMarkers]);

    // 清除所有标记
    const handleClearMarkers = useCallback(() => {
        setMarkers([]);
        setSelectedLocation(null);
        // setRoute(null); // 已注释掉route状态
        setPoiResults([]);
        setSearchQuery('');

        // 清除地图上的覆盖物
        if (mapRef.current) {
            mapRef.current.clearMap();
        }

        message.success('已清除所有标记和搜索结果');
    }, []);

    // 使用当前位置
    const handleUseCurrentLocation = useCallback(() => {
        getCurrentLocation();
        if (currentLocation && mapRef.current) {
            mapRef.current.setCenter([currentLocation.lng, currentLocation.lat]);
            mapRef.current.setZoom(15);
        }
    }, [getCurrentLocation, currentLocation]);

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
                    <div className="mode-section">
                        <h3>功能模式</h3>
                        <div className="mode-buttons">
                            <Button
                                type={searchMode === 'poi' ? 'primary' : 'default'}
                                icon={<SearchOutlined />}
                                onClick={() => setSearchMode('poi')}
                                size="small"
                            >
                                搜索
                            </Button>
                            <Button
                                type={searchMode === 'route' ? 'primary' : 'default'}
                                icon={<CarOutlined />}
                                onClick={() => setSearchMode('route')}
                                size="small"
                            >
                                路线规划
                            </Button>
                        </div>
                    </div>

                    {/* 搜索界面 */}
                    {searchMode === 'poi' && (
                        <div className="poi-search-section">
                            <h3>搜索</h3>
                            <Search
                                placeholder="输入关键词搜索地点（如：餐厅、酒店、景点）"
                                enterButton={<SearchOutlined />}
                                size="middle"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    // 实时输入提示
                                    handleInputSuggest(e.target.value);
                                }}
                                onSearch={handlePOISearch}
                                loading={isSearching}
                            />

                            {isSearching && (
                                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                    <Spin size="small" />
                                    <span style={{ marginLeft: 8 }}>搜索中...</span>
                                </div>
                            )}

                            {poiResults.length > 0 && (
                                <div className="poi-results">
                                    <h4>搜索结果 ({poiResults.length})</h4>
                                    <div className="poi-list">
                                        {poiResults.map((poi) => (
                                            <div key={poi.id} className="poi-item" onClick={() => handlePOISelect(poi)}>
                                                <div className="poi-name">{poi.name}</div>
                                                <div className="poi-address">{poi.address}</div>
                                                {poi.tel && <div className="poi-tel">📞 {poi.tel}</div>}
                                                {poi.distance && <div className="poi-distance">距离: {Math.round(poi.distance)}米</div>}
                                                {poi.businessArea && <div className="poi-business">商圈: {poi.businessArea}</div>}
                                                <div className="poi-location">{poi.pname} {poi.cityname} {poi.adname}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 路线规划界面 */}
                    {searchMode === 'route' && (
                        <div className="route-planning-section">
                            <h3>路线规划</h3>
                            <div className="route-inputs">
                                <Input
                                    placeholder="起点（如：北京西站）"
                                    value={routeOrigin}
                                    onChange={(e) => setRouteOrigin(e.target.value)}
                                    style={{ marginBottom: 8 }}
                                    onPressEnter={() => handleRoutePlanning(routeOrigin, routeDestination)}
                                />
                                <Input
                                    placeholder="终点（如：天安门广场）"
                                    value={routeDestination}
                                    onChange={(e) => setRouteDestination(e.target.value)}
                                    style={{ marginBottom: 8 }}
                                    onPressEnter={() => handleRoutePlanning(routeOrigin, routeDestination)}
                                />
                                <Button
                                    type="primary"
                                    onClick={() => handleRoutePlanning(routeOrigin, routeDestination)}
                                    loading={isPlanningRoute}
                                    block
                                    icon={<CarOutlined />}
                                >
                                    开始规划
                                </Button>
                            </div>

                            {routeInfo && (
                                <div className="route-result">
                                    <h4>路线信息</h4>
                                    <div className="route-detail">
                                        <div><strong>总距离:</strong> {(routeInfo.distance / 1000).toFixed(1)} 公里</div>
                                        <div><strong>预计时间:</strong> {Math.round(routeInfo.time / 60)} 分钟</div>
                                        {routeInfo.tolls > 0 && <div><strong>收费:</strong> {routeInfo.tolls} 元</div>}
                                        {routeInfo.toll_distance > 0 && <div><strong>收费路段:</strong> {(routeInfo.toll_distance / 1000).toFixed(1)} 公里</div>}
                                        {routeInfo.traffic_lights > 0 && <div><strong>红绿灯:</strong> {routeInfo.traffic_lights} 个</div>}
                                    </div>

                                    {routeInfo.steps && routeInfo.steps.length > 0 && (
                                        <div className="route-steps">
                                            <h5>路线详情</h5>
                                            <div className="steps-list">
                                                {routeInfo.steps.slice(0, 5).map((step: any, index: number) => (
                                                    <div key={index} className="step-item">
                                                        <div className="step-instruction">{step.instruction}</div>
                                                        <div className="step-distance">{(step.distance / 1000).toFixed(1)}公里</div>
                                                    </div>
                                                ))}
                                                {routeInfo.steps.length > 5 && (
                                                    <div className="step-more">... 还有 {routeInfo.steps.length - 5} 个步骤</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
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
                        onMapReady={handleMapReady}
                        onError={handleMapError}
                    />
                </div>
            </div>
        </div>
    );
};

export default MapNavigationPage;