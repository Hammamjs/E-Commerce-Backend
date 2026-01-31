import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const convertToWebpMulti = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) return next();

    const outputFolder = path.join('uploads', 'webp');

    fs.mkdirSync(outputFolder, { recursive: true });

    req.filesWebp = await Promise.all(
      req.files.map(async (file) => {
        const inputPath = file.path;
        const outputFileName =
          path.basename(inputPath, path.extname(inputPath)) + 'webp';
        const outputPath = path.join(inputPath, outputFileName);

        await sharp(inputPath)
          .resize({ width: 800 })
          .webp({ quality: 80 })
          .toFile(outputPath);

        return outputPath;
      }),
    );
    next();
  } catch (err) {
    console.error('Convert images failed ', err);
    next();
  }
};
