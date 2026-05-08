import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard } from "@/components/page-shell";
import { ESG } from "@/lib/mock-data";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

export const Route = createFileRoute("/esg")({
  head: () => ({ meta: [{ title: "ESG / Waste — HIDE.OS" }] }),
  component: ESGPage,
});

function ESGPage() {
  const last = ESG[ESG.length - 1];
  const prev = ESG[ESG.length - 2];
  const trend = (a: number, b: number) => (((a - b) / b) * 100).toFixed(1);

  return (
    <PageShell title="ESG / Waste" subtitle="Internal visibility — water, chemicals, solid waste, effluent">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Water (m³) today" value={last.water_m3} tone="info" sub={`${trend(last.water_m3, prev.water_m3)}% vs prev`} />
        <StatCard label="Chrome (kg) today" value={last.chrome_kg} tone="warn" sub={`${trend(last.chrome_kg, prev.chrome_kg)}% vs prev`} />
        <StatCard label="Solid waste (kg)" value={last.solid_waste_kg} sub={`${trend(last.solid_waste_kg, prev.solid_waste_kg)}% vs prev`} />
        <StatCard label="Effluent COD (mg/L)" value={last.cod_mg_l} tone="bad" sub="limit 250 — pre-ETP" />
      </div>

      <div className="border border-border bg-card p-4">
        <div className="mb-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">10-day trend</div>
          <div className="text-sm font-medium">All ESG metrics</div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ESG} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid stroke="oklch(0.88 0.006 250)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "oklch(0.48 0.012 250)" }} />
              <Tooltip
                contentStyle={{ background: "oklch(0.20 0.01 250)", border: "none", borderRadius: 4, fontSize: 12, color: "white" }}
              />
              <Line type="monotone" dataKey="water_m3" stroke="oklch(0.55 0.15 250)" strokeWidth={2} dot={false} name="Water m³" />
              <Line type="monotone" dataKey="chrome_kg" stroke="oklch(0.72 0.16 55)" strokeWidth={2} dot={false} name="Chrome kg" />
              <Line type="monotone" dataKey="sulphide_kg" stroke="oklch(0.65 0.15 145)" strokeWidth={2} dot={false} name="Sulphide kg" />
              <Line type="monotone" dataKey="solid_waste_kg" stroke="oklch(0.50 0.05 250)" strokeWidth={2} dot={false} name="Solid waste kg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm tabular">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Date</th>
              <th className="px-4 py-2.5 text-right font-medium">Water (m³)</th>
              <th className="px-4 py-2.5 text-right font-medium">Chrome (kg)</th>
              <th className="px-4 py-2.5 text-right font-medium">Sulphide (kg)</th>
              <th className="px-4 py-2.5 text-right font-medium">Solid waste (kg)</th>
              <th className="px-4 py-2.5 text-right font-medium">COD (mg/L)</th>
            </tr>
          </thead>
          <tbody>
            {[...ESG].reverse().map((e) => (
              <tr key={e.date} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-2 text-xs">{e.date}</td>
                <td className="px-4 py-2 text-right">{e.water_m3}</td>
                <td className="px-4 py-2 text-right">{e.chrome_kg}</td>
                <td className="px-4 py-2 text-right">{e.sulphide_kg}</td>
                <td className="px-4 py-2 text-right">{e.solid_waste_kg}</td>
                <td className="px-4 py-2 text-right">{e.cod_mg_l}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
