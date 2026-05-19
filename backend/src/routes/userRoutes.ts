import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllUsers,
  getUser,
  addContact,
  removeContact,
  getContacts,
  updateUserStatus,
} from '../controllers/userController';

const router = Router();

router.get('/', getAllUsers);
router.get('/contacts', authenticate, getContacts);
router.get('/:id', getUser);
router.post('/add-contact', authenticate, addContact);
router.post('/remove-contact', authenticate, removeContact);
router.post('/status', authenticate, updateUserStatus);

export default router;
