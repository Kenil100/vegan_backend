import multer from "multer";

const storage = multer.memoryStorage();

const allowedTypes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
];

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only png, jpg, jpeg and webp images are allowed"),
        false
      );
    }
  },
});
