import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, StatusPill } from "@/components/page-shell";
import { fmtBDT, fmtNum, type OrderStatus } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { Plus, Download } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Orders — HIDE.OS" }] }),
  component: OrdersPage,
});

const ALL_STATUSES: (OrderStatus | "all")[] = [
  "all", "draft", "confirmed", "in_production", "ready", "dispatched",
];
const STATUS_LABEL: Record<string, string> = {
  all: "All",
  draft: "Draft",
  confirmed: "Confirmed",
  in_production: "In Production",
  ready: "Ready",
  dispatched: "Dispatched",
};

function OrdersPage() {
  const { orders, addOrder } = useStore();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [newOpen, setNewOpen] = useState(false);

  // form state
  const [customer, setCustomer] = useState("");
  const [country, setCountry] = useState("");
  const [article, setArticle] = useState("");
  const [qty, setQty] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState("");

  const resetForm = () => {
    setCustomer(""); setCountry(""); setArticle("");
    setQty(""); setValue(""); setDueDate("");
  };

  const visible = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const exportCSV = () => {
    const header = ["Order #", "Customer", "Country", "Article", "Qty (pcs)", "Value (BDT)", "Due date", "Status"];
    const rows = visible.map((o) => [
      o.order_no, o.customer, o.country, o.article,
      o.qty_pcs, o.value_bdt, o.due_date, o.status,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("CSV downloaded");
  };

  const submitNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !country || !article || !qty || !value || !dueDate) {
      toast.error("All fields are required");
      return;
    }
    const order = addOrder({
      customer,
      country,
      article,
      qty_pcs: Number(qty),
      value_bdt: Number(value),
      due_date: dueDate,
    });
    toast.success(`Order ${order.order_no} created`, {
      description: `${customer} · ${article} · ${qty} pcs`,
    });
    resetForm();
    setNewOpen(false);
  };

  return (
    <PageShell
      title="Sales Orders"
      subtitle="Customer orders broken into production batches"
      actions={
        <>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <Dialog open={newOpen} onOpenChange={(o) => { setNewOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
                <Plus className="h-3.5 w-3.5" /> New order
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New sales order</DialogTitle>
                <DialogDescription className="text-xs">
                  Creates a draft order. Advance its status once confirmed with the buyer.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={submitNewOrder} className="grid grid-cols-2 gap-3 pt-2">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Customer name</Label>
                  <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Milano Pelle SRL" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Country</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Italy" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Article code</Label>
                  <Input value={article} onChange={(e) => setArticle(e.target.value)} placeholder="COW-CR-1.2-BLK" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Qty (pcs)</Label>
                  <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Value (BDT)</Label>
                  <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} placeholder="18400000" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Due date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <DialogFooter className="col-span-2 mt-2">
                  <button type="button" onClick={() => setNewOpen(false)} className="border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
                  <button type="submit" className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">Create order</button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`border px-3 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
              filterStatus === s
                ? "border-accent bg-accent/10 text-accent-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {STATUS_LABEL[s]}
            {s !== "all" && (
              <span className="ml-1.5 tabular text-muted-foreground">
                {orders.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

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
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              visible.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-2.5 font-mono text-xs">
                    <Link to="/orders/$orderId" params={{ orderId: o.order_no }} className="text-accent-foreground underline-offset-2 hover:underline">
                      {o.order_no}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{o.customer}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{o.country}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{o.article}</td>
                  <td className="px-4 py-2.5 text-right">{fmtNum(o.qty_pcs)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtBDT(o.value_bdt)}</td>
                  <td className="px-4 py-2.5 text-xs">{o.due_date}</td>
                  <td className="px-4 py-2.5"><StatusPill status={o.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
