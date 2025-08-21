import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const shuffleSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, shuffleSuffix + fileExt);
  },
});

export const upload = multer({ storage });
