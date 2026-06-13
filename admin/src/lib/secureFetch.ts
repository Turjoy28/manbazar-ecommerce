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

    return response.json();
}