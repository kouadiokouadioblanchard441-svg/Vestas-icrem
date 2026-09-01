import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAvailableBalance,
  calculateReconciliationDifference,
} from "./accounting";

test("reconciles deposit, purchase, daily gain, commission, and withdrawal", () => {
  const afterDeposit = calculateAvailableBalance({ approvedDeposits: 100 });
  assert.equal(afterDeposit, 100);

  const afterPurchase = calculateAvailableBalance({
    approvedDeposits: 100,
    purchases: 30,
  });
  assert.equal(afterPurchase, 70);

  const afterDailyGain = calculateAvailableBalance({
    approvedDeposits: 100,
    otherCredits: 5,
    purchases: 30,
  });
  assert.equal(afterDailyGain, 75);

  const afterCommission = calculateAvailableBalance({
    approvedDeposits: 100,
    otherCredits: 7.5,
    purchases: 30,
  });
  assert.equal(afterCommission, 77.5);

  const afterWithdrawal = calculateAvailableBalance({
    approvedDeposits: 100,
    otherCredits: 7.5,
    purchases: 30,
    activeWithdrawals: 20,
  });
  assert.equal(afterWithdrawal, 57.5);
});

test("a rejected withdrawal is restored to the available balance", () => {
  const expected = calculateAvailableBalance({
    approvedDeposits: 100,
    otherCredits: 7.5,
    purchases: 30,
    activeWithdrawals: 20,
    refunds: 20,
  });

  assert.equal(expected, 77.5);
  assert.equal(calculateReconciliationDifference(77.5, expected), 0);
  assert.equal(calculateReconciliationDifference(77, expected), -0.5);
});