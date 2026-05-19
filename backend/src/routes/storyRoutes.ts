import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createStory,
  getFeed,
  getUserStories,
  likeStory,
  addComment,
  deleteComment,
  likeComment,
  deleteStory,
  searchStories,
  getTrendingHashtags,
} from '../controllers/storyController';

const router = Router();

// Stories
router.post('/', authenticate, createStory);
router.get('/feed', authenticate, getFeed);
router.get('/search', authenticate, searchStories);
router.get('/trending-hashtags', authenticate, getTrendingHashtags);
router.get('/user/:userId', authenticate, getUserStories);
router.post('/:storyId/like', authenticate, likeStory);
router.delete('/:storyId', authenticate, deleteStory);

// Comments
router.post('/:storyId/comments', authenticate, addComment);
router.delete('/comments/:commentId', authenticate, deleteComment);
router.post('/comments/:commentId/like', authenticate, likeComment);

export default router;
