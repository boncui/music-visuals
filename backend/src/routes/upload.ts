import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { UploadController } from '../controllers/uploadController';
import multer from 'multer';
import path from 'path';

const router = Router();
const uploadController = new UploadController();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow audio files
    const allowedMimes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'audio/m4a'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Upload audio file
router.post('/audio',
  authenticateToken,
  upload.single('audio'),
  uploadController.uploadAudio
);

// Upload multiple audio files
router.post('/audio/batch',
  authenticateToken,
  upload.array('audio', 5),
  uploadController.uploadMultipleAudio
);

// Upload image (for thumbnails)
router.post('/image',
  authenticateToken,
  upload.single('image'),
  uploadController.uploadImage
);

// Get upload status
router.get('/status/:uploadId',
  authenticateToken,
  uploadController.getUploadStatus
);

// Delete uploaded file
router.delete('/:fileId',
  authenticateToken,
  uploadController.deleteFile
);

export default router;
