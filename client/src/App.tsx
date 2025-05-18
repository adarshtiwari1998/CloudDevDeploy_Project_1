import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AiAssistantPage from "@/pages/ai-assistant";
import AzureDeploymentPage from "@/pages/azure-deployment";
import LoginPage from "@/components/login-page";
import AzureAuthProvider from "@/components/azure-auth-provider";
import ProtectedRoute from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <UnauthenticatedTemplate>
          <LoginPage />
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <Route path="/">
            <Home />
          </Route>
        </AuthenticatedTemplate>
      </Route>
      
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      
      <Route path="/ai-assistant">
        <ProtectedRoute>
          <AiAssistantPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/azure-deployment">
        <ProtectedRoute>
          <AzureDeploymentPage />
        </ProtectedRoute>
      </Route>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AzureAuthProvider>
          <Toaster />
          <Router />
        </AzureAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
