// 位置坐标接口
export interface Location {
    lng: number;
    lat: number;
}

// 地图配置接口
export interface MapConfig {
    apiKey: string;
    version: string;
    plugins: string[];
    mapStyle: string;
}

// 地图实例类型（简化版，实际使用时需要根据高德地图API调整）
export type MapInstance = any;

// 位置搜索结果接口
export interface LocationSearchResult {
    id: string;
    name: string;
    address: string;
    location: Location;
    distance?: number;
    type?: string;
}

// 路线规划结果接口
export interface RouteResult {
    distance: number; // 距离（米）
    duration: number; // 时间（秒）
    path: Location[]; // 路线路径点
    steps: RouteStep[]; // 路线步骤
}

// 路线步骤接口
export interface RouteStep {
    instruction: string; // 导航指令
    distance: number; // 步骤距离
    duration: number; // 步骤时间
    path: Location[]; // 步骤路径
}

// 地图标记接口
export interface MapMarker {
    id: string;
    position: Location;
    title: string;
    content?: string;
    icon?: string;
}

// 地图图层配置接口
export interface MapLayer {
    id: string;
    type: 'marker' | 'polyline' | 'polygon' | 'heatmap';
    data: any[];
    style?: any;
    visible: boolean;
}

// 地理编码结果接口
export interface GeocodingResult {
    formattedAddress: string;
    location: Location;
    addressComponent: {
        province: string;
        city: string;
        district: string;
        street: string;
        streetNumber: string;
    };
}

// 地图事件回调接口
export interface MapEventCallbacks {
    onMapClick?: (location: Location) => void;
    onMarkerClick?: (marker: MapMarker) => void;
    onMapMove?: (center: Location, zoom: number) => void;
    onMapZoom?: (zoom: number) => void;
}

// 地图控件配置接口
export interface MapControls {
    zoom?: boolean;
    scale?: boolean;
    toolbar?: boolean;
    geolocation?: boolean;
    overview?: boolean;
}

// 地图状态接口
export interface MapState {
    center: Location;
    zoom: number;
    markers: MapMarker[];
    layers: MapLayer[];
    routes: RouteResult[];
    searchResults: LocationSearchResult[];
}