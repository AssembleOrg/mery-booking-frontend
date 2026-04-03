import publicApiClient from './publicApiClient';
import { getRecentRequests } from './requestTracker';

export interface CreateProblemReportDto {
    email: string;
    phone?: string;
    description: string;
    recentRequests?: unknown[];
}

export interface ProblemReportResponse {
    id: string;
    email: string;
    phone?: string;
    description: string;
    createdAt: string;
}

interface BackendResponse<T> {
    data: T;
    success: boolean;
    message: string;
    timestamp: string;
}

export class ProblemReportService {
    private static readonly BASE_PATH = '/problem-report';

    static async create(data: CreateProblemReportDto): Promise<ProblemReportResponse> {
        const payload = {
            ...data,
            recentRequests: getRecentRequests(),
        };
        const response = await publicApiClient.post<BackendResponse<ProblemReportResponse>>(this.BASE_PATH, payload);
        return response.data.data;
    }
}
