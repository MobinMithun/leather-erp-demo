import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { PageShell, StatCard, StatusPill } from "@/components/page-shell";
import { ORDERS, BATCHES, STAGES, fmtBDT, fmtNum, type Batch } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/orders/$orderId")({
  head: ({ params }) => ({ meta: [{ title: `${params.orderId} — HIDE.OS` }] }),
  loader: ({ params }) => {
    const order = ORDERS.find((o) => o.order_no === params.orderId);
    if (!order) throw notFound();
    const batches = BATCHES.filter((b) => b.order_no === order.order_no);
    return { order, batches };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6">
        <p className="text-sm">{error.message}</p>
        <button className="mt-3 border border-border bg-background px-3 py-1.5 text-xs" onClick={() => { router.invalidate(); reset(); }}>Retry</button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="p-6">
      <p className="text-sm">Order not found.</p>
      <Link to="/orders" className="mt-3 inline-block text-xs text-accent-foreground underline">Back to orders</Link>
    </div>
  ),
  component: OrderDetailPage,
});

const TIMELINE: { key: string; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_production", label: "In production" },
  { key: "ready", label: "Ready" },
  { key: "dispatched", label: "Dispatched" },
];

function OrderDetailPage() {
  const { order, batches } = Route.useLoaderData();
  const producedPcs = batches.reduce((s: number, b: Batch) => s + b.pieces, 0);
  const completionPct = Math.min(100, Math.round((producedPcs / order.qty_pcs) * 100));
  const activeIdx = TIMELINE.findIndex((t) => t.key === order.status);

  return (
    <PageShell
      title={order.order_no}
      subtitle={`${order.customer} · ${order.country} · ${order.article}`}
      actions={
        <Link to="/orders" className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
          <ArrowLeft className="h-3.5 w-3.5" /> All orders
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Quantity" value={`${fmtNum(order.qty_pcs)} pcs`} />
        <StatCard label="Order value" value={fmtBDT(order.value_bdt)} />
        <StatCard label="Due date" value={order.due_date} tone="info" />
        <StatCard label="Allocated to batches" value={`${fmtNum(producedPcs)} pcs`} sub={`${completionPct}% of order`} tone={completionPct >= 100 ? "ok" : "warn"} />
      </div>

      <div className="border border-border bg-card p-4">
        <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Order timeline</div>
        <div className="flex items-center gap-2">
          {TIMELINE.map((t, i) => (
            <div key={t.key} className="flex flex-1 items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-mono ${i <= activeIdx ? "border-accent bg-accent text-accent-foreground" : "border-border bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <div className={`flex-1 text-xs ${i === activeIdx ? "font-medium" : "text-muted-foreground"}`}>{t.label}</div>
              {i < TIMELINE.length - 1 && <div className={`h-px flex-1 ${i < activeIdx ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Production batches · {batches.length}</h2>
        {batches.length === 0 ? (
          <div className="border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No batches allocated yet. Create one from the Batches page.
          </div>
        ) : (
          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm tabular">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Batch</th>
                  <th className="px-4 py-2.5 text-right font-medium">Raw kg</th>
                  <th className="px-4 py-2.5 text-right font-medium">Pcs</th>
                  <th className="px-4 py-2.5 text-left font-medium">Drum</th>
                  <th className="px-4 py-2.5 text-left font-medium">Recipe</th>
                  <th className="px-4 py-2.5 text-left font-medium">Stage</th>
                  <th className="px-4 py-2.5 w-48 text-left font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b: Batch) => {
                  const stageIdx = STAGES.findIndex((s) => s.code === b.current_stage);
                  const total = b.exit === "wet_blue" ? 7 : b.exit === "crust" ? 11 : 15;
                  const pct = Math.min(100, Math.round(((stageIdx + 1) / total) * 100));
                  return (
                    <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-mono text-xs">{b.batch_no}</td>
                      <td className="px-4 py-2.5 text-right">{fmtNum(b.raw_kg)}</td>
                      <td className="px-4 py-2.5 text-right">{b.pieces}</td>
                      <td className="px-4 py-2.5">{b.drum}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{b.recipe}</td>
                      <td className="px-4 py-2.5"><StatusPill status={b.status} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-muted">
                            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground tabular w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
