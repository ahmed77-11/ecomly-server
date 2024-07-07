const multer = require("multer");
const { resolve, basename } = require("node:path");
const { unlink } = require("node:fs/promises");

const ALLOWED_MIME_TYPES = {
  "image/jpeg": "png",
  "image/jpg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname
      .replace(" ", "-")
      .replace(".png", "")
      .replace(".jpg", "")
      .replace(".jpeg", "");
    const extention = ALLOWED_MIME_TYPES[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extention}`);
  },
});

exports.upload = multer({
  storage: storage,
  //5mb
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    const isValid = ALLOWED_MIME_TYPES[file.mimetype];
    let uploadError = new Error(
      `Invalid image type\n${file.mimetype} is not allowed`,
    );
    if (!isValid) {
      return cb(uploadError, false);
    } else {
      return cb(null, true);
    }
  },
});

exports.deleteImages = async (imageUrls, continueOnErrorName) => {
  await Promise.all(
    imageUrls.map(async (imageUrl) => {
      const imagePath = resolve(
        __dirname,
        "..",
        "public",
        "uploads",
        basename(imageUrl),
      );
      try {
        await unlink(imagePath);
      } catch (err) {
        if (err.code !== continueOnErrorName) {
          console.error(
            `Continuing with the new image deletion process...${err.message}`,
          );
        } else {
          console.error("Error deleting image", err.message);
          throw err;
        }
      }
    }),
  );
};
