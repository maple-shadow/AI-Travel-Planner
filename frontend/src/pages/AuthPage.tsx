import React, { useState } from 'react';
import { LoginForm } from '../core/auth/components/LoginForm';
import { RegisterForm } from '../core/auth/components/RegisterForm';

enum AuthMode {
    LOGIN = 'login',
    REGISTER = 'register'
}

export const AuthPage: React.FC = () => {
    const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);

    const switchToRegister = () => {
        setAuthMode(AuthMode.REGISTER);
    };

    const switchToLogin = () => {
        setAuthMode(AuthMode.LOGIN);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: 20
        }}>
            {authMode === AuthMode.LOGIN ? (
                <LoginForm onSwitchToRegister={switchToRegister} />
            ) : (
                <RegisterForm onSwitchToLogin={switchToLogin} />
            )}
        </div>
    );
};