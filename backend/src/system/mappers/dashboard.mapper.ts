import type {
    DashboardOverviewRow,
    MonthlyCollectionRow,
    ClassCollectionRow,
    FinanceSummaryRow,
    RecentPaymentRow
} from "../../finance/services/dashboard.service";

export interface DashboardOverviewResponse {
    totalStudents: number;
    totalCollected: number;
    totalPending: number;
    totalAdjustments: number;
    totalExpenses: number;
    netBalance: number;
}

export interface MonthlyCollectionResponse {
    month: string;
    total: number;
}

export interface ClassCollectionResponse {
    classId: string;
    className: string;
    collected: number;
}

export interface FinanceSummaryResponse {
    income: number;
    expenses: number;
    balance: number;
}

export interface RecentPaymentResponse {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    mode: string;
    date: string;
}

export function mapDashboardOverview(row: DashboardOverviewRow): DashboardOverviewResponse {
    return {
        totalStudents: parseInt(row.total_students, 10),
        totalCollected: parseFloat(row.total_collected),
        totalPending: parseFloat(row.total_pending),
        totalAdjustments: parseFloat(row.total_adjustments),
        totalExpenses: parseFloat(row.total_expenses),
        netBalance: parseFloat(row.net_balance)
    };
}

export function mapMonthlyCollection(row: MonthlyCollectionRow): MonthlyCollectionResponse {
    return {
        month: row.month,
        total: parseFloat(row.amount)
    };
}

export function mapFinanceSummary(row: FinanceSummaryRow): FinanceSummaryResponse {
    return {
        income: parseFloat(row.income),
        expenses: parseFloat(row.expenses),
        balance: parseFloat(row.balance)
    };
}

export function mapRecentPayment(row: RecentPaymentRow, studentName: string): RecentPaymentResponse {
    return {
        id: row.id,
        studentId: row.student_id,
        studentName,
        amount: parseFloat(row.amount),
        mode: row.mode,
        date: row.created_at.toISOString()
    };
}
