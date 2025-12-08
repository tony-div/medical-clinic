import multer from "multer";
import path from "path";

const medicalTestStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/medical-tests");
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + "-" + file.originalname);
    }
});

// Storage for profile pictures
const profilePicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/profile-pics");
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${unique}${ext}`);
    }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
};

// Configure multer instances
const uploadMedicalTest = multer({ 
    storage: medicalTestStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadProfilePic = multer({ 
    storage: profilePicStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});

// Default export for backward compatibility
export default uploadMedicalTest;

// Named exports
export { uploadMedicalTest, uploadProfilePic };