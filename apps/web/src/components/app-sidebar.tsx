import { useClerk } from "@clerk/react-router";
import type { LucideIcon } from "lucide-react";
import { Building2, LogOut, X } from "lucide-react";
import { NavLink } from "react-router";

export type SidebarNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  disabled?: boolean;
};

export function AppSidebar({
  items,
  name,
  email,
  orgName,
  mobileOpen = false,
  onMobileClose,
}: {
  items: readonly SidebarNavItem[];
  name?: string;
  email: string;
  orgName?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const { signOut } = useClerk();

  return (
    <aside
      className={`glass-strong flex h-svh w-full flex-col border-y-0 border-l-0 lg:static lg:z-auto lg:w-64 lg:shrink-0 ${
        mobileOpen
          ? "fixed inset-0 z-50 animate-in slide-in-from-left duration-300"
          : "hidden lg:flex"
      }`}
    >
      <div className="flex items-center justify-between gap-2.5 px-5 pb-2 pt-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-purple-500/30">
            <Building2 className="size-4.5" />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold tracking-widest">
              Fieldops
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {orgName ?? "Fieldops"}
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close menu"
          className="flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-white/40 dark:hover:bg-white/10 lg:hidden"
          onClick={onMobileClose}
        >
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {items.map((item) =>
          item.disabled ? (
            <span
              key={item.label}
              title="Available on the paid plan"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/50"
            >
              <item.icon className="size-4" />
              {item.label}
              <span className="ml-auto rounded-full bg-gradient-to-r from-amber-200 to-yellow-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:from-amber-900 dark:to-yellow-950 dark:text-amber-200">
                Paid
              </span>
            </span>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "brand-gradient font-medium text-white shadow-md shadow-purple-500/30"
                    : "text-foreground/80 hover:bg-white/40 dark:hover:bg-white/10"
                }`
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ),
        )}
      </nav>
      <div className="glass m-3 rounded-2xl p-3">
        <div className="flex items-center gap-3">
          <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
            {(name ?? email).charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            {name && <div className="truncate text-sm font-medium">{name}</div>}
            <div className="truncate text-xs text-muted-foreground">{email}</div>
            {orgName && (
              <div className="truncate text-xs text-muted-foreground">{orgName}</div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/40 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
