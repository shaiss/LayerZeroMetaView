import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import * as dotenv from "dotenv";

// Define custom EndpointId enum to avoid dependency on @layerzerolabs/lz-definitions
enum EndpointId {
  ETHEREUM_V2_MAINNET = "30001",
  ARBITRUM_V2_MAINNET = "30110",
  OPTIMISM_V2_MAINNET = "30111",
  POLYGON_V2_MAINNET = "30109",
  AVALANCHE_V2_MAINNET = "30106",
  BSC_V2_MAINNET = "30102",
  BASE_V2_MAINNET = "30116",
  CANTO_V2_MAINNET = "30125"
}

dotenv.config();

// Get PRIVATE_KEY from .env or set a default test account
const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'];

// Custom network configuration with eid support
interface CustomNetworkConfig {
  eid?: string | number;
  url: string;
  accounts: string[];
  chainId?: number;
  gas?: number;
  gasPrice?: number;
}

// Custom HardhatUserConfig with eid support
interface CustomHardhatUserConfig extends HardhatUserConfig {
  networks?: {
    [key: string]: CustomNetworkConfig;
  };
}

const config: CustomHardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ethereum: {
      eid: EndpointId.ETHEREUM_V2_MAINNET,
      url: process.env.RPC_URL_ETHEREUM || "https://eth.llamarpc.com",
      accounts,
    },
    arbitrum: {
      eid: EndpointId.ARBITRUM_V2_MAINNET,
      url: process.env.RPC_URL_ARBITRUM || "https://arb1.arbitrum.io/rpc",
      accounts,
    },
    optimism: {
      eid: EndpointId.OPTIMISM_V2_MAINNET,
      url: process.env.RPC_URL_OPTIMISM || "https://mainnet.optimism.io",
      accounts,
    },
    polygon: {
      eid: EndpointId.POLYGON_V2_MAINNET,
      url: process.env.RPC_URL_POLYGON || "https://polygon-rpc.com",
      accounts,
    },
    avalanche: {
      eid: EndpointId.AVALANCHE_V2_MAINNET,
      url: process.env.RPC_URL_AVALANCHE || "https://api.avax.network/ext/bc/C/rpc",
      accounts,
    },
    bsc: {
      eid: EndpointId.BSC_V2_MAINNET,
      url: process.env.RPC_URL_BSC || "https://bsc-dataseed.binance.org",
      accounts,
    },
    // Add more networks as needed
    canto: {
      eid: "30125", // Canto EID
      url: "https://canto.slingshot.finance",
      accounts,
    },
    base: {
      eid: "30116", // Base EID
      url: "https://mainnet.base.org",
      accounts,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;