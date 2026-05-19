import React, { useState, useRef, useCallback } from 'react';
import { FiImage, FiSend, FiX, FiHash, FiAtSign } from 'react-icons/fi';
import { extractHashtags, extractMentions } from '../utils/helpers';

interface CreateStoryProps {
  onSubmit: (content: string, image?: string, visibility?: string) => Promise<void>;
  onCancel?: () => void;
}

const CreateStory: React.FC<CreateStoryProps> = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hashtags = extractHashtags(content);
  const mentions = extractMentions(content);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) {
      alert('Please add content or an image');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(content, image || undefined, visibility);
      setContent('');
      setImage(null);
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertTag = useCallback(
    (prefix: string) => {
      setContent((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + prefix);
    },
    []
  );

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
      <h3 className="text-white font-bold mb-4">Share Your Story</h3>

      {/* Image Preview */}
      {image && (
        <div className="relative mb-4 rounded-lg overflow-hidden">
          <img src={image} alt="Preview" className="w-full h-48 object-cover" />
          <button
            onClick={() => setImage(null)}
            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition"
            aria-label="Remove image"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Text Input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Use #hashtags and @mentions"
        maxLength={500}
        rows={3}
        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
      />

      {/* Live hashtag / mention preview */}
      {(hashtags.length > 0 || mentions.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-blue-600 bg-opacity-20 text-blue-400 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {mentions.map((m) => (
            <span
              key={m}
              className="px-2 py-0.5 bg-purple-600 bg-opacity-20 text-purple-400 text-xs rounded-full"
            >
              @{m}
            </span>
          ))}
        </div>
      )}

      {/* Character Count */}
      <p className="text-xs text-gray-400 mb-4">{content.length}/500 characters</p>

      {/* Visibility selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-400 text-xs">Visible to:</span>
        {(['public', 'followers', 'private'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVisibility(v)}
            className={`px-3 py-1 text-xs rounded-full transition capitalize ${
              visibility === v
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
          aria-label="Add image"
        >
          <FiImage size={16} />
          Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => insertTag('#')}
          className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-blue-400 rounded-lg transition text-sm"
          title="Insert hashtag"
          aria-label="Insert hashtag"
        >
          <FiHash size={14} />
          Tag
        </button>
        <button
          onClick={() => insertTag('@')}
          className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-purple-400 rounded-lg transition text-sm"
          title="Insert mention"
          aria-label="Insert mention"
        >
          <FiAtSign size={14} />
          Mention
        </button>
        <button
          onClick={() => onCancel?.()}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 font-semibold"
        >
          <FiSend size={16} />
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default CreateStory;
