import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiSearch, FiX, FiTrendingUp } from 'react-icons/fi';
import CreateStory from '../components/CreateStory';
import StoryCard from '../components/StoryCard';
import CommentItem from '../components/CommentItem';
import apiClient, { storySearchService } from '../services/apiService';

const DEBOUNCE_MS = 400;

const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeHashtag, setActiveHashtag] = useState(searchParams.get('hashtag') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<{ hashtag: string; count: number }[]>([]);
  const [showTrending, setShowTrending] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserId = localStorage.getItem('userId');

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/stories/feed');
      setStories(response.data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrending = useCallback(async () => {
    try {
      const res = await storySearchService.getTrendingHashtags();
      setTrendingHashtags(res.data);
    } catch {
      // non-critical
    }
  }, []);

  const runSearch = useCallback(async (q: string, hashtag: string) => {
    if (!q && !hashtag) {
      loadFeed();
      return;
    }
    try {
      setIsSearching(true);
      setLoading(true);
      const res = hashtag
        ? await storySearchService.searchByHashtag(hashtag)
        : await storySearchService.search(q);
      setStories(res.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [loadFeed]);

  useEffect(() => {
    loadFeed();
    loadTrending();
  }, [loadFeed, loadTrending]);

  // Sync URL params → state on mount
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const hashtag = searchParams.get('hashtag') || '';
    if (q || hashtag) {
      setSearchQuery(q);
      setActiveHashtag(hashtag);
      runSearch(q, hashtag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced text search
  useEffect(() => {
    if (activeHashtag) return; // hashtag search takes precedence
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(searchQuery, '');
      const params: Record<string, string> = {};
      if (searchQuery) params.q = searchQuery;
      setSearchParams(params, { replace: true });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, activeHashtag, runSearch, setSearchParams]);

  const handleHashtagClick = useCallback(
    (tag: string) => {
      setActiveHashtag(tag);
      setSearchQuery('');
      setSearchParams({ hashtag: tag }, { replace: true });
      runSearch('', tag);
      setSelectedStory(null);
    },
    [runSearch, setSearchParams]
  );

  const clearSearch = () => {
    setSearchQuery('');
    setActiveHashtag('');
    setSearchParams({}, { replace: true });
    loadFeed();
  };

  // ─── Story actions ─────────────────────────────────────────────────────────

  const handleCreateStory = async (content: string, image?: string, visibility?: string) => {
    try {
      await apiClient.post('/stories', { content, image, visibility: visibility || 'public' });
      setShowCreateStory(false);
      await loadFeed();
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  const handleLike = async (storyId: string) => {
    try {
      const response = await apiClient.post(`/stories/${storyId}/like`);
      setStories((prev) =>
        prev.map((s) =>
          s._id === storyId
            ? {
                ...s,
                likes: response.data.liked
                  ? [...(s.likes || []), currentUserId]
                  : s.likes?.filter((l: string) => l !== currentUserId) || [],
              }
            : s
        )
      );
      if (selectedStory?._id === storyId) {
        setSelectedStory((prev: any) => ({
          ...prev,
          likes: response.data.liked
            ? [...(prev.likes || []), currentUserId]
            : prev.likes?.filter((l: string) => l !== currentUserId) || [],
        }));
      }
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleAddComment = async (storyId: string) => {
    if (!commentText.trim()) return;

    try {
      setCommenting(true);
      const response = await apiClient.post(`/stories/${storyId}/comments`, {
        content: commentText,
      });

      setStories((prev) =>
        prev.map((s) =>
          s._id === storyId
            ? { ...s, comments: [...(s.comments || []), response.data] }
            : s
        )
      );
      setCommentText('');
      setSelectedStory((prev: any) => ({
        ...prev,
        comments: [...(prev?.comments || []), response.data],
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!window.confirm('Delete this story?')) return;

    try {
      await apiClient.delete(`/stories/${storyId}`);
      setStories((prev) => prev.filter((s) => s._id !== storyId));
      setSelectedStory(null);
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await apiClient.delete(`/stories/comments/${commentId}`);
      if (selectedStory) {
        setSelectedStory((prev: any) => ({
          ...prev,
          comments: prev.comments.filter((c: any) => c._id !== commentId),
        }));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const isFiltered = !!searchQuery || !!activeHashtag;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/chat')}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
              aria-label="Back"
            >
              <FiArrowLeft className="text-white text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-white">Feed</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowTrending((v) => !v);
                if (!showTrending) loadTrending();
              }}
              className={`p-2 rounded-lg transition ${
                showTrending ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
              title="Trending hashtags"
              aria-label="Trending hashtags"
            >
              <FiTrendingUp size={18} />
            </button>
            <button
              onClick={() => setShowCreateStory(!showCreateStory)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <FiPlus size={18} />
              New Story
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={activeHashtag ? `#${activeHashtag}` : searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('#')) {
                // user typed a hashtag directly
                const tag = val.slice(1);
                setActiveHashtag(tag);
                setSearchQuery('');
              } else {
                setActiveHashtag('');
                setSearchQuery(val);
              }
            }}
            placeholder="Search stories, #hashtags..."
            className="w-full pl-9 pr-10 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="Search stories"
          />
          {isFiltered && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              aria-label="Clear search"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Active filter badge */}
        {activeHashtag && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-400 text-xs">Filtering by:</span>
            <span className="px-2 py-0.5 bg-blue-600 bg-opacity-30 text-blue-400 text-xs rounded-full flex items-center gap-1">
              #{activeHashtag}
              <button onClick={clearSearch} aria-label="Remove hashtag filter">
                <FiX size={10} />
              </button>
            </span>
          </div>
        )}

        {/* Trending hashtags panel */}
        {showTrending && trendingHashtags.length > 0 && (
          <div className="mt-3 p-3 bg-gray-700 rounded-lg">
            <p className="text-gray-400 text-xs mb-2 font-medium">Trending (last 24h)</p>
            <div className="flex flex-wrap gap-1.5">
              {trendingHashtags.map(({ hashtag, count }) => (
                <button
                  key={hashtag}
                  onClick={() => {
                    handleHashtagClick(hashtag);
                    setShowTrending(false);
                  }}
                  className="px-2 py-1 bg-gray-600 hover:bg-blue-600 text-gray-200 text-xs rounded-full transition flex items-center gap-1"
                >
                  <span className="text-blue-400">#{hashtag}</span>
                  <span className="text-gray-400">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {/* Create Story */}
          {showCreateStory && (
            <CreateStory
              onSubmit={handleCreateStory}
              onCancel={() => setShowCreateStory(false)}
            />
          )}

          {/* Stories or Detail View */}
          {selectedStory ? (
            <div>
              <button
                onClick={() => setSelectedStory(null)}
                className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                ← Back to Feed
              </button>

              <StoryCard
                story={selectedStory}
                currentUserId={currentUserId || ''}
                onLike={handleLike}
                onDelete={handleDeleteStory}
                onHashtagClick={handleHashtagClick}
              />

              {/* Comments Section */}
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold mb-4">
                  Comments ({selectedStory.comments?.length || 0})
                </h3>

                <div className="mb-6 max-h-96 overflow-y-auto">
                  {selectedStory.comments && selectedStory.comments.length > 0 ? (
                    selectedStory.comments.map((comment: any) => (
                      <CommentItem
                        key={comment._id}
                        comment={comment}
                        currentUserId={currentUserId || ''}
                        onDelete={handleDeleteComment}
                      />
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No comments yet</p>
                  )}
                </div>

                <div className="flex gap-2 border-t border-gray-700 pt-4">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(selectedStory._id);
                      }
                    }}
                    placeholder="Add a comment... Use @mentions"
                    maxLength={300}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAddComment(selectedStory._id)}
                    disabled={commenting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 font-semibold"
                  >
                    {commenting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stories.length > 0 ? (
                <>
                  {isFiltered && (
                    <p className="text-gray-400 text-sm mb-3">
                      {isSearching ? 'Searching...' : `${stories.length} result${stories.length !== 1 ? 's' : ''}`}
                    </p>
                  )}
                  {stories.map((story) => (
                    <div
                      key={story._id}
                      onClick={() => setSelectedStory(story)}
                      className="cursor-pointer"
                    >
                      <StoryCard
                        story={story}
                        currentUserId={currentUserId || ''}
                        onLike={handleLike}
                        onDelete={handleDeleteStory}
                        onComment={() => setSelectedStory(story)}
                        onHashtagClick={handleHashtagClick}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  {isFiltered ? (
                    <div>
                      <p className="text-gray-400 mb-2">No stories found for this search.</p>
                      <button
                        onClick={clearSearch}
                        className="text-blue-400 hover:text-blue-300 text-sm transition"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400">No stories yet. Be the first to share!</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
