import React, { useState, useEffect } from 'react';
import { Location, LocationSearchResult } from '../types/map.types';
import './LocationPicker.css';

interface LocationPickerProps {
    apiKey: string;
    onLocationSelect: (location: Location, address: string) => void;
    placeholder?: string;
    className?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
    apiKey,
    onLocationSelect,
    placeholder = "搜索地点...",
    className = ""
}) => {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // 搜索地点
    const searchLocation = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            // 使用高德地图的搜索API
            const response = await fetch(
                `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(query)}&key=${apiKey}&city=全国`
            );

            const data = await response.json();

            if (data.status === '1' && data.pois) {
                const results: LocationSearchResult[] = data.pois.map((poi: any) => ({
                    id: poi.id,
                    name: poi.name,
                    address: poi.address || poi.pname + poi.cityname + poi.adname,
                    location: {
                        lng: parseFloat(poi.location.split(',')[0]),
                        lat: parseFloat(poi.location.split(',')[1])
                    },
                    distance: poi.distance ? parseInt(poi.distance) : undefined,
                    type: poi.type
                }));

                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('地点搜索失败:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // 防抖搜索
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText) {
                searchLocation(searchText);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, apiKey]);

    // 选择地点
    const handleSelectLocation = (result: LocationSearchResult) => {
        setSearchText(result.name);
        setShowResults(false);
        onLocationSelect(result.location, result.address);
    };

    // 获取当前位置
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: Location = {
                        lng: position.coords.longitude,
                        lat: position.coords.latitude
                    };

                    // 反向地理编码获取地址
                    fetch(`https://restapi.amap.com/v3/geocode/regeo?location=${location.lng},${location.lat}&key=${apiKey}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === '1') {
                                const address = data.regeocode.formatted_address;
                                setSearchText(address);
                                onLocationSelect(location, address);
                            }
                        })
                        .catch(error => {
                            console.error('反向地理编码失败:', error);
                            onLocationSelect(location, '当前位置');
                        });
                },
                (error) => {
                    console.error('获取当前位置失败:', error);
                    alert('无法获取当前位置，请检查浏览器权限设置');
                }
            );
        } else {
            alert('您的浏览器不支持地理位置功能');
        }
    };

    return (
        <div className={`location-picker ${className}`}>
            <div className="search-container">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        placeholder={placeholder}
                        className="search-input"
                    />

                    {isSearching && (
                        <div className="search-spinner">搜索中...</div>
                    )}

                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="current-location-btn"
                        title="使用当前位置"
                    >
                        📍
                    </button>
                </div>

                {showResults && searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((result) => (
                            <div
                                key={result.id}
                                className="search-result-item"
                                onClick={() => handleSelectLocation(result)}
                            >
                                <div className="result-name">{result.name}</div>
                                <div className="result-address">{result.address}</div>
                                {result.distance && (
                                    <div className="result-distance">{result.distance}米</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {showResults && searchText && searchResults.length === 0 && !isSearching && (
                    <div className="no-results">
                        未找到相关地点
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationPicker;