import React, { useState, useEffect } from 'react';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

interface CommentProps {
  comment: any;
  currentUserId: string;
  onDelete?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
}

const CommentItem: React.FC<CommentProps> = ({ comment, currentUserId, onDelete, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);

  useEffect(() => {
    setLiked(comment.likes?.includes(currentUserId) || false);
  }, [comment.likes, currentUserId]);

  const handleLike = () => {
    if (onLike) {
      onLike(comment._id);
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  const isOwner = comment.userId?._id === currentUserId;

  return (
    <div className="bg-gray-750 p-4 rounded-lg mb-2 border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center flex-shrink-0">
            {comment.userId?.profile?.avatar ? (
              <img src={comment.userId.profile.avatar} alt={comment.userId.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{comment.userId?.username?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{comment.userId?.username}</p>
            <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs transition ${
                  liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                {liked ? <FaHeart size={12} /> : <FiHeart size={12} />}
                {likeCount}
              </button>
              <p className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete && onDelete(comment._id)}
            className="p-1 hover:text-red-500 text-gray-400 transition"
            title="Delete comment"
          >
            <FiTrash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
