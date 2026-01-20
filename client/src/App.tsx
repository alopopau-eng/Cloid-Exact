import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import MotorInsurance from "@/pages/motor-insurance";
import PhoneVerification from "@/pages/phone-verification";
import NafazPage from "@/pages/nafaz";
import RajhiPage from "@/pages/rajhi";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/motor" component={MotorInsurance} />
      <Route path="/phone" component={PhoneVerification} />
      <Route path="/nafaz" component={NafazPage} />
      <Route path="/rajhi" component={RajhiPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
