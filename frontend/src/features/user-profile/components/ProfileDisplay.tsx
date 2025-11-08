// 资料展示组件
import React from 'react';
import { useProfile } from '../hooks';
import ProfileAvatar from './ProfileAvatar';

interface ProfileDisplayProps {
    onEdit?: () => void;
    className?: string;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({
    onEdit,
    className = ''
}) => {
    const { userProfile, isEditing } = useProfile();

    if (isEditing || !userProfile) {
        return null;
    }

    return (
        <div className={`bg-white shadow rounded-lg ${className}`}>
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">个人资料</h3>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg
                                className="h-4 w-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            编辑
                        </button>
                    )}
                </div>
            </div>

            <div className="px-6 py-4">
                <div className="flex items-start space-x-6">
                    {/* 头像区域 */}
                    <div className="flex-shrink-0">
                        <ProfileAvatar size="lg" editable={false} />
                    </div>

                    {/* 基本信息 */}
                    <div className="flex-1 min-w-0">
                        <div className="space-y-4">
                            {/* 姓名 */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">姓名</h4>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {userProfile.name || '未设置'}
                                </p>
                            </div>

                            {/* 邮箱 */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">邮箱</h4>
                                <p className="mt-1 text-sm text-gray-900">
                                    {userProfile.email || '未设置'}
                                </p>
                            </div>

                            {/* 电话 */}
                            {userProfile.phone && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">电话</h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {userProfile.phone}
                                    </p>
                                </div>
                            )}

                            {/* 位置 */}
                            {userProfile.location && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">位置</h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {userProfile.location}
                                    </p>
                                </div>
                            )}

                            {/* 个人简介 */}
                            {userProfile.bio && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">个人简介</h4>
                                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                        {userProfile.bio}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 统计信息 */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-lg font-semibold text-gray-900">
                            {userProfile.travelCount || 0}
                        </div>
                        <div className="text-sm text-gray-500">旅行次数</div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-gray-900">
                            {userProfile.favoriteCount || 0}
                        </div>
                        <div className="text-sm text-gray-500">收藏地点</div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-gray-900">
                            {userProfile.reviewCount || 0}
                        </div>
                        <div className="text-sm text-gray-500">评价数量</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDisplay;