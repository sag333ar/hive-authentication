const IPFS_GATEWAY = "https://ipfs-3speak.b-cdn.net/ipfs/";

export const formatThumbnailUrl = (url: string | undefined | null): string | undefined => {
  if (!url) {
    return undefined;
  }
  if (url.startsWith("ipfs://")) {
    return `${IPFS_GATEWAY}${url.substring(7)}`;
  }
  if (url.startsWith("https://")) {
    return url;
  }
  // If it's just the hash, prepend the gateway
  if (!url.includes("/")) {
    return `${IPFS_GATEWAY}${url}`;
  }

  return url; // Return as is if it's some other format
};
