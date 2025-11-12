import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface LoginFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError, onSwitchToRegister }) => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await login({
                email: values.email,
                password: values.password
            });
            message.success('登录成功！');
            onSuccess?.();
            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '登录失败';
            message.error(errorMessage);
            onError?.(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: 400, margin: '0 auto', marginTop: 100 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={2}>登录</Title>
                <Text type="secondary">欢迎回到AI旅行规划器</Text>
            </div>

            <Form
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
            >
                <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="请输入邮箱"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="密码"
                    name="password"
                    rules={[
                        { required: true, message: '请输入密码' },
                        { min: 8, message: '密码至少8个字符' },
                        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, message: '密码必须包含大小写字母、数字和特殊字符' }
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="请输入密码"
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        block
                    >
                        登录
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text type="secondary">
                    还没有账号？{' '}
                    <Button
                        type="link"
                        onClick={onSwitchToRegister}
                        style={{ padding: 0 }}
                    >
                        立即注册
                    </Button>
                </Text>
            </div>
        </Card>
    );
};