// 仪表板页面
import React from 'react';
import { useAppSelector } from '../shared/hooks';

const DashboardPage: React.FC = () => {
    const { user } = useAppSelector((state) => state.user);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
                        <div className="flex flex-col items-center justify-center h-full">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                欢迎回来, {user?.name}!
                            </h1>
                            <p className="text-lg text-gray-600 mb-8">
                                这是您的AI旅行规划器仪表板
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            已创建行程
                                        </dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                            0
                                        </dd>
                                    </div>
                                </div>

                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            进行中行程
                                        </dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                            0
                                        </dd>
                                    </div>
                                </div>

                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            已完成行程
                                        </dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                            0
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-gray-500">
                                    功能开发中... 敬请期待更多精彩功能！
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;