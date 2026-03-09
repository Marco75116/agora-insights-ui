export const AUSD_ADDRESS = "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a";
export const AUSD_ADDRESS_LOWER = "0x00000000efe302beaa2b3e6e1b18d08d69a9012a";
export const AUSD_DECIMALS = 6;

export const CHAIN_IDS = {
  ETHEREUM: 1,
  MANTLE: 5000,
  MONAD: 143,
  POLYGON: 137,
} as const;

export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  tag: string;
  color: string;
  explorerUrl: string;
}

export const CHAINS: Record<ChainId, ChainConfig> = {
  [CHAIN_IDS.ETHEREUM]: {
    id: CHAIN_IDS.ETHEREUM,
    name: "Ethereum",
    shortName: "ETH",
    tag: "eth",
    color: "#8C8C8C",
    explorerUrl: "https://etherscan.io",
  },
  [CHAIN_IDS.MANTLE]: {
    id: CHAIN_IDS.MANTLE,
    name: "Mantle",
    shortName: "MNT",
    tag: "mantle",
    color: "#2FC89F",
    explorerUrl: "https://mantlescan.xyz",
  },
  [CHAIN_IDS.MONAD]: {
    id: CHAIN_IDS.MONAD,
    name: "Monad",
    shortName: "MON",
    tag: "monad",
    color: "#E45BF6",
    explorerUrl: "https://monadexplorer.com",
  },
  [CHAIN_IDS.POLYGON]: {
    id: CHAIN_IDS.POLYGON,
    name: "Polygon",
    shortName: "POL",
    tag: "pol",
    color: "#8247E5",
    explorerUrl: "https://polygonscan.com",
  },
};

export const SUPPORTED_CHAIN_IDS: ChainId[] = [
  CHAIN_IDS.ETHEREUM,
  CHAIN_IDS.MANTLE,
  CHAIN_IDS.MONAD,
  CHAIN_IDS.POLYGON,
];
