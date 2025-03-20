import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { createMeeting } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateMeeting = () => {
    const navigate = useNavigate()
    const [department, setDepartment] = useState('');
    const [meetingName, setMeetingName] = useState('');
    const [meetingDescription, setMeetingDescription] = useState('');

    const mutation = useMutation({
        mutationFn: async () => createMeeting(meetingName, department, meetingDescription),
        onSuccess: () => {
            setDepartment('');
            setMeetingName('');
            setMeetingDescription('');
            navigate('/meetings')
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 h-screen">
            <Card className="w-[500px] shadow-xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Create New Meeting 
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {mutation.isError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {mutation.isSuccess && (
                        <Alert className="mb-4 bg-green-50 border-green-200">
                            <Check className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-700">
                                Meeting created successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="meetingName">Meeting Name</Label>
                            <Input
                                id="meetingName"
                                type="text"
                                value={meetingName}
                                onChange={(e) => setMeetingName(e.target.value)}
                                placeholder="Enter meeting name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department/Team Name</Label>
                            <Input
                                id="department"
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="Enter department or team name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meetingDescription">Meeting Description</Label>
                            <Input
                                id="meetingDescription"
                                type="text"
                                value={meetingDescription}
                                onChange={(e) => setMeetingDescription(e.target.value)}
                                placeholder="Enter meeting description"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isLoading}
                            className="w-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-70"
                        >
                            {mutation.isLoading ? 'Creating...' : 'Create Meeting'}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateMeeting;
