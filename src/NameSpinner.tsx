import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCw, FileSpreadsheet, Check, AlertCircle, RefreshCw, History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type ParticipantData = {
  name: string;
  role?: string;
  email?: string;
  lastSelected?: string;
  selectionCount?: number;
};

type MeetingSession = {
  department: string;
  meetingName: string;
  date: string;
  selectedName: string;
};

const FileUploadSpinner = () => {
  const [department, setDepartment] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [fileError, setFileError] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [rollingNames, setRollingNames] = useState<string[]>([]);
  const [selectionHistory, setSelectionHistory] = useState<MeetingSession[]>([]);
  const [excludeRecentlySelected, setExcludeRecentlySelected] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  useEffect(() => {
    const savedHistory = localStorage.getItem('selectionHistory');
    if (savedHistory) {
      setSelectionHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectionHistory', JSON.stringify(selectionHistory));
  }, [selectionHistory]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError('');

    if (file) {
      if (file.type !== 'text/csv' && !file.type.includes('excel') && !file.type.includes('spreadsheet')) {
        setFileError('Please upload a CSV or Excel file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].toLowerCase().split(',');
          const nameIndex = headers.findIndex(h => h.includes('name'));

          if (nameIndex === -1) {
            setFileError('File must contain a "name" column');
            return;
          }

          let parsedParticipants = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',');
              return {
                name: values[nameIndex].trim(),
                role: headers.includes('role') ? values[headers.indexOf('role')]?.trim() : undefined,
                email: headers.includes('email') ? values[headers.indexOf('email')]?.trim() : undefined,
                selectionCount: 0,
              };
            });
          parsedParticipants = parsedParticipants.map(newParticipant => {
            const history = selectionHistory.filter(h => h.selectedName === newParticipant.name);
            if (history.length > 0) {
              const dates = history.map(h => new Date(h.date));
              const mostRecent = new Date(Math.max(...dates.map(d => d.getTime()))).toISOString();

              return {
                ...newParticipant,
                lastSelected: mostRecent,
                selectionCount: history.length
              };
            }
            return newParticipant;
          });

          setParticipants(parsedParticipants);
        } catch {
          setFileError('Error processing file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (department && meetingName && participants.length > 0) {
      setIsSetupComplete(true);
    }
  };

  const resetSetup = () => {
    setIsSetupComplete(false);
    setSelectedName(null);
    setShowSparkle(false);
  };

  const spin = () => {
    if (participants.length === 0) return;

    setIsSpinning(true);
    setSelectedName(null);
    setShowSparkle(false);

    let eligibleParticipants = [...participants];

    if (excludeRecentlySelected) {
      eligibleParticipants.sort((a, b) => {
        if (!a.lastSelected) return -1;
        if (!b.lastSelected) return 1;
        return new Date(a.lastSelected).getTime() - new Date(b.lastSelected).getTime();
      });
      const neverSelected = eligibleParticipants.filter(p => !p.lastSelected);
      if (neverSelected.length > 0) {
        eligibleParticipants = neverSelected;
      } else {
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

      setParticipants(prev => prev.map(p => {
        if (p.name === chosenParticipant.name) {
          return {
            ...p,
            lastSelected: new Date().toISOString(),
            selectionCount: (p.selectionCount || 0) + 1
          };
        }
        return p;
      }));

      const newSession: MeetingSession = {
        department,
        meetingName,
        date: new Date().toISOString(),
        selectedName: chosenParticipant.name
      };

      setSelectionHistory(prev => [newSession, ...prev]);
    }, rollDuration);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all selection history?')) {
      setSelectionHistory([]);
      setParticipants(prev => prev.map(p => ({
        ...p,
        lastSelected: undefined,
        selectionCount: 0
      })));
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="relative">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isSetupComplete ? meetingName : 'Meeting Host Selection Setup'}
          </CardTitle>
          {isSetupComplete && (
            <button
              onClick={resetSetup}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
            >
              <RefreshCw size={16} className="text-gray-500" />
            </button>
          )}
        </CardHeader>

        <CardContent>
          {!isSetupComplete ? (
            <form onSubmit={handleSetupSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department/Team Name</label>
                <Input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter department or team name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Meeting Name</label>
                <Input
                  type="text"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  placeholder="Enter meeting name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Participant List (CSV/Excel)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileSpreadsheet className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV or Excel file with participant names</p>
                    </div>
                    <Input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      required
                    />
                  </label>
                </div>
                {fileError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}
                {participants.length > 0 && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      {participants.length} participants loaded successfully
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Start Selection
              </button>
            </form>
          ) : (
            <Tabs defaultValue="spinner" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="spinner">Spinner</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="spinner" className="space-y-6">
                <div className="relative h-24 flex items-center justify-center overflow-hidden border rounded-lg bg-gray-50">
                  {isSpinning ? (
                    <div className="flex flex-col space-y-2">
                      {rollingNames.map((name, index) => (
                        <p key={index} className="text-xl font-semibold text-gray-700 animate-roll">
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
                  disabled={isSpinning}
                  className={`
                    w-full group relative px-8 py-3 rounded-full font-semibold text-white
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

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Participants ({participants.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {participants.map((participant, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${participant.name === selectedName
                          ? "bg-purple-500 text-white font-medium"
                          : "bg-white border text-gray-700"
                          }`}
                        title={participant.lastSelected ?
                          `Last selected: ${formatDate(participant.lastSelected)}
                            Selected ${participant.selectionCount} time(s)` : 'Never selected'}
                      >
                        {participant.name}
                        {participant.selectionCount && participant.selectionCount > 0 && (
                          <span className="ml-1 text-xs opacity-80">
                            ({participant.selectionCount})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
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
                            <span className="font-semibold text-purple-600">{session.selectedName}</span>
                            <span className="text-xs text-gray-500">{formatDate(session.date)}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {session.meetingName} ({session.department})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadSpinner;