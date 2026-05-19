import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
} from '../controllers/followController';

const router = Router();

router.post('/:userId/follow', authenticate, followUser);
router.delete('/:userId/follow', authenticate, unfollowUser);
router.get('/:userId/followers', authenticate, getFollowers);
router.get('/:userId/following', authenticate, getFollowing);
router.get('/:userId/is-following', authenticate, isFollowing);

export default router;
