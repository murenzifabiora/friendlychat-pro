import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { userService, followService } from '../services/apiService';
import StoryCard from './StoryCard';

const UserProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [userRes, followRes, followersRes, followingRes] = await Promise.all([
        userService.getUser(userId!),
        followService.isFollowing(userId!),
        followService.getFollowers(userId!),
        followService.getFollowing(userId!),
      ]);

      setProfile(userRes.data);
      setIsFollowing(followRes.data.following);
      setFollowers(followersRes.data.length);
      setFollowing(followingRes.data.length);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId!);
      } else {
        await followService.followUser(userId!);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-700 rounded-lg transition"
        >
          <FiArrowLeft className="text-white text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-white ml-4">{profile.username}</h1>
      </div>

      {/* Profile Info */}
      <div className="bg-gray-800 border-b border-gray-700 p-8">
        <div className="max-w-2xl mx-auto flex items-start gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.profile?.avatar ? (
              <img
                src={profile.profile.avatar}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-6xl font-bold">{profile.username[0]?.toUpperCase()}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition font-semibold ${
                    isFollowing
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <FiUserMinus size={16} />
                      Following
                    </>
                  ) : (
                    <>
                      <FiUserPlus size={16} />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-gray-400 mb-4">{profile.email}</p>
            <p className="text-gray-300 mb-4">{profile.profile?.bio || 'No bio yet'}</p>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-white">{followers}</p>
                <p className="text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{following}</p>
                <p className="text-gray-400">Following</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stories.length}</p>
                <p className="text-gray-400">Stories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          {stories.length > 0 ? (
            <>
              <h3 className="text-white font-bold text-xl mb-4">Stories</h3>
              {stories.map((story) => (
                <StoryCard
                  key={story._id}
                  story={story}
                  currentUserId={currentUserId || ''}
                />
              ))}
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">No stories yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
