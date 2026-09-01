/**
 * Accounting contract:
 * - balance is the current spendable balance. Deposits and realized rewards
 *   increase it; purchases and withdrawal requests decrease it.
 * - totalEarnings is a lifetime gross counter for earned rewards. It is not a
 *   spendable balance and is never reduced by purchases or withdrawals.
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