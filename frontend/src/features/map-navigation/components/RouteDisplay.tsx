import React from 'react';
import { RouteResult, Location } from '../types/map.types';
import './RouteDisplay.css';

interface RouteDisplayProps {
    route: RouteResult;
    origin?: Location;
    destination?: Location;
    onRouteSelect?: (route: RouteResult) => void;
    className?: string;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({
    route,
    origin,
    destination,
    onRouteSelect,
    className = ""
}) => {
    // 格式化距离
    const formatDistance = (distance: number): string => {
        if (distance < 1000) {
            return `${distance}米`;
        }
        return `${(distance / 1000).toFixed(1)}公里`;
    };

    // 格式化时间
    const formatDuration = (duration: number): string => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);

        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        }
        return `${minutes}分钟`;
    };

    // 处理路线选择
    const handleRouteSelect = () => {
        if (onRouteSelect) {
            onRouteSelect(route);
        }
    };

    return (
        <div
            className={`route-display ${className} ${onRouteSelect ? 'selectable' : ''}`}
            onClick={handleRouteSelect}
        >
            <div className="route-header">
                <div className="route-info">
                    <div className="route-distance">
                        📏 {formatDistance(route.distance)}
                    </div>
                    <div className="route-duration">
                        ⏱️ {formatDuration(route.duration)}
                    </div>
                </div>

                {onRouteSelect && (
                    <div className="route-select-indicator">
                        ➡️
                    </div>
                )}
            </div>

            {route.steps && route.steps.length > 0 && (
                <div className="route-steps">
                    <div className="steps-header">路线详情：</div>
                    {route.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="route-step">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                                <div className="step-instruction">{step.instruction}</div>
                                <div className="step-distance">
                                    {formatDistance(step.distance)} · {formatDuration(step.duration)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {route.steps.length > 3 && (
                        <div className="more-steps">
                            还有 {route.steps.length - 3} 个步骤...
                        </div>
                    )}
                </div>
            )}

            {origin && destination && (
                <div className="route-locations">
                    <div className="location-item">
                        <div className="location-marker start">🟢</div>
                        <div className="location-text">起点</div>
                    </div>
                    <div className="location-item">
                        <div className="location-marker end">🔴</div>
                        <div className="location-text">终点</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteDisplay;