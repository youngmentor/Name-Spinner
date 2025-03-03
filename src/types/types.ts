// types.ts
export type ParticipantData = {
    id?: string;
    name: string;
    role?: string;
    email?: string;
    lastSelected?: string;
    selectionCount?: number;
};

export type MeetingData = {
    participants: ParticipantData[];
    _id: string;
    department: string;
    meetingName: string;
    createdAt: string;
    updatedAt?: string;
    participantsCount?: number;
};

export type MeetingSession = {
    id?: string;
    meetingId: string;
    department: string;
    meetingName: string;
    date: string;
    selectedName: string;
};

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};