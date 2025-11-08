import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../core/auth/components/LoginForm';

const LoginPage: React.FC = () => {
    return (
        <div className="App">
            <div className="main-content">
                <div className="auth-container">
                    <div className="card">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginBottom: '0.5rem'
                            }}>
                                AI旅行规划器
                            </h1>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                color: 'var(--gray-700)',
                                marginBottom: '0.5rem'
                            }}>
                                登录您的账户
                            </h2>
                            <p style={{
                                color: 'var(--gray-600)',
                                fontSize: '0.875rem'
                            }}>
                                还没有账户？{' '}
                                <Link
                                    to="/register"
                                    style={{
                                        color: 'var(--primary-600)',
                                        fontWeight: '500',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                                >
                                    立即注册
                                </Link>
                            </p>
                        </div>
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;