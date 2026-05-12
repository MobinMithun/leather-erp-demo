import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/esg")({
  head: () => ({ meta: [{ title: "ESG / Waste — HIDE.OS" }] }),
  component: ESGPage,
});

function ESGPage() {
  const { esgEntries, addESGEntry } = useStore();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [water, setWater] = useState("");
  const [chrome, setChrome] = useState("");
  const [sulphide, setSulphide] = useState("");
  const [solidWaste, setSolidWaste] = useState("");
  const [cod, setCod] = useState("");

  const reset = () => {
    setDate("");
    setWater("");
    setChrome("");
    setSulphide("");
    setSolidWaste("");
    setCod("");
  };

  const last = esgEntries.length > 0 ? esgEntries[esgEntries.length - 1] : null;
  const prev = esgEntries.length > 1 ? esgEntries[esgEntries.length - 2] : null;
  const trend = (a: number, b: number) => (((a - b) / b) * 100).toFixed(1);

  const submitESG = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !water || !chrome || !sulphide || !solidWaste || !cod) {
      toast.error("All fields are required");
      return;
    }
    addESGEntry({
      date,
      water_m3: Number(water),
      chrome_kg: Number(chrome),
      sulphide_kg: Number(sulphide),
      solid_waste_kg: Number(solidWaste),
      cod_mg_l: Number(cod),
    });
    toast.success(`ESG logged · ${date}`);
    reset();
    setOpen(false);
  };

  return (
    <PageShell
      title="ESG / Waste"
      subtitle="Internal visibility — water, chemicals, solid waste, effluent"
      actions={
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Log ESG
        </button>
      }
    >
      {last ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Water (m³) today"
            value={last.water_m3}
            tone="info"
            sub={prev ? `${trend(last.water_m3, prev.water_m3)}% vs prev` : undefined}
          />
          <StatCard
            label="Chrome (kg) today"
            value={last.chrome_kg}
            tone="warn"
            sub={prev ? `${trend(last.chrome_kg, prev.chrome_kg)}% vs prev` : undefined}
          />
          <StatCard
            label="Solid waste (kg)"
            value={last.solid_waste_kg}
            sub={prev ? `${trend(last.solid_waste_kg, prev.solid_waste_kg)}% vs prev` : undefined}
          />
          <StatCard
            label="Effluent COD (mg/L)"
            value={last.cod_mg_l}
            tone="bad"
            sub="limit 250 — pre-ETP"
          />
        </div>
      ) : (
        <div className="border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No ESG data yet. Log the first entry above.
        </div>
      )}

      {esgEntries.length > 1 && (
        <div className="border border-border bg-card p-4">
          <div className="mb-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {esgEntries.length}-day trend
            </div>
            <div className="text-sm font-medium">All ESG metrics</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={esgEntries} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
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
                />
                <Line
                  type="monotone"
                  dataKey="water_m3"
                  stroke="oklch(0.55 0.15 250)"
                  strokeWidth={2}
                  dot={false}
                  name="Water m³"
                />
                <Line
                  type="monotone"
                  dataKey="chrome_kg"
                  stroke="oklch(0.72 0.16 55)"
                  strokeWidth={2}
                  dot={false}
                  name="Chrome kg"
                />
                <Line
                  type="monotone"
                  dataKey="sulphide_kg"
                  stroke="oklch(0.65 0.15 145)"
                  strokeWidth={2}
                  dot={false}
                  name="Sulphide kg"
                />
                <Line
                  type="monotone"
                  dataKey="solid_waste_kg"
                  stroke="oklch(0.50 0.05 250)"
                  strokeWidth={2}
                  dot={false}
                  name="Solid waste kg"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
            {esgEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No ESG records yet.
                </td>
              </tr>
            ) : (
              [...esgEntries].reverse().map((e, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 text-xs">{e.date}</td>
                  <td className="px-4 py-2 text-right">{e.water_m3}</td>
                  <td className="px-4 py-2 text-right">{e.chrome_kg}</td>
                  <td className="px-4 py-2 text-right">{e.sulphide_kg}</td>
                  <td className="px-4 py-2 text-right">{e.solid_waste_kg}</td>
                  <td className="px-4 py-2 text-right">{e.cod_mg_l}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Log ESG dialog */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log ESG data</DialogTitle>
            <DialogDescription className="text-xs">
              Enter daily environmental metrics. Appears in chart and table immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitESG} className="grid grid-cols-2 gap-3 pt-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Date label
              </Label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="May 09"
                maxLength={20}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Water (m³)
              </Label>
              <Input
                type="number"
                min={0}
                value={water}
                onChange={(e) => setWater(e.target.value)}
                placeholder="150"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Chrome (kg)
              </Label>
              <Input
                type="number"
                min={0}
                value={chrome}
                onChange={(e) => setChrome(e.target.value)}
                placeholder="40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sulphide (kg)
              </Label>
              <Input
                type="number"
                min={0}
                value={sulphide}
                onChange={(e) => setSulphide(e.target.value)}
                placeholder="22"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Solid waste (kg)
              </Label>
              <Input
                type="number"
                min={0}
                value={solidWaste}
                onChange={(e) => setSolidWaste(e.target.value)}
                placeholder="430"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Effluent COD (mg/L)
              </Label>
              <Input
                type="number"
                min={0}
                value={cod}
                onChange={(e) => setCod(e.target.value)}
                placeholder="2400"
              />
            </div>
            <DialogFooter className="col-span-2 mt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Log data
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
