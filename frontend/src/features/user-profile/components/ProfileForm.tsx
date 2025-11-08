// 资料表单组件
import React from 'react';
import { useProfile } from '../hooks';

interface ProfileFormProps {
    onSave?: () => void;
    onCancel?: () => void;
    className?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
    onSave,
    onCancel,
    className = ''
}) => {
    const {
        userProfile,
        isEditing,
        saveStatus,
        validationErrors,
        updateUserProfile,
        handleProfileFormChange,
        validateProfileForm,
        resetProfileForm,
    } = useProfile();

    const [formData, setFormData] = React.useState({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        phone: userProfile?.phone || '',
        bio: userProfile?.bio || '',
        location: userProfile?.location || '',
    });

    React.useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                email: userProfile.email || '',
                phone: userProfile.phone || '',
                bio: userProfile.bio || '',
                location: userProfile.location || '',
            });
        }
    }, [userProfile]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        handleProfileFormChange(field);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateProfileForm(formData)) {
            await updateUserProfile(formData);
            if (onSave) {
                onSave();
            }
        }
    };

    const handleCancel = () => {
        resetProfileForm();
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                email: userProfile.email || '',
                phone: userProfile.phone || '',
                bio: userProfile.bio || '',
                location: userProfile.location || '',
            });
        }
        if (onCancel) {
            onCancel();
        }
    };

    if (!isEditing) {
        return null;
    }

    return (
        <div className={`bg-white shadow rounded-lg ${className}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">编辑个人资料</h3>
                </div>

                <div className="px-6 space-y-4">
                    {/* 姓名 */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            姓名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.name ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="请输入您的姓名"
                        />
                        {validationErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                        )}
                    </div>

                    {/* 邮箱 */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            邮箱 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.email ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="请输入您的邮箱"
                        />
                        {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                    </div>

                    {/* 电话 */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            电话
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="请输入您的电话号码"
                        />
                        {validationErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                        )}
                    </div>

                    {/* 位置 */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            位置
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="请输入您所在的城市"
                        />
                    </div>

                    {/* 个人简介 */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            个人简介
                        </label>
                        <textarea
                            id="bio"
                            rows={3}
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.bio ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="介绍一下您自己..."
                        />
                        <div className="mt-1 text-sm text-gray-500">
                            {formData.bio.length}/500
                        </div>
                        {validationErrors.bio && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.bio}</p>
                        )}
                    </div>
                </div>

                {/* 状态消息 */}
                {saveStatus === 'success' && (
                    <div className="px-6">
                        <div className="rounded-md bg-green-50 p-3">
                            <div className="text-sm text-green-700">资料更新成功！</div>
                        </div>
                    </div>
                )}

                {saveStatus === 'error' && (
                    <div className="px-6">
                        <div className="rounded-md bg-red-50 p-3">
                            <div className="text-sm text-red-700">资料更新失败，请重试。</div>
                        </div>
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        disabled={saveStatus === 'saving'}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saveStatus === 'saving' ? '保存中...' : '保存'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileForm;