"use client";

import {
  Package,
  MapPin,
  Tag,
  FileText,
  Settings,
  Receipt,
  ChevronLeft,
  MoreVertical,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "Locations", path: "/locations", icon: MapPin },
  { name: "Labels", path: "/labels", icon: Tag },
  { name: "Receipts", path: "/receipts", icon: Receipt },
  { name: "Reports", path: "/reports", icon: FileText },
];

const settingsNavItems: NavItem[] = [
  { name: "Settings", path: "/settings", icon: Settings },
];

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export function AppSidebar({ isOpen, onToggle, isMobile }: AppSidebarProps) {
  const pathname = usePathname();

  const isActiveRoute = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.path);

    const navContent = (
      <div
        className={cn("sidebar-item", isActive && "sidebar-item-active")}
        onClick={() => isMobile && onToggle()}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {isOpen && <span className="truncate">{item.name}</span>}
      </div>
    );

    // Show tooltip only when sidebar is collapsed (not open)
    if (!isOpen) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <Link href={item.path}>{navContent}</Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10} className="z-50">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link key={item.path} href={item.path}>
        {navContent}
      </Link>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Mobile overlay */}
        {isMobile && isOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={onToggle} />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 h-full bg-sidebar flex flex-col z-50 transition-all duration-300",
            isOpen ? "w-[256px]" : "w-[72px]",
            isMobile && !isOpen && "-translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <h1 className="font-semibold text-foreground truncate">
                  Home Inventory
                </h1>
                <p className="text-xs text-sidebar-muted">Manage your items</p>
              </div>
            )}
            {!isOpen && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  {/* <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </div> */}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="z-50">
                  Home Inventory
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {mainNavItems.map(renderNavItem)}

            {isOpen && (
              <div className="pt-6 pb-2">
                <span className="px-3 text-xs font-medium text-sidebar-muted uppercase tracking-wider">
                  Settings
                </span>
              </div>
            )}

            {settingsNavItems.map(renderNavItem)}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-sidebar-border">
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors",
                !isOpen && "justify-center"
              )}
            >
              {!isOpen ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-9 w-9 flex-shrink-0 cursor-pointer">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="z-50">
                    <div className="text-sm">
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-sidebar-muted truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-sidebar-muted hover:text-foreground hover:bg-sidebar-accent"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Collapse button - desktop only */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  !isOpen && "rotate-180"
                )}
              />
            </button>
          )}
        </aside>
      </>
    </TooltipProvider>
  );
}
