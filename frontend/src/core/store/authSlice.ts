// 认证状态切片
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/auth-service';
import { AuthState, User, AsyncThunkConfig, AuthResponse } from '../../shared/types';

// 异步thunks
// 登录thunk
export const loginUser = createAsyncThunk<AuthResponse, { email: string; password: string }, AsyncThunkConfig>(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(credentials);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '登录失败');
        }
    }
);

// 注册thunk
export const registerUser = createAsyncThunk<AuthResponse, { name: string; email: string; password: string }, AsyncThunkConfig>(
    'auth/register',
    async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await AuthService.register(userData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '注册失败');
        }
    }
);

// 验证token thunk
export const validateToken = createAsyncThunk<{ user: User | null; token: string | null }, void, AsyncThunkConfig>(
    'auth/validateToken',
    async (_, { rejectWithValue }) => {
        try {
            const isValid = await AuthService.validateToken();
            if (isValid) {
                const user = AuthService.getCurrentUser();
                const token = AuthService.getToken();
                return { user, token };
            }
            return rejectWithValue('Token验证失败');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Token验证失败');
        }
    }
);

// 初始状态
const initialState: AuthState = {
    isAuthenticated: AuthService.isAuthenticated(),
    token: AuthService.getToken(),
    user: AuthService.getCurrentUser(),
    loading: false,
    error: null,
};

// 创建切片
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // 清除错误
        clearError: (state) => {
            state.error = null;
        },

        // 设置认证状态
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },

        // 设置用户信息
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },

        // 登出
        logout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.error = null;
            AuthService.logout();
        },
    },
    extraReducers: (builder) => {
        // 登录处理
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 注册处理
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Token验证处理
            .addCase(validateToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(validateToken.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token || null;
                state.user = action.payload.user || null;
                state.error = null;
            })
            .addCase(validateToken.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                state.error = action.payload as string;
                AuthService.logout();
            });
    },
});

// 导出actions
export const { clearError, setAuthenticated, setUser, logout } = authSlice.actions;

// 导出reducer
export default authSlice.reducer;