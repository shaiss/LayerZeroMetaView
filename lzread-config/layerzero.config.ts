// Use an enum definition instead of importing from the package
// This avoids the dependency on @layerzerolabs/lz-definitions in our MVP
enum CustomEndpointId {
  ETHEREUM_V2_MAINNET = "30001",
  ARBITRUM_V2_MAINNET = "30110",
  BASE_V2_MAINNET = "30116",
  CANTO_V2_MAINNET = "30125"
}

enum CustomChannelId {
  READ_CHANNEL_1 = "1"
}

// Alias these to match the original imports
const EndpointId = CustomEndpointId;
const ChannelId = CustomChannelId;

// Define a replacement interface for OAppReadOmniGraphHardhat to avoid the import error
interface OAppReadOmniGraphHardhatInterface {
  contracts: Array<{
    contract: {
      eid: string | number;
      contractName: string;
    };
    config: {
      readLibrary: string;
      readChannels: Array<{
        channelId: string | number;
        active: boolean;
      }>;
      readConfig: {
        ulnConfig: {
          requiredDVNs: string[];
          executor: string;
        };
      };
    };
  }>;
  connections: any[];
}

// Define the contracts we want to interact with
const ethereumContract = {
  eid: EndpointId.ETHEREUM_V2_MAINNET,
  contractName: 'UniswapV3QuoteDemo', // Example contract name
};

const arbitrumContract = {
  eid: EndpointId.ARBITRUM_V2_MAINNET,
  contractName: 'UniswapV3QuoteDemo', // Example contract name
};

const baseContract = {
  eid: "30116", // EndpointId.BASE_V2_MAINNET
  contractName: 'UniswapV3QuoteDemo', // Example contract name
};

const cantoContract = {
  eid: "30125", // EndpointId.CANTO_V2_MAINNET
  contractName: 'UniswapV3QuoteDemo', // Example contract name
};

// Define the config for lzRead
const config: OAppReadOmniGraphHardhatInterface = {
  contracts: [
    {
      contract: ethereumContract, 
      config: {
        readLibrary: '0xbcd4CADCac3F767C57c4F402932C4705DF62BEFf', // Read Library address
        readChannels: [
          {
            channelId: ChannelId.READ_CHANNEL_1,
            active: true,
          },
        ],
        readConfig: {
          ulnConfig: {
            requiredDVNs: ['0x1308151a7ebac14f435d3ad5ff95c34160d539a5'], // Example DVN
            executor: '0x31CAe3B7fB82d847621859fb1585353c5720660D', // Example executor address
          },
        },
      },
    },
    {
      contract: arbitrumContract,
      config: {
        readLibrary: '0xbcd4CADCac3F767C57c4F402932C4705DF62BEFf', // Read Library address
        readChannels: [
          {
            channelId: ChannelId.READ_CHANNEL_1,
            active: true,
          },
        ],
        readConfig: {
          ulnConfig: {
            requiredDVNs: ['0x1308151a7ebac14f435d3ad5ff95c34160d539a5'], // Example DVN
            executor: '0x31CAe3B7fB82d847621859fb1585353c5720660D', // Example executor address
          },
        },
      },
    },
    // Add Base and Canto contracts
    {
      contract: baseContract,
      config: {
        readLibrary: '0xbcd4CADCac3F767C57c4F402932C4705DF62BEFf', // Read Library address
        readChannels: [
          {
            channelId: ChannelId.READ_CHANNEL_1,
            active: true,
          },
        ],
        readConfig: {
          ulnConfig: {
            requiredDVNs: ['0x1308151a7ebac14f435d3ad5ff95c34160d539a5'], // Example DVN
            executor: '0x31CAe3B7fB82d847621859fb1585353c5720660D', // Example executor address
          },
        },
      },
    },
    {
      contract: cantoContract,
      config: {
        readLibrary: '0xbcd4CADCac3F767C57c4F402932C4705DF62BEFf', // Read Library address
        readChannels: [
          {
            channelId: ChannelId.READ_CHANNEL_1,
            active: true,
          },
        ],
        readConfig: {
          ulnConfig: {
            requiredDVNs: ['0x1308151a7ebac14f435d3ad5ff95c34160d539a5'], // Example DVN
            executor: '0x31CAe3B7fB82d847621859fb1585353c5720660D', // Example executor address
          },
        },
      },
    }
  ],
  connections: [], // No connections needed for read-only setup
};

export default config;