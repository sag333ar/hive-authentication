import React, { useEffect, useState, type JSX } from "react";
import {
  FaWallet,
  FaMoneyBill,
  FaPiggyBank,
  FaCoins,
  FaBolt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useWalletStore } from "../store/walletStore";

interface WalletProps {
  username?: string;
  backgroundColors?: string[];
  fontColor?: string;
  cardColor?: string;
  balanceColor?: string;
  hbdColor?: string;
  savingsColor?: string;
  savingsHbdColor?: string;
  powerColor?: string;
  estimatedValueColor?: string;
  errorColor?: string;
}

export const Wallet: React.FC<WalletProps> = ({
  username,
  backgroundColors,
  fontColor,
  cardColor,
  balanceColor,
  hbdColor,
  savingsColor,
  savingsHbdColor,
  powerColor,
  estimatedValueColor,
  errorColor,
}) => {
  const { walletData, fetchWalletData, isLoading, error } = useWalletStore();

  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Fetch wallet data
  useEffect(() => {
    if (username) fetchWalletData(username);
  }, [username, fetchWalletData]);

  const bgColors =
    backgroundColors ?? (isDarkMode ? ["#121212", "#23272F"] : ["#f5f5f5", "#ffffff"]);
  const textColor = fontColor ?? (isDarkMode ? "#fff" : "#000");
  const cardBgColor = cardColor ?? (isDarkMode ? "#2c2c2c" : "#fff");

  const tileColors = {
    balance: balanceColor ?? "#90cdf4",
    hbd: hbdColor ?? "#9ae6b4",
    savings: savingsColor ?? "#fbd38d",
    savingsHbd: savingsHbdColor ?? "#d6bcfa",
    power: powerColor ?? "#f6ad55",
    estimatedValue: estimatedValueColor ?? "#3182ce",
    error: errorColor ?? "#fed7d7",
  };

  // Single tile component
  const WalletTile: React.FC<{ label: string; value?: string; icon?: JSX.Element; color?: string }> =
    ({ label, value, icon, color }) => (
      <div
        className="flex items-center justify-between p-4 rounded-lg shadow mb-3 transition-colors"
        style={{ backgroundColor: cardBgColor, color: textColor }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="p-2 rounded-full flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
          )}
          <span className="font-semibold">{label}</span>
        </div>
        <span className="font-medium">{value ?? "-"}</span>
      </div>
    );

  return (
    <div
      className="min-h-screen p-4 transition-colors"
      style={{
        background: `linear-gradient(to bottom right, ${bgColors[0]}, ${bgColors[1]})`,
        color: textColor,
      }}
    >
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div
          className="flex flex-col items-center p-6 mb-6 rounded-lg shadow"
          style={{ backgroundColor: cardBgColor }}
        >
          {username && (
            <img
              src={`https://images.hive.blog/u/${username}/avatar`}
              alt={`${username} avatar`}
              className="w-20 h-20 rounded-full border-4 border-gray-300 dark:border-gray-600 mb-3"
            />
          )}
          <div className="text-lg font-bold">{username}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Hive Wallet Overview
          </div>
        </div>
        <div
          className="text-center rounded-lg shadow p-6 mb-6 transition-colors"
          style={{ backgroundColor: cardBgColor }}
        >
          <div className="text-sm font-semibold">Estimated Value</div>
          <div
            className="text-3xl font-bold mt-2"
            style={{ color: tileColors.estimatedValue }}
          >
            {isLoading ? "Loading..." : walletData?.estimated_value ?? "-"}
          </div>
        </div>

        {isLoading && <div className="text-center mb-4">Fetching wallet data...</div>}

        {error && (
          <div
            className="flex items-center p-3 rounded mb-4"
            style={{ backgroundColor: tileColors.error, color: "#a00" }}
          >
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        <WalletTile
          label="Balance"
          value={walletData?.balance}
          icon={<FaWallet />}
          color={tileColors.balance}
        />
        <WalletTile
          label="HBD Balance"
          value={walletData?.hbd_balance}
          icon={<FaMoneyBill />}
          color={tileColors.hbd}
        />
        <WalletTile
          label="Savings Balance"
          value={walletData?.savings_balance}
          icon={<FaPiggyBank />}
          color={tileColors.savings}
        />
        <WalletTile
          label="Savings HBD Balance"
          value={walletData?.savings_hbd_balance}
          icon={<FaCoins />}
          color={tileColors.savingsHbd}
        />
        <WalletTile
          label="Hive Power"
          value={walletData?.hive_power}
          icon={<FaBolt />}
          color={tileColors.power}
        />
      </div>
    </div>
  );
};
