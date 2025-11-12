// 用户API服务
import { UserProfile, ProfileFormData, SettingsFormData, AvatarUploadResult, ProfileUpdateResult } from '../types';

class UserService {
    private baseUrl = '/api/users';

    // 获取用户资料
    async fetchUserProfile(): Promise<UserProfile> {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error(`获取用户资料失败: ${response.statusText}`);
            }

            const data = await response.json();

            // 将后端返回的用户数据转换为前端需要的格式
            const userData = data.data.user;
            return {
                id: userData.id,
                name: userData.username,
                email: userData.email,
                avatar: userData.avatar || '',
                phone: userData.phone || '',
                bio: userData.bio || '',
                location: userData.location || '',
                preferences: userData.preferences || {},
                travelCount: userData.travelCount || 0,
                favoriteCount: userData.favoriteCount || 0,
                reviewCount: userData.reviewCount || 0,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt
            };
        } catch (error) {
            console.error('获取用户资料失败:', error);
            throw error;
        }
    }

    // 更新用户资料
    async updateUserProfile(profileData: ProfileFormData): Promise<ProfileUpdateResult> {
        try {
            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                throw new Error(`更新用户资料失败: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                message: '用户资料更新成功',
                user: data.user,
            };
        } catch (error) {
            console.error('更新用户资料失败:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : '更新用户资料失败',
            };
        }
    }

    // 上传用户头像
    async uploadAvatar(avatarFile: File): Promise<AvatarUploadResult> {
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await fetch(`${this.baseUrl}/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`上传头像失败: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                avatarUrl: data.avatarUrl,
                success: true,
                message: '头像上传成功',
            };
        } catch (error) {
            console.error('上传头像失败:', error);
            return {
                avatarUrl: '',
                success: false,
                message: error instanceof Error ? error.message : '上传头像失败',
            };
        }
    }

    // 保存用户设置
    async saveUserSettings(settingsData: SettingsFormData): Promise<ProfileUpdateResult> {
        try {
            const response = await fetch(`${this.baseUrl}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(settingsData),
            });

            if (!response.ok) {
                throw new Error(`保存设置失败: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                message: '设置保存成功',
                user: data.user,
            };
        } catch (error) {
            console.error('保存设置失败:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : '保存设置失败',
            };
        }
    }

    // 验证资料表单
    validateProfileForm(formData: ProfileFormData): Record<string, string> {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = '姓名不能为空';
        } else if (formData.name.trim().length < 2) {
            errors.name = '姓名至少需要2个字符';
        }

        if (!formData.email.trim()) {
            errors.email = '邮箱不能为空';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = '请输入有效的邮箱地址';
        }

        if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
            errors.phone = '请输入有效的电话号码';
        }

        if (formData.bio && formData.bio.length > 500) {
            errors.bio = '个人简介不能超过500个字符';
        }

        return errors;
    }

    // 压缩头像图片
    async compressAvatarImage(file: File, maxSize = 1024 * 1024): Promise<File> {
        return new Promise((resolve, reject) => {
            if (file.size <= maxSize) {
                resolve(file);
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // 计算压缩比例
                const ratio = Math.sqrt(maxSize / file.size);
                const width = img.width * ratio;
                const height = img.height * ratio;

                canvas.width = width;
                canvas.height = height;

                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name, { type: file.type }));
                            } else {
                                reject(new Error('图片压缩失败'));
                            }
                        },
                        file.type,
                        0.8
                    );
                }
            };

            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = URL.createObjectURL(file);
        });
    }
}

export default new UserService();