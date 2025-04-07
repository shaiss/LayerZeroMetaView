import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CrossChainExplorerPage from "@/pages/cross-chain-explorer";
import "./fonts.css";

// Simple Navigation component
function Navigation() {
  const [location] = useLocation();
  
  return (
    <header className="border-b border-border">
      <div className="container flex h-16 items-center">
        <div className="mr-8 font-bold text-lg">LayerZero Explorer</div>
        <nav className="flex gap-6">
          <Link href="/" className={`text-sm ${location === '/' ? 'font-medium' : 'text-muted-foreground'}`}>
            Deployments
          </Link>
          <Link href="/cross-chain-explorer" className={`text-sm ${location === '/cross-chain-explorer' ? 'font-medium' : 'text-muted-foreground'}`}>
            Cross-Chain Explorer
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/cross-chain-explorer" component={CrossChainExplorerPage}/>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
