export type LedgerAdjustmentType =
  | 'DISCOUNT'
  | 'CONCESSION'
  | 'WAIVER'
  | 'EXTRA'
  | 'LATE_FEE'

export type LedgerAdjustment = {
  id: string
  ledgerId: string
  type: LedgerAdjustmentType
  amount: number        // can be negative
  reason: string
  approvedBy: string
  createdAt: string
}
