import React, { useState } from 'react';
import { Sparkles, RotateCw, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ParticipantData = {
  name: string;
  role?: string;
  email?: string;
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

  const [isSetupComplete, setIsSetupComplete] = useState(false);

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

          const parsedParticipants = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',');
              return {
                name: values[nameIndex].trim(),
                role: headers.includes('role') ? values[headers.indexOf('role')]?.trim() : undefined,
                email: headers.includes('email') ? values[headers.indexOf('email')]?.trim() : undefined
              };
            });

          setParticipants(parsedParticipants);
        } catch (error) {
          setFileError('Error processing file. Please check the format.');
          console.log(error);

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

  const spin = () => {
    if (participants.length === 0) return;

    setIsSpinning(true);
    setSelectedName(null);
    setShowSparkle(false);

    let currentIndex = 0;
    const rollInterval = 100;
    const rollDuration = 3000;

    const roll = () => {
      setRollingNames(prev => {
        const newNames = [...prev];
        newNames.push(participants[currentIndex].name);
        if (newNames.length > 5) newNames.shift();
        return newNames;
      });
      currentIndex = (currentIndex + 1) % participants.length;
    };

    const intervalId = setInterval(roll, rollInterval);

    setTimeout(() => {
      clearInterval(intervalId);
      setIsSpinning(false);
      const finalIndex = Math.floor(Math.random() * participants.length);
      const chosenParticipant = participants[finalIndex];

      setSelectedName(chosenParticipant.name);
      setShowSparkle(true);
      setRollingNames([]);
    }, rollDuration);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isSetupComplete ? meetingName : 'Selection Setup'}
          </CardTitle>
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
            <div className="space-y-6">
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
                <h3 className="text-sm font-medium text-gray-700 mb-2">Loaded Participants ({participants.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant, index) => (
                    <span key={index} className="px-3 py-1 bg-white border rounded-full text-sm text-gray-700">
                      {participant.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadSpinner;