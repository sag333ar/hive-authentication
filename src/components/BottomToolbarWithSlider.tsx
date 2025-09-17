import React, { useEffect, useState } from "react";

type BottomBarItem = {
  imagePath: string;
  label: string;
  url: string;
  isNetwork?: boolean;
};

interface BottomToolbarWithSliderProps {
  backgroundColor?: string;
}

export const BottomToolbarWithSlider: React.FC<BottomToolbarWithSliderProps> = ({
  backgroundColor = "#3C3C3C",
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const username = "sagarkothari88";
  const avatarUrl = `https://images.hive.blog/u/${username}/avatar?${Date.now()}`;

  const items: BottomBarItem[] = [
    { imagePath: avatarUrl, label: "Vote", url: "https://witness.the-hive-mobile.app/#/witnesses/@sagarkothari88", isNetwork: true },
    { imagePath: "/images/hive_inbox_logo.png", label: "Inbox", url: "https://inbox.the-hive-mobile.app" },
    { imagePath: "/images/hive-stats.png", label: "Stats", url: "https://stats.the-hive-mobile.app" },
    { imagePath: "/images/donate_logo.png", label: "Donate", url: "https://donate.the-hive-mobile.app" },
    { imagePath: "/images/hifind_logo.png", label: "HiFind", url: "https://hifind.the-hive-mobile.app" },
    { imagePath: "/images/vote_logo.png", label: "Witness", url: "https://witness.the-hive-mobile.app" },
  ];

  // Auto slider logic
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedIndex((prev) => (prev + 1) % items.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [items.length]);

  const launchUrl = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div
      className="h-16 flex justify-center items-center overflow-x-auto shadow-[0_-2px_8px_rgba(0,0,0,0.15)] px-3"
      style={{ backgroundColor }}
    >
      <div className="flex items-center space-x-3">
        {items.map((item, i) => {
          const isActive = i === highlightedIndex;

          return (
            <div
              key={i}
              onClick={() => launchUrl(item.url)}
              className={`flex flex-col items-center cursor-pointer rounded-lg px-1 py-0.5 transition-all duration-300 ${isActive ? "bg-white/15 scale-105" : "scale-90"
                }`}
            >
              {/* Circle Icon */}
              <div
                className={`rounded-full bg-white overflow-hidden flex justify-center items-center w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 ${isActive ? "scale-110" : "scale-90"
                  }`}
              >
                <img
                  src={item.imagePath}
                  alt={item.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/32?text=?";
                  }}
                />
              </div>

              {/* Label only if active */}
              {isActive && (
                <span className="mt-1 text-[9px] sm:text-[11px] font-semibold text-white text-center truncate w-12 sm:w-16">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
