// Mock data for the Leather ERP prototype.
// All numbers are illustrative — no real factory data.

export type StageCode =
  | "soak"
  | "lime"
  | "flesh"
  | "delime"
  | "pickle"
  | "tan"
  | "sammy"
  | "split"
  | "shave"
  | "retan"
  | "dye"
  | "dry"
  | "stake"
  | "finish"
  | "qc"
  | "pack";

export const STAGES: { code: StageCode; name: string; wet: boolean; piece: boolean }[] = [
  { code: "soak", name: "Soaking", wet: true, piece: false },
  { code: "lime", name: "Liming", wet: true, piece: false },
  { code: "flesh", name: "Fleshing", wet: true, piece: false },
  { code: "delime", name: "Deliming + Bating", wet: true, piece: false },
  { code: "pickle", name: "Pickling", wet: true, piece: false },
  { code: "tan", name: "Tanning", wet: true, piece: false },
  { code: "sammy", name: "Sammying", wet: true, piece: false },
  { code: "split", name: "Splitting", wet: false, piece: true },
  { code: "shave", name: "Shaving", wet: false, piece: true },
  { code: "retan", name: "Retanning", wet: true, piece: true },
  { code: "dye", name: "Dyeing + Fatliquor", wet: true, piece: true },
  { code: "dry", name: "Drying", wet: false, piece: true },
  { code: "stake", name: "Staking + Buffing", wet: false, piece: true },
  { code: "finish", name: "Finishing", wet: false, piece: true },
  { code: "qc", name: "QC + Grading", wet: false, piece: true },
  { code: "pack", name: "Pack", wet: false, piece: true },
];

export type OrderStatus = "draft" | "confirmed" | "in_production" | "ready" | "dispatched";
export interface SalesOrder {
  id: string;
  order_no: string;
  customer: string;
  country: string;
  article: string;
  qty_pcs: number;
  due_date: string;
  status: OrderStatus;
  value_bdt: number;
}

export const ORDERS: SalesOrder[] = [
  {
    id: "o1",
    order_no: "SO-2025-0142",
    customer: "Milano Pelle SRL",
    country: "Italy",
    article: "COW-CR-1.2-BLK",
    qty_pcs: 1200,
    due_date: "2026-06-12",
    status: "in_production",
    value_bdt: 18_400_000,
  },
  {
    id: "o2",
    order_no: "SO-2025-0143",
    customer: "Tokyo Hide Co.",
    country: "Japan",
    article: "GOAT-FN-0.8-TAN",
    qty_pcs: 3500,
    due_date: "2026-05-28",
    status: "in_production",
    value_bdt: 9_870_000,
  },
  {
    id: "o3",
    order_no: "SO-2025-0144",
    customer: "Bavaria Leder GmbH",
    country: "Germany",
    article: "COW-WB-2.0-NAT",
    qty_pcs: 800,
    due_date: "2026-05-20",
    status: "ready",
    value_bdt: 5_120_000,
  },
  {
    id: "o4",
    order_no: "SO-2025-0145",
    customer: "Sao Paulo Couros",
    country: "Brazil",
    article: "COW-CR-1.4-BRN",
    qty_pcs: 2100,
    due_date: "2026-07-02",
    status: "confirmed",
    value_bdt: 14_650_000,
  },
  {
    id: "o5",
    order_no: "SO-2025-0146",
    customer: "Milano Pelle SRL",
    country: "Italy",
    article: "GOAT-FN-0.7-BLK",
    qty_pcs: 4800,
    due_date: "2026-06-30",
    status: "draft",
    value_bdt: 13_200_000,
  },
  {
    id: "o6",
    order_no: "SO-2025-0140",
    customer: "Istanbul Deri",
    country: "Turkey",
    article: "COW-FN-1.1-OXB",
    qty_pcs: 950,
    due_date: "2026-05-09",
    status: "dispatched",
    value_bdt: 7_410_000,
  },
];

export type BatchStatus =
  | "queued"
  | "soak"
  | "lime"
  | "tan"
  | "sammy"
  | "shave"
  | "dye"
  | "finish"
  | "qc"
  | "done";
export type ExitPoint = "wet_blue" | "crust" | "finished";
export interface Batch {
  id: string;
  batch_no: string;
  order_no: string;
  article: string;
  species: "cow" | "goat";
  raw_kg: number;
  pieces: number;
  current_stage: StageCode;
  status: BatchStatus;
  exit: ExitPoint;
  drum: string;
  started: string;
  recipe: string;
}

export const BATCHES: Batch[] = [
  {
    id: "b1",
    batch_no: "B-26041",
    order_no: "SO-2025-0142",
    article: "COW-CR-1.2-BLK",
    species: "cow",
    raw_kg: 2400,
    pieces: 600,
    current_stage: "dye",
    status: "dye",
    exit: "crust",
    drum: "D-04",
    started: "2026-05-02",
    recipe: "R-COW-CR-v3",
  },
  {
    id: "b2",
    batch_no: "B-26042",
    order_no: "SO-2025-0142",
    article: "COW-CR-1.2-BLK",
    species: "cow",
    raw_kg: 2380,
    pieces: 600,
    current_stage: "tan",
    status: "tan",
    exit: "crust",
    drum: "D-02",
    started: "2026-05-04",
    recipe: "R-COW-CR-v3",
  },
  {
    id: "b3",
    batch_no: "B-26043",
    order_no: "SO-2025-0143",
    article: "GOAT-FN-0.8-TAN",
    species: "goat",
    raw_kg: 720,
    pieces: 1750,
    current_stage: "finish",
    status: "finish",
    exit: "finished",
    drum: "D-07",
    started: "2026-04-28",
    recipe: "R-GOAT-FN-v2",
  },
  {
    id: "b4",
    batch_no: "B-26044",
    order_no: "SO-2025-0143",
    article: "GOAT-FN-0.8-TAN",
    species: "goat",
    raw_kg: 740,
    pieces: 1750,
    current_stage: "stake",
    status: "finish",
    exit: "finished",
    drum: "D-08",
    started: "2026-04-30",
    recipe: "R-GOAT-FN-v2",
  },
  {
    id: "b5",
    batch_no: "B-26045",
    order_no: "SO-2025-0144",
    article: "COW-WB-2.0-NAT",
    species: "cow",
    raw_kg: 3200,
    pieces: 800,
    current_stage: "qc",
    status: "qc",
    exit: "wet_blue",
    drum: "D-01",
    started: "2026-04-22",
    recipe: "R-COW-WB-v1",
  },
  {
    id: "b6",
    batch_no: "B-26046",
    order_no: "SO-2025-0145",
    article: "COW-CR-1.4-BRN",
    species: "cow",
    raw_kg: 2200,
    pieces: 550,
    current_stage: "soak",
    status: "soak",
    exit: "crust",
    drum: "D-03",
    started: "2026-05-07",
    recipe: "R-COW-CR-v3",
  },
  {
    id: "b7",
    batch_no: "B-26047",
    order_no: "SO-2025-0145",
    article: "COW-CR-1.4-BRN",
    species: "cow",
    raw_kg: 2180,
    pieces: 545,
    current_stage: "soak",
    status: "queued",
    exit: "crust",
    drum: "D-05",
    started: "2026-05-08",
    recipe: "R-COW-CR-v3",
  },
];

export interface PieceRow {
  id: string;
  piece_no: string;
  batch_no: string;
  article: string;
  layer: "grain" | "split" | "full";
  sqft: number;
  thickness_mm: number;
  grade: "A" | "B" | "C" | "REJ";
  stage: StageCode;
  defect: string | null;
}

const grades: PieceRow["grade"][] = ["A", "A", "A", "B", "B", "C", "REJ"];
const defects = [null, null, null, "scratch", "stain", "vein mark", "pinhole"];
export const PIECES: PieceRow[] = Array.from({ length: 28 }, (_, i) => {
  const batch = BATCHES[i % BATCHES.length];
  return {
    id: `p${i}`,
    piece_no: `${batch.batch_no}-${String(i + 1).padStart(4, "0")}`,
    batch_no: batch.batch_no,
    article: batch.article,
    layer: i % 5 === 0 ? "split" : i % 7 === 0 ? "grain" : "full",
    sqft: +(18 + Math.random() * 16).toFixed(1),
    thickness_mm: +(0.7 + Math.random() * 1.6).toFixed(2),
    grade: grades[i % grades.length],
    stage: batch.current_stage,
    defect: defects[i % defects.length],
  };
});

export interface ChemicalLot {
  id: string;
  chemical: string;
  type: string;
  lot_no: string;
  supplier: string;
  qty_kg: number;
  reorder_kg: number;
  unit_cost_bdt: number;
  received: string;
}
export const CHEMICALS: ChemicalLot[] = [
  {
    id: "c1",
    chemical: "Chrome Sulphate 33%",
    type: "Tanning",
    lot_no: "CS-2604-A",
    supplier: "Stahl Asia",
    qty_kg: 4200,
    reorder_kg: 1500,
    unit_cost_bdt: 185,
    received: "2026-04-10",
  },
  {
    id: "c2",
    chemical: "Sodium Sulphide",
    type: "Liming",
    lot_no: "SS-2603-B",
    supplier: "BASF BD",
    qty_kg: 980,
    reorder_kg: 1200,
    unit_cost_bdt: 95,
    received: "2026-03-22",
  },
  {
    id: "c3",
    chemical: "Hydrated Lime",
    type: "Liming",
    lot_no: "HL-2604-C",
    supplier: "Local Vendor",
    qty_kg: 6400,
    reorder_kg: 2000,
    unit_cost_bdt: 32,
    received: "2026-04-18",
  },
  {
    id: "c4",
    chemical: "Sulphuric Acid 98%",
    type: "Pickling",
    lot_no: "SA-2604-A",
    supplier: "TIC Chemicals",
    qty_kg: 2100,
    reorder_kg: 800,
    unit_cost_bdt: 78,
    received: "2026-04-05",
  },
  {
    id: "c5",
    chemical: "Anionic Fatliquor",
    type: "Fatliquoring",
    lot_no: "FL-2604-D",
    supplier: "Stahl Asia",
    qty_kg: 1450,
    reorder_kg: 1000,
    unit_cost_bdt: 320,
    received: "2026-04-12",
  },
  {
    id: "c6",
    chemical: "Acid Black Dye",
    type: "Dyeing",
    lot_no: "AB-2604-E",
    supplier: "Clariant",
    qty_kg: 320,
    reorder_kg: 400,
    unit_cost_bdt: 980,
    received: "2026-04-15",
  },
  {
    id: "c7",
    chemical: "Syntan Replacement",
    type: "Retanning",
    lot_no: "ST-2604-F",
    supplier: "TFL",
    qty_kg: 1800,
    reorder_kg: 1500,
    unit_cost_bdt: 245,
    received: "2026-04-08",
  },
];

export interface RawSkinLot {
  id: string;
  lot_no: string;
  species: "cow" | "goat";
  origin: string;
  pieces: number;
  total_kg: number;
  received: string;
  unit_cost_bdt: number;
}
export const RAW_SKINS: RawSkinLot[] = [
  {
    id: "r1",
    lot_no: "RAW-2604-001",
    species: "cow",
    origin: "Sirajganj",
    pieces: 850,
    total_kg: 3400,
    received: "2026-04-22",
    unit_cost_bdt: 580,
  },
  {
    id: "r2",
    lot_no: "RAW-2604-002",
    species: "cow",
    origin: "Pabna",
    pieces: 620,
    total_kg: 2480,
    received: "2026-04-25",
    unit_cost_bdt: 595,
  },
  {
    id: "r3",
    lot_no: "RAW-2604-003",
    species: "goat",
    origin: "Rajshahi",
    pieces: 2400,
    total_kg: 960,
    received: "2026-04-28",
    unit_cost_bdt: 220,
  },
  {
    id: "r4",
    lot_no: "RAW-2605-001",
    species: "cow",
    origin: "Sirajganj",
    pieces: 720,
    total_kg: 2880,
    received: "2026-05-04",
    unit_cost_bdt: 610,
  },
];

export interface RecipeRow {
  id: string;
  code: string;
  article: string;
  species: "cow" | "goat";
  version: number;
  stages: number;
  chemicals: number;
  active: boolean;
}
export const RECIPES: RecipeRow[] = [
  {
    id: "r1",
    code: "R-COW-CR-v3",
    article: "COW-CR-1.2-BLK",
    species: "cow",
    version: 3,
    stages: 11,
    chemicals: 24,
    active: true,
  },
  {
    id: "r2",
    code: "R-COW-CR-v2",
    article: "COW-CR-1.4-BRN",
    species: "cow",
    version: 2,
    stages: 11,
    chemicals: 22,
    active: true,
  },
  {
    id: "r3",
    code: "R-COW-WB-v1",
    article: "COW-WB-2.0-NAT",
    species: "cow",
    version: 1,
    stages: 7,
    chemicals: 14,
    active: true,
  },
  {
    id: "r4",
    code: "R-GOAT-FN-v2",
    article: "GOAT-FN-0.8-TAN",
    species: "goat",
    version: 2,
    stages: 14,
    chemicals: 28,
    active: true,
  },
  {
    id: "r5",
    code: "R-COW-FN-v4",
    article: "COW-FN-1.1-OXB",
    species: "cow",
    version: 4,
    stages: 14,
    chemicals: 30,
    active: true,
  },
];

export interface QCRow {
  batch_no: string;
  article: string;
  inspected: number;
  grade_a: number;
  grade_b: number;
  grade_c: number;
  rejects: number;
  yield_pct: number;
  date: string;
}
export const QC: QCRow[] = [
  {
    batch_no: "B-26043",
    article: "GOAT-FN-0.8-TAN",
    inspected: 1750,
    grade_a: 1180,
    grade_b: 380,
    grade_c: 140,
    rejects: 50,
    yield_pct: 97.1,
    date: "2026-05-06",
  },
  {
    batch_no: "B-26045",
    article: "COW-WB-2.0-NAT",
    inspected: 800,
    grade_a: 510,
    grade_b: 200,
    grade_c: 70,
    rejects: 20,
    yield_pct: 97.5,
    date: "2026-05-05",
  },
  {
    batch_no: "B-26041",
    article: "COW-CR-1.2-BLK",
    inspected: 600,
    grade_a: 410,
    grade_b: 130,
    grade_c: 45,
    rejects: 15,
    yield_pct: 97.5,
    date: "2026-05-07",
  },
  {
    batch_no: "B-26039",
    article: "COW-FN-1.1-OXB",
    inspected: 950,
    grade_a: 690,
    grade_b: 180,
    grade_c: 60,
    rejects: 20,
    yield_pct: 97.9,
    date: "2026-05-01",
  },
];

export interface ESGRow {
  date: string;
  water_m3: number;
  chrome_kg: number;
  sulphide_kg: number;
  solid_waste_kg: number;
  cod_mg_l: number;
}
export const ESG: ESGRow[] = [
  {
    date: "Apr 28",
    water_m3: 142,
    chrome_kg: 38,
    sulphide_kg: 22,
    solid_waste_kg: 410,
    cod_mg_l: 2400,
  },
  {
    date: "Apr 29",
    water_m3: 156,
    chrome_kg: 41,
    sulphide_kg: 24,
    solid_waste_kg: 445,
    cod_mg_l: 2510,
  },
  {
    date: "Apr 30",
    water_m3: 138,
    chrome_kg: 36,
    sulphide_kg: 20,
    solid_waste_kg: 390,
    cod_mg_l: 2280,
  },
  {
    date: "May 01",
    water_m3: 162,
    chrome_kg: 44,
    sulphide_kg: 26,
    solid_waste_kg: 470,
    cod_mg_l: 2620,
  },
  {
    date: "May 02",
    water_m3: 148,
    chrome_kg: 39,
    sulphide_kg: 22,
    solid_waste_kg: 420,
    cod_mg_l: 2390,
  },
  {
    date: "May 03",
    water_m3: 134,
    chrome_kg: 35,
    sulphide_kg: 19,
    solid_waste_kg: 380,
    cod_mg_l: 2210,
  },
  {
    date: "May 04",
    water_m3: 158,
    chrome_kg: 42,
    sulphide_kg: 25,
    solid_waste_kg: 455,
    cod_mg_l: 2540,
  },
  {
    date: "May 05",
    water_m3: 151,
    chrome_kg: 40,
    sulphide_kg: 23,
    solid_waste_kg: 430,
    cod_mg_l: 2460,
  },
  {
    date: "May 06",
    water_m3: 144,
    chrome_kg: 37,
    sulphide_kg: 21,
    solid_waste_kg: 405,
    cod_mg_l: 2330,
  },
  {
    date: "May 07",
    water_m3: 167,
    chrome_kg: 45,
    sulphide_kg: 27,
    solid_waste_kg: 480,
    cod_mg_l: 2680,
  },
];

export interface InventoryPool {
  pool: "Wet-Blue" | "Crust" | "Finished";
  pieces: number;
  sqft: number;
  value_bdt: number;
}
export const INVENTORY_POOLS: InventoryPool[] = [
  { pool: "Wet-Blue", pieces: 1820, sqft: 48_300, value_bdt: 11_592_000 },
  { pool: "Crust", pieces: 2640, sqft: 71_400, value_bdt: 24_276_000 },
  { pool: "Finished", pieces: 4150, sqft: 108_900, value_bdt: 53_361_000 },
];

export const KPI = {
  active_orders: ORDERS.filter((o) => o.status === "in_production" || o.status === "confirmed")
    .length,
  active_batches: BATCHES.filter((b) => b.status !== "done").length,
  pieces_in_wip: 6_240,
  on_time_pct: 92.4,
  finished_sqft: 108_900,
  qc_yield_pct: 97.5,
  water_today: 167,
  chrome_today: 45,
};

export const STAGE_THROUGHPUT = [
  { stage: "Soak", pieces: 1200 },
  { stage: "Lime", pieces: 980 },
  { stage: "Tan", pieces: 1450 },
  { stage: "Shave", pieces: 1100 },
  { stage: "Retan", pieces: 920 },
  { stage: "Dye", pieces: 1320 },
  { stage: "Finish", pieces: 860 },
  { stage: "QC", pieces: 740 },
];

export type StockMoveType = "IN" | "OUT" | "TRANSFER" | "ADJUST";
export interface StockMove {
  id: string;
  ts: string;
  type: StockMoveType;
  item: string;
  item_kind: "raw_skin" | "chemical" | "wet_blue" | "crust" | "finished";
  lot_no: string;
  qty: number;
  unit: "pcs" | "kg" | "sqft";
  from: string;
  to: string;
  ref: string;
  user: string;
}
export const STOCK_MOVES: StockMove[] = [
  {
    id: "m1",
    ts: "2026-05-08 06:42",
    type: "IN",
    item: "Cow raw skin",
    item_kind: "raw_skin",
    lot_no: "RAW-2605-001",
    qty: 720,
    unit: "pcs",
    from: "Sirajganj supplier",
    to: "Raw store · A1",
    ref: "GRN-2605-014",
    user: "rahim.k",
  },
  {
    id: "m2",
    ts: "2026-05-08 07:15",
    type: "OUT",
    item: "Chrome Sulphate 33%",
    item_kind: "chemical",
    lot_no: "CS-2604-A",
    qty: 180,
    unit: "kg",
    from: "Chem store",
    to: "Drum D-04",
    ref: "B-26041",
    user: "shift.A",
  },
  {
    id: "m3",
    ts: "2026-05-08 09:02",
    type: "TRANSFER",
    item: "Wet-blue cow",
    item_kind: "wet_blue",
    lot_no: "B-26045",
    qty: 800,
    unit: "pcs",
    from: "Sammy floor",
    to: "Wet-blue store",
    ref: "B-26045",
    user: "kabir.m",
  },
  {
    id: "m4",
    ts: "2026-05-08 10:48",
    type: "OUT",
    item: "Anionic Fatliquor",
    item_kind: "chemical",
    lot_no: "FL-2604-D",
    qty: 64,
    unit: "kg",
    from: "Chem store",
    to: "Drum D-07",
    ref: "B-26043",
    user: "shift.A",
  },
  {
    id: "m5",
    ts: "2026-05-08 11:30",
    type: "IN",
    item: "Crust leather",
    item_kind: "crust",
    lot_no: "B-26041",
    qty: 410,
    unit: "pcs",
    from: "Dye line",
    to: "Crust store · C2",
    ref: "B-26041",
    user: "shamim.r",
  },
  {
    id: "m6",
    ts: "2026-05-08 13:05",
    type: "ADJUST",
    item: "Sodium Sulphide",
    item_kind: "chemical",
    lot_no: "SS-2603-B",
    qty: -12,
    unit: "kg",
    from: "Chem store",
    to: "Chem store",
    ref: "ADJ-052",
    user: "store.lead",
  },
  {
    id: "m7",
    ts: "2026-05-08 14:22",
    type: "OUT",
    item: "Finished leather",
    item_kind: "finished",
    lot_no: "B-26039",
    qty: 950,
    unit: "pcs",
    from: "Finished store",
    to: "Dispatch · Istanbul Deri",
    ref: "SO-2025-0140",
    user: "warehouse",
  },
  {
    id: "m8",
    ts: "2026-05-08 15:40",
    type: "IN",
    item: "Goat raw skin",
    item_kind: "raw_skin",
    lot_no: "RAW-2604-003",
    qty: 2400,
    unit: "pcs",
    from: "Rajshahi supplier",
    to: "Raw store · A2",
    ref: "GRN-2604-031",
    user: "rahim.k",
  },
];

export const fmtBDT = (n: number) =>
  "৳" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
export const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);
