import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

const MAX_AVATAR_MB = Number(process.env.AVATAR_MAX_MB ?? 10);
const MAX_AVATAR_BYTES = Math.max(1, Math.floor(MAX_AVATAR_MB * 1024 * 1024));

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: async (req, file) => {
        const originalName = file.originalname;
        const extension = originalName.split(".").pop()?.toLocaleLowerCase();

        const fileNameWithoutExtension = originalName
            .split(".")
            .slice(0, -1)
            .join(".")
            .toLowerCase()
            .replace(/\s+/g, "-")
            // eslint-disable-next-line no-useless-escape
            .replace(/[^a-z0-9\-]/g, "");

        const uniqueName =
            Math.random().toString(36).substring(2)+
            "-"+
            Date.now()+
            "-"+
            fileNameWithoutExtension;

        const folder = extension === "pdf" ? "pdfs" : "images";


        return {
            folder : `launchforge/${folder}`,
            public_id: uniqueName,
            resource_type : "auto"
        }
    }

})

export const multerUpload = multer({
    storage,
    // Avatar upload size limit (in bytes). Adjust with AVATAR_MAX_MB env var.
    limits: { fileSize: MAX_AVATAR_BYTES },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype?.startsWith("image/")) {
            return cb(new AppError(status.BAD_REQUEST, "Only image files are allowed."));
        }
        cb(null, true);
    },
});
