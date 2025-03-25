import fs from 'fs';

// Read the downloaded data
const data = JSON.parse(fs.readFileSync('layerzero_data.json'));

// 1. Check data structure
console.log('API structure:');
console.log('Top level keys count:', Object.keys(data).length);
console.log('Example of one key:', Object.keys(data)[0]);

// 2. Analyze a sample chain
const sampleChainKey = Object.keys(data)[0];
const sampleChain = data[sampleChainKey];
console.log('\nSample chain structure:');
console.log('Keys in chain object:', Object.keys(sampleChain));
console.log('Number of deployments:', sampleChain.deployments?.length || 0);

// 3. Look for relationship indicators
if (sampleChain.deployments && sampleChain.deployments.length > 0) {
  const deployment = sampleChain.deployments[0];
  console.log('\nSample deployment structure:');
  console.log('Keys in deployment:', Object.keys(deployment));
  console.log('Example deployment:', JSON.stringify(deployment, null, 2));

  // 4. Extract and categorize all values
  console.log('\nRelationship Analysis:');
  
  // Check if the objects reference each other
  const chainRelations = new Map();
  const chainKeys = Object.keys(data);
  
  // Count unique EIDs to see if they overlap between chains
  const eidToChains = new Map();
  
  chainKeys.forEach(chainKey => {
    const deployments = data[chainKey].deployments || [];
    deployments.forEach(deployment => {
      const eid = deployment.eid;
      if (!eidToChains.has(eid)) {
        eidToChains.set(eid, new Set());
      }
      eidToChains.get(eid).add(chainKey);
    });
  });
  
  // Check if any EIDs are shared between chains
  const sharedEids = Array.from(eidToChains.entries())
    .filter(([_, chains]) => chains.size > 1)
    .map(([eid, chains]) => ({ 
      eid, 
      chains: Array.from(chains),
      chainCount: chains.size
    }));
  
  console.log('Number of shared EIDs across chains:', sharedEids.length);
  if (sharedEids.length > 0) {
    console.log('Top 5 shared EIDs:');
    sharedEids
      .sort((a, b) => b.chainCount - a.chainCount)
      .slice(0, 5)
      .forEach(({ eid, chains, chainCount }) => {
        console.log(`  EID ${eid} is shared by ${chainCount} chains:`, chains.slice(0, 3).join(', ') + (chains.length > 3 ? '...' : ''));
      });
  }
  
  // Check for other potential relationships
  console.log('\nAre there other relationship indicators?');
  // Look for any shared addresses between deployments
  const addressToDeployments = new Map();
  
  chainKeys.forEach(chainKey => {
    const deployments = data[chainKey].deployments || [];
    deployments.forEach(deployment => {
      // Check endpoint address
      if (deployment.endpoint?.address) {
        const addr = deployment.endpoint.address.toLowerCase();
        if (!addressToDeployments.has(addr)) {
          addressToDeployments.set(addr, []);
        }
        addressToDeployments.get(addr).push({
          chainKey,
          eid: deployment.eid,
          type: 'endpoint'
        });
      }
      
      // Check other addresses
      ['relayerV2', 'ultraLightNodeV2', 'sendUln301', 'receiveUln301', 'nonceContract'].forEach(key => {
        if (deployment[key]?.address) {
          const addr = deployment[key].address.toLowerCase();
          if (!addressToDeployments.has(addr)) {
            addressToDeployments.set(addr, []);
          }
          addressToDeployments.get(addr).push({
            chainKey,
            eid: deployment.eid,
            type: key
          });
        }
      });
    });
  });
  
  // Find shared addresses
  const sharedAddresses = Array.from(addressToDeployments.entries())
    .filter(([_, deploymentList]) => deploymentList.length > 1)
    .map(([address, deploymentList]) => ({
      address,
      deployments: deploymentList,
      count: deploymentList.length
    }));
  
  console.log('Number of shared addresses:', sharedAddresses.length);
  if (sharedAddresses.length > 0) {
    console.log('Top 5 shared addresses:');
    sharedAddresses
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .forEach(({ address, deployments, count }) => {
        const types = new Set(deployments.map(d => d.type));
        const chains = new Set(deployments.map(d => d.chainKey));
        console.log(`  Address ${address.substring(0, 8)}... is shared by ${count} deployments`);
        console.log(`    Used as: ${Array.from(types).join(', ')}`);
        console.log(`    Chains: ${Array.from(chains).slice(0, 3).join(', ')}${chains.size > 3 ? '...' : ''} (${chains.size} total)`);
      });
  }

  // Check conclusion
  console.log('\nConclusion:');
  if (sharedEids.length > 0 || sharedAddresses.length > 0) {
    console.log('There ARE meaningful relationships between chains in the data that could be visualized.');
  } else {
    console.log('There are NO meaningful relationships between chains in the data. The network visualization is not providing value.');
  }
}
