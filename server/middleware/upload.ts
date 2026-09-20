import multer from 'multer';

// Use memory storage so uploads work anywhere (Cloud Run, container, or serverless) without leaking local paths
const storage = multer.memoryStorage();

export const uploadSupportingDoc = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum file size
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Only PDF, JPG, and PNG are permitted.'));
    }
  }
});
