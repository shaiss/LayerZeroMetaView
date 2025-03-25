import { useState, useEffect } from "react";
import { 
  Filter, X, Search, ChevronDown, ChevronUp, Check, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

interface FilterOption {
  value: string;
  label: string;
}

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

export default function FilterPanel({
  isLoading,
  filterOptions,
  activeFilters,
  onFilterChange,
  onResetFilters,
  searchTerm,
  onSearchChange
}: FilterPanelProps) {
  const [chainSearchValue, setChainSearchValue] = useState("");
  const [stageSearchValue, setStageSearchValue] = useState("");
  const [versionSearchValue, setVersionSearchValue] = useState("");
  
  // Format options
  const chainOptions: FilterOption[] = filterOptions?.chains.map(chain => ({
    value: chain,
    label: chain
  })) || [];
  
  const stageOptions: FilterOption[] = filterOptions?.stages.map(stage => ({
    value: stage,
    label: stage
  })) || [];
  
  const versionOptions: FilterOption[] = filterOptions?.versions.map(version => ({
    value: version.toString(),
    label: `v${version}`
  })) || [];
  
  // Filter the options based on search
  const filteredChainOptions = chainOptions.filter(option => 
    option.label.toLowerCase().includes(chainSearchValue.toLowerCase())
  );
  
  const filteredStageOptions = stageOptions.filter(option => 
    option.label.toLowerCase().includes(stageSearchValue.toLowerCase())
  );
  
  const filteredVersionOptions = versionOptions.filter(option => 
    option.label.toLowerCase().includes(versionSearchValue.toLowerCase())
  );
  
  // Count active filters
  const activeFilterCount = activeFilters.chains.length + 
    activeFilters.stages.length + 
    activeFilters.versions.length;
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  
  // Handle filter option selection
  const handleChainSelect = (value: string) => {
    onFilterChange('chains', value);
    setChainSearchValue("");
  };
  
  const handleStageSelect = (value: string) => {
    onFilterChange('stages', value);
    setStageSearchValue("");
  };
  
  const handleVersionSelect = (value: string) => {
    onFilterChange('versions', parseInt(value));
    setVersionSearchValue("");
  };
  
  // Remove a specific filter
  const removeFilter = (type: 'chains' | 'stages' | 'versions', value: string | number) => {
    onFilterChange(type, value);
  };
  
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
      <div className="flex flex-wrap items-center gap-2">
        {/* Chain Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="bg-slate-800/70 border-slate-700 text-slate-300">
              Chain
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-64 border-slate-700 bg-slate-800/95 backdrop-blur-lg">
            <Command>
              <CommandInput 
                placeholder="Search chains..." 
                className="border-none focus:ring-0"
                value={chainSearchValue}
                onValueChange={setChainSearchValue}
              />
              <CommandList className="max-h-60">
                <CommandEmpty>No chains found</CommandEmpty>
                <CommandGroup>
                  {isLoading ? (
                    <div className="p-1 space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    filteredChainOptions.map(option => (
                      <CommandItem 
                        key={option.value}
                        onSelect={() => handleChainSelect(option.value)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span>{option.label}</span>
                        {activeFilters.chains.includes(option.value) && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Stage Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="bg-slate-800/70 border-slate-700 text-slate-300">
              Stage
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-48 border-slate-700 bg-slate-800/95 backdrop-blur-lg">
            <Command>
              <CommandInput 
                placeholder="Search stages..." 
                className="border-none focus:ring-0"
                value={stageSearchValue}
                onValueChange={setStageSearchValue}
              />
              <CommandList className="max-h-60">
                <CommandEmpty>No stages found</CommandEmpty>
                <CommandGroup>
                  {isLoading ? (
                    <div className="p-1 space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    filteredStageOptions.map(option => (
                      <CommandItem 
                        key={option.value}
                        onSelect={() => handleStageSelect(option.value)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span>{option.label}</span>
                        {activeFilters.stages.includes(option.value) && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Version Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="bg-slate-800/70 border-slate-700 text-slate-300">
              Version
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-48 border-slate-700 bg-slate-800/95 backdrop-blur-lg">
            <Command>
              <CommandInput 
                placeholder="Search versions..." 
                className="border-none focus:ring-0"
                value={versionSearchValue}
                onValueChange={setVersionSearchValue}
              />
              <CommandList className="max-h-60">
                <CommandEmpty>No versions found</CommandEmpty>
                <CommandGroup>
                  {isLoading ? (
                    <div className="p-1 space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    filteredVersionOptions.map(option => (
                      <CommandItem 
                        key={option.value}
                        onSelect={() => handleVersionSelect(option.value)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span>{option.label}</span>
                        {activeFilters.versions.includes(parseInt(option.value)) && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
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
                  onClick={() => removeFilter('chains', chain)}
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
                  onClick={() => removeFilter('stages', stage)}
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
                  onClick={() => removeFilter('versions', version)}
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