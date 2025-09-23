import React, { useEffect, useState } from "react";
import hiveInboxLogo from "../assets/hive_inbox_logo.png";
import hiveStatsLogo from "../assets/hive-stats.png";
import donateLogo from "../assets/donate_logo.png";
import hifindLogo from "../assets/hifind_logo.png";
import voteLogo from "../assets/vote_logo.png";

export type BottomBarItem = {
  imagePath: string;
  label: string;
  url: string;
  isNetwork?: boolean;
};

interface BottomToolbarWithSliderProps {
  backgroundColor?: string;
  items?: BottomBarItem[];
  username?: string;
  autoSlideInterval?: number;
}

export const BottomToolbarWithSlider: React.FC<BottomToolbarWithSliderProps> = ({
  backgroundColor = "#3C3C3C",
  items: customItems,
  username = "sagarkothari88",
  autoSlideInterval = 2000,
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const avatarUrl = `https://images.hive.blog/u/${username}/avatar`;

  const defaultItems: BottomBarItem[] = [
    {
      imagePath: avatarUrl,
      label: "Vote",
      url: `https://witness.the-hive-mobile.app/#/witnesses/@${username}`,
      isNetwork: true,
    },
    { imagePath: hiveInboxLogo, label: "hReplier", url: "https://hreplier.sagarkothari88.one" },
    { imagePath: hiveStatsLogo, label: "Stats", url: "https://stats.the-hive-mobile.app" },
    { imagePath: donateLogo, label: "Donate", url: "https://donate.the-hive-mobile.app" },
    { imagePath: hifindLogo, label: "HiFind", url: "https://hifind.the-hive-mobile.app" },
    { imagePath: voteLogo, label: "Witness", url: "https://witness.the-hive-mobile.app" },
  ];

  const items = customItems || defaultItems;

  // Auto slider logic
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedIndex((prev) => (prev + 1) % items.length);
    }, autoSlideInterval);
    return () => clearInterval(interval);
  }, [items.length, autoSlideInterval]);

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
                  loading="lazy"
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
