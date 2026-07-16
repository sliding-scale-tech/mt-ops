const styles = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  approved:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
} as const;

const labels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export function StatusBadge({ status }: { status: keyof typeof styles }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
