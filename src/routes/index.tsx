import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PageShell, StatCard, StatusPill } from "@/components/page-shell";
import { INVENTORY_POOLS, fmtBDT, fmtNum, STAGE_THROUGHPUT } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const searchSchema = z.object({
  range: fallback(z.enum(["7d", "10d", "30d"]), "10d").default("10d"),
  species: fallback(z.enum(["all", "cow", "goat"]), "all").default("all"),
  exit: fallback(z.enum(["all", "wet_blue", "crust", "finished"]), "all").default("all"),
});

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — HIDE.OS" }] }),
  validateSearch: zodValidator(searchSchema),
  component: Dashboard,
});

const RANGES: { value: "7d" | "10d" | "30d"; label: string; days: number }[] = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "10d", label: "10 days", days: 10 },
  { value: "30d", label: "30 days", days: 30 },
];
const SPECIES: { value: "all" | "cow" | "goat"; label: string }[] = [
  { value: "all", label: "All species" },
  { value: "cow", label: "Cow" },
  { value: "goat", label: "Goat" },
];
const EXITS: { value: "all" | "wet_blue" | "crust" | "finished"; label: string }[] = [
  { value: "all", label: "All exits" },
  { value: "wet_blue", label: "Wet-blue" },
  { value: "crust", label: "Crust" },
  { value: "finished", label: "Finished" },
];

function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex border border-border bg-card">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider border-r border-border last:border-r-0 ${
            value === o.value
              ? "bg-accent/15 text-accent-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Dashboard() {
  const { range, species, exit } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const { orders, batches, esgEntries, qcEntries } = useStore();

  const days = RANGES.find((r) => r.value === range)?.days ?? 10;
  const esgData = esgEntries.slice(-days);

  const filteredBatches = batches.filter(
    (b) => (species === "all" || b.species === species) && (exit === "all" || b.exit === exit),
  );
  const recentBatches = filteredBatches.slice(0, 6);

  const filteredOrders = orders.filter((o) => {
    if (species === "all") return true;
    return species === "cow" ? o.article.startsWith("COW") : o.article.startsWith("GOAT");
  });
  const urgentOrders = filteredOrders
    .filter((o) => o.status === "in_production" || o.status === "confirmed")
    .slice(0, 4);

  const set = (
    patch: Partial<{ range: typeof range; species: typeof species; exit: typeof exit }>,
  ) =>
    navigate({
      search: (prev: { range: typeof range; species: typeof species; exit: typeof exit }) => ({
        ...prev,
        ...patch,
      }),
    });

  // Live KPIs
  const activeOrders = orders.filter(
    (o) => o.status === "in_production" || o.status === "confirmed",
  ).length;
  const activeBatches = filteredBatches.filter((b) => b.status !== "done").length;
  const piecesInWip = batches.filter((b) => b.status !== "done").reduce((s, b) => s + b.pieces, 0);
  const lastESG = esgEntries.length > 0 ? esgEntries[esgEntries.length - 1] : null;
  const avgQCYield =
    qcEntries.length > 0
      ? qcEntries.slice(-4).reduce((s, q) => s + q.yield_pct, 0) / Math.min(4, qcEntries.length)
      : 97.5;

  return (
    <PageShell
      title="Dashboard"
      subtitle="Make-to-order production · cow + goat · wet-blue, crust & finished"
      actions={
        <>
          <FilterPills options={RANGES} value={range} onChange={(v) => set({ range: v })} />
          <FilterPills options={SPECIES} value={species} onChange={(v) => set({ species: v })} />
          <FilterPills options={EXITS} value={exit} onChange={(v) => set({ exit: v })} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active orders" value={activeOrders} sub="open + in production" />
        <StatCard
          label="Active batches"
          value={activeBatches}
          sub={species === "all" ? "all species" : `${species} only`}
        />
        <StatCard label="Pieces in WIP" value={fmtNum(piecesInWip)} tone="info" />
        <StatCard label="On-time delivery" value="92.4%" tone="ok" sub="trailing 30 days" />
        <StatCard
          label="Finished sq ft"
          value={fmtNum(INVENTORY_POOLS[2].sqft)}
          sub="ready for dispatch"
        />
        <StatCard label="QC yield" value={`${avgQCYield.toFixed(1)}%`} tone="ok" />
        <StatCard
          label="Water today"
          value={lastESG ? `${lastESG.water_m3} m³` : "—"}
          tone="info"
        />
        <StatCard
          label="Chrome today"
          value={lastESG ? `${lastESG.chrome_kg} kg` : "—"}
          tone="warn"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                ESG · {days}-day trend
              </div>
              <div className="text-sm font-medium">Water (m³) vs Chrome (kg)</div>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 bg-chart-1" />
                Water
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 bg-accent" />
                Chrome
              </span>
            </div>
          </div>
          <div className="h-64">
            {esgData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={esgData} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
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
                  <CartesianGrid
                    stroke="oklch(0.88 0.006 250)"
                    strokeDasharray="2 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.20 0.01 250)",
                      border: "none",
                      borderRadius: 4,
                      fontSize: 12,
                      color: "white",
                    }}
                    labelStyle={{ color: "oklch(0.88 0.004 250)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="water_m3"
                    stroke="oklch(0.55 0.15 250)"
                    fill="url(#g1)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="chrome_kg"
                    stroke="oklch(0.72 0.16 55)"
                    fill="url(#g2)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Log ESG data to see the trend chart.
              </div>
            )}
          </div>
        </div>

        <div className="border border-border bg-card p-4">
          <div className="mb-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Throughput
            </div>
            <div className="text-sm font-medium">Pieces by stage · today</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STAGE_THROUGHPUT} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid
                  stroke="oklch(0.88 0.006 250)"
                  strokeDasharray="2 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.01 250)",
                    border: "none",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "white",
                  }}
                  cursor={{ fill: "oklch(0.95 0.004 250)" }}
                />
                <Bar
                  dataKey="pieces"
                  fill="oklch(0.28 0.02 250)"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Production
              </div>
              <div className="text-sm font-medium">
                Active batches{species !== "all" ? ` · ${species}` : ""}
                {exit !== "all" ? ` · ${exit.replace("_", "-")}` : ""}
              </div>
            </div>
            <Link
              to="/batches"
              className="text-xs text-accent-foreground underline-offset-2 hover:underline"
            >
              View all →
            </Link>
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
              {recentBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No batches match filters
                  </td>
                </tr>
              ) : (
                recentBatches.map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-xs">{b.batch_no}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {b.article}
                    </td>
                    <td className="px-4 py-2 text-xs">{b.drum}</td>
                    <td className="px-4 py-2 text-right">{b.pieces}</td>
                    <td className="px-4 py-2">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Sales
              </div>
              <div className="text-sm font-medium">Open orders</div>
            </div>
            <Link
              to="/orders"
              className="text-xs text-accent-foreground underline-offset-2 hover:underline"
            >
              View all →
            </Link>
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
              {urgentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No orders match filters
                  </td>
                </tr>
              ) : (
                urgentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-xs">
                      <Link
                        to="/orders/$orderId"
                        params={{ orderId: o.order_no }}
                        className="text-accent-foreground underline-offset-2 hover:underline"
                      >
                        {o.order_no}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-xs">{o.customer}</td>
                    <td className="px-4 py-2 text-right">{fmtNum(o.qty_pcs)}</td>
                    <td className="px-4 py-2 text-xs">{o.due_date}</td>
                    <td className="px-4 py-2">
                      <StatusPill status={o.status} />
                    </td>
                  </tr>
                ))
              )}
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
            <div className="mt-2 text-xs font-medium text-accent-foreground tabular">
              {fmtBDT(p.value_bdt)}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
