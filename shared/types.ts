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
