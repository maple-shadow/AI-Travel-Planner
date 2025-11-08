import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
    // 如果需要额外的props可以在这里定义
}

const LoginForm: React.FC<LoginFormProps> = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [formError, setFormError] = useState('');

    const { login, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        clearError();

        try {
            await login({ email, password, rememberMe });
            navigate('/dashboard');
        } catch (err: any) {
            setFormError(err.message || '登录失败，请重试');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--gray-700)',
                    marginBottom: '0.5rem'
                }}>
                    邮箱地址
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                    placeholder="请输入您的邮箱"
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                    onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'var(--primary-500)';
                        (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--primary-100)';
                    }}
                    onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'var(--gray-300)';
                        (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--gray-700)',
                    marginBottom: '0.5rem'
                }}>
                    密码
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                    placeholder="请输入您的密码"
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                    onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'var(--primary-500)';
                        (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--primary-100)';
                    }}
                    onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'var(--gray-300)';
                        (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--gray-700)',
                    cursor: 'pointer'
                }}>
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                            marginRight: '0.5rem',
                            width: '1rem',
                            height: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--gray-300)',
                            cursor: 'pointer'
                        }}
                    />
                    记住我
                </label>
                <Link
                    to="/forgot-password"
                    style={{
                        fontSize: '0.875rem',
                        color: 'var(--primary-600)',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                >
                    忘记密码？
                </Link>
            </div>

            {(error || formError) && (
                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--red-50)',
                    border: '1px solid var(--red-200)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--red-700)',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem'
                }}>
                    {error || formError}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    position: 'relative'
                }}
            >
                {loading ? (
                    <>
                        <span className="loading-spinner" style={{
                            display: 'inline-block',
                            width: '1rem',
                            height: '1rem',
                            border: '2px solid transparent',
                            borderTop: '2px solid currentColor',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginRight: '0.5rem'
                        }} />
                        登录中...
                    </>
                ) : (
                    '登录'
                )}
            </button>
        </form>
    );
};

export default LoginForm;