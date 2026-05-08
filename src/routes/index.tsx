import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, StatCard, StatusPill } from "@/components/page-shell";
import {
  KPI, ORDERS, BATCHES, ESG, STAGE_THROUGHPUT, INVENTORY_POOLS, fmtBDT, fmtNum,
} from "@/lib/mock-data";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — HIDE.OS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const recentBatches = BATCHES.slice(0, 6);
  const urgentOrders = ORDERS
    .filter((o) => o.status === "in_production" || o.status === "confirmed")
    .slice(0, 4);

  return (
    <PageShell
      title="Dashboard"
      subtitle="Make-to-order production · cow + goat · wet-blue, crust & finished"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active orders" value={KPI.active_orders} sub="open + in production" />
        <StatCard label="Active batches" value={KPI.active_batches} sub="across 8 drums" />
        <StatCard label="Pieces in WIP" value={fmtNum(KPI.pieces_in_wip)} tone="info" />
        <StatCard label="On-time delivery" value={`${KPI.on_time_pct}%`} tone="ok" sub="trailing 30 days" />
        <StatCard label="Finished sq ft" value={fmtNum(KPI.finished_sqft)} sub="ready for dispatch" />
        <StatCard label="QC yield" value={`${KPI.qc_yield_pct}%`} tone="ok" />
        <StatCard label="Water today" value={`${KPI.water_today} m³`} tone="info" />
        <StatCard label="Chrome today" value={`${KPI.chrome_today} kg`} tone="warn" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">ESG · 10-day trend</div>
              <div className="text-sm font-medium">Water (m³) vs Chrome (kg)</div>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-chart-1" />Water</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-accent" />Chrome</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ESG} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.16 55)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.72 0.16 55)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.88 0.006 250)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.20 0.01 250)", border: "none", borderRadius: 4, fontSize: 12, color: "white" }}
                  labelStyle={{ color: "oklch(0.88 0.004 250)" }}
                />
                <Area type="monotone" dataKey="water_m3" stroke="oklch(0.55 0.15 250)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="chrome_kg" stroke="oklch(0.72 0.16 55)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-card p-4">
          <div className="mb-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Throughput</div>
            <div className="text-sm font-medium">Pieces by stage · today</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STAGE_THROUGHPUT} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.88 0.006 250)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.20 0.01 250)", border: "none", borderRadius: 4, fontSize: 12, color: "white" }}
                  cursor={{ fill: "oklch(0.95 0.004 250)" }}
                />
                <Bar dataKey="pieces" fill="oklch(0.28 0.02 250)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Production</div>
              <div className="text-sm font-medium">Active batches</div>
            </div>
            <Link to="/batches" className="text-xs text-accent-foreground underline-offset-2 hover:underline">View all →</Link>
          </div>
          <table className="w-full text-sm tabular">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Batch</th>
                <th className="px-4 py-2 text-left font-medium">Article</th>
                <th className="px-4 py-2 text-left font-medium">Drum</th>
                <th className="px-4 py-2 text-right font-medium">Pcs</th>
                <th className="px-4 py-2 text-left font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {recentBatches.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs">{b.batch_no}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{b.article}</td>
                  <td className="px-4 py-2 text-xs">{b.drum}</td>
                  <td className="px-4 py-2 text-right">{b.pieces}</td>
                  <td className="px-4 py-2"><StatusPill status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Sales</div>
              <div className="text-sm font-medium">Open orders</div>
            </div>
            <Link to="/orders" className="text-xs text-accent-foreground underline-offset-2 hover:underline">View all →</Link>
          </div>
          <table className="w-full text-sm tabular">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Order</th>
                <th className="px-4 py-2 text-left font-medium">Customer</th>
                <th className="px-4 py-2 text-right font-medium">Qty</th>
                <th className="px-4 py-2 text-left font-medium">Due</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {urgentOrders.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs">{o.order_no}</td>
                  <td className="px-4 py-2 text-xs">{o.customer}</td>
                  <td className="px-4 py-2 text-right">{fmtNum(o.qty_pcs)}</td>
                  <td className="px-4 py-2 text-xs">{o.due_date}</td>
                  <td className="px-4 py-2"><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {INVENTORY_POOLS.map((p) => (
          <div key={p.pool} className="border border-border bg-card p-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {p.pool} inventory
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-semibold tabular">{fmtNum(p.pieces)}</div>
              <div className="text-xs text-muted-foreground">{fmtNum(p.sqft)} sq ft</div>
            </div>
            <div className="mt-2 text-xs font-medium text-accent-foreground tabular">{fmtBDT(p.value_bdt)}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
