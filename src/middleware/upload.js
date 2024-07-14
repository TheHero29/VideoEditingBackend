const multer = require('multer');
const path = require('path');

const maxSize = 5 * 1024 * 1024; // 5MB
// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    
    cb(null, filename);
  },


});

const upload = multer({ 
  storage,
  limits: { fileSize: maxSize},
 });
module.exports = upload;
