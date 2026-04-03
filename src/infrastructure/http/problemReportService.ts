import publicApiClient from './publicApiClient';

export interface CreateProblemReportDto {
    email: string;
    phone?: string;
    description: string;
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
        const response = await publicApiClient.post<BackendResponse<ProblemReportResponse>>(this.BASE_PATH, data);
        return response.data.data;
    }
}
