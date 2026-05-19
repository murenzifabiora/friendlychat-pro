import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth';
import { validateMessage, handleValidationErrors } from '../middleware/validation';
import { sendMessage, getMessages, markAsRead, getUnreadCount } from '../controllers/chatController';
import { uploadMedia } from '../controllers/uploadController';

const router = Router();

// Multer config for media uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /audio|video|image|pdf|msword|text|octet-stream/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

router.post('/send', authenticate, validateMessage, handleValidationErrors, sendMessage);
router.get('/messages/:userId', authenticate, getMessages);
router.post('/mark-read', authenticate, markAsRead);
router.get('/unread-count', authenticate, getUnreadCount);
router.post('/upload', authenticate, upload.single('file'), uploadMedia);

export default router;
