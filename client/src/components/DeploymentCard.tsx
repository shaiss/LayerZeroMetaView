import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, ExternalLink, Copy } from "lucide-react";
import { ProcessedDeployment } from "@shared/types";
import { truncateAddress, getExplorerUrl } from "@/lib/utils";

interface DeploymentCardProps {
  deployment: ProcessedDeployment;
  onViewDetails: (deployment: ProcessedDeployment) => void;
  onCopyAddress: (address: string) => void;
}

export default function DeploymentCard({ 
  deployment, 
  onViewDetails,
  onCopyAddress 
}: DeploymentCardProps) {
  return (
    <Card className="rounded-xl overflow-hidden border-slate-700 bg-slate-800/50 backdrop-blur-md animate-in fade-in">
      <CardHeader className="flex flex-row items-center p-4 border-b border-slate-700">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-3">
          <Network className="text-white h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-lg">{deployment.chainKey}</h3>
          <div className="flex items-center">
            <span className="text-xs text-slate-400 mr-2">EID: {deployment.eid}</span>
            <Badge variant={deployment.stage === 'mainnet' ? 'default' : 'secondary'} className="bg-primary/20 text-primary hover:bg-primary/30">
              {deployment.stage}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-xs text-slate-400 mb-1">Endpoint</p>
          <div className="flex items-center">
            <p className="text-sm font-mono text-slate-200 truncate">{truncateAddress(deployment.endpoint.address)}</p>
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
        
        <div>
          <p className="text-xs text-slate-400 mb-1">UltraLightNodeV2</p>
          <div className="flex items-center">
            <p className="text-sm font-mono text-slate-200 truncate">
              {deployment.ultraLightNodeV2 
                ? truncateAddress(deployment.ultraLightNodeV2.address) 
                : 'N/A'}
            </p>
            {deployment.ultraLightNodeV2 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 p-0 h-auto text-secondary hover:text-accent hover:bg-transparent"
                onClick={() => onCopyAddress(deployment.ultraLightNodeV2!.address)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-1">Version</p>
            <p className="text-sm font-mono text-slate-200">{deployment.version}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-1">Chain Key</p>
            <p className="text-sm font-mono text-slate-200">{deployment.chainKey}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-slate-700 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            className="text-xs bg-primary hover:bg-primary/90 text-white border-primary font-medium"
            onClick={() => onViewDetails(deployment)}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
            asChild
          >
            <a 
              href={getExplorerUrl(deployment.chainKey, deployment.endpoint.address)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Explorer
            </a>
          </Button>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-400 mr-1.5"></div>
          <span className="text-xs text-green-400">Active</span>
        </div>
      </CardFooter>
    </Card>
  );
}
