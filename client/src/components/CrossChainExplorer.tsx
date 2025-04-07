import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  performCrossChainQuery, 
  fetchRecentLzReadRequests, 
  fetchLzReadRequestById,
  fetchFilterOptions 
} from '@/lib/api';
import { CrossChainQuery, LzReadRequest, FilterOptions } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { truncateAddress } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

function CrossChainExplorer() {
  const { toast } = useToast();
  const [address, setAddress] = useState<string>('');
  const [queryType, setQueryType] = useState<'balance' | 'transactions' | 'nonce' | 'storage' | 'code'>('balance');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [activeRequest, setActiveRequest] = useState<string | null>(null);

  // Fetch available chains from filter options
  const { data: filterOptions, isLoading: isLoadingFilters } = useQuery({
    queryKey: ['/api/filter-options'],
    queryFn: fetchFilterOptions,
    select: (data: FilterOptions) => data.chains || []
  });
  
  // Fetch recent lzRead requests
  const { data: recentRequests, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['/api/lzread/recent'],
    queryFn: () => fetchRecentLzReadRequests(5),
    refetchInterval: 5000 // Refresh every 5 seconds
  });
  
  // Fetch details for a specific request when selected
  const { data: requestDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['/api/lzread/request', activeRequest],
    queryFn: () => fetchLzReadRequestById(activeRequest!),
    enabled: !!activeRequest,
    refetchInterval: 2000 // Poll frequently and let the component handle the condition
  });
  
  // Mutation to perform a cross-chain query
  const mutation = useMutation({
    mutationFn: performCrossChainQuery,
    onSuccess: (data) => {
      // Set the new request as active
      setActiveRequest(data.id);
      
      // Invalidate the recent requests query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/lzread/recent'] });
      
      toast({
        title: 'Query submitted',
        description: `Cross-chain query started for ${truncateAddress(address)}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Query failed',
        description: error instanceof Error ? error.message : 'Failed to submit cross-chain query',
        variant: 'destructive'
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast({
        title: 'Missing address',
        description: 'Please enter a valid wallet or contract address',
        variant: 'destructive'
      });
      return;
    }
    
    if (selectedChains.length === 0) {
      toast({
        title: 'No chains selected',
        description: 'Please select at least one chain to query',
        variant: 'destructive'
      });
      return;
    }
    
    const query: CrossChainQuery = {
      address,
      queryType,
      chains: selectedChains
    };
    
    mutation.mutate(query);
  };
  
  const toggleChain = (chain: string) => {
    if (selectedChains.includes(chain)) {
      setSelectedChains(selectedChains.filter(c => c !== chain));
    } else {
      setSelectedChains([...selectedChains, chain]);
    }
  };
  
  const handleRequestClick = (request: LzReadRequest) => {
    setActiveRequest(request.id);
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Query Form */}
        <div className="lg:w-1/3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cross-Chain Data Explorer</CardTitle>
              <CardDescription>
                Query data across multiple LayerZero connected chains with a single request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    placeholder="0x..." 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a wallet or contract address to query
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="queryType">Query Type</Label>
                  <Select 
                    value={queryType} 
                    onValueChange={(value) => setQueryType(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select query type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balance">Balance</SelectItem>
                      <SelectItem value="transactions">Transactions</SelectItem>
                      <SelectItem value="nonce">Nonce</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="code">Contract Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Target Chains</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {isLoadingFilters ? (
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ) : (
                      filterOptions?.map((chain: string) => (
                        <Badge
                          key={chain}
                          variant={selectedChains.includes(chain) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleChain(chain)}
                        >
                          {chain}
                        </Badge>
                      ))
                    )}
                  </div>
                  {!isLoadingFilters && filterOptions?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No chains available. Please ensure LayerZero deployments are loaded.
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={mutation.isPending || !address || selectedChains.length === 0}
                >
                  {mutation.isPending ? 'Submitting...' : 'Query Across Chains'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Recent Requests */}
          <Card className="mt-4 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecent ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : recentRequests?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No recent queries. Start by making a cross-chain query.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentRequests?.map((request) => (
                    <div 
                      key={request.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                        activeRequest === request.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleRequestClick(request)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium truncate">
                            {truncateAddress(request.result?.address || '')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.targetChains.join(', ')} • {request.requestType}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === 'completed' ? 'default' :
                            request.status === 'pending' ? 'outline' :
                            'destructive'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Results Display */}
        <div className="lg:w-2/3">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Query Results</CardTitle>
                  {requestDetails && (
                    <CardDescription>
                      {requestDetails.result?.queryType} for {truncateAddress(requestDetails.result?.address || '')}
                    </CardDescription>
                  )}
                </div>
                {requestDetails?.status === 'completed' && (
                  <Badge className="ml-2" variant="outline">
                    {requestDetails.result?.results.length} results
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!activeRequest ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Select or submit a query to view results
                  </p>
                </div>
              ) : isLoadingDetails ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : requestDetails?.status === 'pending' ? (
                <Alert>
                  <AlertTitle>Query in progress</AlertTitle>
                  <AlertDescription>
                    Fetching data across {requestDetails.targetChains.length} chains. This may take a few moments...
                  </AlertDescription>
                </Alert>
              ) : requestDetails?.status === 'failed' ? (
                <Alert variant="destructive">
                  <AlertTitle>Query failed</AlertTitle>
                  <AlertDescription>
                    There was an error processing your cross-chain query. Please try again.
                  </AlertDescription>
                </Alert>
              ) : (
                <Tabs defaultValue="data">
                  <TabsList>
                    <TabsTrigger value="data">Data</TabsTrigger>
                    <TabsTrigger value="raw">Raw Response</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="data" className="space-y-4">
                    {requestDetails?.result?.results.map((chainData, index) => (
                      <Card key={index}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">
                              {chainData.chainKey} 
                              <span className="text-xs text-muted-foreground ml-2">
                                (EID: {chainData.eid})
                              </span>
                            </CardTitle>
                            <Badge variant="outline">
                              Block #{chainData.blockNumber}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          {requestDetails.result?.queryType === 'balance' && (
                            <p className="font-mono">
                              {typeof chainData.data === 'string' 
                                ? parseInt(chainData.data, 16) / 1e18 
                                : 'N/A'} ETH
                            </p>
                          )}
                          
                          {requestDetails.result?.queryType === 'nonce' && (
                            <p className="font-mono">
                              {typeof chainData.data === 'string' 
                                ? parseInt(chainData.data, 16) 
                                : 'N/A'}
                            </p>
                          )}
                          
                          {requestDetails.result?.queryType === 'code' && (
                            <div className="max-h-40 overflow-y-auto">
                              <p className="font-mono text-xs break-all">
                                {typeof chainData.data === 'string' && chainData.data !== '0x' 
                                  ? `${chainData.data.substring(0, 100)}...` 
                                  : 'No contract code found'}
                              </p>
                            </div>
                          )}
                          
                          {requestDetails.result?.queryType === 'transactions' && (
                            <div>
                              {chainData.data?.transactions?.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {chainData.data.transactions.slice(0, 5).map((tx: any, i: number) => (
                                    <div key={i} className="text-xs">
                                      <div className="flex justify-between">
                                        <span>Tx: {truncateAddress(tx.hash)}</span>
                                        <span>{parseInt(tx.value || '0x0', 16) / 1e18} ETH</span>
                                      </div>
                                      <div className="text-muted-foreground">
                                        From: {truncateAddress(tx.from)} → To: {truncateAddress(tx.to || '[Contract Creation]')}
                                      </div>
                                      <Separator className="my-1" />
                                    </div>
                                  ))}
                                  {chainData.data.transactions.length > 5 && (
                                    <p className="text-xs text-muted-foreground text-center">
                                      + {chainData.data.transactions.length - 5} more transactions
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No transactions found for this address
                                </p>
                              )}
                            </div>
                          )}
                          
                          {requestDetails.result?.queryType === 'storage' && (
                            <p className="font-mono text-xs break-all">
                              {typeof chainData.data === 'string' 
                                ? chainData.data
                                : 'No storage data found'}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {requestDetails?.result?.results.length === 0 && (
                      <Alert>
                        <AlertTitle>No results found</AlertTitle>
                        <AlertDescription>
                          No data was returned from any chain. This may be because the address doesn't exist on the selected chains or there was an error with the RPC endpoints.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="raw">
                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                      <pre className="text-xs">
                        {JSON.stringify(requestDetails, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <p>
                Powered by LayerZero lzRead protocol for secure, verifiable cross-chain data access
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CrossChainExplorer;

