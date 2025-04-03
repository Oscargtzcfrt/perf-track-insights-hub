
import { ReactNode, useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-4 sticky top-0 bg-background z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">PerfTrack</h1>
        </header>
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
        
        <footer className="border-t py-3 px-6 text-center text-sm text-muted-foreground">
          PerfTrack © {new Date().getFullYear()} - Performance Tracking Made Simple
        </footer>
      </div>
    </div>
  );
}
