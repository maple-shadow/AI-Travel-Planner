// 行程状态切片
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tripService } from '../services';
import { Trip, TripState, TripFilters, CreateTripRequest, UpdateTripRequest } from '../types';

// 异步thunks
// 获取行程列表thunk
export const loadTrips = createAsyncThunk<Trip[], TripFilters | undefined>(
    'trips/loadTrips',
    async (filters, { rejectWithValue }) => {
        try {
            const trips = await tripService.getTrips(filters);
            return trips;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取行程列表失败');
        }
    }
);

// 获取行程详情thunk
export const getTripById = createAsyncThunk<Trip, string>(
    'trips/getTripById',
    async (tripId, { rejectWithValue }) => {
        try {
            const trip = await tripService.getTripById(tripId);
            return trip;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '获取行程详情失败');
        }
    }
);

// 创建行程thunk
export const createTrip = createAsyncThunk<Trip, CreateTripRequest>(
    'trips/createTrip',
    async (tripData, { rejectWithValue }) => {
        try {
            const newTrip = await tripService.createTrip(tripData);
            return newTrip;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '创建行程失败');
        }
    }
);

// 更新行程thunk
export const updateTrip = createAsyncThunk<Trip, UpdateTripRequest>(
    'trips/updateTrip',
    async (tripData, { rejectWithValue }) => {
        try {
            const updatedTrip = await tripService.updateTrip(tripData);
            return updatedTrip;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '更新行程失败');
        }
    }
);

// 删除行程thunk
export const deleteTrip = createAsyncThunk<string, string>(
    'trips/deleteTrip',
    async (tripId, { rejectWithValue }) => {
        try {
            await tripService.deleteTrip(tripId);
            return tripId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || '删除行程失败');
        }
    }
);

// 初始状态
const initialState: TripState = {
    trips: [],
    currentTrip: null,
    loading: false,
    error: null,
    filters: {}
};

// 创建切片
const tripSlice = createSlice({
    name: 'trips',
    initialState,
    reducers: {
        // 清除错误
        clearError: (state) => {
            state.error = null;
        },

        // 设置当前行程
        setCurrentTrip: (state, action: PayloadAction<Trip | null>) => {
            state.currentTrip = action.payload;
        },

        // 设置筛选条件
        setFilters: (state, action: PayloadAction<TripFilters>) => {
            state.filters = action.payload;
        },

        // 清除筛选条件
        clearFilters: (state) => {
            state.filters = {};
        },

        // 添加行程到列表
        addTrip: (state, action: PayloadAction<Trip>) => {
            state.trips.unshift(action.payload);
        },

        // 更新行程
        updateTripInStore: (state, action: PayloadAction<Trip>) => {
            const index = state.trips.findIndex(trip => trip.id === action.payload.id);
            if (index !== -1) {
                state.trips[index] = action.payload;
            }
            if (state.currentTrip?.id === action.payload.id) {
                state.currentTrip = action.payload;
            }
        },

        // 删除行程
        removeTrip: (state, action: PayloadAction<string>) => {
            state.trips = state.trips.filter(trip => trip.id !== action.payload);
            if (state.currentTrip?.id === action.payload) {
                state.currentTrip = null;
            }
        }
    },
    extraReducers: (builder) => {
        // 获取行程列表处理
        builder
            .addCase(loadTrips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.trips = action.payload;
                state.error = null;
            })
            .addCase(loadTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 获取行程详情处理
            .addCase(getTripById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTripById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTrip = action.payload;
                state.error = null;
            })
            .addCase(getTripById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 创建行程处理
            .addCase(createTrip.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTrip.fulfilled, (state, action) => {
                state.loading = false;
                state.trips.unshift(action.payload);
                state.currentTrip = action.payload;
                state.error = null;
            })
            .addCase(createTrip.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 更新行程处理
            .addCase(updateTrip.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTrip.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.trips.findIndex(trip => trip.id === action.payload.id);
                if (index !== -1) {
                    state.trips[index] = action.payload;
                }
                if (state.currentTrip?.id === action.payload.id) {
                    state.currentTrip = action.payload;
                }
                state.error = null;
            })
            .addCase(updateTrip.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // 删除行程处理
            .addCase(deleteTrip.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTrip.fulfilled, (state, action) => {
                state.loading = false;
                state.trips = state.trips.filter(trip => trip.id !== action.payload);
                if (state.currentTrip?.id === action.payload) {
                    state.currentTrip = null;
                }
                state.error = null;
            })
            .addCase(deleteTrip.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

// 导出actions
export const {
    clearError,
    setCurrentTrip,
    setFilters,
    clearFilters,
    addTrip,
    updateTripInStore,
    removeTrip
} = tripSlice.actions;

// 导出reducer
export default tripSlice.reducer;