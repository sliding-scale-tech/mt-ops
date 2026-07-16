import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { Button } from "@my-better-t-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@my-better-t-app/ui/components/card";
import { Input } from "@my-better-t-app/ui/components/input";
import { Label } from "@my-better-t-app/ui/components/label";
import { Skeleton } from "@my-better-t-app/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Download, FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { DemoWorkerInvoices } from "../components/demo";
import { DEMO_WORKER_EMAIL } from "../lib/demo";
import { StatusBadge } from "../components/status-badge";
import { currentMonth, formatAmount, formatDate, formatMonth } from "../lib/format";

function RealWorkerInvoices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Upload your invoice and track its approval status.
        </p>
      </div>
      <UploadInvoiceCard />
      <MyInvoicesCard />
    </div>
  );
}

function UploadInvoiceCard() {
  const generateUploadUrl = useMutation(api.invoices.generateUploadUrl);
  const submitInvoice = useMutation(api.invoices.submit);
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState(currentMonth());
  const [amount, setAmount] = useState("");
  const [uploading, setUploading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a document to upload");
      return;
    }
    const parsedAmount = amount.trim() ? Number(amount) : undefined;
    if (parsedAmount !== undefined && (Number.isNaN(parsedAmount) || parsedAmount < 0)) {
      toast.error("Enter a valid amount");
      return;
    }
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      await submitInvoice({
        fileId: storageId,
        fileName: file.name,
        month,
        amount: parsedAmount,
      });
      toast.success("Invoice submitted for approval");
      setFile(null);
      setAmount("");
      if (fileInput.current) fileInput.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="brand-gradient flex size-8 items-center justify-center rounded-lg text-white">
            <FileUp className="size-4" />
          </span>
          Submit an invoice
        </CardTitle>
        <CardDescription>
          Upload your invoice document. Amount is optional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="invoice-file">Document</Label>
            <Input
              id="invoice-file"
              ref={fileInput}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-month">Month</Label>
            <Input
              id="invoice-month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-amount">Amount (optional)</Label>
            <Input
              id="invoice-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1250.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? "Uploading..." : "Submit invoice"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function MyInvoicesCard() {
  const invoices = useQuery(api.invoices.listMine);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">My invoices</CardTitle>
        <CardDescription>Track the status of your submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices === undefined ? (
          <Skeleton className="h-24 w-full" />
        ) : invoices.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No invoices submitted yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Month</th>
                  <th className="py-2 pr-4 font-medium">Job Site</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">File</th>
                  <th className="py-2 pr-4 font-medium">Submitted</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{formatMonth(invoice.month)}</td>
                    <td className="py-3 pr-4">{invoice.jobsite?.name ?? "—"}</td>
                    <td className="py-3 pr-4">{formatAmount(invoice.amount)}</td>
                    <td className="py-3 pr-4">
                      {invoice.fileUrl ? (
                        <a
                          href={invoice.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-40 items-center gap-1 truncate text-primary hover:underline"
                        >
                          <Download className="size-3.5 shrink-0" />
                          <span className="truncate">{invoice.fileName}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 pr-4">{formatDate(invoice._creationTime)}</td>
                    <td className="py-3">
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function WorkerInvoices() {
  const gateMe = useQuery(api.users.current);
  if (gateMe === undefined) return null;
  if (gateMe?.email === DEMO_WORKER_EMAIL) return <DemoWorkerInvoices />;
  return <RealWorkerInvoices />;
}
