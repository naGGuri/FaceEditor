import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const saveConfigAPI = async (
    sessionId: string,
    payload: {
        colorMap: Record<number, [number, number, number]>;
        opacityMap: Record<number, number>;
    }
) => {
    console.log("saveConfigAPI URL:", `${API_BASE_URL}/config/${sessionId}`); // Debugging line to check the full URL
    await axios.post(`${API_BASE_URL}/config/${sessionId}`, payload);
};

export const loadConfigAPI = async (
    sessionId: string
): Promise<{
    colorMap: Record<number, [number, number, number]>;
    opacityMap: Record<number, number>;
}> => {
    const res = await axios.get(`${API_BASE_URL}/config/${sessionId}`);
    return res.data;
};
