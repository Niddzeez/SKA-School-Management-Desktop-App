export type FeeComponentSnapshot = {
  name: string
  amount: number
}

export type StudentFeeLedger = {
  id: string
  studentId: string        // mongo student id
  classId: string          // mongo class id
  academicYear: string     // '2025-26'
  baseComponents: FeeComponentSnapshot[]
  createdAt: string
}
