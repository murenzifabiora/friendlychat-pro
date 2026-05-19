import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Follow from '../models/Follow';
import User from '../models/User';
import { createNotification } from '../services/notificationService';

// Follow a user
export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    if (userId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ followerId, followingId: userId });
    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    const follow = new Follow({
      followerId,
      followingId: userId,
    });

    await follow.save();

    // Add to contacts
    await User.findByIdAndUpdate(followerId, {
      $addToSet: { contacts: userId },
    });

    // Notify the followed user
    await createNotification({
      userId: userId,
      actorId: followerId!,
      type: 'follow',
    });

    res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

// Unfollow a user
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    await Follow.deleteOne({ followerId, followingId: userId });

    // Check if still have other connections, if not remove from contacts
    const remainingConnections = await Follow.findOne({
      $or: [
        { followerId, followingId: userId },
        { followerId: userId, followingId: followerId },
      ],
    });

    if (!remainingConnections) {
      await User.findByIdAndUpdate(followerId, {
        $pull: { contacts: userId },
      });
    }

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

// Get followers
export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const followers = await Follow.find({ followingId: userId })
      .populate('followerId', 'username email profile');

    res.json(followers.map((f) => f.followerId));
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
};

// Get following
export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const following = await Follow.find({ followerId: userId })
      .populate('followingId', 'username email profile');

    res.json(following.map((f) => f.followingId));
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
};

// Check if following
export const isFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    const follow = await Follow.findOne({ followerId, followingId: userId });
    res.json({ following: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
};
