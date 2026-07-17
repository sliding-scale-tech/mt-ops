import { useState } from "react";

export const DEMO_ADMIN_EMAIL = "dummyadmin@mtops.com";
export const DEMO_WORKER_EMAIL = "dummyuser@mtops.com";
export const DEMO_ORG_NAME = "Fieldops Demo Co";
export const DEMO_WORKER_ID = "m-demo-worker";

export type DemoJobsite = { id: string; name: string; address: string };
export type DemoMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  jobsiteId?: string;
};
export type DemoInvite = {
  id: string;
  email: string;
  jobsiteId?: string;
  invitedAt: number;
};
export type DemoInvoiceStatus = "pending" | "approved" | "rejected";
export type DemoInvoice = {
  id: string;
  memberId: string;
  jobsiteId?: string;
  month: string;
  amount?: number;
  fileName: string;
  /** static sample PDF under /demo; uploads in demo mode have none */
  fileUrl?: string;
  submittedAt: number;
  status: DemoInvoiceStatus;
};
export type DemoState = {
  jobsites: DemoJobsite[];
  members: DemoMember[];
  invites: DemoInvite[];
  invoices: DemoInvoice[];
  workerName: string;
};

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

function seed(): DemoState {
  return {
    jobsites: [
      { id: "j-ber1", name: "BER1", address: "Berlin" },
      { id: "j-fra44", name: "FRA44", address: "Frankfurt" },
      { id: "j-fra63", name: "FRA63", address: "Frankfurt" },
      { id: "j-sapbcn", name: "SAP BCN", address: "Barcelona" },
      { id: "j-wes1a", name: "WES1A", address: "Groningen" },
    ],
    members: [
      {
        id: "m-admin",
        name: "Demo Admin",
        email: DEMO_ADMIN_EMAIL,
        role: "admin",
      },
      {
        id: DEMO_WORKER_ID,
        name: "Demo Worker",
        email: DEMO_WORKER_EMAIL,
        role: "member",
        jobsiteId: "j-fra63",
      },
      {
        id: "m-stefan",
        name: "Stefan Sichigea",
        email: "stefansiky27@gmail.com",
        role: "member",
        jobsiteId: "j-fra63",
      },
      {
        id: "m-florin",
        name: "Florin Vlasceanu",
        email: "vlasceanuf16@gmail.com",
        role: "member",
        jobsiteId: "j-fra44",
      },
      {
        id: "m-marian",
        name: "Marian Paun",
        email: "paun79@gmail.com",
        role: "member",
        jobsiteId: "j-ber1",
      },
      {
        id: "m-alex",
        name: "Alexandru Paun",
        email: "paun.alexandru1991@gmail.com",
        role: "member",
        jobsiteId: "j-sapbcn",
      },
    ],
    invites: [
      { id: "inv-1", email: "newhire@example.com", jobsiteId: "j-wes1a", invitedAt: now - 2 * day },
    ],
    invoices: [
      { id: "i-1", memberId: "m-stefan", jobsiteId: "j-fra63", month: "2026-07", amount: 1840, fileName: "Sichigea_Stefan_July.pdf", fileUrl: "/demo/stefan-july.pdf", submittedAt: now - day, status: "pending" },
      { id: "i-2", memberId: "m-florin", jobsiteId: "j-fra44", month: "2026-07", amount: 2210.5, fileName: "Invoice_001FL_July.pdf", fileUrl: "/demo/florin-july.pdf", submittedAt: now - 2 * day, status: "pending" },
      { id: "i-3", memberId: DEMO_WORKER_ID, jobsiteId: "j-fra63", month: "2026-07", amount: 1495, fileName: "DemoWorker_July.pdf", fileUrl: "/demo/demo-worker-july.pdf", submittedAt: now - 3 * day, status: "pending" },
      { id: "i-4", memberId: "m-marian", jobsiteId: "j-ber1", month: "2026-07", amount: 1975, fileName: "Invoice_001MP_July.pdf", fileUrl: "/demo/marian-july.pdf", submittedAt: now - 4 * day, status: "approved" },
      { id: "i-5", memberId: "m-alex", jobsiteId: "j-sapbcn", month: "2026-06", amount: 2050, fileName: "Invoice_001AA_June.pdf", fileUrl: "/demo/alex-june.pdf", submittedAt: now - 32 * day, status: "approved" },
      { id: "i-6", memberId: DEMO_WORKER_ID, jobsiteId: "j-fra63", month: "2026-06", amount: 1380, fileName: "DemoWorker_June.pdf", fileUrl: "/demo/demo-worker-june.pdf", submittedAt: now - 34 * day, status: "approved" },
      { id: "i-7", memberId: "m-stefan", jobsiteId: "j-fra63", month: "2026-06", fileName: "Sichigea_Stefan_June.pdf", fileUrl: "/demo/stefan-june.pdf", submittedAt: now - 36 * day, status: "rejected" },
      { id: "i-8", memberId: DEMO_WORKER_ID, jobsiteId: "j-fra63", month: "2026-05", fileName: "DemoWorker_May.pdf", fileUrl: "/demo/demo-worker-may.pdf", submittedAt: now - 65 * day, status: "rejected" },
    ],
    workerName: "Demo Worker",
  };
}

const KEY = "fieldops-demo-v2";

function load(): DemoState {
  if (typeof sessionStorage === "undefined") return seed();
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {
    /* fall through to fresh seed */
  }
  return seed();
}

/**
 * Session-only demo dataset: lives in sessionStorage for this tab, is never
 * sent to Convex, and resets in a fresh tab.
 */
export function useDemoStore() {
  const [state, setState] = useState<DemoState>(load);

  const update = (fn: (draft: DemoState) => void) => {
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DemoState;
      fn(next);
      try {
        sessionStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode etc. — keep in-memory state */
      }
      return next;
    });
  };

  return { state, update };
}

export function demoId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
