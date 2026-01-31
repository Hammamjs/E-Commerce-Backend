import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ensureFolder = (folder) => fs.mkdirSync(folder, { recursive: true });

export const convertImagesToWebp =
  (fieldNames = {}) =>
  async (req, res, next) => {
    try {
      if (!req.files) return next();

      const outputFolder = path.join('uploads', 'webp');
      ensureFolder(outputFolder);

      // Single main image
      if (
        fieldNames.single &&
        req.files[fieldNames.single] &&
        req.files[fieldNames.single].length > 0
      ) {
        const file = req.files[fieldNames.single][0];
        const filename =
          path.basename(file.originalname, path.extname(file.originalname)) +
          '.webp';
        const outputPath = path.join(outputFolder, filename);

        await sharp(file.path)
          .resize({ width: 800 })
          .webp({ quality: 80 })
          .toFile(outputPath);

        req.body[fieldNames.single] = filename; // save for DB
      }

      // Multiple images
      if (
        fieldNames.multiple &&
        req.files[fieldNames.multiple] &&
        req.files[fieldNames.multiple].length > 0
      ) {
        req.body[fieldNames.multiple] = [];

        await Promise.all(
          req.files[fieldNames.multiple].map(async (file) => {
            const filename =
              path.basename(
                file.originalname,
                path.extname(file.originalname),
              ) + '.webp';
            const outputPath = path.join(outputFolder, filename);

            await sharp(file.path)
              .resize({ width: 800 })
              .webp({ quality: 80 })
              .toFile(outputPath);

            req.body[fieldNames.multiple].push(filename);
          }),
        );
      }

      next();
    } catch (err) {
      console.error('WebP conversion failed:', err);
      next(err);
    }
  };
