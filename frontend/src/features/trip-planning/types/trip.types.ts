// 行程相关类型定义
export interface Trip {
    id: string;
    title: string;
    description?: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    userId: string;
    status: TripStatus;
    createdAt: string;
    updatedAt: string;
}

export enum TripStatus {
    PLANNING = 'planning',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface CreateTripRequest {
    title: string;
    description?: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {
    id: string;
}

export interface TripFilters {
    status?: TripStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface TripFormData {
    title: string;
    description: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
}

export interface TripState {
    trips: Trip[];
    currentTrip: Trip | null;
    loading: boolean;
    error: string | null;
    filters: TripFilters;
}