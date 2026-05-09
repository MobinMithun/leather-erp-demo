import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, StatusPill } from "@/components/page-shell";
import { ORDERS, fmtBDT, fmtNum } from "@/lib/mock-data";
import { Plus, Filter, Download } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Orders — HIDE.OS" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <PageShell
      title="Sales Orders"
      subtitle="Customer orders broken into production batches"
      actions={
        <>
          <button className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <button className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> New order
          </button>
        </>
      }
    >
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm tabular">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Order #</th>
              <th className="px-4 py-2.5 text-left font-medium">Customer</th>
              <th className="px-4 py-2.5 text-left font-medium">Country</th>
              <th className="px-4 py-2.5 text-left font-medium">Article</th>
              <th className="px-4 py-2.5 text-right font-medium">Qty (pcs)</th>
              <th className="px-4 py-2.5 text-right font-medium">Value</th>
              <th className="px-4 py-2.5 text-left font-medium">Due date</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => (
              <tr key={o.id} className="border-t border-border hover:bg-muted/30 cursor-pointer">
                <td className="px-4 py-2.5 font-mono text-xs">
                  <Link to="/orders/$orderId" params={{ orderId: o.order_no }} className="text-accent-foreground underline-offset-2 hover:underline">{o.order_no}</Link>
                </td>
                <td className="px-4 py-2.5">{o.customer}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{o.country}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{o.article}</td>
                <td className="px-4 py-2.5 text-right">{fmtNum(o.qty_pcs)}</td>
                <td className="px-4 py-2.5 text-right">{fmtBDT(o.value_bdt)}</td>
                <td className="px-4 py-2.5 text-xs">{o.due_date}</td>
                <td className="px-4 py-2.5"><StatusPill status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
