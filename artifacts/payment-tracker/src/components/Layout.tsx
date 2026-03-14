import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { LayoutDashboard, Receipt, Users, LogOut, Wallet, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@workspace/replit-auth-web";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Payments", href: "/payments", icon: Receipt },
  { name: "Clients", href: "/clients", icon: Users },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Wallet className="w-6 h-6 text-primary mr-3" />
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            PayTracker
          </span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-3">
          {/* Security badge */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            <Shield className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span className="text-xs text-green-700 font-medium">Encrypted & secure</span>
          </div>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {(user.firstName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.email ?? "User"}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border/50 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 text-primary mr-3" />
            <span className="font-display font-bold text-lg">PayTracker</span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden border-t border-border/50 bg-card flex items-center justify-around p-3 pb-safe">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center p-2 rounded-xl transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
