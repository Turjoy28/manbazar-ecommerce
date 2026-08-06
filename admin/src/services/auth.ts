import { secureFetch } from "../lib/secureFetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

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

    createManager: async (name: string, email: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/managers`, {
            method: "POST",
            body: { name, email },
        });
    },

    listManagers: async (): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/managers`);
    },

    verifyOnboarding: async (token: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/verify-onboarding?token=${token}`);
    },

    setPassword: async (token: string, password: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/set-password`, {
            method: "POST",
            body: { token, password },
        });
    },

    getAdminEmailsHint: async (): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/admin-emails-hint`);
    },

    forgotPassword: async (email: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/forgot-password`, {
            method: "POST",
            body: { email },
        });
    },

    verifyResetOtp: async (email: string, otp: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/verify-reset-otp`, {
            method: "POST",
            body: { email, otp },
        });
    },

    resetPassword: async (email: string, otp: string, password: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/reset-password`, {
            method: "POST",
            body: { email, otp, password },
        });
    },

    updateAdminEmails: async (superAdminEmail: string, userAdminEmail: string): Promise<any> => {
        return secureFetch(`${BASE_URL}/auth/admin-emails`, {
            method: "PATCH",
            body: { superAdminEmail, userAdminEmail },
        });
    },
};
