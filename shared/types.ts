// Common types for frontend and backend

export interface Address {
  address: string;
}

export interface ChainDeployment {
  eid: string;
  endpoint: Address;
  chainKey: string;
  stage: string;
  relayerV2?: Address;
  ultraLightNodeV2?: Address;
  sendUln301?: Address;
  receiveUln301?: Address;
  nonceContract?: Address;
  version: number;
}

export interface DeploymentsResponse {
  [chainKeyStage: string]: {
    deployments: ChainDeployment[];
  };
}

export interface ProcessedDeployment {
  id: string;
  chainKey: string;
  eid: string;
  stage: string;
  endpoint: Address;
  relayerV2?: Address;
  ultraLightNodeV2?: Address;
  sendUln301?: Address;
  receiveUln301?: Address;
  nonceContract?: Address;
  version: number;
  isActive: boolean;
  rawData: any;
}

export interface NetworkNode {
  id: string;
  name: string;
  eid: string;
  stage: string;
  connections: number;
  group: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface DeploymentStats {
  totalDeployments: number;
  uniqueChains: number;
  latestUpdate: string;
}

export interface FilterOptions {
  chains: string[];
  stages: string[];
  versions: number[];
}

// lzRead cross-chain data access types
export interface ChainData {
  chainKey: string;
  eid: string;
  blockNumber: number;
  timestamp: number;
  data: any;
}

export interface CrossChainQuery {
  address: string;
  queryType: 'balance' | 'transactions' | 'nonce' | 'storage' | 'code';
  chains: string[]; // Chain keys to query
  blockNumber?: number; // Optional specific block number, defaults to latest
}

export interface CrossChainResult {
  address: string;
  queryType: string;
  results: ChainData[];
  timestamp: number;
}

export interface AssetData {
  chain: string;
  eid: string;
  assetType: 'native' | 'erc20' | 'erc721' | 'other';
  symbol?: string;
  name?: string;
  balance: string;
  balanceFormatted?: string;
  decimals?: number;
  contractAddress?: string;
  blockNumber: number;
  lastUpdated: number;
}

export interface WalletScanResult {
  address: string;
  totalChains: number;
  chainsWithAssets: number;
  assets: AssetData[];
  timestamp: number;
}

export interface LzReadRequest {
  id: string;
  sourceChain: string;
  targetChains: string[];
  requestType: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  result?: CrossChainResult;
  walletScan?: WalletScanResult;
}
