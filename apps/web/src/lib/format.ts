export function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatAmount(amount: number | undefined) {
  if (amount === undefined) return "—";
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
