import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, Link, RefreshCw, X, 
  ExternalLink, FileText, Copy, CheckCircle, List,
  Grid3x3, Table, Network, ChevronDown, Filter,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { 
  Card, CardContent, CardFooter, CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import DeploymentCard from "@/components/DeploymentCard";
import DetailModal from "@/components/DetailModal";
import SimpleFilterPanel from "@/components/SimpleFilterPanel";
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
  const itemsPerPage = 12;
  
  const { toast } = useToast();

  // Queries
  const { 
    data: deployments = [], 
    isLoading: isLoadingDeployments,
    error: deploymentsError,
    refetch: refetchDeployments
  } = useQuery<ProcessedDeployment[]>({ 
    queryKey: ['/api/deployments'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: stats = { totalDeployments: 0, uniqueChains: 0, latestUpdate: "" }, 
    isLoading: isLoadingStats
  } = useQuery<{ totalDeployments: number, uniqueChains: number, latestUpdate: string }>({ 
    queryKey: ['/api/stats'],
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: filterOptions = { chains: [], stages: [], versions: [] }, 
    isLoading: isLoadingFilterOptions
  } = useQuery<{ chains: string[], stages: string[], versions: number[] }>({ 
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
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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
      <header className="sticky top-0 z-50 border-b border-secondary/20 backdrop-blur-md bg-background-dark/90 shadow-md shadow-background-dark/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center mb-2">
            <div className="w-12 h-12 relative mr-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-80 blur-[10px]"></div>
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-white/10">
                <Link className="text-white" size={22} />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-accent font-bold">Layer</span>
              <span className="text-white/80">Zero</span>
              <span className="ml-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Connected Chains</span>
            </h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <div className="container mx-auto px-4 py-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {isLoadingStats ? (
              <>
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </>
            ) : (
              <>
                <Card className="bg-gradient-to-br from-background to-background-dark border-primary/20 overflow-hidden rounded-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
                  <CardContent className="p-6 flex items-center relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mr-4 shadow-lg">
                      <Network className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-foreground/60 font-medium mb-1">Total Connected Chains</p>
                      <p className="text-3xl font-bold tracking-tight text-primary-light">{stats?.totalDeployments || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-background to-background-dark border-secondary/20 overflow-hidden rounded-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
                  <CardContent className="p-6 flex items-center relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center mr-4 shadow-lg">
                      <Link className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-foreground/60 font-medium mb-1">Unique Chains</p>
                      <p className="text-3xl font-bold tracking-tight text-secondary-light">{stats?.uniqueChains || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-background to-background-dark border-accent/20 overflow-hidden rounded-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
                  <CardContent className="p-6 flex items-center relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center mr-4 shadow-lg">
                      <RefreshCw className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-foreground/60 font-medium mb-1">Latest Updated</p>
                      <p className="text-xl font-medium font-mono text-accent-light">{stats?.latestUpdate || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* New Filter Panel */}
          <div className="mb-6">
            <SimpleFilterPanel
              isLoading={isLoadingFilterOptions}
              filterOptions={filterOptions}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-grow px-6 pb-6 overflow-y-auto">
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

              
              {/* Connected Chains */}
              <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Connected Chains</h2>
                    <p className="text-sm text-foreground/60">Explore connected chains and their deployments across the LayerZero ecosystem</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center">
                      <div className="bg-background/50 border border-secondary/20 rounded-lg p-1 flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setActiveView("grid")}
                          className={`px-3 ${activeView === "grid" 
                            ? "bg-primary/10 text-primary hover:bg-primary/20" 
                            : "bg-transparent hover:bg-background-light/30 text-foreground/70"}`}
                        >
                          <Grid3x3 className="h-4 w-4 mr-1.5" />
                          Grid
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setActiveView("list")}
                          className={`px-3 ${activeView === "list" 
                            ? "bg-primary/10 text-primary hover:bg-primary/20" 
                            : "bg-transparent hover:bg-background-light/30 text-foreground/70"}`}
                        >
                          <List className="h-4 w-4 mr-1.5" />
                          List
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setActiveView("table")}
                          className={`px-3 ${activeView === "table" 
                            ? "bg-primary/10 text-primary hover:bg-primary/20" 
                            : "bg-transparent hover:bg-background-light/30 text-foreground/70"}`}
                        >
                          <Table className="h-4 w-4 mr-1.5" />
                          Table
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2 bg-background/50 border border-secondary/20 rounded-lg p-2">
                        <span className="text-foreground/60 text-sm font-medium">Sort by:</span>
                        <select 
                          className="bg-transparent rounded text-sm font-medium text-foreground focus:outline-none"
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
                          <Card key={deployment.id} className="p-0 border-secondary/20 bg-gradient-to-r from-background/70 to-background-dark/80 hover:from-background/80 hover:to-background-dark/90 backdrop-blur-md transition-all duration-200 overflow-hidden shadow-md">
                            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 p-0">
                              <div className="w-2 self-stretch bg-gradient-to-b from-primary to-secondary"></div>
                              
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center my-4 ml-2">
                                <Network className="h-5 w-5 text-primary" />
                              </div>
                              
                              <div className="flex-grow p-4">
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                  <h3 className="font-bold text-lg">
                                    {deployment.chainKey}
                                  </h3>
                                  <Badge 
                                    variant={deployment.stage === 'mainnet' ? 'default' : 'secondary'} 
                                    className={deployment.stage === 'mainnet' 
                                      ? "bg-accent/10 text-accent border-accent/20" 
                                      : "bg-secondary/10 text-secondary border-secondary/20"}
                                  >
                                    {deployment.stage}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-3 mb-3">
                                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs">
                                    <span className="mr-1 text-primary/70">EID:</span> {deployment.eid}
                                  </div>
                                  
                                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-accent/10 text-accent font-mono text-xs">
                                    <span className="mr-1 text-accent/70">v</span>{deployment.version}
                                  </div>
                                </div>
                                
                                <div className="flex items-center">
                                  <div className="text-xs text-foreground/60 mr-2">Endpoint:</div>
                                  <div className="bg-background/40 px-2 py-1 rounded border border-secondary/10 font-mono text-xs text-foreground/80">
                                    {truncateAddress(deployment.endpoint.address)}
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0 ml-1 rounded-full hover:bg-secondary/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyAddress(deployment.endpoint.address);
                                    }}
                                    aria-label="Copy address"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="p-4 ml-auto self-center">
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
                                  onClick={() => handleViewDetails(deployment)}
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
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
                      <div className="overflow-x-auto glass-panel p-1 rounded-xl">
                        <table>
                          <thead>
                            <tr>
                              <th className="rounded-tl-lg">Chain</th>
                              <th>EID</th>
                              <th>Stage</th>
                              <th>Version</th>
                              <th>Endpoint</th>
                              <th className="rounded-tr-lg text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentDeployments.map((deployment, index) => (
                              <tr key={deployment.id} className="transition-colors">
                                <td className={`${index === currentDeployments.length - 1 ? "rounded-bl-lg" : ""}`}>
                                  <div className="font-medium">{deployment.chainKey}</div>
                                </td>
                                <td>
                                  <div className="inline-flex px-2 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs">
                                    {deployment.eid}
                                  </div>
                                </td>
                                <td>
                                  <Badge 
                                    variant={deployment.stage === 'mainnet' ? 'default' : 'secondary'} 
                                    className={deployment.stage === 'mainnet' 
                                      ? "bg-accent/10 text-accent border-accent/20" 
                                      : "bg-secondary/10 text-secondary border-secondary/20"}
                                  >
                                    {deployment.stage}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="font-mono text-sm font-medium">v{deployment.version}</div>
                                </td>
                                <td className="font-mono text-xs">
                                  <div className="flex items-center">
                                    <span className="bg-background/40 px-2 py-1 rounded border border-secondary/10">
                                      {truncateAddress(deployment.endpoint.address)}
                                    </span>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 w-6 p-0 ml-1 rounded-full hover:bg-secondary/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyAddress(deployment.endpoint.address);
                                      }}
                                      aria-label="Copy address"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                                <td className={`text-center ${index === currentDeployments.length - 1 ? "rounded-br-lg" : ""}`}>
                                  <Button
                                    variant="outline" 
                                    size="sm"
                                    className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
                                    onClick={() => handleViewDetails(deployment)}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                    Details
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
                  <div className="mt-10 flex justify-center">
                    <div className="bg-background/50 backdrop-blur-sm border border-secondary/20 rounded-xl p-2 shadow-md">
                      <nav className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`rounded-lg h-9 w-9 ${currentPage === 1 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-background-light/30 text-foreground/70 hover:text-foreground'}`}
                          aria-label="Previous Page"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          // Show limited number of pages with ellipsis for better UX
                          if (
                            totalPages <= 7 ||
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "ghost"}
                                size="icon"
                                onClick={() => handlePageChange(page)}
                                className={`rounded-lg h-9 w-9 ${
                                  currentPage === page 
                                    ? "bg-primary hover:bg-primary-light text-white font-medium" 
                                    : "hover:bg-background-light/30 text-foreground/70 hover:text-foreground"
                                }`}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? "page" : undefined}
                              >
                                {page}
                              </Button>
                            );
                          } else if (
                            (page === 2 && currentPage > 3) ||
                            (page === totalPages - 1 && currentPage < totalPages - 2)
                          ) {
                            return (
                              <span key={page} className="text-foreground/40 px-1">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`rounded-lg h-9 w-9 ${currentPage === totalPages 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-background-light/30 text-foreground/70 hover:text-foreground'}`}
                          aria-label="Next Page"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </nav>
                    </div>
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
      
      <footer className="py-6 px-8 text-center border-t border-secondary/20 bg-gradient-to-b from-background/70 to-background-dark/90 backdrop-blur-lg">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-foreground/60">
            <div className="flex items-center">
              <div className="w-8 h-8 relative mr-3">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-70 blur-[6px]"></div>
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Link className="text-white" size={14} />
                </div>
              </div>
              <p className="text-sm font-medium">
                LayerZero Metadata Explorer &copy; {new Date().getFullYear()}
              </p>
            </div>
            <span className="hidden md:block">|</span>
            <p className="text-sm">
              Data provided by <a href="https://layerzero.network" className="text-secondary hover:text-accent transition-colors font-medium">LayerZero Network</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
