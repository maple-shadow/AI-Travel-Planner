// 用户资料Hook
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { fetchUserProfile, updateUserProfile } from '../../../core/store/userSlice';
import { ProfileFormData, SettingsFormData, UserProfile } from '../types';
import userService from '../services/userService';

export const useProfile = () => {
    const dispatch = useAppDispatch();
    const { user, loading, error } = useAppSelector((state) => state.user);

    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // 获取用户资料
    const fetchUserProfileData = useCallback(async () => {
        try {
            await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
            console.error('获取用户资料失败:', error);
        }
    }, [dispatch]);

    // 更新用户资料
    const updateUserProfileData = useCallback(async (profileData: ProfileFormData) => {
        try {
            setSaveStatus('saving');

            // 验证表单数据
            const errors = userService.validateProfileForm(profileData);
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                setSaveStatus('error');
                return { success: false, message: '表单验证失败' };
            }

            await dispatch(updateUserProfile(profileData)).unwrap();
            setSaveStatus('success');
            setIsEditing(false);
            setValidationErrors({});

            return { success: true, message: '资料更新成功' };
        } catch (error) {
            console.error('更新用户资料失败:', error);
            setSaveStatus('error');
            return {
                success: false,
                message: error instanceof Error ? error.message : '更新用户资料失败'
            };
        }
    }, [dispatch]);

    // 上传用户头像
    const uploadUserAvatarData = useCallback(async (avatarFile: File) => {
        try {
            setIsUploading(true);

            // 压缩图片
            const compressedFile = await userService.compressAvatarImage(avatarFile);

            const uploadResult = await userService.uploadAvatar(compressedFile);
            setIsUploading(false);

            return { success: uploadResult.success, message: uploadResult.message };
        } catch (error) {
            console.error('上传头像失败:', error);
            setIsUploading(false);
            return {
                success: false,
                message: error instanceof Error ? error.message : '上传头像失败'
            };
        }
    }, []);

    // 保存用户设置
    const saveUserSettingsData = useCallback(async (settingsData: SettingsFormData) => {
        try {
            setSaveStatus('saving');

            const result = await userService.saveUserSettings(settingsData);

            if (result.success) {
                setSaveStatus('success');
                return { success: true, message: '设置保存成功' };
            } else {
                setSaveStatus('error');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('保存设置失败:', error);
            setSaveStatus('error');
            return {
                success: false,
                message: error instanceof Error ? error.message : '保存设置失败'
            };
        }
    }, []);

    // 处理资料表单变更
    const handleProfileFormChange = useCallback((field: string) => {
        // 清除该字段的验证错误
        setValidationErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    }, []);

    // 验证资料表单
    const validateProfileForm = useCallback((formData: ProfileFormData) => {
        const errors = userService.validateProfileForm(formData);
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, []);

    // 重置资料表单
    const resetProfileForm = useCallback(() => {
        setIsEditing(false);
        setSaveStatus('idle');
        setValidationErrors({});
    }, []);

    // 处理头像选择
    const handleAvatarSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            uploadUserAvatarData(file);
        }
    }, [uploadUserAvatarData]);

    // 裁剪头像图片（简化版）
    const cropAvatarImage = useCallback(async (file: File, cropArea: { x: number; y: number; width: number; height: number }) => {
        return new Promise<File>((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = cropArea.width;
                canvas.height = cropArea.height;

                if (ctx) {
                    ctx.drawImage(
                        img,
                        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                        0, 0, cropArea.width, cropArea.height
                    );

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name, { type: file.type }));
                            } else {
                                reject(new Error('图片裁剪失败'));
                            }
                        },
                        file.type,
                        0.9
                    );
                }
            };

            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = URL.createObjectURL(file);
        });
    }, []);

    return {
        // 状态
        userProfile: user as UserProfile | null,
        loading,
        error,
        isEditing,
        isUploading,
        saveStatus,
        validationErrors,

        // 操作方法
        fetchUserProfile: fetchUserProfileData,
        updateUserProfile: updateUserProfileData,
        uploadUserAvatar: uploadUserAvatarData,
        saveUserSettings: saveUserSettingsData,

        // 表单处理方法
        handleProfileFormChange,
        validateProfileForm,
        resetProfileForm,

        // 头像处理方法
        handleAvatarSelect,
        cropAvatarImage,

        // 状态设置方法
        setIsEditing,
        setSaveStatus,
        setValidationErrors,
    };
};

export default useProfile;