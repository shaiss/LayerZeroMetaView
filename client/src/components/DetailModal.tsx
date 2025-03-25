import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Network, X, ExternalLink, Copy } from "lucide-react";
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
  // For display purposes, imagine these connected chains
  // In a real implementation, this would come from the API/backend
  const connectedChains = [
    { name: "ethereum", color: "from-green-400 to-blue-500" },
    { name: "arbitrum", color: "from-purple-400 to-pink-500" },
    { name: "polygon", color: "from-blue-400 to-indigo-500" },
    { name: "optimism", color: "from-red-400 to-orange-500" }
  ];
  
  // Mock transaction history
  const transactions = [
    { date: "2023-05-12", hash: "0x3a8e...f92d", type: "Deploy", status: "Success" },
    { date: "2023-05-14", hash: "0x7c2d...a45e", type: "Update", status: "Success" },
    { date: "2023-06-02", hash: "0x5f1a...b37c", type: "Config", status: "Success" }
  ];
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto bg-slate-800/90 backdrop-blur-md border-slate-600">
        <DialogHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-4">
              <Network className="text-white h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-medium">{deployment.chainKey} Deployment</h2>
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
            <h3 className="text-lg font-medium text-slate-200 mb-4">Connected Chains</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {connectedChains.map((chain) => (
                <Card key={chain.name} className="p-3 rounded-lg flex items-center space-x-2 bg-slate-800/70 border-slate-700">
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-r ${chain.color} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white h-3 w-3">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </div>
                  <span className="text-sm text-slate-200">{chain.name}</span>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-4">Transaction History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tx Hash</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((tx, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-slate-300 font-mono">{tx.date}</td>
                      <td className="px-4 py-3 text-sm text-secondary font-mono">{tx.hash}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{tx.type}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400">{tx.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
