// types.ts
export type ParticipantData = {
    department: string;
    _id: string;
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
    name: string;
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