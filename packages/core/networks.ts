import type { ChainNetwork } from "./types";

const LABELS: Record<ChainNetwork, string> = {
  ethereum: "Ethereum (ERC-20)",
  polygon: "Polygon",
  tron: "Tron (TRC-20)",
  bsc: "BNB Smart Chain",
};

export function networkLabel(network: ChainNetwork): string {
  return LABELS[network] ?? network;
}

/** Shortens an address for display: 0x8f3c…7a2B9eF4dC */
export function truncateAddress(address: string, lead = 6, tail = 10): string {
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

/** Explorer links, used from transaction detail. */
export function explorerUrl(network: ChainNetwork, txHash: string): string {
  switch (network) {
    case "ethereum":
      return `https://etherscan.io/tx/${txHash}`;
    case "polygon":
      return `https://polygonscan.com/tx/${txHash}`;
    case "tron":
      return `https://tronscan.org/#/transaction/${txHash}`;
    case "bsc":
      return `https://bscscan.com/tx/${txHash}`;
  }
}
