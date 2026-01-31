import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const convertTowebp = async (req, resizeBy, next) => {
  try {
    if (!req.file) return next();

    const inputPath = req.file.path;
    const outputFolder = path.join('uploads', 'webp');

    // Ignore if file exist {recursive: true};
    fs.mkdirSync(outputFolder, { recursive: true });

    const outputFileName =
      path.basename(inputPath, path.extname(inputPath)) + '.webp';
    const outputPath = path.join(outputFolder, outputFileName);

    await sharp(inputPath)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toFile(outputPath);

    req.file.webPath = outputPath;

    next();
  } catch (err) {
    console.error('WebP conversion error:', err);
    next(err);
  }
};
