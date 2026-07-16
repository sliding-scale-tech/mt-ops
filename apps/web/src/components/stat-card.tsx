import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  linkTo,
  linkLabel,
  muted,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  linkTo?: string;
  linkLabel?: string;
  muted?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${muted ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-full text-white shadow-md shadow-purple-500/30">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-sm text-muted-foreground">{sub}</div>}
      {linkTo && (
        <Link
          to={linkTo}
          className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
        >
          {linkLabel ?? "Review now"}
        </Link>
      )}
    </div>
  );
}
