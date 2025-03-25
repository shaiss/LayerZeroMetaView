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
  
  // Toggle filters
  const toggleChainFilter = () => setIsChainFilterOpen(!isChainFilterOpen);
  const toggleStageFilter = () => setIsStageFilterOpen(!isStageFilterOpen);
  const toggleVersionFilter = () => setIsVersionFilterOpen(!isVersionFilterOpen);
  
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search chains, EIDs, addresses..." 
          className="pl-10 font-mono text-sm bg-slate-800/50 border-slate-700"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        {/* Chain Filter Button */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-slate-800/70 border-slate-700 text-slate-300"
            onClick={toggleChainFilter}
          >
            Chain
            {isChainFilterOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
          
          {isChainFilterOpen && (
            <Card className="absolute mt-1 p-2 z-50 w-60 max-h-80 overflow-y-auto bg-slate-800/95 backdrop-blur-lg border-slate-700">
              <Input
                placeholder="Search chains..."
                className="mb-2 text-sm bg-slate-700/50 border-slate-600"
                value={chainSearch}
                onChange={(e) => setChainSearch(e.target.value)}
              />
              <div className="space-y-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </>
                ) : filteredChains.length === 0 ? (
                  <p className="text-sm text-slate-400 p-2">No chains found</p>
                ) : (
                  filteredChains.map(chain => (
                    <div 
                      key={chain}
                      className="flex items-center justify-between p-2 rounded hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => onFilterChange('chains', chain)}
                    >
                      <span className="text-sm">{chain}</span>
                      {activeFilters.chains.includes(chain) && (
                        <Check className="h-4 w-4 text-green-500" />
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
            size="sm" 
            className="bg-slate-800/70 border-slate-700 text-slate-300"
            onClick={toggleStageFilter}
          >
            Stage
            {isStageFilterOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
          
          {isStageFilterOpen && (
            <Card className="absolute mt-1 p-2 z-50 w-48 max-h-80 overflow-y-auto bg-slate-800/95 backdrop-blur-lg border-slate-700">
              <Input
                placeholder="Search stages..."
                className="mb-2 text-sm bg-slate-700/50 border-slate-600"
                value={stageSearch}
                onChange={(e) => setStageSearch(e.target.value)}
              />
              <div className="space-y-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </>
                ) : filteredStages.length === 0 ? (
                  <p className="text-sm text-slate-400 p-2">No stages found</p>
                ) : (
                  filteredStages.map(stage => (
                    <div 
                      key={stage}
                      className="flex items-center justify-between p-2 rounded hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => onFilterChange('stages', stage)}
                    >
                      <span className="text-sm">{stage}</span>
                      {activeFilters.stages.includes(stage) && (
                        <Check className="h-4 w-4 text-green-500" />
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
            size="sm" 
            className="bg-slate-800/70 border-slate-700 text-slate-300"
            onClick={toggleVersionFilter}
          >
            Version
            {isVersionFilterOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
          
          {isVersionFilterOpen && (
            <Card className="absolute mt-1 p-2 z-50 w-48 max-h-80 overflow-y-auto bg-slate-800/95 backdrop-blur-lg border-slate-700">
              <Input
                placeholder="Search versions..."
                className="mb-2 text-sm bg-slate-700/50 border-slate-600"
                value={versionSearch}
                onChange={(e) => setVersionSearch(e.target.value)}
              />
              <div className="space-y-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </>
                ) : filteredVersions.length === 0 ? (
                  <p className="text-sm text-slate-400 p-2">No versions found</p>
                ) : (
                  filteredVersions.map(version => (
                    <div 
                      key={version}
                      className="flex items-center justify-between p-2 rounded hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => onFilterChange('versions', version)}
                    >
                      <span className="text-sm">v{version}</span>
                      {activeFilters.versions.includes(version) && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
        
        {/* Clear Filters Button - Only shown when filters are active */}
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilters}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <X className="mr-1 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {activeFilters.chains.map(chain => (
              <Badge 
                key={`chain-${chain}`} 
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 flex items-center gap-1"
              >
                {chain}
                <button 
                  onClick={() => onFilterChange('chains', chain)}
                  className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {activeFilters.stages.map(stage => (
              <Badge 
                key={`stage-${stage}`} 
                variant="outline"
                className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 flex items-center gap-1"
              >
                {stage}
                <button 
                  onClick={() => onFilterChange('stages', stage)}
                  className="ml-1 rounded-full hover:bg-secondary/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {activeFilters.versions.map(version => (
              <Badge 
                key={`version-${version}`} 
                variant="outline"
                className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 flex items-center gap-1"
              >
                v{version}
                <button 
                  onClick={() => onFilterChange('versions', version)}
                  className="ml-1 rounded-full hover:bg-accent/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}