/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { WalletStore, WalletData } from "../types/wallet";
import * as dhive from "@hiveio/dhive";
const dhiveClient = new dhive.Client(["https://api.hive.blog"]);

// ------------------- Wallet Helpers -------------------
const getWalletDataDetail = async (username: string) => {
  try {
    const accounts = await dhiveClient.database.getAccounts([username]);
    if (!accounts || accounts.length === 0)
      throw new Error("Account not found");
    return accounts[0];
  } catch (error) {
    console.error("Error in getWalletDataDetail:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

const convertVestingSharesToHiveData = async (vestingShares: string) => {
  try {
    const props = await dhiveClient.database.getDynamicGlobalProperties();
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    const totalVestingShares = parseFloat(
      String(props.total_vesting_shares).split(" ")[0]
    );
    const totalVestingFundHive = parseFloat(
      String(props.total_vesting_fund_hive).split(" ")[0]
    );
    return ((vestingSharesFloat * totalVestingFundHive) / totalVestingShares).toFixed(3);
  } catch (error) {
    console.error("Error in convertVestingSharesToHiveData:", error);
    return "0";
  }
};

const convertHivetoUSDData = async (hiveAmount: string | number) => {
  try {
    const feedHistory = await dhiveClient.database.call("get_feed_history", []);
    const currentMedian = feedHistory.current_median_history;
    const baseAmount = parseFloat(currentMedian.base.split(" ")[0]);
    const hiveAmountFloat =
      typeof hiveAmount === "string" ? parseFloat(hiveAmount) : hiveAmount;
    return (baseAmount * hiveAmountFloat).toFixed(2);
  } catch (error) {
    console.error("Error in convertHivetoUSDData:", error);
    return "0";
  }
};

// ------------------- WalletStore -------------------
export const useWalletStore = create<WalletStore>((set) => ({
  walletData: null,
  isLoading: false,
  error: null,

  setWalletData: (data) => set({ walletData: data }),

  clearWalletData: () => set({ walletData: null, error: null }),

  fetchWalletData: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const account = await getWalletDataDetail(username);

      // Type guard for error object
      const isErrorAccount = (obj: any): obj is { error: string } =>
        "error" in obj;

      if (!account || isErrorAccount(account)) {
        throw new Error(account?.error || "Account not found");
      }

      // Convert Asset objects to string if necessary
      const vestingShares =
        typeof account.vesting_shares === "string"
          ? account.vesting_shares
          : "0.000000 VESTS";
      const balance =
        typeof account.balance === "string"
          ? account.balance
          : account.balance.toString();
      const hbdBalance =
        typeof account.hbd_balance === "string"
          ? account.hbd_balance
          : account.hbd_balance.toString();
      const savingsBalance =
        typeof account.savings_balance === "string"
          ? account.savings_balance
          : account.savings_balance.toString();
      const savingsHbdBalance =
        typeof account.savings_hbd_balance === "string"
          ? account.savings_hbd_balance
          : account.savings_hbd_balance.toString();

      const hivePower = await convertVestingSharesToHiveData(vestingShares);

      const liquidHive = parseFloat(balance.split(" ")[0] || "0");
      const stakedHive = parseFloat(hivePower);
      const totalHive = (liquidHive + stakedHive).toFixed(3);

      const estimatedHiveUSD = await convertHivetoUSDData(totalHive);

      const walletData: WalletData = {
        balance,
        hbd_balance: hbdBalance,
        savings_balance: savingsBalance,
        savings_hbd_balance: savingsHbdBalance,
        hive_power: `${hivePower} HP`,
        estimated_value: `$${estimatedHiveUSD}`,
      };

      set({ walletData });
      return walletData;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch wallet data";
      console.error("Wallet fetch error:", errorMessage);

      const emptyWallet: WalletData = {
        balance: "0.000 HIVE",
        hbd_balance: "0.000 HBD",
        savings_balance: "0.000 HIVE",
        savings_hbd_balance: "0.000 HBD",
        hive_power: "0 HP",
        estimated_value: "$0.00",
        error: errorMessage,
      };

      set({ walletData: emptyWallet, error: errorMessage });
      return emptyWallet;
    } finally {
      set({ isLoading: false });
    }
  },
}));
