import { useState, useMemo, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard } from "@/components/page-shell";
import { fmtBDT, fmtNum, type StockMove } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Plus,
  Search,
  ArrowRight,
} from "lucide-react";
import { StockMoveDialog } from "@/components/stock-move-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory — HIDE.OS" }] }),
  component: InventoryPage,
});

const CHEM_TYPES = [
  "Tanning",
  "Liming",
  "Pickling",
  "Fatliquoring",
  "Dyeing",
  "Retanning",
  "Other",
];
const MOVE_TYPES: (StockMove["type"] | "all")[] = ["all", "IN", "OUT", "TRANSFER", "ADJUST"];

const CHEM_TYPE_COLORS: Record<string, string> = {
  Tanning: "bg-accent/20 text-accent-foreground",
  Liming: "bg-status-info/15 text-status-info",
  Pickling: "bg-status-warn/15 text-status-warn",
  Fatliquoring: "bg-status-ok/15 text-status-ok",
  Dyeing: "bg-purple-100 text-purple-700",
  Retanning: "bg-orange-100 text-orange-700",
  Other: "bg-muted text-muted-foreground",
};

type Tab = "skins" | "chemicals" | "moves";

function InventoryPage() {
  const { chemicals, rawSkins, stockMoves, addChemicalLot, addRawSkinLot } = useStore();

  // ── Tab state ────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("skins");

  // ── Auto lot number generators ───────────────────────────────────
  const genRawLotNo = useCallback(() => {
    const d = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    return `RAW-${ym}-${String(rawSkins.length + 1).padStart(3, "0")}`;
  }, [rawSkins.length]);
  const genChemLotNo = useCallback(() => {
    const d = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    return `CH-${ym}-${String(chemicals.length + 1).padStart(3, "0")}`;
  }, [chemicals.length]);

  // ── Raw skins tab state ──────────────────────────────────────────
  const [skinSearch, setSkinSearch] = useState("");
  const [skinOpen, setSkinOpen] = useState(false);
  const [skinLot, setSkinLot] = useState("");
  const [skinSpecies, setSkinSpecies] = useState<"cow" | "goat">("cow");
  const [skinOrigin, setSkinOrigin] = useState("");
  const [skinCount, setSkinCount] = useState("");
  const [skinKg, setSkinKg] = useState("");
  const [skinCost, setSkinCost] = useState("");
  const [skinDate, setSkinDate] = useState(() => new Date().toISOString().slice(0, 10));

  const openSkinDialog = () => {
    setSkinLot(genRawLotNo());
    setSkinDate(new Date().toISOString().slice(0, 10));
    setSkinOpen(true);
  };

  const resetSkinForm = () => {
    setSkinLot("");
    setSkinSpecies("cow");
    setSkinOrigin("");
    setSkinCount("");
    setSkinKg("");
    setSkinCost("");
    setSkinDate(new Date().toISOString().slice(0, 10));
  };

  const submitSkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skinLot || !skinOrigin || !skinCount || !skinKg || !skinCost) {
      toast.error("All fields are required");
      return;
    }
    addRawSkinLot({
      lot_no: skinLot,
      species: skinSpecies,
      origin: skinOrigin,
      pieces: Number(skinCount),
      total_kg: Number(skinKg),
      received: skinDate,
      unit_cost_bdt: Number(skinCost),
    });
    toast.success(`Lot ${skinLot} received · ${fmtNum(Number(skinCount))} ${skinSpecies} skins`);
    resetSkinForm();
    setSkinOpen(false);
  };

  // ── Chemicals tab state ───────────────────────────────────────────
  const [chemFilter, setChemFilter] = useState<string>("all");
  const [chemOpen, setChemOpen] = useState(false);
  const [chemName, setChemName] = useState("");
  const [chemType, setChemType] = useState("Tanning");
  const [chemLot, setChemLot] = useState("");
  const [chemSupplier, setChemSupplier] = useState("");
  const [chemQty, setChemQty] = useState("");
  const [chemReorder, setChemReorder] = useState("");
  const [chemCost, setChemCost] = useState("");
  const [chemDate, setChemDate] = useState(() => new Date().toISOString().slice(0, 10));

  const openChemDialog = () => {
    setChemLot(genChemLotNo());
    setChemDate(new Date().toISOString().slice(0, 10));
    setChemOpen(true);
  };

  const resetChemForm = () => {
    setChemName("");
    setChemType("Tanning");
    setChemLot("");
    setChemSupplier("");
    setChemQty("");
    setChemReorder("");
    setChemCost("");
    setChemDate(new Date().toISOString().slice(0, 10));
  };

  const submitChem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chemName || !chemLot || !chemSupplier || !chemQty || !chemReorder || !chemCost) {
      toast.error("All fields are required");
      return;
    }
    addChemicalLot({
      chemical: chemName,
      type: chemType,
      lot_no: chemLot,
      supplier: chemSupplier,
      qty_kg: Number(chemQty),
      reorder_kg: Number(chemReorder),
      unit_cost_bdt: Number(chemCost),
      received: chemDate,
    });
    toast.success(`${chemName} lot ${chemLot} received · ${fmtNum(Number(chemQty))} kg`);
    resetChemForm();
    setChemOpen(false);
  };

  // ── Stock moves tab state ─────────────────────────────────────────
  const [moveFilter, setMoveFilter] = useState<StockMove["type"] | "all">("all");

  // ── Computed values ───────────────────────────────────────────────
  const totalRawPcs = useMemo(() => rawSkins.reduce((s, r) => s + r.pieces, 0), [rawSkins]);
  const totalRawValue = useMemo(
    () => rawSkins.reduce((s, r) => s + r.unit_cost_bdt * r.pieces, 0),
    [rawSkins],
  );
  const reorderCount = useMemo(
    () => chemicals.filter((c) => c.qty_kg < c.reorder_kg).length,
    [chemicals],
  );
  const totalChemValue = useMemo(
    () => chemicals.reduce((s, c) => s + c.qty_kg * c.unit_cost_bdt, 0),
    [chemicals],
  );
  const lastMove = stockMoves[0];

  // Filtered data
  const visibleSkins = useMemo(
    () =>
      skinSearch.trim()
        ? rawSkins.filter(
            (r) =>
              r.lot_no.toLowerCase().includes(skinSearch.toLowerCase()) ||
              r.origin.toLowerCase().includes(skinSearch.toLowerCase()),
          )
        : rawSkins,
    [rawSkins, skinSearch],
  );

  const visibleChems = useMemo(
    () => (chemFilter === "all" ? chemicals : chemicals.filter((c) => c.type === chemFilter)),
    [chemicals, chemFilter],
  );

  const visibleMoves = useMemo(
    () =>
      (moveFilter === "all" ? stockMoves : stockMoves.filter((m) => m.type === moveFilter)).slice(
        0,
        100,
      ),
    [stockMoves, moveFilter],
  );

  const moveCountByType = useCallback(
    (t: StockMove["type"]) => stockMoves.filter((m) => m.type === t).length,
    [stockMoves],
  );

  return (
    <PageShell title="Inventory" subtitle="Raw skins · chemicals · stock ledger">
      {/* ── KPI cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Raw skins"
          value={`${fmtNum(totalRawPcs)} pcs`}
          sub={`${rawSkins.length} lots · ${fmtBDT(totalRawValue)}`}
        />
        <StatCard
          label="Chemical lots"
          value={chemicals.length}
          tone={reorderCount > 0 ? "warn" : "ok"}
          sub={reorderCount > 0 ? `${reorderCount} below reorder` : "All stocked OK"}
        />
        <StatCard
          label="Chemical stock value"
          value={fmtBDT(totalChemValue)}
          sub="at current qty"
        />
        <StatCard
          label="Stock moves"
          value={stockMoves.length}
          sub={lastMove ? `Last: ${lastMove.ts}` : "No moves yet"}
        />
      </div>

      {/* ── Tab switcher ─────────────────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {(["skins", "chemicals", "moves"] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = {
              skins: `Raw Skins (${rawSkins.length})`,
              chemicals: `Chemicals (${chemicals.length})`,
              moves: `Stock Moves (${stockMoves.length})`,
            };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  tab === t
                    ? "border-accent text-accent-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {labels[t]}
                {t === "chemicals" && reorderCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-status-bad px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {reorderCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════ TAB: RAW SKINS ════════════════════════════════ */}
      {tab === "skins" && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={skinSearch}
                onChange={(e) => setSkinSearch(e.target.value)}
                placeholder="Search lot # or origin…"
                className="w-56 border border-border bg-background py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              onClick={openSkinDialog}
              className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Receive skins
            </button>
          </div>

          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Lot · Date</th>
                  <th className="px-4 py-2.5 text-left font-medium">Species</th>
                  <th className="px-4 py-2.5 text-left font-medium">Origin</th>
                  <th className="px-4 py-2.5 text-right font-medium">Pieces</th>
                  <th className="px-4 py-2.5 text-right font-medium">Avg kg / skin</th>
                  <th className="px-4 py-2.5 text-right font-medium">Lot value</th>
                </tr>
              </thead>
              <tbody>
                {visibleSkins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      {skinSearch
                        ? "No lots match your search."
                        : `No raw skin lots yet. Click "Receive skins" to add one.`}
                    </td>
                  </tr>
                ) : (
                  visibleSkins.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-medium">{r.lot_no}</div>
                        <div className="text-[10px] text-muted-foreground">{r.received}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            r.species === "cow"
                              ? "bg-status-info/15 text-status-info"
                              : "bg-status-ok/15 text-status-ok"
                          }`}
                        >
                          {r.species}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{r.origin}</td>
                      <td className="px-4 py-3 text-right font-medium tabular">
                        {fmtNum(r.pieces)}
                      </td>
                      <td className="px-4 py-3 text-right tabular text-muted-foreground">
                        {r.pieces > 0 ? (r.total_kg / r.pieces).toFixed(1) : "—"} kg
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular text-accent-foreground">
                        {fmtBDT(r.unit_cost_bdt * r.pieces)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {visibleSkins.length > 0 && (
                <tfoot className="border-t-2 border-border bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <td className="px-4 py-2 font-medium" colSpan={3}>
                      Total
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-foreground tabular">
                      {fmtNum(totalRawPcs)}
                    </td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2 text-right font-medium text-foreground tabular">
                      {fmtBDT(totalRawValue)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      )}

      {/* ══════════════ TAB: CHEMICALS ════════════════════════════════ */}
      {tab === "chemicals" && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {["all", ...CHEM_TYPES].map((t) => (
                <button
                  key={t}
                  onClick={() => setChemFilter(t)}
                  className={`border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                    chemFilter === t
                      ? "border-accent bg-accent/10 text-accent-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "all" ? "All" : t}
                  {t !== "all" && (
                    <span className="ml-1 text-muted-foreground">
                      {chemicals.filter((c) => c.type === t).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={openChemDialog}
              className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Receive chemicals
            </button>
          </div>

          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Chemical · Lot · Supplier</th>
                  <th className="px-4 py-2.5 text-left font-medium">Type</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qty (kg)</th>
                  <th className="px-4 py-2.5 w-44 text-left font-medium">Stock level</th>
                  <th className="px-4 py-2.5 text-right font-medium">Value (BDT)</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleChems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      {chemFilter !== "all"
                        ? `No ${chemFilter} lots.`
                        : `No chemical lots yet. Click "Receive chemicals" to add one.`}
                    </td>
                  </tr>
                ) : (
                  visibleChems.map((c) => {
                    const pct = Math.min(110, (c.qty_kg / c.reorder_kg) * 100);
                    const low = c.qty_kg < c.reorder_kg;
                    const critical = c.qty_kg < c.reorder_kg * 0.5;
                    const barColor = !low
                      ? "bg-status-ok"
                      : critical
                        ? "bg-status-bad"
                        : "bg-status-warn";
                    return (
                      <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">{c.chemical}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {c.lot_no} · {c.supplier}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${CHEM_TYPE_COLORS[c.type] ?? "bg-muted text-muted-foreground"}`}
                          >
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular">
                          {fmtNum(c.qty_kg)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-muted rounded-sm overflow-hidden">
                              <div
                                className={`h-full ${barColor} rounded-sm`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground tabular w-20 text-right shrink-0">
                              {fmtNum(c.qty_kg)} / {fmtNum(c.reorder_kg)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular text-accent-foreground font-medium">
                          {fmtBDT(c.qty_kg * c.unit_cost_bdt)}
                        </td>
                        <td className="px-4 py-3">
                          {low ? (
                            <span className="inline-flex items-center rounded-sm bg-status-bad/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-status-bad">
                              Reorder
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-sm bg-status-ok/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-status-ok">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {visibleChems.length > 0 && (
                <tfoot className="border-t-2 border-border bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <td className="px-4 py-2 font-medium" colSpan={4}>
                      Total ({visibleChems.length} lots)
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-foreground tabular">
                      {fmtBDT(visibleChems.reduce((s, c) => s + c.qty_kg * c.unit_cost_bdt, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      )}

      {/* ══════════════ TAB: STOCK MOVES ══════════════════════════════ */}
      {tab === "moves" && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {MOVE_TYPES.map((t) => {
                const count = t === "all" ? stockMoves.length : moveCountByType(t);
                const toneClass =
                  t === "IN"
                    ? "border-status-ok/40 bg-status-ok/5 text-status-ok"
                    : t === "OUT"
                      ? "border-status-bad/40 bg-status-bad/5 text-status-bad"
                      : t === "TRANSFER"
                        ? "border-status-info/40 bg-status-info/5 text-status-info"
                        : t === "ADJUST"
                          ? "border-status-warn/40 bg-status-warn/5 text-status-warn"
                          : "";
                return (
                  <button
                    key={t}
                    onClick={() => setMoveFilter(t)}
                    className={`border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                      moveFilter === t
                        ? t === "all"
                          ? "border-accent bg-accent/10 text-accent-foreground"
                          : toneClass
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t === "all" ? "All" : t}
                    <span className="ml-1 tabular">{count}</span>
                  </button>
                );
              })}
            </div>
            <StockMoveDialog />
          </div>

          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Time</th>
                  <th className="px-4 py-2.5 text-left font-medium">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium">Item · Lot</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                  <th className="px-4 py-2.5 text-left font-medium">Location</th>
                  <th className="px-4 py-2.5 text-left font-medium">Ref</th>
                  <th className="px-4 py-2.5 text-left font-medium">By</th>
                </tr>
              </thead>
              <tbody>
                {visibleMoves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No stock moves yet.
                    </td>
                  </tr>
                ) : (
                  visibleMoves.map((m: StockMove) => {
                    const tone =
                      m.type === "IN"
                        ? "text-status-ok"
                        : m.type === "OUT"
                          ? "text-status-bad"
                          : m.type === "TRANSFER"
                            ? "text-status-info"
                            : "text-status-warn";
                    const Icon =
                      m.type === "IN"
                        ? ArrowDownToLine
                        : m.type === "OUT"
                          ? ArrowUpFromLine
                          : m.type === "TRANSFER"
                            ? ArrowLeftRight
                            : SlidersHorizontal;
                    return (
                      <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {m.ts}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider ${tone}`}
                          >
                            <Icon className="h-3 w-3" /> {m.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{m.item}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            {m.lot_no}
                          </div>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium tabular whitespace-nowrap ${m.qty < 0 ? "text-status-bad" : "text-status-ok"}`}
                        >
                          {m.qty > 0 ? "+" : ""}
                          {fmtNum(m.qty)} {m.unit}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{m.from}</span>
                            <ArrowRight className="h-3 w-3 shrink-0" />
                            <span className="text-foreground">{m.to}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {m.ref}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {m.user}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {visibleMoves.length === 100 && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Showing first 100 of{" "}
              {moveFilter === "all"
                ? stockMoves.length
                : stockMoves.filter((m) => m.type === moveFilter).length}{" "}
              moves.
            </p>
          )}
        </section>
      )}

      {/* ── Receive raw skins dialog ──────────────────────────────── */}
      <Dialog
        open={skinOpen}
        onOpenChange={(o) => {
          setSkinOpen(o);
          if (!o) resetSkinForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Receive raw skins</DialogTitle>
            <DialogDescription className="text-xs">
              Log a new raw skin lot into warehouse stock.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSkin} className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Lot #{" "}
                <span className="ml-1 normal-case text-muted-foreground/70">
                  (auto-generated · editable)
                </span>
              </Label>
              <Input
                value={skinLot}
                onChange={(e) => setSkinLot(e.target.value)}
                className="font-mono"
                maxLength={40}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Species
              </Label>
              <Select
                value={skinSpecies}
                onValueChange={(v) => setSkinSpecies(v as "cow" | "goat")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cow">Cow</SelectItem>
                  <SelectItem value="goat">Goat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Origin / District
              </Label>
              <Input
                value={skinOrigin}
                onChange={(e) => setSkinOrigin(e.target.value)}
                placeholder="Sirajganj"
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Count (pcs)
              </Label>
              <Input
                type="number"
                min={1}
                value={skinCount}
                onChange={(e) => setSkinCount(e.target.value)}
                placeholder="720"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total weight (kg)
              </Label>
              <Input
                type="number"
                min={1}
                value={skinKg}
                onChange={(e) => setSkinKg(e.target.value)}
                placeholder="2880"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Unit cost (BDT / pc)
              </Label>
              <Input
                type="number"
                min={0}
                value={skinCost}
                onChange={(e) => setSkinCost(e.target.value)}
                placeholder="610"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Received date
              </Label>
              <Input type="date" value={skinDate} onChange={(e) => setSkinDate(e.target.value)} />
            </div>
            <DialogFooter className="col-span-2 mt-2">
              <button
                type="button"
                onClick={() => setSkinOpen(false)}
                className="border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Receive lot
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Receive chemicals dialog ──────────────────────────────── */}
      <Dialog
        open={chemOpen}
        onOpenChange={(o) => {
          setChemOpen(o);
          if (!o) resetChemForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Receive chemicals</DialogTitle>
            <DialogDescription className="text-xs">
              Log a new chemical lot into warehouse stock.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitChem} className="grid grid-cols-2 gap-3 pt-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Chemical name
              </Label>
              <Input
                value={chemName}
                onChange={(e) => setChemName(e.target.value)}
                placeholder="Chrome Sulphate 33%"
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Type
              </Label>
              <Select value={chemType} onValueChange={setChemType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHEM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Lot #{" "}
                <span className="ml-1 normal-case text-muted-foreground/70">
                  (auto-generated · editable)
                </span>
              </Label>
              <Input
                value={chemLot}
                onChange={(e) => setChemLot(e.target.value)}
                className="font-mono"
                maxLength={40}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Supplier
              </Label>
              <Input
                value={chemSupplier}
                onChange={(e) => setChemSupplier(e.target.value)}
                placeholder="Stahl Asia"
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Qty received (kg)
              </Label>
              <Input
                type="number"
                min={0}
                value={chemQty}
                onChange={(e) => setChemQty(e.target.value)}
                placeholder="2000"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Reorder point (kg)
              </Label>
              <Input
                type="number"
                min={0}
                value={chemReorder}
                onChange={(e) => setChemReorder(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Unit cost (BDT / kg)
              </Label>
              <Input
                type="number"
                min={0}
                value={chemCost}
                onChange={(e) => setChemCost(e.target.value)}
                placeholder="185"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Received date
              </Label>
              <Input type="date" value={chemDate} onChange={(e) => setChemDate(e.target.value)} />
            </div>
            <DialogFooter className="col-span-2 mt-2">
              <button
                type="button"
                onClick={() => setChemOpen(false)}
                className="border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Receive lot
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
