import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "upload/";

// garante que a pasta existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const upload = multer({
  storage: multer.diskStorage({destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);

      cb(null, uniqueName);
    },
  }),

  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },

  fileFilter(req, file, cb) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Tipo de arquivo inválido"));
    }

    cb(null, true);
  },
});