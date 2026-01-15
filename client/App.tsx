import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import CreateCategory from "./pages/CreateCategory";
import CreateSubCategory from "./pages/CreateSubCategory";
import CreateUnit from "./pages/CreateUnit";
import CreateVendor from "./pages/CreateVendor";
import RMManagement from "./pages/RMManagement";
import RMCManagement from "./pages/RMCManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/create-category" element={<CreateCategory />} />
          <Route path="/create-subcategory" element={<CreateSubCategory />} />
          <Route path="/create-unit" element={<CreateUnit />} />
          <Route path="/create-vendor" element={<CreateVendor />} />
          <Route path="/raw-materials" element={<RMManagement />} />
          <Route path="/recipe-costing" element={<RMCManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
