import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCw, UserPlus, Play, Users, } from 'lucide-react';
import { getParticipantsByMeetingId, getMeeting } from '../services/api';
import { MeetingData, ParticipantData } from '../types/types';

const MeetingDetails = () => {
    const { meetingId } = useParams<{ meetingId: string }>();

    const { data: meeting, isLoading: meetingLoading, error: meetingError } = useQuery<MeetingData>(['ALL_MEETIMG', meetingId], async () => {
        const response = await getMeeting(meetingId!);
        return response.data;
    }, { enabled: !!meetingId });

    const { data: participants, isLoading: participantsLoading, error: participantsError } = useQuery<ParticipantData[]>([`ALL_PARTICIPANTS_BY_MEETINGID${meetingId}`, meetingId], async () => {
        const response = await getParticipantsByMeetingId(meetingId!);
        return response.data.participants;
    }, { enabled: !!meetingId });

    // const { data: history, isLoading: historyLoading, error: historyError } = useQuery<MeetingSession[]>(['history', meetingId], () => getSelectionHistory(meetingId!), { enabled: !!meetingId });

    if (participantsLoading || meetingLoading) {
        console.log('participant error', participantsError)
        console.log('participant error', meetingError)
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <RotateCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    if (participantsError || meetingError) {
        console.log('participant error', participantsError)
        console.log('participant error', meetingError)
        return (
            <div className="text-center py-8 text-red-500">
                Meeting not found
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
            <Card className="w-full max-w-4xl shadow-xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {meeting?.name}
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Link to={`/meetings/${meetingId}/participants`} className="px-3 py-1.5 border rounded hover:bg-gray-50 flex items-center gap-1 text-sm">
                                <UserPlus className="h-4 w-4" /> Manage Participants
                            </Link>
                            <Link to={`/meetings/${meetingId}/spin-participants`} className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1 text-sm">
                                <Play className="h-4 w-4" /> Start Spinner
                            </Link>
                        </div>
                    </div>
                    <p className="text-gray-600">{meeting?.department}</p>
                    <p className="text-sm text-gray-500">Created: {meeting?.createdAt ? formatDate(meeting.createdAt) : 'N/A'}</p>
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
                            </div>
                        </TabsContent>
                        <TabsContent value="participants">
                            {participants?.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 mb-4">No participants added yet</p>
                                    <Link
                                        to={`/meetings/${meetingId}/add-participantss`}
                                        className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                                    >
                                        Add Participants
                                    </Link>
                                </div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Times Selected</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Selected</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {participants?.map((participant, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{participant.name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{participant.role || '-'}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{participant.selectionCount || 0}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                        {participant.lastSelected ? formatDate(participant.lastSelected) : 'Never'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                        {/* <TabsContent value="history">
                            {history?.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500">No selection history yet</p>
                                </div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selected Person</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {history?.map((session, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{session.selectedName}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{formatDate(session.date)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent> */}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default MeetingDetails;
