import axios from 'axios'


const { VITE_ENDPOINT } = import.meta.env

export const createMeeting = async (name: string, department: string, description: string) => {
    return await axios.post(`${VITE_ENDPOINT}/meetings`, { name, department, description })
}

export const getAllMeeting = async () => {
    return await axios.get(`${VITE_ENDPOINT}/meetings`)
}

export const addParticicpantToMeeting = async (id: string, file: File) => {
    return await axios.post(`${VITE_ENDPOINT}/meetings/${id}/add-participants`, file)
}

export const getParticipantsByMeetingId = async (id: string) => {
    return await axios.get(`${VITE_ENDPOINT}/meetings/${id}/participants`)
}
export const getMeeting = async (id: string) => {
    return await axios.get(`${VITE_ENDPOINT}/meetings/${id}`)
}
export const deleteMeeting = async (id: string) => {
    return await axios.delete(`${VITE_ENDPOINT}/meetings/${id}`)
}

export const getSelectionHistory = async (id: string) => {
    const response = await axios.get(`${VITE_ENDPOINT}/history?meetingId=${id}`);
    return response.data;
};

export const createSelectionRecord = async (data: {
    meetingId: string,
    meetingName: string,
    department: string,
    participantId: string,
    participantName: string,
}) => {
    const response = await axios.post(`${VITE_ENDPOINT}/history`, data);
    return response.data;
};

export const clearSelectionHistory = async (id: string) => {
    const response = await axios.delete(`${VITE_ENDPOINT}/history/clear?meetingId=${id}`);
    return response.data;
};