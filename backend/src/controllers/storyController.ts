import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Story from '../models/Story';
import Comment from '../models/Comment';
import User from '../models/User';
import { extractHashtags, extractMentionUsernames } from '../utils/helpers';
import { createNotification } from '../services/notificationService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const populateStory = (query: any) =>
  query
    .populate('userId', 'username profile email')
    .populate({
      path: 'comments',
      populate: { path: 'userId', select: 'username profile' },
    })
    .populate('mentions', 'username profile');

// ─── Create a story ──────────────────────────────────────────────────────────

export const createStory = async (req: AuthRequest, res: Response) => {
  try {
    const { content, image, visibility } = req.body;
    const userId = req.userId!;

    if (!content && !image) {
      return res.status(400).json({ error: 'Story must have content or image' });
    }

    // Parse hashtags and mentions from content
    const hashtags = content ? extractHashtags(content) : [];
    const mentionUsernames = content ? extractMentionUsernames(content) : [];

    // Resolve @mention usernames → user IDs
    const mentionedUsers = mentionUsernames.length
      ? await User.find({ username: { $in: mentionUsernames } }).select('_id')
      : [];
    const mentionIds = mentionedUsers.map((u) => u._id);

    const story = new Story({
      userId,
      content,
      image,
      visibility: visibility || 'public',
      hashtags,
      mentions: mentionIds,
    });

    await story.save();
    await populateStory(Story.findById(story._id)).then(async (populated) => {
      // Send mention notifications
      for (const mentionedUser of mentionedUsers) {
        await createNotification({
          userId: mentionedUser._id.toString(),
          actorId: userId,
          type: 'mention',
          storyId: story._id.toString(),
        });
      }
    });

    const populated = await populateStory(Story.findById(story._id));
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
};

// ─── Get feed ────────────────────────────────────────────────────────────────

export const getFeed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId);

    const stories = await populateStory(
      Story.find({
        $or: [
          { userId },
          { userId: { $in: user?.contacts || [] }, visibility: { $in: ['public', 'followers'] } },
          { visibility: 'public' },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(50)
    );

    res.json(stories);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
};

// ─── Search stories ──────────────────────────────────────────────────────────

export const searchStories = async (req: AuthRequest, res: Response) => {
  try {
    const { q, hashtag } = req.query as { q?: string; hashtag?: string };

    if (!q && !hashtag) {
      return res.status(400).json({ error: 'Provide a search query (q) or hashtag' });
    }

    const filter: any = { visibility: 'public' };

    if (hashtag) {
      filter.hashtags = hashtag.toLowerCase().replace(/^#/, '');
    } else if (q) {
      filter.$text = { $search: q };
    }

    const stories = await populateStory(
      Story.find(filter).sort({ createdAt: -1 }).limit(30)
    );

    res.json(stories);
  } catch (error) {
    console.error('Error searching stories:', error);
    res.status(500).json({ error: 'Failed to search stories' });
  }
};

// ─── Get trending hashtags ────────────────────────────────────────────────────

export const getTrendingHashtags = async (req: AuthRequest, res: Response) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24 h

    const result = await Story.aggregate([
      { $match: { createdAt: { $gte: since }, visibility: 'public' } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, hashtag: '$_id', count: 1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    res.status(500).json({ error: 'Failed to fetch trending hashtags' });
  }
};

// ─── Get user's stories ───────────────────────────────────────────────────────

export const getUserStories = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const stories = await populateStory(
      Story.find({ userId }).sort({ createdAt: -1 })
    );

    res.json(stories);
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ error: 'Failed to fetch user stories' });
  }
};

// ─── Like a story ─────────────────────────────────────────────────────────────

export const likeStory = async (req: AuthRequest, res: Response) => {
  try {
    const { storyId } = req.params;
    const userId = req.userId!;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const likeIndex = story.likes.indexOf(userId as any);
    const isLiking = likeIndex === -1;

    if (isLiking) {
      story.likes.push(userId as any);
    } else {
      story.likes.splice(likeIndex, 1);
    }

    await story.save();

    // Send notification to story owner when someone likes (not when unliking)
    if (isLiking) {
      await createNotification({
        userId: story.userId.toString(),
        actorId: userId,
        type: 'like',
        storyId: storyId,
      });
    }

    res.json({ likes: story.likes.length, liked: isLiking });
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ error: 'Failed to like story' });
  }
};

// ─── Add comment ──────────────────────────────────────────────────────────────

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { storyId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const comment = new Comment({
      userId,
      storyId,
      content,
    });

    await comment.save();
    await comment.populate('userId', 'username profile');

    // Add comment reference to story
    const story = await Story.findByIdAndUpdate(
      storyId,
      { $push: { comments: comment._id } },
      { new: true }
    );

    if (story) {
      // Notify story owner about the comment
      await createNotification({
        userId: story.userId.toString(),
        actorId: userId,
        type: 'comment',
        storyId: storyId,
        commentId: comment._id.toString(),
      });

      // Notify any @mentioned users in the comment
      const mentionUsernames = extractMentionUsernames(content);
      if (mentionUsernames.length) {
        const mentionedUsers = await User.find({
          username: { $in: mentionUsernames },
        }).select('_id');

        for (const mentionedUser of mentionedUsers) {
          await createNotification({
            userId: mentionedUser._id.toString(),
            actorId: userId,
            type: 'mention',
            storyId: storyId,
            commentId: comment._id.toString(),
          });
        }
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// ─── Delete comment ───────────────────────────────────────────────────────────

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId!;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Comment.deleteOne({ _id: commentId });
    await Story.findByIdAndUpdate(comment.storyId, { $pull: { comments: commentId } });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// ─── Like a comment ───────────────────────────────────────────────────────────

export const likeComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId!;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(userId as any);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId as any);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
};

// ─── Delete story ─────────────────────────────────────────────────────────────

export const deleteStory = async (req: AuthRequest, res: Response) => {
  try {
    const { storyId } = req.params;
    const userId = req.userId!;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (story.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Story.deleteOne({ _id: storyId });
    await Comment.deleteMany({ storyId });

    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
};
