import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../core/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        console.log('注册成功');
    };

    const handleError = (error: string) => {
        console.error('注册失败:', error);
    };

    const handleSwitchToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div className="w-full max-w-md">
                <RegisterForm
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onSwitchToLogin={handleSwitchToLogin}
                />
            </div>
        </div>
    );
};

export default RegisterPage;