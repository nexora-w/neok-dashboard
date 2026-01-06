"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Gift, Share2, HelpCircle, Bell, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshProvider, useRefresh } from "./refresh-context";
import { toast } from "sonner";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { refreshing, onRefresh } = useRefresh();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/auth');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { id: "bonuses", icon: Gift, label: "BONUSES", path: "/" },
    { id: "socials", icon: Share2, label: "SOCIAL LINKS", path: "/socials" },
    { id: "faqs", icon: HelpCircle, label: "FAQs", path: "/faqs" },
  ];

  const getPageTitle = () => {
    if (pathname === "/socials") return "SOCIAL LINKS";
    if (pathname === "/faqs") return "FAQs";
    if (pathname === "/bonuses") return "BONUSES";
    return "BONUSES";
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-[#EDAF5F] font-bold text-lg tracking-wider">NEOKCS</h1>
              <p className="text-neutral-500 text-xs">v1.0.0</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-[#EDAF5F]"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                    isActive
                      ? "bg-[#EDAF5F] text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-neutral-400 hover:text-red-500 hover:bg-neutral-800"
            >
              <LogOut className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
              {!sidebarCollapsed && <span className="text-sm font-medium">LOGOUT</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              <span className="text-[#EDAF5F]">{getPageTitle()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-neutral-500">LAST UPDATE: 05/06/2025 20:00 UTC</div>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-[#EDAF5F]">
              <Bell className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-[#EDAF5F]"
              onClick={handleRefresh}
              disabled={refreshing || !onRefresh}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RefreshProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </RefreshProvider>
  );
}

