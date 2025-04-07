import { CrossChainQuery, CrossChainResult, ChainData, LzReadRequest } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

// In modern Node.js, fetch is available globally
const fetchApi = fetch;

// For a production application, we would need to 
// integrate directly with the lzRead contracts or use an official SDK
// This service simulates such integration with basic RPC calls

// Map of chainKey to RPC URL (in production, maintain this in a secure configuration)
const chainRpcMap: Record<string, string> = {
  // These are example RPCs and should be replaced with actual ones
  // Ideally sourced from configuration or environment variables
  ethereum: 'https://eth-mainnet.public.blastapi.io',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  polygon: 'https://polygon-rpc.com',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  bsc: 'https://bsc-dataseed.binance.org',
};

// Track in-memory request history for demo purposes
// In production, this would be stored in a database
const requestHistory: LzReadRequest[] = [];

/**
 * Simulates a lzRead request to fetch data across multiple chains
 */
export async function performCrossChainQuery(query: CrossChainQuery): Promise<LzReadRequest> {
  console.log(`[lzRead] Starting cross-chain query for ${query.address} across ${query.chains.length} chains`);
  
  // Create a request record
  const requestId = uuidv4();
  const request: LzReadRequest = {
    id: requestId,
    sourceChain: 'explorer', // For demo purposes, the source is our explorer app
    targetChains: query.chains,
    requestType: query.queryType,
    status: 'pending',
    timestamp: Date.now()
  };
  
  // Add to history
  requestHistory.push(request);
  
  try {
    // Execute the query across all specified chains
    const results: ChainData[] = await Promise.all(
      query.chains.map(async (chainKey) => {
        if (!chainRpcMap[chainKey]) {
          return {
            chainKey,
            eid: '0', // Would need to lookup EID
            blockNumber: 0,
            timestamp: Date.now(),
            data: { error: 'RPC not configured for this chain' }
          };
        }
        
        const rpcUrl = chainRpcMap[chainKey];
        return fetchChainData(rpcUrl, chainKey, query);
      })
    );
    
    // Update request with results
    request.status = 'completed';
    request.result = {
      address: query.address,
      queryType: query.queryType,
      results: results.filter(r => !r.data.error), // Filter out errors
      timestamp: Date.now()
    };
    
    console.log(`[lzRead] Completed query ${requestId} with ${request.result.results.length} results`);
    return request;
  } catch (error) {
    console.error(`[lzRead] Error performing cross-chain query:`, error);
    request.status = 'failed';
    return request;
  }
}

/**
 * Fetches data from a specific chain
 */
async function fetchChainData(rpcUrl: string, chainKey: string, query: CrossChainQuery): Promise<ChainData> {
  console.log(`[lzRead] Fetching ${query.queryType} data for ${query.address} on ${chainKey}`);
  
  try {
    // Prepare RPC method and params based on query type
    let method = '';
    let params: any[] = [];
    
    switch (query.queryType) {
      case 'balance':
        method = 'eth_getBalance';
        params = [query.address, query.blockNumber ? `0x${query.blockNumber.toString(16)}` : 'latest'];
        break;
      case 'nonce':
        method = 'eth_getTransactionCount';
        params = [query.address, query.blockNumber ? `0x${query.blockNumber.toString(16)}` : 'latest'];
        break;
      case 'code':
        method = 'eth_getCode';
        params = [query.address, query.blockNumber ? `0x${query.blockNumber.toString(16)}` : 'latest'];
        break;
      case 'transactions':
        // Use eth_getBlockByNumber for demo purposes (real implementation would be more complex)
        method = 'eth_getBlockByNumber';
        params = [query.blockNumber ? `0x${query.blockNumber.toString(16)}` : 'latest', true];
        break;
      case 'storage':
        method = 'eth_getStorageAt';
        params = [query.address, '0x0', query.blockNumber ? `0x${query.blockNumber.toString(16)}` : 'latest'];
        break;
      default:
        throw new Error(`Unsupported query type: ${query.queryType}`);
    }
    
    // Make RPC call with AbortController for timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    let data: any;
    let blockNumber = 0;
    let timestamp = 0;
    
    try {
      const response = await fetchApi(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method,
          params,
        }),
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json() as { result: any, error?: any };
      
      if (result.error) {
        throw new Error(`RPC error: ${JSON.stringify(result.error)}`);
      }
      
      // For transaction type, filter to only include transactions related to the queried address
      data = result.result;
      if (query.queryType === 'transactions' && Array.isArray(result.result?.transactions)) {
        data = {
          transactions: result.result.transactions.filter(
            (tx: any) => 
              tx.from?.toLowerCase() === query.address.toLowerCase() || 
              tx.to?.toLowerCase() === query.address.toLowerCase()
          ),
          blockNumber: result.result.number,
          timestamp: result.result.timestamp
        };
      }
      
      // Get block info for timestamp
      const blockResponse = await fetchApi(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBlockByNumber',
          params: [query.blockNumber ? `0x${query.blockNumber.toString(16)}` : 'latest', false],
        }),
        signal: controller.signal
      });
      
      const blockData = await blockResponse.json() as { result?: { number?: string, timestamp?: string } };
      blockNumber = parseInt(blockData.result?.number || '0x0', 16);
      timestamp = parseInt(blockData.result?.timestamp || '0x0', 16);
    } finally {
      clearTimeout(timeoutId);
    }
    
    return {
      chainKey,
      eid: '0', // Would need to lookup from configuration
      blockNumber,
      timestamp,
      data
    };
  } catch (error: any) { // Use any type to handle unknown error structure
    console.error(`[lzRead] Error fetching data from ${chainKey}:`, error);
    return {
      chainKey,
      eid: '0',
      blockNumber: 0,
      timestamp: Date.now(),
      data: { error: error.message || 'Unknown error' }
    };
  }
}

/**
 * Gets a list of recent lzRead requests
 */
export function getRecentRequests(limit: number = 10): LzReadRequest[] {
  return requestHistory
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Gets a specific lzRead request by ID
 */
export function getRequestById(id: string): LzReadRequest | undefined {
  return requestHistory.find(req => req.id === id);
}