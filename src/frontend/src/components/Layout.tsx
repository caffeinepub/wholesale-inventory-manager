import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Page = "dashboard" | "inventory" | "movements" | "reports" | "customers";

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems = [
  {
    id: "dashboard" as Page,
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    id: "inventory" as Page,
    label: "Inventory",
    icon: Package,
    ocid: "nav.inventory.link",
  },
  {
    id: "movements" as Page,
    label: "Stock Movement",
    icon: ArrowLeftRight,
    ocid: "nav.movements.link",
  },
  {
    id: "reports" as Page,
    label: "Reports",
    icon: BarChart3,
    ocid: "nav.reports.link",
  },
  {
    id: "customers" as Page,
    label: "Customers",
    icon: Users,
    ocid: "nav.customers.link",
  },
];

export default function Layout({
  currentPage,
  onNavigate,
  children,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const isLoggedIn = loginStatus === "success" && !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar sidebar-grid-bg border-r border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center amber-glow">
            <Warehouse className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-sidebar-foreground text-sm leading-none">
              WholesalePro
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inventory Manager
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-current"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {isLoggedIn ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground truncate">
                {shortPrincipal}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={clear}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full gap-2 bg-primary text-primary-foreground hover:opacity-90"
              onClick={login}
              disabled={loginStatus === "logging-in"}
            >
              <LogIn className="w-3.5 h-3.5" />
              {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Warehouse className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sidebar-foreground text-sm">
            WholesalePro
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-sidebar-foreground"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="md:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-sidebar sidebar-grid-bg border-r border-sidebar-border pt-14"
          >
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    data-ocid={item.ocid}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
