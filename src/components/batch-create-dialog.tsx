import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { type ExitPoint } from "@/lib/mock-data";
import { toast } from "sonner";

const DRUMS = ["D-01", "D-02", "D-03", "D-04", "D-05", "D-06", "D-07", "D-08"];
const EXITS: { value: ExitPoint; label: string }[] = [
  { value: "wet_blue", label: "Wet-blue" },
  { value: "crust", label: "Crust" },
  { value: "finished", label: "Finished" },
];

export function BatchCreateDialog() {
  const { orders, recipes, addBatch } = useStore();
  const [open, setOpen] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [recipe, setRecipe] = useState("");
  const [drum, setDrum] = useState("");
  const [exit, setExit] = useState<ExitPoint>("crust");
  const [pieces, setPieces] = useState("");
  const [rawKg, setRawKg] = useState("");

  const reset = () => {
    setOrderNo(""); setRecipe(""); setDrum(""); setExit("crust"); setPieces(""); setRawKg("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNo || !recipe || !drum || !pieces || !rawKg) {
      toast.error("All fields are required");
      return;
    }

    const order = orders.find((o) => o.order_no === orderNo);
    if (!order) {
      toast.error("Order not found");
      return;
    }

    const batch = addBatch({
      order_no: orderNo,
      article: order.article,
      species: order.article.startsWith("GOAT") ? "goat" : "cow",
      raw_kg: Number(rawKg),
      pieces: Number(pieces),
      drum,
      recipe,
      exit,
    });

    toast.success(`Batch ${batch.batch_no} queued`, {
      description: `${orderNo} · ${pieces} pcs · ${drum} · ${recipe}`,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> New batch
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Create production batch</DialogTitle>
          <DialogDescription className="text-xs">
            Allocate a sales order to a drum and recipe. Batch enters the queue at the Soaking stage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid grid-cols-2 gap-3 pt-2">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Sales order</Label>
            <Select value={orderNo} onValueChange={setOrderNo}>
              <SelectTrigger><SelectValue placeholder="Select an order" /></SelectTrigger>
              <SelectContent>
                {orders.filter((o) => o.status !== "dispatched").map((o) => (
                  <SelectItem key={o.id} value={o.order_no}>
                    <span className="font-mono text-xs">{o.order_no}</span> · {o.customer} · {o.article}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Recipe</Label>
            <Select value={recipe} onValueChange={setRecipe}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {recipes.filter((r) => r.active).map((r) => (
                  <SelectItem key={r.id} value={r.code}>{r.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Drum</Label>
            <Select value={drum} onValueChange={setDrum}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {DRUMS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Pieces</Label>
            <Input type="number" min={1} value={pieces} onChange={(e) => setPieces(e.target.value)} placeholder="e.g. 600" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Raw weight (kg)</Label>
            <Input type="number" min={1} value={rawKg} onChange={(e) => setRawKg(e.target.value)} placeholder="e.g. 2400" />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Exit point</Label>
            <div className="flex gap-2">
              {EXITS.map((ex) => (
                <button
                  type="button"
                  key={ex.value}
                  onClick={() => setExit(ex.value)}
                  className={`flex-1 border px-3 py-1.5 text-xs uppercase tracking-wider ${
                    exit === ex.value
                      ? "border-accent bg-accent/10 text-accent-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="col-span-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
            <button type="submit" className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">Create batch</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
