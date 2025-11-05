// 用户状态切片
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/auth-service';
import { UserState, User, AsyncThunkConfig } from '../../shared/types';

// 异步thunks
// 获取用户信息thunk
export const fetchUserProfile = createAsyncThunk<User, void, AsyncThunkConfig>(
    'user/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            // 这里应该调用获取用户详情的API
            // 暂时返回当前用户信息
            const user = AuthService.getCurrentUser();
            if (!user) {
                throw new Error('用户未登录');
            }
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message || '获取用户信息失败');
        }
    }
);

// 更新用户信息thunk
export const updateUserProfile = createAsyncThunk<User, Partial<User>, AsyncThunkConfig>(
    'user/updateProfile',
    async (userData: Partial<User>, { rejectWithValue }) => {
        try {
            const updatedUser = await AuthService.updateUser(userData);
            return updatedUser;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '更新用户信息失败');
        }
    }
);

// 上传头像thunk
export const uploadAvatar = createAsyncThunk<string, File, AsyncThunkConfig>(
    'user/uploadAvatar',
    async (avatarFile: File, { rejectWithValue }) => {
        try {
            // 创建FormData
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            // 这里应该调用上传头像的API
            // 暂时模拟上传成功
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 返回模拟的URL
            const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
            return avatarUrl;
        } catch (error: any) {
            return rejectWithValue(error.message || '上传头像失败');
        }
    }
);

// 初始状态
const initialState: UserState = {
    user: AuthService.getCurrentUser(),
    loading: false,
    error: null,
};

// 创建切片
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // 清除错误
        clearError: (state) => {
            state.error = null;
        },

        // 设置用户信息
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },

        // 更新用户部分信息
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        // 清除用户信息
        clearUser: (state) => {
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // 获取用户信息处理
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 更新用户信息处理
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 上传头像处理
            .addCase(uploadAvatar.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.loading = false;
                if (state.user) {
                    state.user.avatar = action.payload;
                }
                state.error = null;
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// 导出actions
export const { clearError, setUser, updateUser, clearUser } = userSlice.actions;

// 导出reducer
export default userSlice.reducer;