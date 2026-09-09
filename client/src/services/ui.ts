const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001/api/v1';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getUiData = async (retries = 2, delayMs = 400): Promise<any> => {
    const url = `${baseUrl}/ui/all-data`;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                console.error(`[getUiData] Fetch failed. URL: ${url}, Status: ${res.status} ${res.statusText}`);
                return null;
            }
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const bodyText = await res.text();
                console.error(`[getUiData] Non-JSON response received. URL: ${url}, Content-Type: ${contentType}. Body preview: ${bodyText.substring(0, 300)}`);
                return null;
            }
            return await res.json();
        } catch (error: any) {
            if (
                error.name === 'DynamicServerError' ||
                error.message?.includes('Dynamic server usage') ||
                error.digest === 'NEXT_REDIRECT' ||
                error.digest === 'NEXT_NOT_FOUND'
            ) {
                throw error;
            }

            if (attempt < retries) {
                await delay(delayMs);
                continue;
            }

            console.error(`[getUiData] Error fetching UI data after ${retries + 1} attempt(s). URL: ${url}, Error:`, error.message || error);
            return null;
        }
    }
    return null;
};