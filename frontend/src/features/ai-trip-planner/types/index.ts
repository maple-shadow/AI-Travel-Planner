export interface TripPlanningRequest {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    travelers: number;
    preferences: string[];
    description: string;
}

export interface TripPlan {
    itinerary: Array<{
        day: number;
        date: string;
        activities: Array<{
            time: string;
            activity: string;
            location: string;
            estimatedCost: number;
            description: string;
        }>;
    }>;
    totalEstimatedCost: number;
    recommendations: string[];
    weatherAdvice: string;
}

export interface AITripService {
    generateTripPlan(request: TripPlanningRequest): Promise<TripPlan>;
    optimizeTripPlan(plan: TripPlan, optimizationType: 'time' | 'cost' | 'experience'): Promise<TripPlan>;
}

export interface VoiceTripInput {
    text: string;
    confidence: number;
    parsedData?: Partial<TripPlanningRequest>;
}