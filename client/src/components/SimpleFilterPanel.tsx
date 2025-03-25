import { useState } from "react";
import { X, Search, Filter, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface FilterPanelProps {
  isLoading: boolean;
  filterOptions: {
    chains: string[];
    stages: string[];
    versions: number[];
  } | null;
  activeFilters: {
    chains: string[];
    stages: string[];
    versions: number[];
  };
  onFilterChange: (type: 'chains' | 'stages' | 'versions', value: string | number) => void;
  onResetFilters: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SimpleFilterPanel({
  isLoading,
  filterOptions,
  activeFilters,
  onFilterChange,
  onResetFilters,
  searchTerm,
  onSearchChange
}: FilterPanelProps) {
  const [isChainFilterOpen, setIsChainFilterOpen] = useState(false);
  const [isStageFilterOpen, setIsStageFilterOpen] = useState(false);
  const [isVersionFilterOpen, setIsVersionFilterOpen] = useState(false);
  const [chainSearch, setChainSearch] = useState("");
  const [stageSearch, setStageSearch] = useState("");
  const [versionSearch, setVersionSearch] = useState("");
  
  // Count active filters
  const activeFilterCount = activeFilters.chains.length + 
    activeFilters.stages.length + 
    activeFilters.versions.length;
  
  // Filtered options
  const filteredChains = filterOptions?.chains.filter(chain => 
    chain.toLowerCase().includes(chainSearch.toLowerCase())
  ) || [];
  
  const filteredStages = filterOptions?.stages.filter(stage => 
    stage.toLowerCase().includes(stageSearch.toLowerCase())
  ) || [];
  
  const filteredVersions = filterOptions?.versions.filter(version => 
    version.toString().includes(versionSearch)
  ) || [];
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  
  // Handle chain selection with better logging
  const handleChainSelect = (chain: string) => {
    console.log(`Selecting chain: ${chain}`);
    console.log(`Current active chains: ${activeFilters.chains.join(', ')}`);
    
    // Force UI update after selection
    setChainSearch('');
    onFilterChange('chains', chain);
    
    // Keep dropdown open for better UX
    setTimeout(() => {
      console.log(`Updated active chains: ${activeFilters.chains.includes(chain) ? 
        activeFilters.chains.filter(c => c !== chain).join(', ') : 
        [...activeFilters.chains, chain].join(', ')}`);
    }, 100);
  };
  
  // Toggle filters
  const toggleChainFilter = () => setIsChainFilterOpen(!isChainFilterOpen);
  const toggleStageFilter = () => setIsStageFilterOpen(!isStageFilterOpen);
  const toggleVersionFilter = () => setIsVersionFilterOpen(!isVersionFilterOpen);
  
  return (
    <div className="rounded-xl bg-gradient-to-r from-background/70 to-background-dark/70 backdrop-blur-lg border border-secondary/20 p-5 shadow-lg">
      {/* Search Input */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-foreground/40" />
        </div>
        <Input
          type="text"
          placeholder="Search chains, EIDs, addresses..." 
          className="pl-10 py-6 rounded-lg font-mono text-base bg-background/40 border-secondary/20 shadow-inner placeholder:text-foreground/40 focus:border-primary/30 focus:ring-primary/20"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Chain Filter Button */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="default" 
            className="w-full justify-between bg-background/40 border-secondary/20 text-foreground hover:bg-background-light/40 hover:text-foreground/90 focus:ring-1 focus:ring-primary/20"
            onClick={toggleChainFilter}
          >
            <div className="flex items-center">
              <div className="bg-primary/10 p-1 rounded mr-2">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <span>Chain {activeFilters.chains.length > 0 && <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{activeFilters.chains.length}</span>}</span>
            </div>
            {isChainFilterOpen ? <ChevronUp className="h-4 w-4 text-foreground/60" /> : <ChevronDown className="h-4 w-4 text-foreground/60" />}
          </Button>
          
          {isChainFilterOpen && (
            <Card className="absolute mt-1 p-3 z-50 w-full max-h-80 overflow-y-auto bg-background-dark/95 backdrop-blur-xl border border-secondary/30 rounded-lg shadow-xl">
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-foreground/40" />
                </div>
                <Input
                  placeholder="Search chains..."
                  className="pl-8 text-sm bg-background/40 border-secondary/20 rounded-md"
                  value={chainSearch}
                  onChange={(e) => setChainSearch(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </>
                ) : filteredChains.length === 0 ? (
                  <p className="text-sm text-foreground/60 p-2 text-center">No chains found</p>
                ) : (
                  filteredChains.map(chain => (
                    <div 
                      key={chain}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() => handleChainSelect(chain)}
                    >
                      <span className="text-sm font-medium">{chain}</span>
                      {activeFilters.chains.includes(chain) ? (
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-secondary/20 bg-background/40"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
        
        {/* Stage Filter Button */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="default" 
            className="w-full justify-between bg-background/40 border-secondary/20 text-foreground hover:bg-background-light/40 hover:text-foreground/90 focus:ring-1 focus:ring-secondary/20"
            onClick={toggleStageFilter}
          >
            <div className="flex items-center">
              <div className="bg-secondary/10 p-1 rounded mr-2">
                <Filter className="h-4 w-4 text-secondary" />
              </div>
              <span>Stage {activeFilters.stages.length > 0 && <span className="ml-1 text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full">{activeFilters.stages.length}</span>}</span>
            </div>
            {isStageFilterOpen ? <ChevronUp className="h-4 w-4 text-foreground/60" /> : <ChevronDown className="h-4 w-4 text-foreground/60" />}
          </Button>
          
          {isStageFilterOpen && (
            <Card className="absolute mt-1 p-3 z-50 w-full max-h-80 overflow-y-auto bg-background-dark/95 backdrop-blur-xl border border-secondary/30 rounded-lg shadow-xl">
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-foreground/40" />
                </div>
                <Input
                  placeholder="Search stages..."
                  className="pl-8 text-sm bg-background/40 border-secondary/20 rounded-md"
                  value={stageSearch}
                  onChange={(e) => setStageSearch(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </>
                ) : filteredStages.length === 0 ? (
                  <p className="text-sm text-foreground/60 p-2 text-center">No stages found</p>
                ) : (
                  filteredStages.map(stage => (
                    <div 
                      key={stage}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/5 cursor-pointer transition-colors"
                      onClick={() => onFilterChange('stages', stage)}
                    >
                      <span className="text-sm font-medium">{stage}</span>
                      {activeFilters.stages.includes(stage) ? (
                        <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-secondary" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-secondary/20 bg-background/40"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
        
        {/* Version Filter Button */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="default" 
            className="w-full justify-between bg-background/40 border-secondary/20 text-foreground hover:bg-background-light/40 hover:text-foreground/90 focus:ring-1 focus:ring-accent/20"
            onClick={toggleVersionFilter}
          >
            <div className="flex items-center">
              <div className="bg-accent/10 p-1 rounded mr-2">
                <Filter className="h-4 w-4 text-accent" />
              </div>
              <span>Version {activeFilters.versions.length > 0 && <span className="ml-1 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">{activeFilters.versions.length}</span>}</span>
            </div>
            {isVersionFilterOpen ? <ChevronUp className="h-4 w-4 text-foreground/60" /> : <ChevronDown className="h-4 w-4 text-foreground/60" />}
          </Button>
          
          {isVersionFilterOpen && (
            <Card className="absolute mt-1 p-3 z-50 w-full max-h-80 overflow-y-auto bg-background-dark/95 backdrop-blur-xl border border-secondary/30 rounded-lg shadow-xl">
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-foreground/40" />
                </div>
                <Input
                  placeholder="Search versions..."
                  className="pl-8 text-sm bg-background/40 border-secondary/20 rounded-md"
                  value={versionSearch}
                  onChange={(e) => setVersionSearch(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </>
                ) : filteredVersions.length === 0 ? (
                  <p className="text-sm text-foreground/60 p-2 text-center">No versions found</p>
                ) : (
                  filteredVersions.map(version => (
                    <div 
                      key={version}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent/5 cursor-pointer transition-colors"
                      onClick={() => onFilterChange('versions', version)}
                    >
                      <span className="text-sm font-medium font-mono">v{version}</span>
                      {activeFilters.versions.includes(version) ? (
                        <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-accent" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-secondary/20 bg-background/40"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2">
          {activeFilterCount > 0 ? (
            <>
              {activeFilters.chains.map(chain => (
                <Badge 
                  key={`chain-${chain}`} 
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 flex items-center gap-1 px-3 py-1 rounded-full"
                >
                  {chain}
                  <button 
                    onClick={() => onFilterChange('chains', chain)}
                    className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                    aria-label={`Remove ${chain} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {activeFilters.stages.map(stage => (
                <Badge 
                  key={`stage-${stage}`} 
                  variant="outline"
                  className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 flex items-center gap-1 px-3 py-1 rounded-full"
                >
                  {stage}
                  <button 
                    onClick={() => onFilterChange('stages', stage)}
                    className="ml-1 rounded-full hover:bg-secondary/20 p-0.5"
                    aria-label={`Remove ${stage} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {activeFilters.versions.map(version => (
                <Badge 
                  key={`version-${version}`} 
                  variant="outline"
                  className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 flex items-center gap-1 px-3 py-1 rounded-full"
                >
                  v{version}
                  <button 
                    onClick={() => onFilterChange('versions', version)}
                    className="ml-1 rounded-full hover:bg-accent/20 p-0.5"
                    aria-label={`Remove version ${version} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </>
          ) : (
            <span className="text-sm text-foreground/60">No active filters</span>
          )}
        </div>
        
        {/* Clear Filters Button - Only shown when filters are active */}
        {activeFilterCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onResetFilters}
            className="text-foreground/70 border-secondary/20 bg-background/40 hover:bg-background-light/30 transition-colors"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}