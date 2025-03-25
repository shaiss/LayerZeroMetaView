import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Network, X, ExternalLink, Copy, Info } from "lucide-react";
import { ProcessedDeployment } from "@shared/types";
import { truncateAddress, getExplorerUrl } from "@/lib/utils";

interface DetailModalProps {
  deployment: ProcessedDeployment;
  onClose: () => void;
  onCopyAddress: (address: string) => void;
}

export default function DetailModal({ 
  deployment, 
  onClose,
  onCopyAddress 
}: DetailModalProps) {
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto bg-slate-800/90 backdrop-blur-md border-slate-600">
        <DialogHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-4">
              <Network className="text-white h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-medium">{deployment.chainKey} Deployment</DialogTitle>
              <div className="flex items-center">
                <span className="text-sm text-slate-400 mr-3">EID: {deployment.eid}</span>
                <Badge variant={deployment.stage === 'mainnet' ? 'default' : 'secondary'} className="bg-primary/20 text-primary">
                  {deployment.stage}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Core Contracts</h3>
              
              <div>
                <p className="text-xs text-slate-400 mb-1">Endpoint</p>
                <div className="flex items-center">
                  <p className="text-sm font-mono text-slate-200 truncate">{deployment.endpoint.address}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 p-0 h-auto text-secondary hover:text-accent hover:bg-transparent"
                    onClick={() => onCopyAddress(deployment.endpoint.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {deployment.ultraLightNodeV2 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">UltraLightNodeV2</p>
                  <div className="flex items-center">
                    <p className="text-sm font-mono text-slate-200 truncate">{deployment.ultraLightNodeV2.address}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 p-0 h-auto text-secondary hover:text-accent hover:bg-transparent"
                      onClick={() => onCopyAddress(deployment.ultraLightNodeV2.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {deployment.relayerV2 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">RelayerV2</p>
                  <div className="flex items-center">
                    <p className="text-sm font-mono text-slate-200 truncate">{deployment.relayerV2.address}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 p-0 h-auto text-secondary hover:text-accent hover:bg-transparent"
                      onClick={() => onCopyAddress(deployment.relayerV2.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Send/Receive Contracts</h3>
              
              {deployment.sendUln301 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">SendUln301</p>
                  <div className="flex items-center">
                    <p className="text-sm font-mono text-slate-200 truncate">{deployment.sendUln301.address}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 p-0 h-auto text-secondary hover:text-accent hover:bg-transparent"
                      onClick={() => onCopyAddress(deployment.sendUln301.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {deployment.receiveUln301 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">ReceiveUln301</p>
                  <div className="flex items-center">
                    <p className="text-sm font-mono text-slate-200 truncate">{deployment.receiveUln301.address}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 p-0 h-auto text-secondary hover:text-accent hover:bg-transparent"
                      onClick={() => onCopyAddress(deployment.receiveUln301.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {deployment.nonceContract && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">NonceContract</p>
                  <div className="flex items-center">
                    <p className="text-sm font-mono text-slate-200 truncate">{deployment.nonceContract.address}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 p-0 h-auto text-secondary hover:text-accent hover:bg-transparent"
                      onClick={() => onCopyAddress(deployment.nonceContract.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-4">Deployment Details</h3>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Chain Key</p>
                  <p className="text-sm font-medium text-slate-200">{deployment.chainKey}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">EID</p>
                  <p className="text-sm font-medium text-slate-200">{deployment.eid}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Stage</p>
                  <p className="text-sm font-medium text-slate-200">{deployment.stage}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Version</p>
                  <p className="text-sm font-medium text-slate-200">{deployment.version}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <p className="text-sm font-medium text-green-400">Active</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Data Source</p>
                  <p className="text-sm font-medium text-slate-200">LayerZero API</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-4">Additional Information</h3>
            <div className="flex items-center bg-primary/10 rounded-lg p-4 border border-primary/30">
              <Info className="text-accent h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm text-slate-300">
                This deployment data is fetched directly from the LayerZero API. The information shown here 
                represents the current state of the LayerZero infrastructure for this chain.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild>
            <a 
              href={getExplorerUrl(deployment.chainKey, deployment.endpoint.address)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-secondary hover:bg-secondary/90"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Explorer
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
