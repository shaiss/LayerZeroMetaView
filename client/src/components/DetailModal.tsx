import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Network, X, ExternalLink, Copy, Info, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { ProcessedDeployment } from "@shared/types";
import { truncateAddress, getExplorerUrl } from "@/lib/utils";
import { useEffect, useState } from "react";
import { fetchDeploymentById } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DetailModalProps {
  deployment: ProcessedDeployment;
  onClose: () => void;
  onCopyAddress: (address: string) => void;
}

export default function DetailModal({ 
  deployment: initialDeployment, 
  onClose,
  onCopyAddress 
}: DetailModalProps) {
  // State to track the latest deployment data
  const [deployment, setDeployment] = useState<ProcessedDeployment>(initialDeployment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch the latest deployment data when the modal opens
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const latestData = await fetchDeploymentById(initialDeployment.id);
        setDeployment(latestData);
      } catch (err) {
        console.error("Error fetching latest deployment data:", err);
        setError("Could not fetch the latest data. Showing cached version.");
        toast({
          title: "Data Refresh Failed",
          description: "Could not fetch the latest deployment data. Showing cached version.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestData();
  }, [initialDeployment.id]);
  
  // Helper function to render contract address
  const renderContractAddress = (label: string, contract: { address: string } | undefined) => {
    if (!contract) return null;
    
    return (
      <div className="p-3 rounded-lg bg-background/50 border border-secondary/10">
        <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">{label}</p>
        <div className="flex items-center">
          <code className="text-sm font-mono text-foreground/80 break-all pr-2">{contract.address}</code>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto p-1 h-auto text-secondary hover:text-accent hover:bg-secondary/10 rounded-full"
            onClick={() => onCopyAddress(contract.address)}
            aria-label={`Copy ${label} address`}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-background to-background-dark/80 backdrop-blur-lg border-secondary/20 rounded-xl shadow-2xl p-0">
        {/* Header with glowing effect */}
        <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-r from-background-dark to-background p-6 border-b border-secondary/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full -mr-20 -mt-20 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 blur-3xl rounded-full -ml-20 -mb-20 opacity-60"></div>
          
          <DialogHeader className="flex flex-row justify-between items-center relative z-10">
            <div className="flex items-center">
              <div className="h-14 w-14 relative mr-5">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent opacity-70 blur-[8px]"></div>
                <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-white/10">
                  <Network className="text-white h-6 w-6" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">{deployment.chainKey} Deployment</DialogTitle>
                <DialogDescription className="text-foreground/70">
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <div className="flex items-center">
                      <span className="text-sm font-mono font-medium">EID: {deployment.eid}</span>
                    </div>
                    <Badge variant={deployment.stage === 'mainnet' ? 'default' : 'secondary'} 
                      className={deployment.stage === 'mainnet' 
                        ? "bg-accent/10 text-accent border-accent/20" 
                        : "bg-secondary/10 text-secondary border-secondary/20"}>
                      {deployment.stage}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-success text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Active</span>
                    </div>
                    
                    {loading && (
                      <div className="flex items-center gap-1.5 text-primary text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Refreshing data...</span>
                      </div>
                    )}
                  </div>
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-foreground/10">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
        </div>
        
        {error && (
          <div className="mx-6 mt-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Contracts Panel */}
            <div className="glass-panel p-5 space-y-5">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <div className="w-6 h-6 bg-primary/20 rounded-md flex items-center justify-center mr-2">
                  <Network className="text-primary h-4 w-4" />
                </div>
                Core Contracts
              </h3>
              
              <div className="space-y-4">
                {renderContractAddress("Endpoint", deployment.endpoint)}
                {renderContractAddress("UltraLightNodeV2", deployment.ultraLightNodeV2)}
                {renderContractAddress("RelayerV2", deployment.relayerV2)}
              </div>
            </div>
            
            {/* Send/Receive Contracts Panel */}
            <div className="glass-panel p-5 space-y-5">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <div className="w-6 h-6 bg-secondary/20 rounded-md flex items-center justify-center mr-2">
                  <ArrowRight className="text-secondary h-4 w-4" />
                </div>
                Send/Receive Contracts
              </h3>
              
              <div className="space-y-4">
                {renderContractAddress("SendUln301", deployment.sendUln301)}
                {renderContractAddress("ReceiveUln301", deployment.receiveUln301)}
                {renderContractAddress("NonceContract", deployment.nonceContract)}
                
                {!deployment.sendUln301 && !deployment.receiveUln301 && !deployment.nonceContract && (
                  <div className="p-4 rounded-lg bg-background/20 border border-secondary/10 text-foreground/60 text-center">
                    No send/receive contracts available for this deployment
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Deployment Details Panel */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              <div className="w-6 h-6 bg-accent/20 rounded-md flex items-center justify-center mr-2">
                <Info className="text-accent h-4 w-4" />
              </div>
              Deployment Details
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div className="p-3 rounded-lg bg-background/50 border border-secondary/10">
                <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">Chain Key</p>
                <p className="text-sm font-medium text-foreground/90">{deployment.chainKey}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50 border border-secondary/10">
                <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">EID</p>
                <p className="text-sm font-mono font-medium text-primary">{deployment.eid}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50 border border-secondary/10">
                <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">Stage</p>
                <p className="text-sm font-medium text-secondary">{deployment.stage}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50 border border-secondary/10">
                <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">Version</p>
                <p className="text-sm font-mono font-medium text-accent">v{deployment.version}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50 border border-secondary/10">
                <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">Status</p>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-success mr-1.5 animate-pulse"></div>
                  <p className="text-sm font-medium text-success">Active</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50 border border-secondary/10">
                <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">Data Source</p>
                <p className="text-sm font-medium text-foreground/90">LayerZero API</p>
              </div>
            </div>
          </div>
          
          {/* Additional Information Panel */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-5 border border-primary/10">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="text-accent h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-base mb-2">About LayerZero Deployments</h4>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  This deployment data is fetched directly from the LayerZero API. The addresses shown here
                  represent the official smart contracts that make up the LayerZero infrastructure for {deployment.chainKey}.
                  These contracts handle cross-chain messaging and are essential for building omnichain applications.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t border-secondary/20 bg-background/50 flex flex-col sm:flex-row sm:justify-between gap-3">
          <a 
            href={getExplorerUrl(deployment.chainKey, deployment.endpoint.address)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-foreground/60 hover:text-foreground flex items-center transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            View on block explorer
          </a>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-secondary/20 bg-background/50">
              Close
            </Button>
            <Button 
              asChild
              className="bg-primary hover:bg-primary-light text-white font-medium"
              disabled={loading}
            >
              <a 
                href={getExplorerUrl(deployment.chainKey, deployment.endpoint.address)} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Explorer
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
