const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001/api/v1'


export const getUiData = async () => {
    const url = `${baseUrl}/ui/all-data`;
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
        console.error(`[getUiData] Error fetching UI data. URL: ${url}, Error:`, error.message || error);
        return null;
    }
}