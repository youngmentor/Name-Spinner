import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { addParticicpantToMeeting } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const AddParticipants = () => {
    const { id: meetingId } = useParams<{ id: string }>();
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>('');
    const [participantNames, setParticipantNames] = useState<string[]>([]);
    const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
    const navigate = useNavigate();

    const mutation = useMutation((data: { id: string; file: File }) =>
        addParticicpantToMeeting(data.id, data.file)
    );

    const parseFile = async (file: File) => {
        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target?.result;
                let names: string[] = [];

                if (file.name.endsWith('.csv')) {
                    const result = await new Promise<{ name?: string; Name?: string }[]>((resolve) => {
                        Papa.parse(content as string, {
                            header: true,
                            complete: (results) => resolve(results.data as { name?: string; Name?: string }[])
                        });
                    });
                    names = result
                        .map(row => row.name || row.Name || '')
                        .filter(name => name.trim() !== '');
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    const workbook = XLSX.read(content, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json<{ name?: string; Name?: string }>(worksheet);
                    names = data
                        .map(row => row.name || row.Name || '')
                        .filter(name => name.trim() !== '');
                }

                setParticipantNames(names);
                setIsPreviewVisible(true);
            };

            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsBinaryString(file);
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            setFileError('Failed to parse file. Please check the format.');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        setFileError('');
        setParticipantNames([]);
        setIsPreviewVisible(false);

        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.type.includes('excel')) {
                setFileError('Please upload a CSV or Excel file');
                return;
            }
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !meetingId) {
            setFileError('Please provide a meeting ID and upload a valid file');
            return;
        }

        mutation.mutate(
            { id: meetingId as string, file },
            {
                onSuccess: () => {
                    toast.success('Participants added successfully!');
                    setFile(null);
                    setParticipantNames([]);
                    setIsPreviewVisible(false);
                    navigate(`/meetings/${meetingId}/spin-participants`);
                },
                onError: (error: unknown) => {
                    if (error instanceof Error) {
                        console.error('Upload error:', error.message);
                    } else {
                        console.error('Upload error:', error);
                    }
                    setFileError('Failed to upload participants. Please try again.');
                },
            }
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Add Participants</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Upload Participant List (CSV/Excel)</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileSpreadsheet className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">CSV or Excel file</p>
                                </div>
                                <Input
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
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

                    </div>

                    {isPreviewVisible && participantNames.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Participants ({participantNames.length})</h3>
                            <div className="bg-white border rounded-lg p-4">
                                <div className="flex flex-wrap gap-2">
                                    {participantNames.map((name, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-full text-sm bg-white border text-gray-700"
                                        >
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                        disabled={mutation.isLoading}
                    >
                        {mutation.isLoading ? 'Uploading...' : (isPreviewVisible ? 'Confirm & Add Participants' : 'Add Participants')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddParticipants;