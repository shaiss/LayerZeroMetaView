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
    <Card className="rounded-xl overflow-hidden border-[1px] border-secondary/20 bg-background-dark/80 backdrop-blur-lg hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="flex flex-row items-center p-4 border-b border-secondary/10 bg-gradient-to-br from-background to-background-light/10">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-3 shadow-sm">
          <Network className="text-white h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg tracking-tight">{deployment.chainKey}</h3>
          <div className="flex items-center">
            <span className="text-xs text-foreground/70 mr-2 font-mono">EID: {deployment.eid}</span>
            <Badge variant={deployment.stage === 'mainnet' ? 'default' : 'secondary'} 
              className={deployment.stage === 'mainnet' 
                ? "bg-accent/10 text-accent border-accent/20" 
                : "bg-secondary/10 text-secondary border-secondary/20"}>
              {deployment.stage}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4 bg-gradient-to-b from-background-dark/60 to-background-dark/90">
        <div className="p-3 rounded-lg bg-background/30 border border-secondary/10">
          <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">Endpoint</p>
          <div className="flex items-center">
            <p className="text-sm font-mono font-medium text-foreground/80 truncate">{truncateAddress(deployment.endpoint.address)}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 p-1 h-auto text-secondary hover:text-accent hover:bg-secondary/10 rounded-full"
              onClick={() => onCopyAddress(deployment.endpoint.address)}
              aria-label="Copy endpoint address"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-background/30 border border-secondary/10">
            <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">Version</p>
            <p className="text-sm font-mono font-medium text-accent">{deployment.version}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-background/30 border border-secondary/10">
            <p className="text-xs uppercase tracking-wider font-medium text-foreground/60 mb-2">Status</p>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-success mr-1.5 animate-pulse"></div>
              <p className="text-sm font-medium text-success">Active</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-secondary/10 flex justify-between items-center bg-gradient-to-b from-background/40 to-background-dark/60">
        <div className="flex space-x-3">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-primary hover:bg-primary-light text-white font-medium drop-shadow transition-colors"
            onClick={() => onViewDetails(deployment)}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-secondary/20 bg-secondary/5 hover:bg-secondary/10 text-secondary hover:text-secondary-light"
            asChild
          >
            <a 
              href={getExplorerUrl(deployment.chainKey, deployment.endpoint.address)} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="View in Explorer"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Explorer
            </a>
          </Button>
        </div>
        
        <div className="flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
          EID: {deployment.eid}
        </div>
      </CardFooter>
    </Card>
  );
}
