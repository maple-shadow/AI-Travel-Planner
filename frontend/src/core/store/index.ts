// Redux Store配置
import { configureStore } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import userReducer from './userSlice';
import uiReducer from './uiSlice';
import tripReducer from '../../features/trip-planning/store/tripSlice';

// 持久化配置
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // 只持久化认证状态
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// 配置store
export const configureAppStore = () => {
    const store = configureStore({
        reducer: {
            auth: persistedAuthReducer,
            user: userReducer,
            ui: uiReducer,
            trips: tripReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                },
            }),
    });

    return store;
};

// 导出store实例
export const store = configureAppStore();

// 导出persistor用于应用启动时恢复状态
export const persistor = persistStore(store);

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;