const { config, uploader } = require('cloudinary');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'secret.env') });

const cloudinaryConfig = (req, res, next) => {
  config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  next();
};

module.exports = { cloudinaryConfig, uploader };
