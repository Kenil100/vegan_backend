import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (buffer, folder, publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId || undefined, // REPLACE IF EXISTS
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  const parts = imageUrl.split("/");
  const fileName = parts[parts.length - 1].split(".")[0]; // get name without extension
  const folder = parts[parts.length - 2]; // last folder

  await cloudinary.uploader.destroy(`${folder}/${fileName}`);
};
