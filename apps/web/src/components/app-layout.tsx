import { Building2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { AnimatedOutlet } from "./animated-outlet";
import { AppSidebar, type SidebarNavItem } from "./app-sidebar";

export function AppLayout({
  items,
  name,
  email,
  orgName,
}: {
  items: readonly SidebarNavItem[];
  name?: string;
  email: string;
  orgName?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-svh">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AppSidebar
        items={items}
        name={name}
        email={email}
        orgName={orgName}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-strong fixed inset-x-0 top-0 z-[60] flex h-14 items-center gap-3 border-b border-white/20 px-4 lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-white/40 dark:hover:bg-white/10"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="brand-gradient flex size-8 shrink-0 items-center justify-center rounded-lg text-white shadow-md shadow-purple-500/30">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-bold tracking-widest">
                MT-OPERATION
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {orgName ?? "Systems"}
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 pt-[calc(3.5rem+1rem)] sm:p-6 sm:pt-[calc(3.5rem+1.5rem)] lg:p-8 lg:pt-8">
          <AnimatedOutlet />
        </main>
      </div>
    </div>
  );
}
