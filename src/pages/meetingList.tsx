import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RotateCw, UserPlus, Play } from 'lucide-react';
import { MeetingData } from '@/types/types';
import { getAllMeeting } from '@/services/api';

const MeetingsList = () => {

    const { data: meetings, isLoading, error } = useQuery<MeetingData[]>(['ALL_MEETIMG'], async () => {
        const response = await getAllMeeting();
        return response.data;
    });

    console.log(meetings)
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <Card className="w-full max-w-4xl shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Your Meetings
                    </CardTitle>
                    <Link
                        to="/create-meeting"
                        className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                    >
                        Create New Meeting
                    </Link>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <RotateCw className="animate-spin h-8 w-8 text-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">Failed to fetch meetings</div>
                    ) : meetings?.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">You don't have any meetings yet</p>
                            <Link
                                to="/create-meeting"
                                className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                            >
                                Create Your First Meeting
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {meetings?.map((meeting) => (
                                <div key={meeting?._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-bold text-lg">{meeting.name}</h3>
                                        <span className="text-xs text-gray-500">{formatDate(meeting.createdAt)}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">{meeting?.department}</p>
                                    <p className="text-sm mb-4">
                                        <span className="font-medium">{meeting?.participants?.length || 0}</span> participants
                                    </p>
                                    <div className="flex space-x-2 mt-2">
                                        <Link
                                            to={`/meetings/${meeting?._id}`}
                                            className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50"
                                        >
                                            Details
                                        </Link>
                                        <Link
                                            to={`/meetings/${meeting?._id}/spin-participants`}
                                            className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50 flex items-center gap-1"
                                        >
                                            <UserPlus className="h-3 w-3" /> Participants
                                        </Link>
                                        <Link
                                            to={`/meetings/${meeting?._id}/spin-participants`}
                                            className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                                        >
                                            <Play className="h-3 w-3" /> Spin
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MeetingsList;
