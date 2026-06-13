export type UploadedImages = {
    thumbnail?: string;
    images: string[];
};

type UploadApiResponse = {
    success?: boolean;
    message?: string;
    data?: Partial<UploadedImages>;
    thumbnail?: string;
    images?: string[];
};

const getApiBaseUrl = () => {
    const configuredUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BASE_URL;
    const baseUrl = configuredUrl && configuredUrl !== "undefined"
        ? configuredUrl
        : "http://localhost:5000/api/v1";

    return baseUrl
        .replace(/^https:\/\/localhost(?=[:/]|$)/, "http://localhost")
        .replace(/\/$/, "");
};

const parseUploadResponse = async (res: Response): Promise<UploadApiResponse> => {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return res.json();
    }

    const message = await res.text();
    throw new Error(message || "Image upload failed");
};

export const uploadImage = async (
    files: File[],
    isMultiple = false
): Promise<UploadedImages> => {
    const formData = new FormData();

    if (isMultiple) {
        files.forEach((file) => {
            formData.append("images", file);
        });
    } else if (files[0]) {
        formData.append("thumbnail", files[0]);
    }

    const res = await fetch(`${getApiBaseUrl()}/image-upload`, {
        method: "POST",
        body: formData,
    });

    const payload = await parseUploadResponse(res);

    if (!res.ok || payload.success === false) {
        throw new Error(payload.message || "Image upload failed");
    }

    const data = payload.data || payload;

    return {
        thumbnail: data.thumbnail,
        images: data.images || [],
    };
};
