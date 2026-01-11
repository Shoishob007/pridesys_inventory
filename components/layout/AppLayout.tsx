"use client";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react"; // Add this import

// Add children prop
interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-secondary/30">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          !isMobile && (sidebarOpen ? "ml-[256px]" : "ml-[72px]")
        )}
      >
        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-30 flex items-center h-14 px-4 bg-background border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-4"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </header>
        )}

        <div className="p-6">
          {/* Replace Outlet with children */}
          {children}
        </div>
      </main>
    </div>
  );
}
