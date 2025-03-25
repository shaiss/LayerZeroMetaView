import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Truncate Ethereum addresses
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

// Format date string
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// Get block explorer URL based on chain and deployment data
export function getExplorerUrl(chainKey: string, address: string, deployment?: any): string {
  if (!address || address === 'N/A') {
    return '#';
  }
  
  // Fallback explorers if not found in raw data
  const defaultExplorers: Record<string, string> = {
    ethereum: 'https://etherscan.io',
    arbitrum: 'https://arbiscan.io',
    polygon: 'https://polygonscan.com',
    optimism: 'https://optimistic.etherscan.io',
    avalanche: 'https://snowtrace.io',
    binance: 'https://bscscan.com',
    bsc: 'https://bscscan.com',
    xlayer: 'https://explorer.xlayer.xyz',
    base: 'https://basescan.org',
    linea: 'https://lineascan.build',
    zksync: 'https://explorer.zksync.io',
    mantle: 'https://explorer.mantle.xyz',
    scroll: 'https://scrollscan.com',
    metis: 'https://andromeda-explorer.metis.io',
    mode: 'https://explorer.mode.network',
    blast: 'https://blastscan.io',
    fraxtal: 'https://fraxscan.com',
    sei: 'https://www.seiscan.app',
    aptos: 'https://explorer.aptoslabs.com',
    sui: 'https://suivision.xyz',
    moonbeam: 'https://moonbeam.moonscan.io',
    gnosis: 'https://gnosisscan.io',
    celo: 'https://celoscan.io',
    harmony: 'https://explorer.harmony.one',
    fantom: 'https://ftmscan.com',
    aurora: 'https://explorer.aurora.dev',
    tron: 'https://tronscan.org',
    kava: 'https://explorer.kava.io',
    fuse: 'https://explorer.fuse.io',
    klaytn: 'https://scope.klaytn.com',
    canto: 'https://cantoscan.io',
    polygon_zkevm: 'https://zkevm.polygonscan.com',
    astar: 'https://astar.subscan.io',
    manta: 'https://pacific-explorer.manta.network',
    merlin: 'https://scan.merlinchain.io',
    telos: 'https://explorer.telos.net',
  };
  
  // Try to get explorer from deployment raw data
  let baseUrl;
  
  if (deployment && deployment.rawData) {
    // First, try to use blockExplorers from the chain metadata
    if (deployment.rawData.blockExplorers && Array.isArray(deployment.rawData.blockExplorers)) {
      const blockExplorers = deployment.rawData.blockExplorers;
      if (blockExplorers.length > 0 && blockExplorers[0].url) {
        baseUrl = blockExplorers[0].url;
      }
    }
    
    // If not found in blockExplorers, try chainDetails.blockExplorer property
    if (!baseUrl && deployment.rawData.chainDetails && deployment.rawData.chainDetails.blockExplorer) {
      baseUrl = deployment.rawData.chainDetails.blockExplorer;
    }
    
    // If not found, check if there's an explorer URL in the raw data
    if (!baseUrl && deployment.rawData.explorerUrl) {
      baseUrl = deployment.rawData.explorerUrl;
    }
  }

  // Fallback to default explorers if still not found
  if (!baseUrl) {
    // Normalize chainKey (remove testnet suffixes for explorer URL lookup)
    let normalizedChainKey = chainKey.toLowerCase();
    if (normalizedChainKey.includes('-')) {
      normalizedChainKey = normalizedChainKey.split('-')[0];
    }
    
    baseUrl = defaultExplorers[normalizedChainKey] || 'https://etherscan.io';
  }
  
  // Remove trailing slash if present
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Handle different explorer formats (some use /address, others use /accounts)
  const urlPath = baseUrl.includes('aptoslabs') ? 'account' : 
                  baseUrl.includes('subscan') ? 'account' :
                  baseUrl.includes('suivision') ? 'address-details' :
                  'address';
  
  return `${baseUrl}/${urlPath}/${address}`;
}
