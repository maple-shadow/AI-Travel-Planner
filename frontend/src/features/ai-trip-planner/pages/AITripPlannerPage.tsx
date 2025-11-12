import React, { useState } from 'react';
import { Card, Typography, Button, Space, Tabs, message } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useBudget } from '../../budget-manager/hooks/useBudget';
import { CreateBudgetData } from '../../budget-manager/types';
import { TripPlanningForm, TripPlanResult, BudgetManager } from '../components';
import { useAITripPlanning } from '../hooks';
import { TripPlanningRequest, TripPlan } from '../types';

const { Title, Text } = Typography;



const AITripPlannerPage: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<string>('planning');
    const [tripRequest, setTripRequest] = useState<TripPlanningRequest | null>(null);
    const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);

    // AI旅行规划钩子
    const { generateTripPlan, optimizeTripPlan, clearPlan, isPlanning } = useAITripPlanning();

    // 预算管理
    const budgetHook = useBudget();

    // 处理行程规划提交
    const handleTripPlanning = async (request: TripPlanningRequest) => {
        setTripRequest(request);

        // 使用AI旅行规划钩子生成行程
        const plan = await generateTripPlan(request);
        if (plan) {
            setTripPlan(plan);
            setCurrentTab('result');
            message.success('行程规划完成！');
        }
    };

    // 处理行程优化
    const handleOptimizeTrip = async (optimizationType: 'time' | 'cost' | 'experience') => {
        if (!tripPlan) return;

        const optimizedPlan = await optimizeTripPlan(tripPlan, optimizationType);
        if (optimizedPlan) {
            setTripPlan(optimizedPlan);
            message.success('行程优化完成！');
        }
    };

    // 清除规划结果
    const handleClearPlan = () => {
        clearPlan();
        setTripRequest(null);
        setTripPlan(null);
        setCurrentTab('planning');
        message.info('已清除规划结果');
    };

    // 处理语音输入（函数已删除，因为未使用）

    // 创建预算
    const handleCreateBudget = async () => {
        if (!tripPlan || !tripRequest) return;

        // 生成一个临时的trip_id和user_id
        const budgetData: CreateBudgetData = {
            trip_id: `temp-trip-${Date.now()}`,
            user_id: 'temp-user',
            title: `${tripRequest.destination} 旅行预算`,
            total_amount: tripRequest.budget,
            start_date: tripRequest.startDate,
            end_date: tripRequest.endDate,
            description: `AI规划的${tripRequest.destination}旅行预算`
        };

        const result = await budgetHook.createBudget(budgetData);
        if (result.success) {
            message.success('预算创建成功！');
            setCurrentTab('budget');
        } else {
            message.error('预算创建失败');
        }
    };

    // 标签页配置
    const tabItems = [
        {
            key: 'planning',
            label: '行程规划',
            children: (
                <TripPlanningForm
                    onSubmit={handleTripPlanning}
                    loading={isPlanning}
                />
            )
        },
        {
            key: 'result',
            label: '规划结果',
            children: tripPlan ? (
                <div>
                    <div style={{ textAlign: 'right', marginBottom: 16 }}>
                        <Space>
                            <Button
                                type="primary"
                                onClick={handleCreateBudget}
                                icon={<DollarOutlined />}
                            >
                                创建预算
                            </Button>
                            <Button
                                onClick={handleClearPlan}
                                danger
                            >
                                清除规划
                            </Button>
                        </Space>
                    </div>
                    <TripPlanResult
                        plan={tripPlan}
                        onOptimize={(type) => handleOptimizeTrip(type)}
                        loading={isPlanning}
                    />
                </div>
            ) : (
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                    <Text type="secondary">请先完成行程规划</Text>
                </Card>
            ),
            disabled: !tripPlan
        },
        {
            key: 'budget',
            label: '预算管理',
            children: tripPlan ? (
                <BudgetManager
                    totalBudget={tripPlan.totalEstimatedCost}
                />
            ) : (
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                    <Text type="secondary">请先完成行程规划</Text>
                </Card>
            ),
            disabled: !tripPlan
        }
    ];

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            minHeight: '100vh'
        }}>
            <Card
                style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    minHeight: '80vh'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ color: '#1f2937', marginBottom: 8 }}>智能AI旅行规划</Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                        使用AI技术为您生成个性化旅行路线和预算管理
                    </Text>
                </div>

                <Tabs
                    activeKey={currentTab}
                    onChange={setCurrentTab}
                    items={tabItems}
                    size="large"
                    tabBarStyle={{ marginBottom: 24 }}
                />
            </Card>
        </div>
    );
};

export default AITripPlannerPage;