// 设置组件
import React, { useState } from 'react';
import { useProfile } from '../hooks';

interface SettingsFormProps {
    className?: string;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ className = '' }) => {
    const { userProfile, saveUserSettings } = useProfile();
    const [settings, setSettings] = useState({
        language: userProfile?.preferences?.language ?? 'zh-CN',
        timezone: userProfile?.preferences?.timezone ?? 'Asia/Shanghai',
        currency: userProfile?.preferences?.currency ?? 'CNY',
        notifications: {
            email: userProfile?.preferences?.notifications?.email ?? true,
            push: userProfile?.preferences?.notifications?.push ?? true,
            sms: userProfile?.preferences?.notifications?.sms ?? false,
        },
        privacy: {
            profileVisibility: userProfile?.preferences?.privacy?.profileVisibility ?? 'public',
            activityVisibility: userProfile?.preferences?.privacy?.activityVisibility ?? 'public',
        },
    });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    React.useEffect(() => {
        if (userProfile?.preferences) {
            setSettings({
                language: userProfile.preferences.language ?? 'zh-CN',
                timezone: userProfile.preferences.timezone ?? 'Asia/Shanghai',
                currency: userProfile.preferences.currency ?? 'CNY',
                notifications: {
                    email: userProfile.preferences.notifications?.email ?? true,
                    push: userProfile.preferences.notifications?.push ?? true,
                    sms: userProfile.preferences.notifications?.sms ?? false,
                },
                privacy: {
                    profileVisibility: userProfile.preferences.privacy?.profileVisibility ?? 'public',
                    activityVisibility: userProfile.preferences.privacy?.activityVisibility ?? 'public',
                },
            });
        }
    }, [userProfile]);

    const handleSettingChange = (field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveSettings = async () => {
        setSaveStatus('saving');

        try {
            await saveUserSettings({ preferences: settings });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            setSaveStatus('error');
        }
    };

    return (
        <div className={`bg-white shadow rounded-lg ${className}`}>
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">设置</h3>
            </div>

            <div className="px-6 py-4 space-y-6">
                {/* 通知设置 */}
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">通知设置</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label htmlFor="email-notifications" className="text-sm font-medium text-gray-700">
                                    邮件通知
                                </label>
                                <p className="text-sm text-gray-500">接收重要更新和活动通知</p>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="email-notifications"
                                    type="checkbox"
                                    checked={settings.notifications.email}
                                    onChange={(e) => handleSettingChange('notifications', {
                                        ...settings.notifications,
                                        email: e.target.checked
                                    })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label htmlFor="push-notifications" className="text-sm font-medium text-gray-700">
                                    推送通知
                                </label>
                                <p className="text-sm text-gray-500">接收实时提醒和消息</p>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="push-notifications"
                                    type="checkbox"
                                    checked={settings.notifications.push}
                                    onChange={(e) => handleSettingChange('notifications', {
                                        ...settings.notifications,
                                        push: e.target.checked
                                    })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label htmlFor="sms-notifications" className="text-sm font-medium text-gray-700">
                                    SMS通知
                                </label>
                                <p className="text-sm text-gray-500">接收短信提醒</p>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="sms-notifications"
                                    type="checkbox"
                                    checked={settings.notifications.sms}
                                    onChange={(e) => handleSettingChange('notifications', {
                                        ...settings.notifications,
                                        sms: e.target.checked
                                    })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 语言设置 */}
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">语言设置</h4>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                            界面语言
                        </label>
                        <select
                            id="language"
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="zh-CN">简体中文</option>
                            <option value="en-US">English</option>
                            <option value="ja-JP">日本語</option>
                            <option value="ko-KR">한국어</option>
                        </select>
                    </div>
                </div>

                {/* 隐私设置 */}
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">隐私设置</h4>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="profile-visibility" className="block text-sm font-medium text-gray-700">
                                个人资料可见性
                            </label>
                            <select
                                id="profile-visibility"
                                value={settings.privacy.profileVisibility}
                                onChange={(e) => handleSettingChange('privacy', {
                                    ...settings.privacy,
                                    profileVisibility: e.target.value
                                })}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="public">公开</option>
                                <option value="friends">仅好友可见</option>
                                <option value="private">仅自己可见</option>
                            </select>
                            <p className="mt-1 text-sm text-gray-500">控制谁可以看到您的个人资料信息</p>
                        </div>

                        <div>
                            <label htmlFor="activity-visibility" className="block text-sm font-medium text-gray-700">
                                活动可见性
                            </label>
                            <select
                                id="activity-visibility"
                                value={settings.privacy.activityVisibility}
                                onChange={(e) => handleSettingChange('privacy', {
                                    ...settings.privacy,
                                    activityVisibility: e.target.value
                                })}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="public">公开</option>
                                <option value="friends">仅好友可见</option>
                                <option value="private">仅自己可见</option>
                            </select>
                            <p className="mt-1 text-sm text-gray-500">控制谁可以看到您的旅行活动和评价</p>
                        </div>
                    </div>
                </div>

                {/* 时区设置 */}
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">时区设置</h4>
                    <div>
                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                            时区
                        </label>
                        <select
                            id="timezone"
                            value={settings.timezone}
                            onChange={(e) => handleSettingChange('timezone', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                            <option value="America/New_York">美国东部时间 (UTC-5)</option>
                            <option value="Europe/London">英国时间 (UTC+0)</option>
                            <option value="Asia/Tokyo">日本时间 (UTC+9)</option>
                        </select>
                    </div>
                </div>

                {/* 状态消息 */}
                {saveStatus === 'success' && (
                    <div className="rounded-md bg-green-50 p-3">
                        <div className="text-sm text-green-700">设置保存成功！</div>
                    </div>
                )}

                {saveStatus === 'error' && (
                    <div className="rounded-md bg-red-50 p-3">
                        <div className="text-sm text-red-700">设置保存失败，请重试。</div>
                    </div>
                )}
            </div>

            {/* 保存按钮 */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                <button
                    onClick={handleSaveSettings}
                    disabled={saveStatus === 'saving'}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {saveStatus === 'saving' ? '保存中...' : '保存设置'}
                </button>
            </div>
        </div>
    );
};

export default SettingsForm;