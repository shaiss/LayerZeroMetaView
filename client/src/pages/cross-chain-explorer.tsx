import React from 'react';
import CrossChainExplorer from '@/components/CrossChainExplorer';

export default function CrossChainExplorerPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Cross-Chain Data Explorer</h1>
      <p className="text-muted-foreground mb-8 max-w-3xl">
        Access and view data from multiple blockchains in a single interface using LayerZero's lzRead protocol.
        Query balances, transactions, nonces, and smart contract data across any LayerZero connected chain.
      </p>
      <CrossChainExplorer />
    </div>
  );
}