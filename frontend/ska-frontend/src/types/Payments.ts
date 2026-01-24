export type PaymentMode =
  | 'CASH'
  | 'UPI'
  | 'BANK'
  | 'CARD'
  | 'CHEQUE'

export type Payment = {
  id: string
  ledgerId: string
  studentId: string
  amount: number
  mode: PaymentMode
  reference?: string
  collectedBy: string
  createdAt: string
}
