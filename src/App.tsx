
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import PeoplePage from "./pages/PeoplePage";
import DepartmentsPage from "./pages/DepartmentsPage";
import KpisPage from "./pages/KpisPage";
import KpiEntryPage from "./pages/KpiEntryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import PersonPerformancePage from "./pages/PersonPerformancePage";
import PersonDetailView from "./components/performance/PersonDetailView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/kpis" element={<KpisPage />} />
              <Route path="/kpi-entry" element={<KpiEntryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/performance" element={<PersonPerformancePage />} />
              <Route path="/performance/person/:personId" element={<PersonDetailView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
