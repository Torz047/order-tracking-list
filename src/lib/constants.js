export const ALL_FIELDS = [
  'apo','cpo','prd','prs','qty','type','classification',
  'partNumber','drawingNumber','revision','partsIssuanceDate',
  'partsETA','cpoRDD','ardd','etd','awb','shipmentInvoice',
]

// Map JS camelCase keys → Supabase snake_case columns
export const FIELD_TO_DB = {
  apo:                'apo',
  cpo:                'cpo',
  prd:                'prd',
  prs:                'prs',
  qty:                'qty',
  type:               'type',
  classification:     'classification',
  partNumber:         'part_number',
  drawingNumber:      'drawing_number',
  revision:           'revision',
  partsIssuanceDate:  'parts_issuance_date',
  partsETA:           'parts_eta',
  cpoRDD:             'cpo_rdd',
  ardd:               'ardd',
  etd:                'etd',
  awb:                'awb',
  shipmentInvoice:    'shipment_invoice',
}

export const DB_TO_FIELD = Object.fromEntries(
  Object.entries(FIELD_TO_DB).map(([k, v]) => [v, k])
)

export const ROLE_COLORS = {
  Admin:     '#f59e0b',
  Planner:   '#00d4aa',
  Logistics: '#0099ff',
  Inventory: '#a855f7',
}

export const TYPE_MAP  = { New: 'new', Repeat: 'repeat', Return: 'return' }
export const CLASS_MAP = { Pin:'pin', Assy:'assy', Rework:'rework', Jig:'jig', Device:'device', Part:'part' }

export function editableFields(role) {
  if (role === 'Admin' || role === 'Planner') return new Set(ALL_FIELDS)
  if (role === 'Logistics')  return new Set(['awb','shipmentInvoice'])
  if (role === 'Inventory')  return new Set(['partsIssuanceDate'])
  return new Set()
}

export function toDbRow(data) {
  const row = {}
  for (const [k, v] of Object.entries(data)) {
    const col = FIELD_TO_DB[k] || k
    row[col] = v === '' ? null : v
  }
  return row
}

export function fromDbRow(row) {
  const obj = { id: row.id }
  for (const [col, val] of Object.entries(row)) {
    const key = DB_TO_FIELD[col] || col
    obj[key] = val ?? ''
  }
  return obj
}
