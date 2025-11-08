// 用户资料类型定义
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    bio?: string;
    location?: string;
    preferences?: UserPreferences;
    travelCount?: number;
    favoriteCount?: number;
    reviewCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserPreferences {
    language: string;
    timezone: string;
    currency: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    privacy: {
        profileVisibility: 'public' | 'private' | 'friends';
        activityVisibility: 'public' | 'private' | 'friends';
    };
}

export interface ProfileFormData {
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    location?: string;
}

export interface SettingsFormData {
    preferences: UserPreferences;
}

export interface ProfileState {
    userProfile: UserProfile | null;
    profileFormData: ProfileFormData;
    settingsFormData: SettingsFormData;
    isEditing: boolean;
    isUploading: boolean;
    saveStatus: 'idle' | 'saving' | 'success' | 'error';
    validationErrors: Record<string, string>;
}

export interface AvatarUploadResult {
    avatarUrl: string;
    success: boolean;
    message?: string;
}

export interface ProfileUpdateResult {
    success: boolean;
    message?: string;
    user?: UserProfile;
}