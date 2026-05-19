import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare, FiTrash2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { parseContentSegments } from '../utils/helpers';

interface StoryCardProps {
  story: any;
  currentUserId: string;
  onComment?: (storyId: string) => void;
  onLike?: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
}

/** Renders story content with clickable #hashtags and @mentions */
const RichContent: React.FC<{
  text: string;
  onHashtagClick?: (tag: string) => void;
  onMentionClick?: (username: string) => void;
}> = ({ text, onHashtagClick, onMentionClick }) => {
  const segments = parseContentSegments(text);

  return (
    <p className="text-gray-100 mb-4 leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.type === 'hashtag') {
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onHashtagClick?.(seg.value.slice(1));
              }}
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              {seg.value}
            </button>
          );
        }
        if (seg.type === 'mention') {
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onMentionClick?.(seg.value.slice(1));
              }}
              className="text-purple-400 hover:text-purple-300 font-medium transition"
            >
              {seg.value}
            </button>
          );
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </p>
  );
};

const StoryCard: React.FC<StoryCardProps> = ({
  story,
  currentUserId,
  onComment,
  onLike,
  onDelete,
  onHashtagClick,
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likes?.length || 0);

  useEffect(() => {
    setLiked(story.likes?.includes(currentUserId) || false);
    setLikeCount(story.likes?.length || 0);
  }, [story.likes, currentUserId]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(story._id);
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  const handleMentionClick = (username: string) => {
    // Navigate to user profile by username — requires a lookup; for now open search
    // If you have a username→id mapping, navigate to /user/:id
    navigate(`/feed?mention=${username}`);
  };

  const isOwner = story.userId?._id === currentUserId;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-4 border border-gray-700 hover:border-blue-500 transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {story.userId?.profile?.avatar ? (
              <img
                src={story.userId.profile.avatar}
                alt={story.userId.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold">
                {story.userId?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-white font-semibold">{story.userId?.username}</p>
            <p className="text-gray-400 text-xs">
              {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(story._id);
            }}
            className="p-2 hover:bg-red-600 hover:bg-opacity-20 rounded-lg transition text-red-500"
            title="Delete story"
            aria-label="Delete story"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>

      {/* Image */}
      {story.image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={story.image} alt="Story" className="w-full h-64 object-cover" />
        </div>
      )}

      {/* Rich content */}
      {story.content && (
        <RichContent
          text={story.content}
          onHashtagClick={onHashtagClick}
          onMentionClick={handleMentionClick}
        />
      )}

      {/* Hashtag pills */}
      {story.hashtags && story.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {story.hashtags.map((tag: string) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onHashtagClick?.(tag);
              }}
              className="px-2 py-0.5 bg-blue-600 bg-opacity-20 text-blue-400 text-xs rounded-full hover:bg-opacity-40 transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400 border-b border-gray-700 pb-4">
        <span>{likeCount} Likes</span>
        <span>{story.comments?.length || 0} Comments</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            liked ? 'bg-red-600 bg-opacity-20 text-red-500' : 'text-gray-400 hover:bg-gray-700'
          }`}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {liked ? <FaHeart size={16} /> : <FiHeart size={16} />}
          Like
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComment && onComment(story._id);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition"
          aria-label="Comment"
        >
          <FiMessageCircle size={16} />
          Comment
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({ title: 'Story', text: story.content });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition"
          aria-label="Share"
        >
          <FiShare size={16} />
          Share
        </button>
      </div>
    </div>
  );
};

export default StoryCard;
