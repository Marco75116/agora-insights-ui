export const AUSD_ADDRESS = "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a";
export const AUSD_ADDRESS_LOWER = "0x00000000efe302beaa2b3e6e1b18d08d69a9012a";
export const AUSD_DECIMALS = 6;

export const CHAIN_IDS = {
  ETHEREUM: 1,
  MONAD: 143,
  POLYGON: 137,
  IMMUTABLE_ZKEVM: 13371,
  AVALANCHE: 43114,
  KATANA: 747474,
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
  [CHAIN_IDS.IMMUTABLE_ZKEVM]: {
    id: CHAIN_IDS.IMMUTABLE_ZKEVM,
    name: "Immutable zkEVM",
    shortName: "IMX",
    tag: "immutable-zkevm",
    color: "#00B2A9",
    explorerUrl: "https://explorer.immutable.com",
  },
  [CHAIN_IDS.AVALANCHE]: {
    id: CHAIN_IDS.AVALANCHE,
    name: "Avalanche",
    shortName: "AVAX",
    tag: "avalanche",
    color: "#E84142",
    explorerUrl: "https://snowtrace.io",
  },
  [CHAIN_IDS.KATANA]: {
    id: CHAIN_IDS.KATANA,
    name: "Katana",
    shortName: "KAT",
    tag: "katana",
    color: "#FF6B35",
    explorerUrl: "https://katanascan.com",
  },
};

export const SUPPORTED_CHAIN_IDS: ChainId[] = [
  CHAIN_IDS.ETHEREUM,
  CHAIN_IDS.MONAD,
  CHAIN_IDS.POLYGON,
  CHAIN_IDS.IMMUTABLE_ZKEVM,
  CHAIN_IDS.AVALANCHE,
  CHAIN_IDS.KATANA,
];
