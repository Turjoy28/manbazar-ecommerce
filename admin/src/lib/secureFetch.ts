type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface HttpOptions<T = unknown> {
    method?: HttpMethod;
    body?: T;
    token?: string;

    headers?: Record<string, string>;

    cache?: RequestCache;

    next?: {
        revalidate?: number;
        tags?: string[];
    };
    credentials?: RequestCredentials;
}

export async function secureFetch<R = unknown, B = unknown>(
    url: string,
    options: HttpOptions<B> = {}
): Promise<R> {
    const {
        method = "GET",
        body,
        token,
        headers = {},
        cache,
        next,
        credentials = "include",
    } = options;

    const response = await fetch(url, {
        method,
        credentials,

        headers: {
            "Content-Type": "application/json",

            ...(token && {
                Authorization: `Bearer ${token}`,
            }),

            ...headers,
        },

        ...(body && {
            body: JSON.stringify(body),
        }),

        cache,
        next,
    });

    if (!response.ok) {
        const error = await response.text();

        throw new Error(error || "Request failed");
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const bodyText = await response.text();
        console.error(`[secureFetch] Non-JSON response from ${url}. Content-Type: ${contentType}. Body preview: ${bodyText.substring(0, 300)}`);
        throw new Error("Received non-JSON response from server");
    }

    return response.json();
}