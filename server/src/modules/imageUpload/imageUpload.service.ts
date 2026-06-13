import cloudinary from "../../config/cloudinary.js";


const uploadSingle = async (file: Express.Multer.File) => {
    const base64 = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
        folder: "landing_page",
    });

    return result.secure_url;
};

export const uploadMultipleImages = async (
    files: Express.Multer.File[]
) => {
    const uploadPromises = files.map((file) => uploadSingle(file));
    return await Promise.all(uploadPromises);
};

export const imageUploadService = async (
    thumbnail: Express.Multer.File | undefined,
    images: Express.Multer.File[]
) => {
    let thumbnailUrl = null;
    if (thumbnail) {
        thumbnailUrl = await uploadSingle(thumbnail);
    }
    const imageUrls = await uploadMultipleImages(images);

    return {
        thumbnail: thumbnailUrl,
        images: imageUrls,
    };
};