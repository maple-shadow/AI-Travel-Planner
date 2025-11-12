import { Location, LocationSearchResult, RouteResult, GeocodingResult } from '../types/map.types';

class MapService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * 搜索地点
     */
    async searchLocation(query: string, city?: string): Promise<LocationSearchResult[]> {
        if (!query.trim()) {
            return [];
        }

        try {
            const cityParam = city ? `&city=${encodeURIComponent(city)}` : '';
            const response = await fetch(
                `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(query)}&key=${this.apiKey}${cityParam}`
            );

            const data = await response.json();

            if (data.status === '1' && data.pois) {
                return data.pois.map((poi: any) => ({
                    id: poi.id,
                    name: poi.name,
                    address: poi.address || `${poi.pname}${poi.cityname}${poi.adname}`,
                    location: {
                        lng: parseFloat(poi.location.split(',')[0]),
                        lat: parseFloat(poi.location.split(',')[1])
                    },
                    distance: poi.distance ? parseInt(poi.distance) : undefined,
                    type: poi.type
                }));
            }

            return [];
        } catch (error) {
            console.error('地点搜索失败:', error);
            throw new Error('地点搜索失败，请检查网络连接');
        }
    }

    /**
     * 地理编码（地址转坐标）
     */
    async geocodeAddress(address: string, city?: string): Promise<GeocodingResult | null> {
        if (!address.trim()) {
            return null;
        }

        try {
            const cityParam = city ? `&city=${encodeURIComponent(city)}` : '';
            const response = await fetch(
                `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${this.apiKey}${cityParam}`
            );

            const data = await response.json();

            if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
                const geocode = data.geocodes[0];
                const location = geocode.location.split(',');

                return {
                    formattedAddress: geocode.formatted_address,
                    location: {
                        lng: parseFloat(location[0]),
                        lat: parseFloat(location[1])
                    },
                    addressComponent: {
                        province: geocode.province,
                        city: geocode.city,
                        district: geocode.district,
                        street: geocode.street,
                        streetNumber: geocode.number
                    }
                };
            }

            return null;
        } catch (error) {
            console.error('地理编码失败:', error);
            throw new Error('地址解析失败，请检查网络连接');
        }
    }

    /**
     * 反向地理编码（坐标转地址）
     */
    async reverseGeocode(location: Location): Promise<GeocodingResult | null> {
        try {
            const response = await fetch(
                `https://restapi.amap.com/v3/geocode/regeo?location=${location.lng},${location.lat}&key=${this.apiKey}`
            );

            const data = await response.json();

            if (data.status === '1' && data.regeocode) {
                const addressComponent = data.regeocode.addressComponent;

                return {
                    formattedAddress: data.regeocode.formatted_address,
                    location: location,
                    addressComponent: {
                        province: addressComponent.province,
                        city: addressComponent.city || addressComponent.province,
                        district: addressComponent.district,
                        street: addressComponent.street || '',
                        streetNumber: addressComponent.streetNumber || ''
                    }
                };
            }

            return null;
        } catch (error) {
            console.error('反向地理编码失败:', error);
            throw new Error('位置解析失败，请检查网络连接');
        }
    }

    /**
     * 计算路线距离（直线距离）
     */
    calculateDistance(origin: Location, destination: Location): number {
        // 使用Haversine公式计算两点间距离（米）
        const R = 6371000; // 地球半径（米）
        const dLat = (destination.lat - origin.lat) * Math.PI / 180;
        const dLng = (destination.lng - origin.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * 路线规划
     */
    async calculateRoute(origin: Location, destination: Location, strategy: string = '0'): Promise<RouteResult | null> {
        try {
            const response = await fetch(
                `https://restapi.amap.com/v3/direction/driving?origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}&strategy=${strategy}&key=${this.apiKey}`
            );

            const data = await response.json();

            if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
                const path = data.route.paths[0];

                return {
                    distance: path.distance,
                    duration: path.duration,
                    path: this.parsePathString(path.polyline),
                    steps: path.steps.map((step: any) => ({
                        instruction: step.instruction.replace(/<[^>]*>/g, ''), // 移除HTML标签
                        distance: step.distance,
                        duration: step.duration,
                        path: this.parsePathString(step.polyline)
                    }))
                };
            }

            return null;
        } catch (error) {
            console.error('路线规划失败:', error);
            throw new Error('路线规划失败，请检查网络连接');
        }
    }

    /**
     * 解析路径字符串
     */
    private parsePathString(polyline: string): Location[] {
        if (!polyline) return [];

        const points = polyline.split(';');
        return points.map(point => {
            const [lng, lat] = point.split(',');
            return {
                lng: parseFloat(lng),
                lat: parseFloat(lat)
            };
        });
    }

    /**
     * 验证坐标是否有效
     */
    validateCoordinates(location: Location): boolean {
        return (
            typeof location.lng === 'number' &&
            typeof location.lat === 'number' &&
            location.lng >= -180 && location.lng <= 180 &&
            location.lat >= -90 && location.lat <= 90
        );
    }

    /**
     * 生成静态地图URL
     * 根据高德地图静态地图API文档：https://lbs.amap.com/api/webservice/guide/api/staticmaps
     */
    generateStaticMapUrl(options: {
        center: Location;
        zoom?: number;
        size?: string; // 格式：宽x高，如：400x300
        markers?: Array<{
            location: Location;
            label?: string;
            color?: string;
            size?: string;
        }>;
        paths?: Array<{
            color?: string;
            weight?: number;
            transparency?: number;
            locations: Location[];
        }>;
        labels?: Array<{
            content: string;
            location: Location;
            font?: number;
            color?: string;
        }>;
    }): string {
        const baseUrl = 'https://restapi.amap.com/v3/staticmap';
        const params = new URLSearchParams();

        // 必填参数
        params.append('key', this.apiKey);
        params.append('location', `${options.center.lng},${options.center.lat}`);

        // 可选参数
        if (options.zoom) {
            params.append('zoom', options.zoom.toString());
        }

        if (options.size) {
            params.append('size', options.size);
        } else {
            params.append('size', '400x300'); // 默认大小
        }

        // 标记点
        if (options.markers && options.markers.length > 0) {
            const markers = options.markers.map(marker => {
                let markerStr = `${marker.location.lng},${marker.location.lat}`;
                if (marker.label) markerStr += `,${marker.label}`;
                if (marker.color) markerStr += `,${marker.color}`;
                if (marker.size) markerStr += `,${marker.size}`;
                return markerStr;
            }).join('|');
            params.append('markers', markers);
        }

        // 路径
        if (options.paths && options.paths.length > 0) {
            const paths = options.paths.map(path => {
                let pathStr = '';
                if (path.color) pathStr += `${path.color},`;
                if (path.weight) pathStr += `${path.weight},`;
                if (path.transparency) pathStr += `${path.transparency},`;

                const locations = path.locations.map(loc => `${loc.lng},${loc.lat}`).join(';');
                pathStr += locations;

                return pathStr;
            }).join('|');
            params.append('paths', paths);
        }

        // 标签
        if (options.labels && options.labels.length > 0) {
            const labels = options.labels.map(label => {
                let labelStr = label.content;
                labelStr += `,${label.location.lng},${label.location.lat}`;
                if (label.font) labelStr += `,${label.font}`;
                if (label.color) labelStr += `,${label.color}`;
                return labelStr;
            }).join('|');
            params.append('labels', labels);
        }

        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * 生成简单静态地图URL（简化版）
     */
    generateSimpleStaticMap(center: Location, zoom: number = 13, size: string = '400x300'): string {
        return this.generateStaticMapUrl({
            center,
            zoom,
            size
        });
    }

    /**
     * 生成带标记的静态地图URL
     */
    generateStaticMapWithMarkers(center: Location, markers: Array<{
        location: Location;
        label?: string;
        color?: string;
        size?: string;
    }>, zoom: number = 13, size: string = '400x300'): string {
        return this.generateStaticMapUrl({
            center,
            zoom,
            size,
            markers
        });
    }

    /**
     * 生成带路径的静态地图URL
     */
    generateStaticMapWithPath(center: Location, path: Array<{
        color?: string;
        weight?: number;
        transparency?: number;
        locations: Location[];
    }>, zoom: number = 13, size: string = '400x300'): string {
        return this.generateStaticMapUrl({
            center,
            zoom,
            size,
            paths: path
        });
    }

    /**
     * 获取城市列表（简化版）
     */
    async getCities(): Promise<string[]> {
        // 这里可以返回常用城市列表
        return [
            '北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '重庆', '西安',
            '天津', '苏州', '郑州', '长沙', '东莞', '沈阳', '青岛', '宁波', '昆明', '厦门'
        ];
    }
}

export default MapService;