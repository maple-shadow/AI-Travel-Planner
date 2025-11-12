import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

interface RegisterFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onError, onSwitchToLogin }) => {
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // 只发送后端需要的字段：username, email, password
            const { confirmPassword, ...registerData } = values;
            await register(registerData);
            message.success('注册成功！');
            onSuccess?.();
            // 自动跳转到登录页面
            onSwitchToLogin();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '注册失败';
            message.error(errorMessage);
            onError?.(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: 400, margin: '0 auto', marginTop: 50 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={2}>注册</Title>
                <Text type="secondary">创建您的AI旅行规划器账户</Text>
            </div>

            <Form
                name="register"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
            >
                <Form.Item
                    label="用户名"
                    name="username"
                    rules={[
                        { required: true, message: '请输入用户名' },
                        { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间' },
                        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
                        {
                            validator: (_, value) => {
                                if (!value || value.trim().length === 0) {
                                    return Promise.reject(new Error('用户名不能为空'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="请输入用户名"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="请输入邮箱"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="密码"
                    name="password"
                    rules={[
                        { required: true, message: '请输入密码' },
                        { min: 8, max: 128, message: '密码长度必须在8-128个字符之间' },
                        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, message: '密码必须包含大小写字母、数字和特殊字符' }
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="请输入密码"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="确认密码"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: '请确认密码' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="请再次输入密码"
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
                        注册
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text type="secondary">
                    已有账号？{' '}
                    <Button
                        type="link"
                        onClick={onSwitchToLogin}
                        style={{ padding: 0 }}
                    >
                        立即登录
                    </Button>
                </Text>
            </div>
        </Card>
    );
};