import apiClient from './apiClient';

export interface CreateMeetInviteDto {
  email: string;
  title: string;
  startDateTime: string; // ISO 8601 (con offset -03:00)
  durationMinutes: number;
  description?: string;
}

export interface MeetInviteResult {
  eventId: string;
  meetLink: string | null;
  htmlLink: string | null;
  start: string;
  end: string;
  attendee: string;
}

interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class GoogleMeetService {
  private static readonly BASE_PATH = '/google-meet';

  static async invite(dto: CreateMeetInviteDto): Promise<MeetInviteResult> {
    const res = await apiClient.post<BackendResponse<MeetInviteResult>>(
      `${this.BASE_PATH}/invite`,
      dto,
    );
    return res.data.data;
  }
}
