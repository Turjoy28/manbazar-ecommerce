import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
            cb(null, true);
        } else {
            cb(new Error("Only images and videos allowed"));
        }
    }
});

export const csvUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv") || file.mimetype === "application/vnd.ms-excel") {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files allowed"));
        }
    }
});

export default upload;