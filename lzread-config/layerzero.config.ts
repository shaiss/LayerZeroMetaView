import { ChannelId, EndpointId } from '@layerzerolabs/lz-definitions';
import { OAppReadOmniGraphHardhat } from '@layerzerolabs/oapp-evm';

// Define the contracts we want to interact with
const ethereumContract = {
  eid: EndpointId.ETHEREUM_V2_MAINNET,
  contractName: 'UniswapV3QuoteDemo', // Example contract name
};

const arbitrumContract = {
  eid: EndpointId.ARBITRUM_V2_MAINNET,
  contractName: 'UniswapV3QuoteDemo', // Example contract name
};

// Define the config for lzRead
const config: OAppReadOmniGraphHardhat = {
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
  ],
  connections: [], // No connections needed for read-only setup
};

export default config;