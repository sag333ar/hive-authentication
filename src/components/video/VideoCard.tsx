import { useEffect, useState } from "react";
import type { VideoFeedItem } from "../../types/video";
import { ThumbsUp, MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiService } from "../../services/apiService";
import { formatThumbnailUrl } from "../../utils/thumbnail";

interface VideoCardProps {
  video: VideoFeedItem;
  onVideoClick: (video: VideoFeedItem) => void;
  onAuthorClick: (author: string) => void;
  // isGrid?: boolean;
}


const VideoCard = ({
  video,
  onVideoClick,
  onAuthorClick,
  // isGrid = false,
}: VideoCardProps) => {
  const [stats, setStats] = useState({
    numOfUpvotes: video.numOfUpvotes,
    numOfComments: video.numOfComments,
    hiveValue: video.hiveValue,
  });

  // Fetch real stats in background if not provided
  useEffect(() => {
    // const controller = new AbortController();
    if (stats.numOfUpvotes === undefined) {
      let isMounted = true;
      (async () => {
        try {
          const res = await apiService.getContentStats(
            video.author || "",
            video.permlink || ""
          );
          if (isMounted) {
            setStats(res);
          }
        } catch (e) {
          console.error("Error fetching content stats for VideoCard:", e);
        }
      })();
      return () => {
        isMounted = false;
      };
    }
    // return () => {
    //   controller.abort();
    // }
  }, [video.author, video.permlink, stats.numOfUpvotes]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    const totalSeconds = Math.floor(seconds);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, "0");

    if (totalSeconds < 60) return `00:${pad(secs)}`;
    if (hrs === 0) return `${pad(mins)}:${pad(secs)}`;
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const formatNumber = (num?: number) => {
    if (num == null) return "";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden"
        onClick={() => onVideoClick(video)}
      >
        <img
          src={
            formatThumbnailUrl(video.thumbnail) ||
            `https://picsum.photos/400/225?random=${video.permlink}`
          }
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Duration overlay */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-blue-600 dark:bg-blue-500 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <svg
              className="w-6 h-6 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3
          className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
          onClick={() => onVideoClick(video)}
        >
          {video.title}
        </h3>

        {/* Author */}
        {/* Author Row with CreatedAt on the right */}
        <div className="flex items-center justify-between">
          {/* Author */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => onAuthorClick(video.author)}
          >
            <img
              src={`https://images.hive.blog/u/${video.author}/avatar`}
              alt={video.author}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${video.author}&background=random`;
              }}
            />
            <span className="font-medium text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              @{video.author}
            </span>
          </div>

          {/* Created At */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(video.created, { addSuffix: true })}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            {stats.numOfUpvotes != null && (
              <div className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                <ThumbsUp className="w-4 h-4" />
                <span>{formatNumber(stats.numOfUpvotes)}</span>
              </div>
            )}
            {stats.numOfComments != null && (
              <div className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>{formatNumber(stats.numOfComments)}</span>
              </div>
            )}
          </div>

          {stats.hiveValue != null && (
            <div className="text-blue-600 dark:text-blue-400 font-medium">
              ${stats.hiveValue.toFixed(3)}
            </div>
          )}
        </div>

        {/* Category */}
        {video.category && (
          <div className="flex items-center gap-2">
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
              {video.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
