import { User } from "../models/User";

export const simplifyDebtsLogic = (balances: { [userId: number]: number }, users: User[]) => {
    const creditors: { userId: number; amount: number }[] = [];
    const debtors: { userId: number; amount: number }[] = [];
  
    // Separate users into debtors and creditors based on their balance
    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance > 0) {
        creditors.push({ userId: parseInt(userId), amount: balance });
      } else if (balance < 0) {
        debtors.push({ userId: parseInt(userId), amount: -balance });  // Positive amount owed
      }
    });
  
    // Simplify the debts between debtors and creditors
    const transactions: { fromUserId: number; toUserId: number; amount: number }[] = [];
  
    let creditorIndex = 0;
    let debtorIndex = 0;
  
    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
  
      const minAmount = Math.min(creditor.amount, debtor.amount);
  
      // Record the transaction
      transactions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: minAmount
      });
  
      // Update the amounts
      creditor.amount -= minAmount;
      debtor.amount -= minAmount;
  
      // Move to the next creditor or debtor if their balance is settled
      if (creditor.amount === 0) creditorIndex++;
      if (debtor.amount === 0) debtorIndex++;
    }
  
    return transactions;
  };
  