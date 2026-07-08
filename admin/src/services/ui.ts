import { secureFetch } from "../lib/secureFetch";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001/api/v1'


export const getUiData = async () => {
    const url = `${baseUrl}/ui/all-data`;
    try {
        const res = await secureFetch<any>(url, { cache: "no-store" });
        return res;
    } catch (error: any) {
        if (
            error.name === 'DynamicServerError' ||
            error.message?.includes('Dynamic server usage') ||
            error.digest === 'NEXT_REDIRECT' ||
            error.digest === 'NEXT_NOT_FOUND'
        ) {
            throw error;
        }
        console.error(`[getUiData] Error fetching UI data. URL: ${url}, Error:`, error.message || error);
        return null;
    }
};

export const updateUiData = async (id: string, payload: any) => {
    const url = `${baseUrl}/ui/update-ui/${id}`;
    try {
        const res = await secureFetch<any>(url, {
            method: "PATCH",
            body: payload
        });
        return res;
    } catch (error: any) {
        console.error(`[updateUiData] Error updating UI data. URL: ${url}, Error:`, error.message || error);
        throw new Error(error.message || `Failed to update UI`);
    }
};