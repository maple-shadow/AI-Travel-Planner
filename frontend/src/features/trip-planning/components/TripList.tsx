import React from 'react';
import { Trip } from '../types';
import TripCard from './TripCard';
import { Row, Col, Empty, Skeleton, Typography } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface TripListProps {
    trips: Trip[];
    onEditTrip: (trip: Trip) => void;
    onDeleteTrip: (tripId: string) => void;
    onDuplicateTrip: (tripId: string) => void;
    onViewTrip: (trip: Trip) => void;
    isLoading?: boolean;
}

const TripList: React.FC<TripListProps> = ({
    trips,
    onEditTrip,
    onDeleteTrip,
    onDuplicateTrip,
    onViewTrip,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <Row gutter={[16, 16]}>
                {[...Array(6)].map((_, index) => (
                    <Col key={index} xs={24} sm={12} lg={8}>
                        <Skeleton
                            active
                            avatar={false}
                            title={{ width: '80%' }}
                            paragraph={{ rows: 4, width: ['100%', '100%', '100%', '60%'] }}
                        />
                    </Col>
                ))}
            </Row>
        );
    }

    if (trips.length === 0) {
        return (
            <Empty
                image={<RocketOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                imageStyle={{ height: 80 }}
                description={
                    <div>
                        <Title level={4} style={{ marginBottom: 8 }}>暂无行程</Title>
                        <Text type="secondary">开始创建您的第一个旅行计划吧！</Text>
                    </div>
                }
                style={{ padding: '40px 0' }}
            />
        );
    }

    return (
        <Row gutter={[16, 16]}>
            {trips.map((trip) => (
                <Col key={trip.id} xs={24} sm={12} lg={8}>
                    <TripCard
                        trip={trip}
                        onEdit={onEditTrip}
                        onDelete={onDeleteTrip}
                        onDuplicate={onDuplicateTrip}
                        onView={onViewTrip}
                    />
                </Col>
            ))}
        </Row>
    );
};

export default TripList;