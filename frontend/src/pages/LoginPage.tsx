import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../core/auth/components/LoginForm';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        console.log('登录成功');
    };

    const handleError = (error: string) => {
        console.error('登录失败:', error);
    };

    const handleSwitchToRegister = () => {
        navigate('/register');
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div className="w-full max-w-md">
                <LoginForm
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onSwitchToRegister={handleSwitchToRegister}
                />
            </div>
        </div>
    );
};

export default LoginPage;