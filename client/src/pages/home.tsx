import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, Link, RefreshCw, ZoomIn, ZoomOut, X, 
  ExternalLink, FileText, Copy, CheckCircle, List,
  Grid3x3, Table, Network, ChevronDown, Filter
} from "lucide-react";
import { 
  Card, CardContent, CardFooter, CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import NetworkGraph from "@/components/NetworkGraph";
import DeploymentCard from "@/components/DeploymentCard";
import DetailModal from "@/components/DetailModal";
import { ProcessedDeployment } from "@shared/types";
import { truncateAddress, copyToClipboard } from "@/lib/utils";

export default function Home() {
  // State
  const [selectedDeployment, setSelectedDeployment] = useState<ProcessedDeployment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    chains: string[];
    stages: string[];
    versions: number[];
  }>({
    chains: [],
    stages: [],
    versions: []
  });
  const [sortBy, setSortBy] = useState<string>("chain");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState<"grid" | "list" | "table">("grid");
  const [showNetwork, setShowNetwork] = useState<boolean>(false);
  const itemsPerPage = 12;
  
  const { toast } = useToast();

  // Queries
  const { 
    data: deployments = [], 
    isLoading: isLoadingDeployments,
    error: deploymentsError,
    refetch: refetchDeployments
  } = useQuery({ 
    queryKey: ['/api/deployments'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: stats, 
    isLoading: isLoadingStats
  } = useQuery({ 
    queryKey: ['/api/stats'],
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: filterOptions, 
    isLoading: isLoadingFilterOptions
  } = useQuery({ 
    queryKey: ['/api/filter-options'],
    staleTime: 5 * 60 * 1000,
  });

  // Filter and sort deployments
  const filteredDeployments = deployments.filter((deployment: ProcessedDeployment) => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !deployment.chainKey.toLowerCase().includes(searchLower) &&
        !deployment.eid.toLowerCase().includes(searchLower) &&
        !deployment.stage.toLowerCase().includes(searchLower) &&
        !deployment.endpoint.address.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    
    // Apply chain filter
    if (filters.chains.length > 0 && !filters.chains.includes(deployment.chainKey)) {
      return false;
    }
    
    // Apply stage filter
    if (filters.stages.length > 0 && !filters.stages.includes(deployment.stage)) {
      return false;
    }
    
    // Apply version filter
    if (filters.versions.length > 0 && !filters.versions.includes(deployment.version)) {
      return false;
    }
    
    return true;
  });
  
  // Sort deployments
  const sortedDeployments = [...filteredDeployments].sort((a, b) => {
    switch (sortBy) {
      case "chain":
        return a.chainKey.localeCompare(b.chainKey);
      case "eid":
        return parseInt(a.eid) - parseInt(b.eid);
      case "version":
        return a.version - b.version;
      default:
        return 0;
    }
  });
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeployments = sortedDeployments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  
  const totalPages = Math.ceil(sortedDeployments.length / itemsPerPage);
  
  // Handlers
  const handleFilterChange = (type: 'chains' | 'stages' | 'versions', value: string | number) => {
    setFilters(prev => {
      const updatedFilters = { ...prev };
      
      if (type === 'chains' || type === 'stages') {
        const valueStr = value as string;
        if (updatedFilters[type].includes(valueStr)) {
          updatedFilters[type] = updatedFilters[type].filter(v => v !== valueStr);
        } else {
          updatedFilters[type] = [...updatedFilters[type], valueStr];
        }
      } else { // versions
        const valueNum = value as number;
        if (updatedFilters[type].includes(valueNum)) {
          updatedFilters[type] = updatedFilters[type].filter(v => v !== valueNum);
        } else {
          updatedFilters[type] = [...updatedFilters[type], valueNum];
        }
      }
      
      setCurrentPage(1); // Reset to first page
      return updatedFilters;
    });
  };
  
  const handleResetFilters = () => {
    setFilters({
      chains: [],
      stages: [],
      versions: []
    });
    setSearchTerm("");
    setCurrentPage(1);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  const handleCopyAddress = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      toast({
        title: "Address copied to clipboard",
        duration: 2000,
      });
    } else {
      toast({
        title: "Failed to copy address",
        variant: "destructive",
        duration: 2000,
      });
    }
  };
  
  const handleViewDetails = (deployment: ProcessedDeployment) => {
    setSelectedDeployment(deployment);
  };
  
  const handleCloseModal = () => {
    setSelectedDeployment(null);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleRetry = () => {
    refetchDeployments();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700 backdrop-blur-md bg-background/70">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-3">
              <Link className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold font-space">
              <span className="text-accent">Layer</span>Zero <span className="text-secondary">Explorer</span>
            </h1>
          </div>
          
          <div className="relative w-full md:w-96">
            <Input
              type="text"
              placeholder="Search chains, EIDs, addresses..." 
              className="pl-10 font-mono text-sm bg-slate-800/50"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0 border-r border-slate-700 p-4 overflow-y-auto bg-background/70 backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-xl font-medium font-space mb-3">Filters</h2>
            
            {isLoadingFilterOptions ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                {/* Chain Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Chain</h3>
                  <div className="space-y-2">
                    {filterOptions?.chains.map((chain) => (
                      <div key={chain} className="flex items-center space-x-2">
                        <Checkbox
                          id={`chain-${chain}`}
                          checked={filters.chains.includes(chain)}
                          onCheckedChange={() => handleFilterChange('chains', chain)}
                        />
                        <label htmlFor={`chain-${chain}`} className="text-sm text-slate-200">{chain}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Stage Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Stage</h3>
                  <div className="space-y-2">
                    {filterOptions?.stages.map((stage) => (
                      <div key={stage} className="flex items-center space-x-2">
                        <Checkbox
                          id={`stage-${stage}`}
                          checked={filters.stages.includes(stage)}
                          onCheckedChange={() => handleFilterChange('stages', stage)}
                        />
                        <label htmlFor={`stage-${stage}`} className="text-sm text-slate-200">{stage}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Version Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Version</h3>
                  <div className="space-y-2">
                    {filterOptions?.versions.map((version) => (
                      <div key={version} className="flex items-center space-x-2">
                        <Checkbox
                          id={`version-${version}`}
                          checked={filters.versions.includes(version)}
                          onCheckedChange={() => handleFilterChange('versions', version)}
                        />
                        <label htmlFor={`version-${version}`} className="text-sm text-slate-200">v{version}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleResetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-medium font-space mb-3">Stats</h2>
            {isLoadingStats ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-400 mb-1">Total Connected Chains</p>
                    <p className="text-xl font-medium text-accent">{stats?.totalDeployments || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-400 mb-1">Unique Chains</p>
                    <p className="text-xl font-medium text-secondary">{stats?.uniqueChains || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-400 mb-1">Latest Updated</p>
                    <p className="text-sm font-mono text-slate-200">{stats?.latestUpdate || "N/A"}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </aside>
        
        {/* Content Area */}
        <div className="flex-grow p-6 overflow-y-auto">
          {/* Loading View */}
          {isLoadingDeployments && (
            <div>
              <div className="flex justify-center items-center mb-8">
                <div className="w-12 h-12 rounded-full border-4 border-accent/30 border-t-accent animate-spin"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Skeleton key={index} className="h-60" />
                ))}
              </div>
            </div>
          )}
          
          {/* Error View */}
          {deploymentsError && (
            <Card className="p-8 rounded-xl text-center">
              <CardContent className="pt-6">
                <X className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-200 mb-2">Unable to Load Connected Chains</h3>
                <p className="text-slate-400 mb-4">There was an error fetching data from the LayerZero API. Please try again later.</p>
                <Button onClick={handleRetry} variant="secondary">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Data View */}
          {!isLoadingDeployments && !deploymentsError && (
            <div>
              {/* Network Visualization - Only show when toggled */}
              {showNetwork && (
                <Card className="mb-8 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-medium">Network Visualization</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-slate-700">
                          <ZoomIn className="mr-1 h-4 w-4" />
                          Zoom In
                        </Button>
                        <Button variant="outline" size="sm" className="bg-slate-700">
                          <ZoomOut className="mr-1 h-4 w-4" />
                          Zoom Out
                        </Button>
                        <Button variant="outline" size="sm" className="bg-slate-700">
                          <RefreshCw className="mr-1 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </div>
                    
                    <div className="relative h-80 w-full border border-slate-700 rounded-lg bg-background/50 overflow-hidden">
                      <NetworkGraph />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Connected Chains */}
              <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <h2 className="text-xl font-medium mr-3">Connected Chains</h2>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={activeView === "grid" ? "default" : "outline"} 
                        onClick={() => setActiveView("grid")}
                        className={activeView === "grid" ? "" : "bg-slate-800/50"}
                      >
                        <Grid3x3 className="h-4 w-4 mr-1" />
                        Grid
                      </Button>
                      <Button 
                        size="sm" 
                        variant={activeView === "list" ? "default" : "outline"} 
                        onClick={() => setActiveView("list")}
                        className={activeView === "list" ? "" : "bg-slate-800/50"}
                      >
                        <List className="h-4 w-4 mr-1" />
                        List
                      </Button>
                      <Button 
                        size="sm" 
                        variant={activeView === "table" ? "default" : "outline"} 
                        onClick={() => setActiveView("table")}
                        className={activeView === "table" ? "" : "bg-slate-800/50"}
                      >
                        <Table className="h-4 w-4 mr-1" />
                        Table
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant={showNetwork ? "default" : "outline"} 
                      onClick={() => setShowNetwork(!showNetwork)}
                      className={!showNetwork ? "bg-slate-800/50" : ""}
                    >
                      <Network className="h-4 w-4 mr-1" />
                      {showNetwork ? "Hide Network" : "Show Network"}
                    </Button>
                    <div className="flex items-center">
                      <span className="text-slate-400 text-sm mr-2">Sort:</span>
                      <select 
                        className="bg-slate-800 border border-slate-700 rounded py-1 px-2 text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent"
                        value={sortBy}
                        onChange={handleSortChange}
                      >
                        <option value="chain">Chain</option>
                        <option value="eid">EID</option>
                        <option value="version">Version</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {currentDeployments.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CardContent className="pt-6">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-slate-200 mb-2">No connected chains found</h3>
                      <p className="text-slate-400 mb-4">Try adjusting your filters or search criteria.</p>
                      <Button onClick={handleResetFilters} variant="secondary">
                        Reset Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Grid View */}
                    {activeView === "grid" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {currentDeployments.map((deployment) => (
                          <DeploymentCard
                            key={deployment.id}
                            deployment={deployment}
                            onViewDetails={handleViewDetails}
                            onCopyAddress={handleCopyAddress}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* List View */}
                    {activeView === "list" && (
                      <div className="space-y-3">
                        {currentDeployments.map((deployment) => (
                          <Card key={deployment.id} className="p-4 hover:bg-slate-800/70 transition-colors cursor-pointer">
                            <div className="flex flex-wrap justify-between gap-4">
                              <div>
                                <h3 className="font-medium text-lg flex items-center">
                                  {deployment.chainKey}
                                  <Badge className="ml-2" variant="secondary">{deployment.stage}</Badge>
                                </h3>
                                <p className="text-slate-400 text-sm mb-2">EID: {deployment.eid} | v{deployment.version}</p>
                                <p className="font-mono text-xs text-slate-300 flex items-center">
                                  {truncateAddress(deployment.endpoint.address)}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0 ml-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyAddress(deployment.endpoint.address);
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </p>
                              </div>
                              <div className="flex items-center">
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDetails(deployment)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {/* Table View */}
                    {activeView === "table" && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-slate-700 bg-slate-800/50">
                              <th className="text-left py-3 px-4 font-medium">Chain</th>
                              <th className="text-left py-3 px-4 font-medium">EID</th>
                              <th className="text-left py-3 px-4 font-medium">Stage</th>
                              <th className="text-left py-3 px-4 font-medium">Version</th>
                              <th className="text-left py-3 px-4 font-medium">Endpoint</th>
                              <th className="text-center py-3 px-4 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentDeployments.map((deployment) => (
                              <tr key={deployment.id} className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
                                <td className="py-3 px-4">{deployment.chainKey}</td>
                                <td className="py-3 px-4">{deployment.eid}</td>
                                <td className="py-3 px-4">
                                  <Badge variant="secondary">{deployment.stage}</Badge>
                                </td>
                                <td className="py-3 px-4">v{deployment.version}</td>
                                <td className="py-3 px-4 font-mono text-xs">
                                  <div className="flex items-center">
                                    {truncateAddress(deployment.endpoint.address)}
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 w-6 p-0 ml-1"
                                      onClick={() => handleCopyAddress(deployment.endpoint.address)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Button
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewDetails(deployment)}
                                  >
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="bg-slate-800"
                      >
                        <span className="sr-only">Previous Page</span>
                        &lt;
                      </Button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? "bg-primary" : "bg-slate-800"}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-slate-800"
                      >
                        <span className="sr-only">Next Page</span>
                        &gt;
                      </Button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Detail Modal */}
      {selectedDeployment && (
        <DetailModal
          deployment={selectedDeployment}
          onClose={handleCloseModal}
          onCopyAddress={handleCopyAddress}
        />
      )}
      
      <footer className="p-4 text-center text-sm text-slate-400 border-t border-slate-700 bg-background/70 backdrop-blur-md">
        <p>LayerZero Metadata Explorer &copy; {new Date().getFullYear()} | Data provided by <a href="https://layerzero.network" className="text-secondary hover:text-accent transition-colors">LayerZero Network</a></p>
      </footer>
    </div>
  );
}
