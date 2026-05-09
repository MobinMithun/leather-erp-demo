import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StockMove, StockMoveType } from "@/lib/mock-data";

const TYPES: StockMoveType[] = ["IN", "OUT", "TRANSFER", "ADJUST"];
const KINDS: StockMove["item_kind"][] = [
  "raw_skin",
  "chemical",
  "wet_blue",
  "crust",
  "finished",
];
const UNITS: StockMove["unit"][] = ["pcs", "kg", "sqft"];

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  onCreate: (move: StockMove) => void;
}

export function StockMoveDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<StockMoveType>("IN");
  const [item, setItem] = useState("");
  const [itemKind, setItemKind] = useState<StockMove["item_kind"]>("chemical");
  const [lotNo, setLotNo] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState<StockMove["unit"]>("kg");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [ref, setRef] = useState("");

  const reset = () => {
    setType("IN");
    setItem("");
    setItemKind("chemical");
    setLotNo("");
    setQty("");
    setUnit("kg");
    setFrom("");
    setTo("");
    setRef("");
  };

  const submit = () => {
    const trimmed = {
      item: item.trim(),
      lot_no: lotNo.trim(),
      from: from.trim(),
      to: to.trim(),
      ref: ref.trim(),
    };
    const qtyNum = Number(qty);
    if (
      !trimmed.item ||
      !trimmed.lot_no ||
      !trimmed.from ||
      !trimmed.to ||
      !trimmed.ref ||
      !Number.isFinite(qtyNum) ||
      qtyNum === 0
    ) {
      toast.error("Fill all fields with a non-zero quantity");
      return;
    }
    const signed =
      type === "OUT" ? -Math.abs(qtyNum)
        : type === "ADJUST" ? qtyNum
        : Math.abs(qtyNum);

    const move: StockMove = {
      id: `m-${Date.now()}`,
      ts: nowStamp(),
      type,
      item: trimmed.item,
      item_kind: itemKind,
      lot_no: trimmed.lot_no,
      qty: signed,
      unit,
      from: trimmed.from,
      to: trimmed.to,
      ref: trimmed.ref,
      user: "current.user",
    };
    onCreate(move);
    toast.success(`${type} move recorded · ${trimmed.item}`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New stock move
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New stock move</DialogTitle>
          <DialogDescription>
            Record an IN, OUT, TRANSFER, or ADJUST against inventory. Posts to the ledger immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Move type</Label>
            <Select value={type} onValueChange={(v) => setType(v as StockMoveType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Item kind</Label>
            <Select value={itemKind} onValueChange={(v) => setItemKind(v as StockMove["item_kind"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => <SelectItem key={k} value={k}>{k.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 col-span-2">
            <Label>Item description</Label>
            <Input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. Chrome Sulphate 33%"
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Lot #</Label>
            <Input value={lotNo} onChange={(e) => setLotNo(e.target.value)} placeholder="CS-2605-A" maxLength={40} />
          </div>
          <div className="space-y-1.5">
            <Label>Reference</Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="GRN / Batch / SO #" maxLength={40} />
          </div>

          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder={type === "ADJUST" ? "+/- delta" : "positive number"}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as StockMove["unit"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>From</Label>
            <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Source location" maxLength={60} />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination" maxLength={60} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Post move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
