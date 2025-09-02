/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from "react";;
import { apiService } from "../../services/apiService";
import { Loader2, RefreshCw } from "lucide-react";
import { ApiVideoFeedType, type VideoFeedItem } from "../../types/video";
import { formatThumbnailUrl } from "../../utils/thumbnail";
import VideoCard from "./VideoCard";

interface VideoFeedProps {
  feedType: ApiVideoFeedType;
  username?: string;
  communityId?: string;
  tag?: string;
  onVideoClick: (video: VideoFeedItem) => void;
  onAuthorClick: (author: string) => void;
}

const feedCache = new Map<string, VideoFeedItem[]>();

const VideoFeed = ({
  feedType,
  username,
  communityId,
  tag,
  onVideoClick,
  onAuthorClick,
}: VideoFeedProps) => {
  const [videos, setVideos] = useState<VideoFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const cacheKey = useMemo(() => {
    switch (feedType) {
      case ApiVideoFeedType.USER:
        return `user:${username || ""}`;
      case ApiVideoFeedType.COMMUNITY:
        return `community:${communityId || ""}`;
      case ApiVideoFeedType.TAG_FEED:
        return `tag:${tag || ""}`;
      default:
        return feedType;
    }
  }, [feedType, username, communityId, tag]);

  const convertToVideoItem = useCallback(
    async (video: any): Promise<VideoFeedItem | null> => {
      // Handle GQLVideoItem (from TAG_FEED)
      if (video.author?.username) {
        if (!video.permlink) return null;

        let spkvideoData = null;
        try {
          // spkvideo is a JSON string, so we need to parse it
          if (typeof video.spkvideo === 'string') {
            spkvideoData = JSON.parse(video.spkvideo);
          } else {
            spkvideoData = video.spkvideo;
          }
        } catch (e) {
          console.error("Error parsing spkvideo JSON", e);
        }

        const thumbnail = formatThumbnailUrl(spkvideoData?.thumbnail_url) || formatThumbnailUrl(video.json_metadata?.raw?.video?.info?.thumbnail);
        const duration = spkvideoData?.duration || video.json_metadata?.raw?.video?.info?.duration || 0;

        return {
          title: video.title || "Untitled",
          author: video.author.username,
          permlink: video.permlink,
          created: new Date(video.created_at),
          category:
            video.tags && video.tags.length > 0 ? video.tags[0] : "general",
          duration: duration,
          thumbnail: thumbnail,
          numOfUpvotes: video.stats?.num_votes,
          numOfComments: video.stats?.num_comments,
          hiveValue: video.stats?.total_hive_reward,
        };
      }

      // Handle ThreeSpeakVideo (from other REST feeds)
      if (video.owner) {
        return {
          title: video.title || "Untitled",
          author: video.owner,
          permlink: video.permlink || "",
          created: new Date(video.created || Date.now()),
          category: video.category || "general",
          duration: video.duration,
          thumbnail: formatThumbnailUrl(video.thumbnail),
        };
      }

      // If it's neither, it's an invalid item
      return null;
    },
    []
  );

  const fetchVideos = useCallback(
    async (currentSkip: number, refresh = false) => {
      try {
        let newVideos: any[] = []; // Can be GQLVideoItem or ThreeSpeakVideo
        switch (feedType) {
          case ApiVideoFeedType.SEARCH:
            if (tag) { // tag will be used as search term for search feed
              newVideos = await apiService.getSearchFeed(tag, currentSkip);
            }
            break;
          case ApiVideoFeedType.TAG_FEED:
            if (tag) {
              newVideos = await apiService.getTaggedVideos(tag, currentSkip);
            }
            break;
          case ApiVideoFeedType.HOME:
            newVideos = await apiService.getHomeVideos(currentSkip);
            break;
          case ApiVideoFeedType.TRENDING:
            newVideos = await apiService.getTrendingVideos(currentSkip);
            break;
          case ApiVideoFeedType.NEW_VIDEOS:
            newVideos = await apiService.getNewVideos(currentSkip);
            break;
          case ApiVideoFeedType.FIRST_UPLOADS:
            newVideos = await apiService.getFirstUploadsVideos(currentSkip);
            break;
          case ApiVideoFeedType.USER:
            if (username) {
              newVideos = await apiService.getUserVideos(username, currentSkip);
            }
            break;
          case ApiVideoFeedType.COMMUNITY:
            if (communityId) {
              newVideos = await apiService.getCommunityVideos(
                communityId,
                currentSkip
              );
            }
            break;
          case ApiVideoFeedType.RELATED:
            if (username) {
              newVideos = await apiService.getRelatedVideos(
                username,
                currentSkip
              );
            }
            break;
        }

        const convertedWithNulls = await Promise.all(
          newVideos.map(convertToVideoItem)
        );
        const converted = convertedWithNulls.filter(
          (item): item is VideoFeedItem => item !== null
        );

        if (refresh) {
          setVideos(converted);
          feedCache.set(cacheKey, converted);
        } else {
          setVideos((prev) => {
            const updated = [...prev, ...converted];
            feedCache.set(cacheKey, updated);
            return updated;
          });
        }

        setHasMore(newVideos.length >= 20);
        setSkip(currentSkip + newVideos.length);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
      }
    },
    [feedType, username, communityId, tag, cacheKey, convertToVideoItem]
  );

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setSkip(0);

      const cached = feedCache.get(cacheKey);
      if (cached?.length) {
        setVideos(cached);
        setLoading(false);
      }

      await fetchVideos(0, true);
      setLoading(false);
    };
    loadInitial();
  }, [cacheKey, fetchVideos]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchVideos(skip);
    setLoadingMore(false);
  }, [loadingMore, hasMore, skip, fetchVideos]);

  const refresh = useCallback(async () => {
    feedCache.delete(cacheKey);
    setLoading(true);
    setSkip(0);
    await fetchVideos(0, true);
    setLoading(false);
  }, [cacheKey, fetchVideos]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden animate-pulse"
        >
          <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16" />
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && videos.length === 0) return <LoadingSkeleton />;

  if (error && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load videos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={refresh} className="m-2 inline-flex items-center justify-center rounded-md border border-input text-gray-400 cursor-pointer bg-background p-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No videos found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Check back later for new content
          </p>
          <button onClick={refresh} className="m-2 inline-flex items-center justify-center rounded-md border border-input text-gray-400 cursor-pointer bg-background p-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh row */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
          {feedType.replace(/([A-Z])/g, " $1").toLowerCase()} Videos
        </h2>
        <button onClick={refresh} className="m-2 inline-flex items-center justify-center rounded-md border border-input text-gray-400 bg-background p-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <VideoCard
            key={`${video.author}-${video.permlink}-${index}`}
            video={video}
            onVideoClick={onVideoClick}
            onAuthorClick={onAuthorClick}
            // isGrid
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          {loadingMore ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading more videos...
            </div>
          ) : (
            <button onClick={loadMore} className="m-2 inline-flex items-center justify-center rounded-md border border-input text-gray-400 cursor-pointer bg-background p-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
            >
              Load More Videos
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
