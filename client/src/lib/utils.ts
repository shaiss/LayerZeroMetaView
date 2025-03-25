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

// Get block explorer URL based on chain
export function getExplorerUrl(chainKey: string, address: string): string {
  const explorers: Record<string, string> = {
    ethereum: 'https://etherscan.io',
    arbitrum: 'https://arbiscan.io',
    polygon: 'https://polygonscan.com',
    optimism: 'https://optimistic.etherscan.io',
    avalanche: 'https://snowtrace.io',
    binance: 'https://bscscan.com',
    // Add more chains as needed
  };
  
  const baseUrl = explorers[chainKey.toLowerCase()] || 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
}
