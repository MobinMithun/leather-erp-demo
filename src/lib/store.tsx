import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  ORDERS as SEED_ORDERS,
  BATCHES as SEED_BATCHES,
  CHEMICALS as SEED_CHEMICALS,
  RAW_SKINS as SEED_RAW_SKINS,
  STOCK_MOVES as SEED_STOCK_MOVES,
  QC as SEED_QC,
  ESG as SEED_ESG,
  RECIPES as SEED_RECIPES,
  PIECES as SEED_PIECES,
  type SalesOrder,
  type Batch,
  type ChemicalLot,
  type RawSkinLot,
  type StockMove,
  type QCRow,
  type ESGRow,
  type RecipeRow,
  type PieceRow,
  type OrderStatus,
  type ExitPoint,
  type StageCode,
  type BatchStatus,
} from "./mock-data";

const STORAGE_KEY = "hide-os-db-v1";

// Simplified stage pipelines per exit point
const PIPELINE: Record<ExitPoint, StageCode[]> = {
  wet_blue: ["soak", "lime", "tan", "qc", "pack"],
  crust: ["soak", "lime", "tan", "sammy", "shave", "dye", "qc", "pack"],
  finished: ["soak", "lime", "tan", "sammy", "shave", "dye", "finish", "qc", "pack"],
};

function stageToStatus(stage: StageCode): BatchStatus {
  const map: Partial<Record<StageCode, BatchStatus>> = {
    soak: "soak",
    lime: "lime",
    tan: "tan",
    sammy: "sammy",
    shave: "shave",
    dye: "dye",
    finish: "finish",
    qc: "qc",
    pack: "done",
  };
  return map[stage] ?? "queued";
}

const ORDER_NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  draft: "confirmed",
  confirmed: "in_production",
  in_production: "ready",
  ready: "dispatched",
  dispatched: null,
};

interface DB {
  orders: SalesOrder[];
  batches: Batch[];
  chemicals: ChemicalLot[];
  rawSkins: RawSkinLot[];
  stockMoves: StockMove[];
  qcEntries: QCRow[];
  esgEntries: ESGRow[];
  recipes: RecipeRow[];
  pieces: PieceRow[];
}

function seedDB(): DB {
  return {
    orders: SEED_ORDERS,
    batches: SEED_BATCHES,
    chemicals: SEED_CHEMICALS,
    rawSkins: SEED_RAW_SKINS,
    stockMoves: SEED_STOCK_MOVES,
    qcEntries: SEED_QC,
    esgEntries: SEED_ESG,
    recipes: SEED_RECIPES,
    pieces: SEED_PIECES,
  };
}

function loadDB(): DB {
  if (typeof window === "undefined") return seedDB();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch (error) {
    console.warn("Unable to load saved ERP demo state; using seed data instead.", error);
  }
  return seedDB();
}

function saveDB(db: DB) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.warn("Unable to persist ERP demo state.", error);
  }
}

function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function genOrderNo() {
  return `SO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000 + 1000))}`;
}

function genBatchNo() {
  return `B-${Math.floor(26100 + Math.random() * 900)}`;
}

export interface NewOrder {
  customer: string;
  country: string;
  article: string;
  qty_pcs: number;
  value_bdt: number;
  due_date: string;
}

export interface NewBatch {
  order_no: string;
  article: string;
  species: "cow" | "goat";
  raw_kg: number;
  pieces: number;
  drum: string;
  recipe: string;
  exit: ExitPoint;
}

export interface NewStockMove {
  type: StockMove["type"];
  item: string;
  item_kind: StockMove["item_kind"];
  lot_no: string;
  qty: number;
  unit: StockMove["unit"];
  from: string;
  to: string;
  ref: string;
}

export type NewChemicalLot = Omit<ChemicalLot, "id">;
export type NewRawSkinLot = Omit<RawSkinLot, "id">;

interface StoreCtx extends DB {
  // Orders
  addOrder: (o: NewOrder) => SalesOrder;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  // Batches
  addBatch: (b: NewBatch) => Batch;
  advanceBatchStage: (id: string) => string;
  // Inventory
  addStockMove: (m: NewStockMove) => void;
  addChemicalLot: (lot: NewChemicalLot) => void;
  addRawSkinLot: (lot: NewRawSkinLot) => void;
  // QC
  addQCEntry: (q: QCRow) => void;
  // ESG
  addESGEntry: (e: ESGRow) => void;
  // Recipes
  addRecipe: (r: Omit<RecipeRow, "id">) => void;
  // Pieces
  gradePiece: (
    id: string,
    grade: PieceRow["grade"],
    sqft: number,
    thickness_mm: number,
    defect: string | null,
  ) => void;
  // Reset
  resetDB: () => void;
}

const StoreContext = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Always start with seed data so server and client first-render agree (no hydration mismatch).
  // After mount, overwrite with whatever is in localStorage.
  const [db, setDB] = useState<DB>(seedDB);

  useEffect(() => {
    setDB(loadDB());
  }, []);

  const update = (fn: (prev: DB) => DB) => {
    setDB((prev) => {
      const next = fn(prev);
      saveDB(next);
      return next;
    });
  };

  const ctx: StoreCtx = {
    ...db,

    addOrder: (o) => {
      const order: SalesOrder = {
        id: `o-${Date.now()}`,
        order_no: genOrderNo(),
        customer: o.customer,
        country: o.country,
        article: o.article,
        qty_pcs: o.qty_pcs,
        due_date: o.due_date,
        status: "draft",
        value_bdt: o.value_bdt,
      };
      update((prev) => ({ ...prev, orders: [...prev.orders, order] }));
      return order;
    },

    updateOrderStatus: (id, status) =>
      update((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      })),

    addBatch: (b) => {
      const batch: Batch = {
        id: `b-${Date.now()}`,
        batch_no: genBatchNo(),
        order_no: b.order_no,
        article: b.article,
        species: b.species,
        raw_kg: b.raw_kg,
        pieces: b.pieces,
        current_stage: "soak",
        status: "queued",
        exit: b.exit,
        drum: b.drum,
        started: todayISO(),
        recipe: b.recipe,
      };
      update((prev) => ({ ...prev, batches: [...prev.batches, batch] }));
      return batch;
    },

    advanceBatchStage: (id) => {
      let newStageName = "";
      update((prev) => {
        const batches = prev.batches.map((b) => {
          if (b.id !== id) return b;
          if (b.status === "done") return b;
          const pipeline = PIPELINE[b.exit];
          if (b.status === "queued") {
            const firstStage = pipeline[0];
            newStageName = firstStage;
            return { ...b, current_stage: firstStage, status: stageToStatus(firstStage) };
          }
          const curIdx = pipeline.indexOf(b.current_stage);
          if (curIdx === -1 || curIdx >= pipeline.length - 1) {
            newStageName = "done";
            return { ...b, status: "done" as BatchStatus };
          }
          const nextStage = pipeline[curIdx + 1];
          newStageName = nextStage;
          return { ...b, current_stage: nextStage, status: stageToStatus(nextStage) };
        });
        return { ...prev, batches };
      });
      return newStageName;
    },

    addStockMove: (m) => {
      const move: StockMove = {
        id: `m-${Date.now()}`,
        ts: nowStamp(),
        user: "current.user",
        ...m,
      };
      update((prev) => {
        let chemicals = prev.chemicals;
        if (m.item_kind === "chemical" && (m.type === "OUT" || m.type === "ADJUST")) {
          chemicals = chemicals.map((c) =>
            c.lot_no === m.lot_no ? { ...c, qty_kg: Math.max(0, c.qty_kg + m.qty) } : c,
          );
        }
        let rawSkins = prev.rawSkins;
        if (m.item_kind === "raw_skin" && (m.type === "OUT" || m.type === "ADJUST")) {
          rawSkins = rawSkins.map((r) =>
            r.lot_no === m.lot_no ? { ...r, pieces: Math.max(0, r.pieces + m.qty) } : r,
          );
        }
        return { ...prev, stockMoves: [move, ...prev.stockMoves], chemicals, rawSkins };
      });
    },

    addChemicalLot: (lot) =>
      update((prev) => ({
        ...prev,
        chemicals: [...prev.chemicals, { ...lot, id: `c-${Date.now()}` }],
      })),

    addRawSkinLot: (lot) =>
      update((prev) => ({
        ...prev,
        rawSkins: [...prev.rawSkins, { ...lot, id: `r-${Date.now()}` }],
      })),

    addQCEntry: (q) => update((prev) => ({ ...prev, qcEntries: [q, ...prev.qcEntries] })),

    addESGEntry: (e) => update((prev) => ({ ...prev, esgEntries: [...prev.esgEntries, e] })),

    addRecipe: (r) =>
      update((prev) => ({
        ...prev,
        recipes: [...prev.recipes, { ...r, id: `r-${Date.now()}` }],
      })),

    gradePiece: (id, grade, sqft, thickness_mm, defect) =>
      update((prev) => ({
        ...prev,
        pieces: prev.pieces.map((p) =>
          p.id === id ? { ...p, grade, sqft, thickness_mm, defect: defect || null } : p,
        ),
      })),

    resetDB: () => {
      const fresh = seedDB();
      saveDB(fresh);
      setDB(fresh);
    },
  };

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { ORDER_NEXT_STATUS };
