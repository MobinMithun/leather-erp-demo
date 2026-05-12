import { useState, useMemo } from "react";
import { Plus, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, type NewStockMove } from "@/lib/store";
import type { StockMove } from "@/lib/mock-data";
import { fmtNum } from "@/lib/mock-data";

const DRUMS = ["D-01", "D-02", "D-03", "D-04", "D-05", "D-06", "D-07", "D-08"];
const MOVE_TYPES: StockMove["type"][] = ["OUT", "TRANSFER", "ADJUST", "IN"];

type SelectedItem = {
  kind: "chemical" | "raw_skin";
  id: string;
  name: string;
  lot_no: string;
  available: number;
  unit: "kg" | "pcs";
  location: string;
};

export function StockMoveDialog() {
  const { chemicals, rawSkins, batches, addStockMove } = useStore();
  const [open, setOpen] = useState(false);
  const [moveType, setMoveType] = useState<StockMove["type"]>("OUT");
  const [itemSearch, setItemSearch] = useState("");
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [qty, setQty] = useState("");
  const [destination, setDestination] = useState("");
  const [customDest, setCustomDest] = useState("");
  const [ref, setRef] = useState("");
  // ADJUST only
  const [adjustDelta, setAdjustDelta] = useState("");
  // IN only (free-form)
  const [inItem, setInItem] = useState("");
  const [inLot, setInLot] = useState("");
  const [inQty, setInQty] = useState("");
  const [inUnit, setInUnit] = useState<"kg" | "pcs" | "sqft">("kg");
  const [inFrom, setInFrom] = useState("");
  const [inTo, setInTo] = useState("");

  const reset = () => {
    setMoveType("OUT");
    setItemSearch("");
    setSelected(null);
    setQty("");
    setDestination("");
    setCustomDest("");
    setRef("");
    setAdjustDelta("");
    setInItem("");
    setInLot("");
    setInQty("");
    setInUnit("kg");
    setInFrom("");
    setInTo("");
  };

  // Build unified item list from chemicals + raw skins
  const allItems = useMemo((): SelectedItem[] => {
    const chems: SelectedItem[] = chemicals.map((c) => ({
      kind: "chemical",
      id: c.id,
      name: c.chemical,
      lot_no: c.lot_no,
      available: c.qty_kg,
      unit: "kg",
      location: "Chem store",
    }));
    const skins: SelectedItem[] = rawSkins.map((r) => ({
      kind: "raw_skin",
      id: r.id,
      name: `${r.species === "cow" ? "Cow" : "Goat"} raw skin · ${r.origin}`,
      lot_no: r.lot_no,
      available: r.pieces,
      unit: "pcs",
      location: "Raw store",
    }));
    return [...chems, ...skins];
  }, [chemicals, rawSkins]);

  const filteredItems = itemSearch.trim()
    ? allItems.filter(
        (i) =>
          i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
          i.lot_no.toLowerCase().includes(itemSearch.toLowerCase()),
      )
    : allItems;

  // Auto-suggest ref from recent active batches
  const recentBatchRefs = batches
    .filter((b) => b.status !== "done")
    .slice(0, 6)
    .map((b) => b.batch_no);
  const destinationValue = destination === "__custom__" ? customDest.trim() : destination;
  const qtyNumber = Number(qty);
  const inQtyNumber = Number(inQty);
  const adjustDeltaNumber = Number(adjustDelta);
  const hasMoveQty = Number.isFinite(qtyNumber) && qtyNumber > 0;
  const hasInQty = Number.isFinite(inQtyNumber) && inQtyNumber > 0;
  const hasValidAdjust =
    selected &&
    Number.isFinite(adjustDeltaNumber) &&
    adjustDeltaNumber !== 0 &&
    selected.available + adjustDeltaNumber >= 0;
  const canPostMove =
    moveType === "IN"
      ? Boolean(inItem.trim() && inLot.trim() && hasInQty && inFrom.trim() && inTo.trim())
      : Boolean(
          selected &&
          ((moveType === "OUT" &&
            hasMoveQty &&
            qtyNumber <= selected.available &&
            destinationValue) ||
            (moveType === "TRANSFER" &&
              hasMoveQty &&
              qtyNumber <= selected.available &&
              destinationValue) ||
            (moveType === "ADJUST" && hasValidAdjust)),
        );

  const selectItem = (item: SelectedItem) => {
    setSelected(item);
    setItemSearch("");
  };

  const submitOut = () => {
    if (!selected) {
      toast.error("Select an item first");
      return;
    }
    const qtyNum = Number(qty);
    if (!qtyNum || qtyNum <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (qtyNum > selected.available) {
      toast.error(`Only ${fmtNum(selected.available)} ${selected.unit} available`);
      return;
    }
    if (!destinationValue) {
      toast.error("Select or enter a destination");
      return;
    }
    addStockMove({
      type: "OUT",
      item: selected.name,
      item_kind: selected.kind,
      lot_no: selected.lot_no,
      qty: -qtyNum,
      unit: selected.unit,
      from: selected.location,
      to: destinationValue,
      ref: ref.trim() || destinationValue,
    });
    toast.success(
      `OUT · ${selected.name} · ${fmtNum(qtyNum)} ${selected.unit} → ${destinationValue}`,
    );
    reset();
    setOpen(false);
  };

  const submitTransfer = () => {
    if (!selected) {
      toast.error("Select an item first");
      return;
    }
    const qtyNum = Number(qty);
    if (!qtyNum || qtyNum <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (qtyNum > selected.available) {
      toast.error(`Only ${fmtNum(selected.available)} ${selected.unit} available`);
      return;
    }
    if (!destinationValue) {
      toast.error("Select or enter a destination");
      return;
    }
    addStockMove({
      type: "TRANSFER",
      item: selected.name,
      item_kind: selected.kind,
      lot_no: selected.lot_no,
      qty: qtyNum,
      unit: selected.unit,
      from: selected.location,
      to: destinationValue,
      ref: ref.trim() || "TRANSFER",
    });
    toast.success(`TRANSFER · ${selected.name} → ${destinationValue}`);
    reset();
    setOpen(false);
  };

  const submitAdjust = () => {
    if (!selected) {
      toast.error("Select an item first");
      return;
    }
    const delta = Number(adjustDelta);
    if (!Number.isFinite(delta) || delta === 0) {
      toast.error("Enter a non-zero delta");
      return;
    }
    if (selected.available + delta < 0) {
      toast.error(`Adjustment cannot drop below zero ${selected.unit}`);
      return;
    }
    addStockMove({
      type: "ADJUST",
      item: selected.name,
      item_kind: selected.kind,
      lot_no: selected.lot_no,
      qty: delta,
      unit: selected.unit,
      from: selected.location,
      to: selected.location,
      ref: ref.trim() || "ADJUST",
    });
    toast.success(`ADJUST · ${selected.name} · ${delta > 0 ? "+" : ""}${delta} ${selected.unit}`);
    reset();
    setOpen(false);
  };

  const submitIn = () => {
    if (!inItem.trim() || !inLot.trim() || !inQty || !inFrom.trim() || !inTo.trim()) {
      toast.error("Fill all fields");
      return;
    }
    addStockMove({
      type: "IN",
      item: inItem.trim(),
      item_kind: "chemical",
      lot_no: inLot.trim(),
      qty: Math.abs(Number(inQty)),
      unit: inUnit,
      from: inFrom.trim(),
      to: inTo.trim(),
      ref: ref.trim() || "GRN",
    });
    toast.success(`IN · ${inItem.trim()}`);
    reset();
    setOpen(false);
  };

  const handleSubmit = () => {
    if (moveType === "OUT") submitOut();
    else if (moveType === "TRANSFER") submitTransfer();
    else if (moveType === "ADJUST") submitAdjust();
    else submitIn();
  };

  const typeColors: Record<StockMove["type"], string> = {
    OUT: "border-status-bad   bg-status-bad/10   text-status-bad",
    TRANSFER: "border-status-info  bg-status-info/10  text-status-info",
    ADJUST: "border-status-warn  bg-status-warn/10  text-status-warn",
    IN: "border-status-ok    bg-status-ok/10    text-status-ok",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <Button size="sm" variant="default" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" /> New stock move
      </Button>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New stock move</DialogTitle>
          <DialogDescription className="text-xs">Posts to ledger immediately.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* ── Move type pills ── */}
          <div className="flex gap-2">
            {MOVE_TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  setMoveType(t);
                  setSelected(null);
                  setItemSearch("");
                }}
                className={`flex-1 border py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                  moveType === t
                    ? typeColors[t]
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── IN: free-form (rare) ── */}
          {moveType === "IN" && (
            <div className="space-y-3 rounded-sm border border-dashed border-border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                For bulk receipts use "Receive skins" / "Receive chemicals" on the inventory page.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Item
                  </Label>
                  <Input
                    value={inItem}
                    onChange={(e) => setInItem(e.target.value)}
                    placeholder="Chrome Sulphate 33%"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Lot #
                  </Label>
                  <Input
                    value={inLot}
                    onChange={(e) => setInLot(e.target.value)}
                    placeholder="CS-2605-A"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Reference
                  </Label>
                  <Input
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    placeholder="GRN-001"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Qty
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={inQty}
                    onChange={(e) => setInQty(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Unit
                  </Label>
                  <div className="flex gap-1">
                    {(["kg", "pcs", "sqft"] as const).map((u) => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => setInUnit(u)}
                        className={`flex-1 border py-1.5 text-xs uppercase ${inUnit === u ? "border-accent bg-accent/10 text-accent-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    From
                  </Label>
                  <Input
                    value={inFrom}
                    onChange={(e) => setInFrom(e.target.value)}
                    placeholder="Supplier"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    To
                  </Label>
                  <Input
                    value={inTo}
                    onChange={(e) => setInTo(e.target.value)}
                    placeholder="Chem store"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── OUT / TRANSFER / ADJUST: item picker ── */}
          {moveType !== "IN" && (
            <>
              {/* Item picker */}
              {!selected ? (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Select item
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Search chemical or raw skin lot…"
                      className="w-full border border-border bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto border border-border bg-card divide-y divide-border">
                    {filteredItems.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                        No items match
                      </p>
                    ) : (
                      filteredItems.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => selectItem(item)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {item.lot_no}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <div
                              className={`text-xs font-medium tabular ${item.available === 0 ? "text-status-bad" : "text-foreground"}`}
                            >
                              {fmtNum(item.available)} {item.unit}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{item.location}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Selected item card */
                <div className="flex items-center justify-between rounded-sm border border-accent/40 bg-accent/5 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium">{selected.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {selected.lot_no} · {selected.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <div className="text-xs font-medium tabular">
                        {fmtNum(selected.available)} {selected.unit}
                      </div>
                      <div className="text-[10px] text-muted-foreground">available</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="text-[10px] text-muted-foreground underline hover:text-foreground"
                    >
                      change
                    </button>
                  </div>
                </div>
              )}

              {/* ── OUT: qty + drum destination ── */}
              {selected && moveType === "OUT" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Quantity ({selected.unit})
                      <span className="ml-2 normal-case text-muted-foreground">
                        max {fmtNum(selected.available)}
                      </span>
                    </Label>
                    <Input
                      type="number"
                      autoFocus
                      min={1}
                      max={selected.available}
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder={`1 – ${fmtNum(selected.available)}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Destination
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[...DRUMS, "Dispatch", "Waste", "Other…"].map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => setDestination(d === "Other…" ? "__custom__" : d)}
                          className={`border px-2.5 py-1 text-xs font-medium transition-colors ${
                            destination === (d === "Other…" ? "__custom__" : d)
                              ? "border-accent bg-accent/10 text-accent-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    {destination === "__custom__" && (
                      <Input
                        autoFocus
                        value={customDest}
                        onChange={(e) => setCustomDest(e.target.value)}
                        placeholder="Enter destination…"
                        className="mt-1.5"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Reference{" "}
                      <span className="normal-case text-muted-foreground">(batch / order)</span>
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {recentBatchRefs.map((b) => (
                        <button
                          type="button"
                          key={b}
                          onClick={() => setRef(b)}
                          className={`border px-2 py-0.5 text-[10px] font-mono transition-colors ${
                            ref === b
                              ? "border-accent bg-accent/10 text-accent-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                      placeholder="or type a reference…"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* ── TRANSFER: qty + destination ── */}
              {selected && moveType === "TRANSFER" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-sm border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{selected.location}</span>
                    <span className="text-muted-foreground">→ move to</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Destination
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Raw store · A1",
                        "Raw store · A2",
                        "Chem store",
                        "Wet-blue store",
                        "Crust store · C1",
                        "Crust store · C2",
                        "Finished store",
                        "Sammy floor",
                        "Other…",
                      ].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDestination(d === "Other…" ? "__custom__" : d)}
                          className={`border px-2.5 py-1 text-xs font-medium transition-colors ${
                            destination === (d === "Other…" ? "__custom__" : d)
                              ? "border-status-info bg-status-info/10 text-status-info"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    {destination === "__custom__" && (
                      <Input
                        autoFocus
                        value={customDest}
                        onChange={(e) => setCustomDest(e.target.value)}
                        placeholder="Enter location…"
                        className="mt-1.5"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Qty ({selected.unit})
                        <span className="ml-2 normal-case text-muted-foreground">
                          max {fmtNum(selected.available)}
                        </span>
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={selected.available}
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="e.g. 800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Reference
                      </Label>
                      <Input
                        value={ref}
                        onChange={(e) => setRef(e.target.value)}
                        placeholder="optional"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── ADJUST: delta ── */}
              {selected && moveType === "ADJUST" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Delta ({selected.unit}){" "}
                      <span className="normal-case text-muted-foreground">use − for write-off</span>
                    </Label>
                    <Input
                      type="number"
                      value={adjustDelta}
                      onChange={(e) => setAdjustDelta(e.target.value)}
                      placeholder="e.g. -12 or +50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Reason
                    </Label>
                    <Input
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                      placeholder="recount, damage…"
                    />
                  </div>
                  {adjustDelta && selected && (
                    <div className="col-span-2 rounded-sm border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      After adjust:{" "}
                      <span className="font-medium text-foreground">
                        {fmtNum(Math.max(0, selected.available + Number(adjustDelta)))}{" "}
                        {selected.unit}
                      </span>{" "}
                      (was {fmtNum(selected.available)} {selected.unit})
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canPostMove}>
            Post move <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
