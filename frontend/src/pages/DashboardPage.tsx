// 仪表板页面
import React from 'react';
import { useAppSelector } from '../shared/hooks';

const DashboardPage: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <div className="App">
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>欢迎回来, {user?.name || '旅行者'}!</h1>
                    <p>这是您的AI旅行规划器仪表板，开始规划您的下一次冒险吧</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">12</div>
                        <div className="stat-label">已规划行程</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">5</div>
                        <div className="stat-label">进行中行程</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">3</div>
                        <div className="stat-label">已完成行程</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">8</div>
                        <div className="stat-label">收藏目的地</div>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '2rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: 'var(--gray-800)',
                        marginBottom: '1rem'
                    }}>
                        快速开始
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <button className="btn btn-primary">新建行程</button>
                        <button className="btn btn-secondary">浏览目的地</button>
                        <button className="btn btn-secondary">查看推荐</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;