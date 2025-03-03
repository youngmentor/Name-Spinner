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

export const deleteMeeting = async (id: string) => {
    return await axios.delete(`${VITE_ENDPOINT}/meetings/${id}`)
}
