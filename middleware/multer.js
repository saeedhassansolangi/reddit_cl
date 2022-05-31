const multer = require('multer');
const datauri = require('datauri/parser');
const path = require('path');

const storage = multer.memoryStorage();
const dUri = new datauri();

const multerUploads = multer({ storage }).single('imageAndVideoUrl');

const dataUri = (req) =>
  dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);

module.exports = { multerUploads, dataUri };
