import { secureFetch } from "../lib/secureFetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

export interface AdminMeResponse {
    success: boolean;
    data?: {
        id: string;
        email: string;
        role: string;
    };
    message?: string;
}

export const authService = {
    login: async (email: string, password: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            body: { email, password },
        });
    },

    logout: async (): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/logout`, {
            method: "POST",
        });
    },

    getMe: async (): Promise<AdminMeResponse> => {
        return secureFetch<AdminMeResponse>(`${BASE_URL}/auth/me`);
    },
};
