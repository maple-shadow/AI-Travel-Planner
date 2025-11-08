// Redux Store配置
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import uiReducer from './uiSlice';
import tripReducer from '../../features/trip-planning/store/tripSlice';

// 配置store
export const configureAppStore = () => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            user: userReducer,
            ui: uiReducer,
            trips: tripReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: ['persist/PERSIST'],
                },
            }),
    });

    return store;
};

// 导出store实例
export const store = configureAppStore();

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;