// 地图配置管理

// 高德地图API配置
interface AMapConfig {
    apiKey: string;
    version: string;
    plugins: string[];
}

// 地图服务配置
interface MapServiceConfig {
    searchUrl: string;
    geocodeUrl: string;
    routeUrl: string;
}

// 默认地图配置
export const defaultMapConfig: AMapConfig = {
    apiKey: import.meta.env.VITE_AMAP_API_KEY || 'your-amap-api-key',
    version: '2.0',
    plugins: [
        'AMap.Geolocation',
        'AMap.AutoComplete',
        'AMap.PlaceSearch',
        'AMap.Driving',
        'AMap.Walking',
        'AMap.Transfer',
        'AMap.Marker',
        'AMap.Polyline',
        'AMap.ToolBar',
        'AMap.Scale',
        'AMap.OverView',
        'AMap.MapType',
        'AMap.Geocoder'
    ]
};

// 地图服务配置
export const mapServiceConfig: MapServiceConfig = {
    searchUrl: 'https://restapi.amap.com/v3/assistant/inputtips',
    geocodeUrl: 'https://restapi.amap.com/v3/geocode/geo',
    routeUrl: 'https://restapi.amap.com/v3/direction/driving'
};

// 地图初始化配置
export const mapInitConfig = {
    // 默认中心点（北京）
    defaultCenter: {
        lng: 116.397428,
        lat: 39.90923
    },

    // 默认缩放级别
    defaultZoom: 13,

    // 地图样式
    mapStyle: 'amap://styles/normal',

    // 视图模式
    viewMode: '3D',

    // 缩放范围
    zoomLimit: [3, 20],

    // 是否显示路况
    showTraffic: false,

    // 是否显示建筑物
    showBuilding: true
};

// 路线规划配置
export const routeConfig = {
    // 路线策略
    strategies: {
        driving: {
            // 驾车策略
            fastest: 0,      // 最快路线
            shortest: 1,     // 最短路线
            avoidHighways: 2, // 避免高速
            avoidCongestion: 3, // 避免拥堵
            avoidHighwaysAndCongestion: 4, // 避免高速和拥堵
            multiStrategy: 5 // 多策略
        },
        walking: {
            // 步行策略
            shortest: 0,     // 最短路线
            fastest: 1       // 最快路线
        },
        transit: {
            // 公交策略
            fastest: 0,      // 最快捷
            cheapest: 1,     // 最经济
            shortest: 2,     // 最短距离
            avoidSubway: 3   // 不坐地铁
        }
    },

    // 路线颜色
    colors: {
        driving: '#1890FF',
        walking: '#52C41A',
        transit: '#722ED1',
        cycling: '#FAAD14'
    }
};

// 搜索配置
export const searchConfig = {
    // 搜索类型
    types: {
        all: '',           // 所有地点
        scenic: '风景名胜', // 风景名胜
        restaurant: '餐饮服务', // 餐饮服务
        hotel: '住宿服务',   // 住宿服务
        shopping: '购物服务', // 购物服务
        transportation: '交通设施服务' // 交通设施
    },

    // 搜索范围（米）
    radius: 30000,

    // 搜索结果数量限制
    limit: 20,

    // 城市限制
    cityLimit: true
};

// 获取地图配置
export const getMapConfig = (customConfig?: Partial<AMapConfig>): AMapConfig => {
    return {
        ...defaultMapConfig,
        ...customConfig
    };
};

// 验证API密钥
export const validateApiKey = (apiKey?: string): boolean => {
    const key = apiKey || defaultMapConfig.apiKey;
    return key !== 'your-amap-api-key' && key.length > 0;
};

// 获取API密钥（带验证）
export const getApiKey = (): string => {
    const apiKey = defaultMapConfig.apiKey;

    if (!validateApiKey(apiKey)) {
        console.warn(
            '高德地图API密钥未配置或配置无效。\n' +
            '请按照以下步骤配置：\n' +
            '1. 访问 https://lbs.amap.com/ 注册并申请API密钥\n' +
            '2. 在 .env 文件中设置 VITE_AMAP_API_KEY=your-actual-api-key\n' +
            '3. 重启开发服务器'
        );
    }

    return apiKey;
};

// 导出配置类型
export type { AMapConfig, MapServiceConfig };