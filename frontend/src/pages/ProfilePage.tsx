import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiCheck, FiX, FiCamera } from 'react-icons/fi';
import { userService } from '../services/apiService';

const STATUS_OPTIONS = ['online', 'away', 'offline'] as const;

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ bio: '', status: 'online' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.data);
      setFormData({
        bio: response.data.profile?.bio || '',
        status: response.data.profile?.status || 'online',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const updateData: any = { bio: formData.bio };
      if (profile?.profile?.avatar) {
        updateData.avatar = profile.profile.avatar;
      }
      await userService.updateProfile(updateData);
      await userService.updateStatus(formData.status);
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setProfile((prev: any) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: base64String,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const statusColor = (s: string) => {
    if (s === 'online') return 'bg-green-500';
    if (s === 'away') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-secondary">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center">
        <button
          onClick={() => navigate('/chat')}
          className="mr-4 p-2 hover:bg-gray-700 rounded-lg transition"
          aria-label="Back"
        >
          <FiArrowLeft className="text-white text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-8 overflow-y-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div 
                className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:opacity-80 transition"
                onClick={triggerFileInput}
              >
                {profile.profile?.avatar ? (
                  <img
                    src={profile.profile.avatar}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-5xl font-bold">
                    {profile.username[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              {/* Camera icon overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                onClick={triggerFileInput}
              >
                <FiCamera className="text-white text-2xl" />
              </div>
              {/* Status dot */}
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${statusColor(
                  profile.profile?.status
                )}`}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              aria-label="Upload profile picture"
            />
            <h2 className="text-2xl font-bold text-white mt-4">{profile.username}</h2>
            <p className="text-gray-400 text-sm">{profile.email}</p>
          </div>

          {/* Info / Edit */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData((p) => ({ ...p, status: s }))}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        formData.status === s
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusColor(s)}`} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  <FiCheck size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
                >
                  <FiX size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Bio</p>
                <p className="text-white">
                  {profile.profile?.bio || (
                    <span className="text-gray-500 italic">No bio yet</span>
                  )}
                </p>
              </div>

              <div className="bg-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${statusColor(profile.profile?.status)}`} />
                  <span className="text-white capitalize">
                    {profile.profile?.status || 'offline'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Member Since</p>
                <p className="text-white">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
              >
                <FiEdit2 size={16} />
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
