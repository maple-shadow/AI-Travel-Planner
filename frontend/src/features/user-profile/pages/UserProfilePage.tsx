// 用户资料管理主页面
import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks';
import { ProfileAvatar, ProfileDisplay, ProfileForm, SettingsForm } from '../components';

const UserProfilePage: React.FC = () => {
    const {
        userProfile,
        isEditing,
        loading,
        error,
        setIsEditing,
        fetchUserProfile
    } = useProfile();

    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-medium">加载失败</div>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={fetchUserProfile}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
                    <p className="mt-2 text-gray-600">管理您的个人资料和账户设置</p>
                </div>

                {/* 标签页导航 */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                个人资料
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                设置
                            </button>
                        </nav>
                    </div>
                </div>

                {/* 内容区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 侧边栏 - 头像和基本信息 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="text-center">
                                <ProfileAvatar size="xl" editable={activeTab === 'profile'} />
                                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                                    {userProfile?.name || '用户'}
                                </h2>
                                <p className="text-gray-500">{userProfile?.email}</p>

                                {/* 会员状态 */}
                                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    普通会员
                                </div>

                                {/* 统计信息 */}
                                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {userProfile?.travelCount || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">旅行</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {userProfile?.favoriteCount || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">收藏</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {userProfile?.reviewCount || 0}
                                        </div>
                                        <div className="text-sm text-gray-500">评价</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 主内容区域 */}
                    <div className="lg:col-span-2">
                        {activeTab === 'profile' ? (
                            <div className="space-y-6">
                                {/* 资料展示或编辑表单 */}
                                {isEditing ? (
                                    <ProfileForm onSave={handleSave} onCancel={handleCancel} />
                                ) : (
                                    <ProfileDisplay onEdit={handleEditClick} />
                                )}
                            </div>
                        ) : (
                            <SettingsForm />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;