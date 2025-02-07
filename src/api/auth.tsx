import axios from 'axios';

const API_BASE = 'https://laij38-109-252-122-97.ru.tuna.am';

export const ValidateInitData = async (initData: string): Promise<boolean> => {
    try {
        const response = await axios.post(`${API_BASE}/auth/init-data`, { initData });
        return response.status === 200;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data || error.message);
            return false;
        } else {
            console.error("Unexpected error:", error);
            return false;
        }
    }
};
