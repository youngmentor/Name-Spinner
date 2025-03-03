import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCw, UserPlus, Play, Clock, Users } from 'lucide-react';
import { getMeeting, getParticipants, getSelectionHistory } from '../services/api';
import { MeetingData, ParticipantData, MeetingSession } from '../types';

const MeetingDetails = () => {
    const { meetingId } = useParams<{ meetingId: string }>();

    const { data: meeting, isLoading: meetingLoading, error: meetingError } = useQuery<MeetingData>(['meeting', meetingId], () => getMeeting(meetingId!), { enabled: !!meetingId });

    const { data: participants, isLoading: participantsLoading, error: participantsError } = useQuery<ParticipantData[]>(['participants', meetingId], () => getParticipants(meetingId!), { enabled: !!meetingId });

    const { data: history, isLoading: historyLoading, error: historyError } = useQuery<MeetingSession[]>(['history', meetingId], () => getSelectionHistory(meetingId!), { enabled: !!meetingId });

    if (meetingLoading || participantsLoading || historyLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <RotateCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    if (meetingError || participantsError || historyError || !meeting) {
        return (
            <div className="text-center py-8 text-red-500">
                {(meetingError || participantsError || historyError)?.message || 'Meeting not found'}
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <Card className="w-full max-w-4xl shadow-xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {meeting.meetingName}
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Link to={`/meetings/${meetingId}/participants`} className="px-3 py-1.5 border rounded hover:bg-gray-50 flex items-center gap-1 text-sm">
                                <UserPlus className="h-4 w-4" /> Manage Participants
                            </Link>
                            <Link to={`/meetings/${meetingId}/spinner`} className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1 text-sm">
                                <Play className="h-4 w-4" /> Start Spinner
                            </Link>
                        </div>
                    </div>
                    <p className="text-gray-600">{meeting.department}</p>
                    <p className="text-sm text-gray-500">Created: {formatDate(meeting.createdAt)}</p>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="summary">
                        <TabsList className="mb-4">
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="participants">Participants</TabsTrigger>
                            <TabsTrigger value="history">Selection History</TabsTrigger>
                        </TabsList>
                        <TabsContent value="summary">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center justify-center">
                                    <Users className="h-8 w-8 text-blue-500 mb-2" />
                                    <p className="text-2xl font-bold">{participants?.length ?? 0}</p>
                                    <p className="text-sm text-gray-600">Total Participants</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center justify-center">
                                    <Clock className="h-8 w-8 text-purple-500 mb-2" />
                                    <p className="text-2xl font-bold">{history?.length ?? 0}</p>
                                    <p className="text-sm text-gray-600">Total Selections</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default MeetingDetails;
