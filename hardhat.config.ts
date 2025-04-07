import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import { EndpointId } from '@layerzerolabs/lz-definitions';
import * as dotenv from "dotenv";

dotenv.config();

// Get PRIVATE_KEY from .env or set a default test account
const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'];

const config: HardhatUserConfig = {
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
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;