import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RotateCw, AlertCircle, Sparkles, History } from 'lucide-react';
import { clearSelectionHistory, createSelectionRecord, getMeeting, getParticipantsByMeetingId, getSelectionHistory } from '../services/api';
import { MeetingData, ParticipantData } from '../types/types';
import { useQuery } from 'react-query';

const ParticipantsList = () => {
    const { meetingId } = useParams<{ meetingId: string }>();
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showSparkle, setShowSparkle] = useState(false);
    const [rollingNames, setRollingNames] = useState<string[]>([]);
    const [excludeRecentlySelected, setExcludeRecentlySelected] = useState(true);
    const [selectionHistory, setSelectionHistory] = useState<{
        participantName: string;
        selectedAt: string;
        meetingId: string;
        meetingName: string;
        date: string;
        selectedName: string;
    }[]>([]);

    const { data: meeting, isLoading: meetingLoading, error: meetingError } = useQuery<MeetingData>([`meeting_${meetingId}`, meetingId], async () => {
        const response = await getMeeting(meetingId!);
        return response.data;
    }, {
        enabled: !!meetingId
    });


    const { data: participants, isLoading: participantsLoading, error: participantsError } = useQuery<ParticipantData[]>(['ALL_PARTICIPANTS_BY_MEETINGID', meetingId], async () => {
        const response = await getParticipantsByMeetingId(meetingId!);
        return response.data.participants;
    }, { enabled: !!meetingId });


    React.useEffect(() => {
        if (meetingId) {
            getSelectionHistory(meetingId)
                .then(data => {
                    if (Array.isArray(data)) {
                        setSelectionHistory(data);
                    } else {
                        console.error('Expected an array but got:', data);
                        setSelectionHistory([]); 
                    }
                })
                .catch(error => {
                    console.error('Error fetching selection history:', error);
                    setSelectionHistory([]);
                });
        }
    }, [meetingId]);

    const spin = () => {
        if (!participants || participants.length === 0) return;

        setIsSpinning(true);
        setSelectedName(null);
        setShowSparkle(false);

        let eligibleParticipants = [...participants];

        if (excludeRecentlySelected && selectionHistory.length > 0) {
            const recentlySelected = new Map();
            selectionHistory.forEach(record => {
                recentlySelected.set(record.participantName, record.selectedAt);
            });
            const neverSelected = eligibleParticipants.filter(p => !recentlySelected.has(p.name));

            if (neverSelected.length > 0) {
                eligibleParticipants = neverSelected;
            } else {
                eligibleParticipants.sort((a, b) => {
                    const aLastSelected = recentlySelected.get(a.name) || '1970-01-01';
                    const bLastSelected = recentlySelected.get(b.name) || '1970-01-01';
                    return new Date(aLastSelected).getTime() - new Date(bLastSelected).getTime();
                });

                const halfLength = Math.ceil(eligibleParticipants.length / 2);
                eligibleParticipants = eligibleParticipants.slice(0, halfLength);
            }
        }

        if (eligibleParticipants.length === 0) {
            eligibleParticipants = [...participants];
        }

        let currentIndex = 0;
        const rollInterval = 100;
        const rollDuration = 3000;

        const roll = () => {
            setRollingNames(prev => {
                const newNames = [...prev];
                newNames.push(eligibleParticipants[currentIndex].name);
                if (newNames.length > 5) newNames.shift();
                return newNames;
            });
            currentIndex = (currentIndex + 1) % eligibleParticipants.length;
        };

        const intervalId = setInterval(roll, rollInterval);

        setTimeout(() => {
            clearInterval(intervalId);
            setIsSpinning(false);

            const finalIndex = Math.floor(Math.random() * eligibleParticipants.length);
            const chosenParticipant = eligibleParticipants[finalIndex];

            setSelectedName(chosenParticipant.name);
            setShowSparkle(true);
            setRollingNames([]);

            if (meeting) {
                const newSelection = {
                    participantName: chosenParticipant.name,
                    selectedAt: new Date().toISOString(),
                    meetingId: meetingId!,
                    meetingName: meeting.name,
                    date: new Date().toISOString(),
                    selectedName: chosenParticipant.name
                };
                createSelectionRecord({
                    meetingId: meetingId!,
                    meetingName: meeting.name,
                    participantId: chosenParticipant?._id,
                    participantName: chosenParticipant.name,
                    department: chosenParticipant.department,
                }).then(() => {
                    setSelectionHistory(prev => [newSelection, ...prev]);
                }).catch(error => {
                    console.error('Error saving selection record:', error);
                });
            }
        }, rollDuration);
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear all selection history?')) {
            clearSelectionHistory(meetingId!).then(() => {
                setSelectionHistory([]);
            }).catch(error => {
                console.error('Error clearing selection history:', error);
            });
        }
    };

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

    if (meetingLoading || participantsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RotateCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    if (meetingError || participantsError) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>An error occured</AlertDescription>
            </Alert>
        );
    }

    if (!meeting) {
        return (
            <Alert className="max-w-2xl mx-auto mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Meeting not found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="relative">
                    <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {meeting?.name}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="spinner" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="spinner">Spinner</TabsTrigger>
                            <TabsTrigger value="participants">Participants</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        {/* Spinner Tab */}
                        <TabsContent value="spinner" className="space-y-6">
                            <div className="relative h-32 flex items-center justify-center overflow-hidden border rounded-lg bg-gray-50">
                                {isSpinning ? (
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        {rollingNames.map((name, index) => (
                                            <p key={index} className="text-xl font-semibold text-gray-700 animate-pulse">
                                                {name}
                                            </p>
                                        ))}
                                    </div>
                                ) : selectedName ? (
                                    <div className="relative">
                                        <p className={`text-2xl font-bold transition-all duration-300 ${showSparkle ? 'scale-110' : 'scale-100'}`}>
                                            {selectedName}
                                        </p>
                                        {showSparkle && (
                                            <div className="absolute -top-4 -right-4">
                                                <Sparkles className="text-yellow-400 animate-pulse" size={24} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xl font-semibold text-gray-500">Click spin to select someone</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="exclude-recent"
                                    checked={excludeRecentlySelected}
                                    onCheckedChange={setExcludeRecentlySelected}
                                />
                                <Label htmlFor="exclude-recent">Prioritize people who haven't been selected recently</Label>
                            </div>

                            <button
                                onClick={spin}
                                disabled={isSpinning || !participants || participants.length === 0}
                                className={`
                  w-full group relative px-8 py-6 rounded-full font-semibold text-white
                  ${isSpinning ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'}
                  transform hover:scale-105 transition-all duration-300
                  disabled:opacity-70 disabled:cursor-not-allowed
                  shadow-lg hover:shadow-xl
                `}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isSpinning ? (
                                        <>
                                            <RotateCw className="animate-spin" size={20} />
                                            Spinning...
                                        </>
                                    ) : (
                                        <>
                                            Spin
                                            <RotateCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                                        </>
                                    )}
                                </span>
                            </button>

                            {participants && participants.length === 0 && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        No participants available for this meeting
                                    </AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>

                        <TabsContent value="participants" className="space-y-6">
                            <div className="space-y-2 mt-4">
                                <h3 className="text-lg font-medium">Participants ({participants?.length || 0})</h3>

                                {participants && participants.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No participants added yet</p>
                                ) : (
                                    <div className="bg-white border rounded-lg p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {participants?.map((participant, index) => {
                                                const history = selectionHistory?.filter(h => h.selectedName === participant.name);
                                                const selectionCount = history.length;
                                                const lastSelected = history.length > 0 ?
                                                    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date :
                                                    null;

                                                return (
                                                    <span
                                                        key={index}
                                                        className={`px-3 py-1 rounded-full text-sm ${participant.name === selectedName
                                                            ? "bg-purple-500 text-white font-medium"
                                                            : "bg-white border text-gray-700"
                                                            }`}
                                                        title={lastSelected ?
                                                            `Last selected: ${formatDate(lastSelected)}
                               Selected ${selectionCount} time(s)` : 'Never selected'}
                                                    >
                                                        {participant.name}
                                                        {selectionCount > 0 && (
                                                            <span className="ml-1 text-xs opacity-80">
                                                                ({selectionCount})
                                                            </span>
                                                        )}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="history">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <History size={20} />
                                        Selection History
                                    </h3>
                                    <button
                                        onClick={clearHistory}
                                        className="text-sm text-red-500 hover:text-red-700"
                                        disabled={selectionHistory.length === 0}
                                    >
                                        Clear History
                                    </button>
                                </div>

                                {selectionHistory.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No selection history yet</p>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                        {selectionHistory.map((session, index) => (
                                            <div key={index} className="p-3 bg-white border rounded-lg">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold text-purple-600">{session.participantName}</span>
                                                    <span className="text-xs text-gray-500">{formatDate(session.selectedAt)}</span>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {session.meetingName}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ParticipantsList;