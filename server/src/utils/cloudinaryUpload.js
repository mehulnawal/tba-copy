const cloudinary = require("../config/cloudinary.config");
const ApiError = require("./ApiError");

const uploadToCloudinary = (file, folder = "tba-banners", transformations = {}) =>
  new Promise((resolve, reject) => {
    if (!file?.buffer) {
      reject(new ApiError(400, "No file provided"));
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        ...transformations,
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(500, "Failed to upload image"));
          return;
        }
        resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });

module.exports = { uploadToCloudinary };
