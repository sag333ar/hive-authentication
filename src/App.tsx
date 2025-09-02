import { useEffect, useState } from "react";
import { AuthButton } from "./components/AuthButton";
import { useAuthStore } from "./store/authStore";
import type { HiveAuthResult, LoggedInUser } from "./types/auth";

import "./App.css";
import { ApiVideoFeedType, type VideoFeedItem } from "./types/video";
import VideoFeed from "./components/video/VideoFeed";

function App() {
  const { currentUser, loggedInUsers } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<ApiVideoFeedType>(ApiVideoFeedType.HOME);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    let previousUser = currentUser;

    const unsubscribe = useAuthStore.subscribe((state) => {
      const currentUser = state.currentUser;

      if (currentUser && !previousUser) {
        console.log("User logged in:", currentUser);
      } else if (!currentUser && previousUser) {
        console.log("User logged out:", previousUser);
      } else if (
        currentUser &&
        previousUser &&
        currentUser.username !== previousUser.username
      ) {
        console.log("User switched to:", currentUser);
      }

      previousUser = currentUser;
    });

    return unsubscribe;
  }, [currentUser]);

  const handleAuthenticate = async (hiveResult: HiveAuthResult): Promise<string> => {
    console.log("Hive authentication result:", hiveResult);

    try {
      const response = await fetch("https://beta-api.distriator.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challenge: hiveResult.challenge,
          username: hiveResult.username,
          pubkey: hiveResult.publicKey,
          proof: hiveResult.proof,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Server response:", data);

      return JSON.stringify(data);
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  };

  const handleVideoClick = (video: VideoFeedItem) => {
    console.log("Video clicked:", video.permlink, video.author);
  };

  const handleAuthorClick = (author: string) => {
    console.log("Author clicked:", author);
  };

  const renderFeed = () => {
    switch (selectedTab) {
      case ApiVideoFeedType.USER:
        return (
          currentUser && (
            <VideoFeed
              feedType={ApiVideoFeedType.USER}
              username={currentUser.username}
              onVideoClick={handleVideoClick}
              onAuthorClick={handleAuthorClick}
            />
          )
        );
      case ApiVideoFeedType.HOME:
        return (
          <VideoFeed feedType={ApiVideoFeedType.HOME} onVideoClick={handleVideoClick} onAuthorClick={handleAuthorClick} />
        );
      case ApiVideoFeedType.TRENDING:
        return (
          <VideoFeed feedType={ApiVideoFeedType.TRENDING} onVideoClick={handleVideoClick} onAuthorClick={handleAuthorClick} />
        );
      case ApiVideoFeedType.NEW_VIDEOS:
        return (
          <VideoFeed feedType={ApiVideoFeedType.NEW_VIDEOS} onVideoClick={handleVideoClick} onAuthorClick={handleAuthorClick} />
        );
      case ApiVideoFeedType.FIRST_UPLOADS:
        return (
          <VideoFeed feedType={ApiVideoFeedType.FIRST_UPLOADS} onVideoClick={handleVideoClick} onAuthorClick={handleAuthorClick} />
        );
      case ApiVideoFeedType.COMMUNITY:
        return (
          <VideoFeed feedType={ApiVideoFeedType.COMMUNITY} communityId={'hive-163772'} onVideoClick={handleVideoClick} onAuthorClick={handleAuthorClick} />
        );
      case ApiVideoFeedType.RELATED:
        return (
          <VideoFeed feedType={ApiVideoFeedType.RELATED} onVideoClick={handleVideoClick} username={'viviana.fitness'} onAuthorClick={handleAuthorClick} />
        );
      case ApiVideoFeedType.TAG_FEED:
        return (
          <VideoFeed feedType={ApiVideoFeedType.TAG_FEED} tag={'neoxian'} onVideoClick={handleVideoClick} onAuthorClick={handleAuthorClick} />
        );
      case ApiVideoFeedType.SEARCH:
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery.length >= 4 ? (
              <VideoFeed
                feedType={ApiVideoFeedType.SEARCH}
                tag={searchQuery}
                onVideoClick={handleVideoClick}
                onAuthorClick={handleAuthorClick}
              />
            ) : (
              <p className="text-gray-500">Type at least 4 characters to search...</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Auth Section */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl">Hive Authentication Demo</h2>
            <p className="text-base-content/70">
              This is a demo of the Hive Authentication package with a working API integration.
            </p>
            <div className="card-actions justify-center mt-4">
              <AuthButton
                onAuthenticate={handleAuthenticate}
                hiveauth={{
                  name: "Hive Authentication Demo",
                  description: "A demo app for testing Hive authentication",
                }}
                hivesigner={{
                  app: "hive-auth-demo.app",
                  callbackURL: window.location.origin + "/hivesigner.html",
                  scope: ["login", "vote"],
                }}
              />
            </div>
          </div>
        </div>

        {/* Current User Info */}
        {currentUser && (
          <div className="card bg-green-50 border border-green-200 mb-6">
            <div className="card-body">
              <h3 className="card-title text-green-800">Currently Logged In</h3>
              <div className="space-y-2 text-green-700">
                <p>
                  <strong>Username:</strong> {currentUser.username}
                </p>
                <p>
                  <strong>Provider:</strong> {currentUser.provider}
                </p>
                <p>
                  <strong>Public Key:</strong> {currentUser.publicKey.substring(0, 20)}...
                </p>
                <p>
                  <strong>Server Response:</strong> {currentUser.serverResponse.substring(0, 20)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logged In Users */}
        {loggedInUsers.length > 0 && (
          <div className="card bg-blue-50 border border-blue-200 mb-6">
            <div className="card-body">
              <h3 className="card-title text-blue-800">
                All Logged In Users ({loggedInUsers.length})
              </h3>
              <div className="space-y-2">
                {loggedInUsers.map((user: LoggedInUser) => (
                  <div key={user.username} className="text-blue-700 flex items-center gap-2">
                    <span>•</span>
                    <span>{user.username}</span>
                    <span className="text-blue-500">({user.provider})</span>
                    {currentUser?.username === user.username && (
                      <span className="badge badge-primary badge-sm">Current</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feed Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.values(ApiVideoFeedType).map((feed) => (
            <button
              key={feed}
              onClick={() => setSelectedTab(feed)}
              className={`px-4 py-2 rounded-lg ${selectedTab === feed
                ? "bg-primary text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-500"
                }`}
            >
              {feed.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        
      </div>
        {/* Render Feeds */}
        <div>
          <h3 className="text-4xl">Video Feeds</h3>
          {renderFeed()}
        </div>
    </div>
  );
}

export default App;
