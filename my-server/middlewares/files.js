const multer = require('multer');
const path = require('path');
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const uploadPath = path.join(__dirname, "../uploads/images");
    callback(null, uploadPath);
  },

  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').replace(/\.[^/.]+$/, "");
    const extension = MIME_TYPES[file.mimetype] || 'unknown';
    callback(null, `${name}_${Date.now()}.${extension}`);
  },
});

module.exports.imgUpload = multer({ storage: storage }).single('image');
module.exports.imgsUpload = multer({ storage: storage }).array('pictures', 5);
