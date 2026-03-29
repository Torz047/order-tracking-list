export function uid() {
  return "_" + Math.random().toString(36).slice(2, 10);
}

export function d(n = 0) {
  const dt = new Date();
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}

export function getAccounts() {
  let accounts = JSON.parse(localStorage.getItem("ap_accounts") || "null");
  if (!accounts) {
    accounts = [
      { id: uid(), username: "admin", password: "admin123", role: "Admin" },
      { id: uid(), username: "planner1", password: "plan123", role: "Planner" },
      { id: uid(), username: "logistics1", password: "logi123", role: "Logistics" },
      { id: uid(), username: "inventory1", password: "inv123", role: "Inventory" },
    ];
    localStorage.setItem("ap_accounts", JSON.stringify(accounts));
  }
  return accounts;
}

export function saveAccounts(accounts) {
  localStorage.setItem("ap_accounts", JSON.stringify(accounts));
}

export function getOrders() {
  let orders = JSON.parse(localStorage.getItem("ap_orders") || "null");
  if (!orders || !orders.length) {
    orders = [
      { id: uid(), apo: "APO-2024-001", cpo: "CPO-0045", prd: d(-10), prs: "PRS-011", qty: 50, type: "New", classification: "Pin", partNumber: "PN-88340-A", drawingNumber: "DWG-2024-001", revision: "Rev A", partsIssuanceDate: d(-8), partsETA: d(2), cpoRDD: d(7), ardd: d(5), etd: d(4), awb: "AWB-001-2024", shipmentInvoice: "INV-0045" },
      { id: uid(), apo: "APO-2024-002", cpo: "CPO-0046", prd: d(-5), prs: "PRS-012", qty: 12, type: "Repeat", classification: "Assy", partNumber: "PN-55120-B", drawingNumber: "DWG-2024-002", revision: "Rev B", partsIssuanceDate: d(-3), partsETA: d(0), cpoRDD: d(3), ardd: d(2), etd: d(1), awb: "", shipmentInvoice: "" },
      { id: uid(), apo: "APO-2024-003", cpo: "CPO-0047", prd: d(-2), prs: "", qty: 200, type: "New", classification: "Part", partNumber: "PN-11020-C", drawingNumber: "DWG-2024-003", revision: "Rev C", partsIssuanceDate: "", partsETA: d(5), cpoRDD: d(10), ardd: d(8), etd: d(9), awb: "", shipmentInvoice: "" },
      { id: uid(), apo: "APO-2024-004", cpo: "CPO-0048", prd: d(-15), prs: "PRS-013", qty: 8, type: "Return", classification: "Rework", partNumber: "PN-77880-A", drawingNumber: "DWG-2023-040", revision: "Rev A", partsIssuanceDate: d(-12), partsETA: d(-1), cpoRDD: d(-3), ardd: d(-4), etd: d(-2), awb: "AWB-002-2024", shipmentInvoice: "INV-0048" },
      { id: uid(), apo: "APO-2024-005", cpo: "CPO-0049", prd: d(-1), prs: "PRS-014", qty: 3, type: "New", classification: "Jig", partNumber: "JIG-00120", drawingNumber: "DWG-2024-010", revision: "Rev D", partsIssuanceDate: "", partsETA: d(8), cpoRDD: d(14), ardd: d(12), etd: d(11), awb: "", shipmentInvoice: "" },
    ];
    localStorage.setItem("ap_orders", JSON.stringify(orders));
  }
  return orders;
}

export function saveOrders(orders) {
  localStorage.setItem("ap_orders", JSON.stringify(orders));
}

export const ALL_FIELDS = [
  "apo","cpo","prd","prs","qty","type","classification",
  "partNumber","drawingNumber","revision","partsIssuanceDate",
  "partsETA","cpoRDD","ardd","etd","awb","shipmentInvoice",
];

export function editableFields(role) {
  if (role === "Admin" || role === "Planner") return new Set(ALL_FIELDS);
  if (role === "Logistics") return new Set(["awb", "shipmentInvoice"]);
  if (role === "Inventory") return new Set(["partsIssuanceDate"]);
  return new Set();
}

export function roleColor(r) {
  return { Admin: "#f59e0b", Planner: "#00d4aa", Logistics: "#0099ff", Inventory: "#a855f7" }[r] || "#888";
}
