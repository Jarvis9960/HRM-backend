import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(fileName);

export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/uploads/lead"));
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.originalname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

export function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images only!"); // custom this message to fit your needs
  }
}

