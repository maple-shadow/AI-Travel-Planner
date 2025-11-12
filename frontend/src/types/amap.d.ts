// 高德地图API类型声明
declare namespace AMap {
    // 地图类
    class Map {
        constructor(container: string | HTMLElement, options?: MapOptions);
        setCenter(center: [number, number]): void;
        setZoom(zoom: number): void;
        add(overlay: any | any[]): void;
        addControl(control: any): void;
        clearMap(): void;
        destroy(): void;
    }

    interface MapOptions {
        viewMode?: '2D' | '3D';
        zoom?: number;
        center?: [number, number];
        mapStyle?: string;
        zoomEnable?: boolean;
        dragEnable?: boolean;
        doubleClickZoom?: boolean;
        keyboardEnable?: boolean;
        animateEnable?: boolean;
        resizeEnable?: boolean;
        rotateEnable?: boolean;
        pitchEnable?: boolean;
        showLabel?: boolean;
        showIndoorMap?: boolean;
        showBuildingBlock?: boolean;
        features?: string[];
    }

    // 地点搜索类
    class PlaceSearch {
        constructor(options?: PlaceSearchOptions);
        search(keyword: string, callback: (status: string, result: any) => void): void;
    }

    interface PlaceSearchOptions {
        city?: string;
        citylimit?: boolean;
        pageSize?: number;
        pageIndex?: number;
        extensions?: string;
    }

    // 驾车路线规划类
    class Driving {
        constructor(options?: DrivingOptions);
        search(
            origin: [number, number],
            destination: [number, number],
            callback: (status: string, result: any) => void
        ): void;
    }

    interface DrivingOptions {
        policy?: DrivingPolicy;
        ferry?: number;
        province?: string;
    }

    enum DrivingPolicy {
        LEAST_TIME = 0, // 最快路线
        LEAST_FEE = 1,  // 最经济路线
        LEAST_DISTANCE = 2, // 最短距离
        REAL_TRAFFIC = 4 // 实时交通
    }

    // 折线类
    class Polyline {
        constructor(options?: PolylineOptions);
    }

    interface PolylineOptions {
        path: [number, number][];
        strokeColor?: string;
        strokeWeight?: number;
        strokeOpacity?: number;
    }

    // 标记类
    class Marker {
        constructor(options?: MarkerOptions);
    }

    interface MarkerOptions {
        position: [number, number];
        title?: string;
        content?: string;
        icon?: string;
    }

    // 工具栏控件
    class ToolBar {
        constructor();
    }

    // 比例尺控件
    class Scale {
        constructor();
    }

    // 鹰眼图控件
    class OverView {
        constructor(options?: { isOpen?: boolean });
    }

    // 地图类型控件
    class MapType {
        constructor();
    }

    // 定位插件
    class Geolocation {
        constructor(options?: GeolocationOptions);
        getCurrentPosition(callback: (status: string, result: any) => void): void;
    }

    interface GeolocationOptions {
        enableHighAccuracy?: boolean;
        timeout?: number;
        maximumAge?: number;
    }
}

// 全局声明
declare global {
    interface Window {
        AMap: typeof AMap;
    }
}

export { };