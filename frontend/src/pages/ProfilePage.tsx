// 个人资料页面
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../shared/hooks';
import { fetchUserProfile, updateUserProfile, uploadAvatar } from '../core/store/userSlice';

const ProfilePage: React.FC = () => {
    const { user, loading, error } = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    const handleSave = async () => {
        try {
            const result = await dispatch(updateUserProfile({ name, email }));
            if (updateUserProfile.fulfilled.match(result)) {
                setIsEditing(false);
            }
            setIsEditing(false);
        } catch (error) {
            console.error('更新个人资料失败:', error);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const result = await dispatch(uploadAvatar(file));
                if (uploadAvatar.fulfilled.match(result)) {
                    // 上传成功
                }
            } catch (error) {
                console.error('上传头像失败:', error);
            }
        }
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            个人资料
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            管理您的账户信息和设置
                        </p>
                    </div>

                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">头像</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                                            {user?.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt="头像"
                                                    className="h-16 w-16 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-600">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="text-sm text-gray-600"
                                        />
                                    </div>
                                </dd>
                            </div>

                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">姓名</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        user?.name || '未设置'
                                    )}
                                </dd>
                            </div>

                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        user?.email || '未设置'
                                    )}
                                </dd>
                            </div>

                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">用户ID</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user?.id || '未知'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                        {error && (
                            <div className="mb-4 rounded-md bg-red-50 p-3">
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        {isEditing ? (
                            <div className="space-x-3">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? '保存中...' : '保存'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setName(user?.name || '');
                                        setEmail(user?.email || '');
                                    }}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    取消
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                编辑资料
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;