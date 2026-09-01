/**
 * Accounting contract:
 * - balance contains approved deposits used for purchases. Purchases reduce it,
 *   and historical accounts may have a negative balance representing a debt.
 * - totalEarnings contains withdrawable rewards. Withdrawals reduce it.
 */

export interface BalanceReconciliationInput {
  approvedDeposits?: number;
  otherCredits?: number;
  purchases?: number;
  activeWithdrawals?: number;
  refunds?: number;
}

export function calculateAvailableBalance({
  approvedDeposits = 0,
  otherCredits = 0,
  purchases = 0,
  activeWithdrawals = 0,
  refunds = 0,
}: BalanceReconciliationInput): number {
  return Number((
    approvedDeposits
    + otherCredits
    - purchases
    - activeWithdrawals
    + refunds
  ).toFixed(2));
}

export function calculateReconciliationDifference(
  actualBalance: number,
  expectedBalance: number,
): number {
  return Number((actualBalance - expectedBalance).toFixed(2));
}