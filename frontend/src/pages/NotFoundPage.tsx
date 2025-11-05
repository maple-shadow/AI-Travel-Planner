// 404错误页面
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="text-center">
                    <h1 className="text-9xl font-bold text-gray-300">404</h1>
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        页面未找到
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        抱歉，您访问的页面不存在。
                    </p>
                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            返回仪表板
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            返回上页
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;