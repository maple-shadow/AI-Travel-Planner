// UI状态切片
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Notification } from '../../shared/types';

// 初始状态
const initialState: UIState = {
    theme: 'light',
    language: 'zh-CN',
    isLoading: false,
    notifications: [],
};

// 创建切片
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // 切换主题
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },

        // 设置主题
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },

        // 设置语言
        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },

        // 设置加载状态
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // 添加通知
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
            const newNotification: Notification = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                ...action.payload,
            };
            state.notifications.push(newNotification);
        },

        // 移除通知
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                notification => notification.id !== action.payload
            );
        },

        // 清除所有通知
        clearNotifications: (state) => {
            state.notifications = [];
        },

        // 清除过期通知（自动清理）
        clearExpiredNotifications: (state, action: PayloadAction<number>) => {
            const now = Date.now();
            state.notifications = state.notifications.filter(
                notification => now - notification.timestamp < action.payload
            );
        },
    },
});

// 导出actions
export const {
    toggleTheme,
    setTheme,
    setLanguage,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    clearExpiredNotifications,
} = uiSlice.actions;

// 导出reducer
export default uiSlice.reducer;