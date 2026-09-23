import { Transaction, Budget, SavingsGoal, SmartInsight } from '../types/finance';
import { formatINR } from './currencyFormatter';

export function getPreviousMonthPeriod(period: string): string {
  const [yearStr, monthStr] = period.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(month - 1).padStart(2, '0')}`;
}

/**
 * Deterministic rule-based smart financial insights engine
 */
export function generateSmartInsights(params: {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  currentPeriod: string; // YYYY-MM
  todayDate?: Date;
}): SmartInsight[] {
  const {
    transactions,
    budgets,
    goals,
    currentPeriod,
    todayDate = new Date(),
  } = params;

  const insights: SmartInsight[] = [];
  const prevPeriod = getPreviousMonthPeriod(currentPeriod);

  // Group transactions for current and previous period
  const currentMonthExpenses = transactions.filter(
    (t) => t.date.startsWith(currentPeriod) && t.type === 'expense'
  );
  const prevMonthExpenses = transactions.filter(
    (t) => t.date.startsWith(prevPeriod) && t.type === 'expense'
  );
  const currentMonthIncome = transactions
    .filter((t) => t.date.startsWith(currentPeriod) && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCurrentExpense = currentMonthExpenses.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // 1. Month-over-Month Category Drift
  const currentCategorySpend: Record<string, number> = {};
  currentMonthExpenses.forEach((t) => {
    currentCategorySpend[t.category] =
      (currentCategorySpend[t.category] || 0) + t.amount;
  });

  const prevCategorySpend: Record<string, number> = {};
  prevMonthExpenses.forEach((t) => {
    prevCategorySpend[t.category] =
      (prevCategorySpend[t.category] || 0) + t.amount;
  });

  Object.entries(currentCategorySpend).forEach(([category, currentSpend]) => {
    const prevSpend = prevCategorySpend[category] || 0;
    if (prevSpend > 500 && currentSpend > prevSpend) {
      const percentageIncrease = Math.round(
        ((currentSpend - prevSpend) / prevSpend) * 100
      );
      if (percentageIncrease >= 15) {
        insights.push({
          id: `drift-${category}-${currentPeriod}`,
          type: percentageIncrease > 35 ? 'alert' : 'warning',
          title: `${category} Spending Surge`,
          description: `Your ${category.toLowerCase()} spending is ${percentageIncrease}% higher than last month.`,
          calculationDetail: `Last month (${prevPeriod}) you spent ${formatINR(
            prevSpend
          )}, compared to ${formatINR(
            currentSpend
          )} this month (+${formatINR(
            currentSpend - prevSpend
          )}, an increase of ${percentageIncrease}%).`,
          actionableTip: `Review recent ${category.toLowerCase()} purchases to see if unexpected or one-off items contributed to this rise.`,
          category: category as any,
          metricValue: `+${percentageIncrease}%`,
          urgency: percentageIncrease > 40 ? 'high' : 'medium',
        });
      }
    }
  });

  // 2. Burn-Rate & Budget Exhaustion Predictor
  const currentDay = Math.max(1, todayDate.getDate());
  const year = parseInt(currentPeriod.split('-')[0], 10);
  const month = parseInt(currentPeriod.split('-')[1], 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  budgets.forEach((b) => {
    const spent = currentCategorySpend[b.category] || 0;
    const remaining = b.monthlyLimit - spent;
    const burnRatePerDay = spent / currentDay;
    const projectedTotal = burnRatePerDay * daysInMonth;

    if (spent >= b.monthlyLimit) {
      insights.push({
        id: `budget-exceeded-${b.category}`,
        type: 'alert',
        title: `${b.category} Budget Exceeded`,
        description: `You have crossed your ${b.category} budget of ${formatINR(
          b.monthlyLimit
        )} by ${formatINR(spent - b.monthlyLimit)}.`,
        calculationDetail: `Total spent: ${formatINR(spent)} vs limit: ${formatINR(
          b.monthlyLimit
        )}. Over budget by ${formatINR(spent - b.monthlyLimit)} with ${
          daysInMonth - currentDay
        } days remaining in the month.`,
        actionableTip: `Pause or reallocate discretionary spending from other categories to balance this overshoot.`,
        category: b.category,
        metricValue: `${Math.round((spent / b.monthlyLimit) * 100)}%`,
        urgency: 'high',
      });
    } else if (remaining > 0 && burnRatePerDay > 0 && projectedTotal > b.monthlyLimit) {
      const daysUntilExhaustion = Math.max(
        1,
        Math.floor(remaining / burnRatePerDay)
      );

      if (daysUntilExhaustion <= daysInMonth - currentDay) {
        insights.push({
          id: `budget-burn-${b.category}`,
          type: 'warning',
          title: `${b.category} Budget Alert`,
          description: `You may exceed your ${b.category} budget in ${daysUntilExhaustion} days at your current pace.`,
          calculationDetail: `You have spent ${formatINR(
            spent
          )} in ${currentDay} days (avg ${formatINR(
            burnRatePerDay
          )}/day). At this pace, your remaining ${formatINR(
            remaining
          )} buffer will run out in ${daysUntilExhaustion} days, reaching ~${formatINR(
            projectedTotal
          )} by month end.`,
          actionableTip: `Limit daily ${b.category.toLowerCase()} spending to ${formatINR(
            remaining / Math.max(1, daysInMonth - currentDay)
          )}/day to stay within limit.`,
          category: b.category,
          metricValue: `${daysUntilExhaustion} days`,
          urgency: daysUntilExhaustion <= 5 ? 'high' : 'medium',
        });
      }
    }
  });

  // 3. Top Spending Category
  const sortedCategories = Object.entries(currentCategorySpend).sort(
    (a, b) => b[1] - a[1]
  );
  if (sortedCategories.length > 0 && totalCurrentExpense > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const percentageOfTotal = Math.round((topAmount / totalCurrentExpense) * 100);

    if (percentageOfTotal >= 25) {
      insights.push({
        id: `top-spend-${topCategory}`,
        type: 'info',
        title: `Primary Expense Driver: ${topCategory}`,
        description: `${topCategory} accounts for ${percentageOfTotal}% of your total spending this month (${formatINR(
          topAmount
        )}).`,
        calculationDetail: `Formula: (${formatINR(topAmount)} / ${formatINR(
          totalCurrentExpense
        )}) * 100 = ${percentageOfTotal}%.`,
        actionableTip: `Because ${topCategory.toLowerCase()} is your largest outgoing, even small optimizations here will deliver the largest savings.`,
        category: topCategory as any,
        metricValue: `${percentageOfTotal}%`,
        urgency: 'low',
      });
    }
  }

  // 4. Repeated / Subscription Pattern Detection
  const recurringMap: Record<
    string,
    { count: number; amounts: number[]; total: number; latestDate: string }
  > = {};

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      const key = `${t.description.toLowerCase().trim()}-${t.amount}`;
      if (!recurringMap[key]) {
        recurringMap[key] = {
          count: 0,
          amounts: [],
          total: 0,
          latestDate: t.date,
        };
      }
      recurringMap[key].count += 1;
      recurringMap[key].amounts.push(t.amount);
      recurringMap[key].total += t.amount;
      if (t.date > recurringMap[key].latestDate) {
        recurringMap[key].latestDate = t.date;
      }
    }
  });

  const subscriptionCandidates = Object.entries(recurringMap).filter(
    ([_, data]) => data.count >= 2
  );

  if (subscriptionCandidates.length > 0) {
    const totalMonthlyRecurring = subscriptionCandidates.reduce(
      (sum, [_, data]) => sum + data.amounts[0],
      0
    );

    const subscriptionNames = subscriptionCandidates
      .map(([key]) => {
        const name = key.split('-')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
      })
      .slice(0, 4)
      .join(', ');

    insights.push({
      id: `recurring-subscriptions-${currentPeriod}`,
      type: 'info',
      title: 'Recurring Subscriptions Detected',
      description: `You have ~${formatINR(
        totalMonthlyRecurring
      )} in detected recurring payments (${subscriptionNames}${
        subscriptionCandidates.length > 4 ? '...' : ''
      }).`,
      calculationDetail: `Detected ${subscriptionCandidates.length} recurring charges appearing with identical amounts across billing cycles totaling ${formatINR(
        totalMonthlyRecurring
      )}/month.`,
      actionableTip: `Audit your active subscriptions to cancel any streaming, gym, or software plans you no longer actively use.`,
      metricValue: formatINR(totalMonthlyRecurring),
      urgency: 'low',
    });
  }

  // 5. Savings Goal Feasibility & Actionable Trade-Off Recommendations
  const netMonthlyCashflow = currentMonthIncome - totalCurrentExpense;

  goals.forEach((g) => {
    const remainingToSave = Math.max(0, g.targetAmount - g.currentAmount);
    if (remainingToSave > 0) {
      const deadlineDate = new Date(g.deadline);
      const diffTime = deadlineDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const monthsRemaining = Math.max(1, Math.ceil(diffDays / 30.4));
      const requiredMonthly = Math.ceil(remainingToSave / monthsRemaining);

      if (netMonthlyCashflow < requiredMonthly) {
        // Find discretionary categories to recommend cuts
        const entertainmentSpend = currentCategorySpend['Entertainment'] || 0;
        const shoppingSpend = currentCategorySpend['Shopping'] || 0;
        const diningSpend = currentCategorySpend['Food'] || 0;

        let recommendationCategory = '';
        let suggestedCut = 500;

        if (entertainmentSpend >= 1500) {
          recommendationCategory = 'Entertainment';
          suggestedCut = Math.min(
            1500,
            Math.round((entertainmentSpend * 0.3) / 100) * 100
          );
        } else if (shoppingSpend >= 2000) {
          recommendationCategory = 'Shopping';
          suggestedCut = Math.min(
            2000,
            Math.round((shoppingSpend * 0.25) / 100) * 100
          );
        } else if (diningSpend >= 3000) {
          recommendationCategory = 'Food & Dining';
          suggestedCut = Math.min(
            1000,
            Math.round((diningSpend * 0.2) / 100) * 100
          );
        }

        if (recommendationCategory && suggestedCut > 0) {
          insights.push({
            id: `goal-feasibility-${g.id}`,
            type: 'tip',
            title: `Goal Boost: ${g.name}`,
            description: `Reducing ${recommendationCategory} spending by ${formatINR(
              suggestedCut
            )} per month could help meet your ${g.name} goal on time.`,
            calculationDetail: `Target: ${formatINR(
              g.targetAmount
            )}. Remaining: ${formatINR(
              remainingToSave
            )} across ${monthsRemaining} month(s). Required savings rate: ${formatINR(
              requiredMonthly
            )}/mo. Your current net monthly cashflow is ${formatINR(
              netMonthlyCashflow
            )}. Redirecting ${formatINR(
              suggestedCut
            )} from ${recommendationCategory} bridges this gap.`,
            actionableTip: `Set an automated transfer of ${formatINR(
              suggestedCut
            )} to ${g.name} immediately on salary credit day.`,
            metricValue: `Save ${formatINR(suggestedCut)}`,
            urgency: 'medium',
          });
        }
      } else {
        // On track
        insights.push({
          id: `goal-ontrack-${g.id}`,
          type: 'success',
          title: `On Track: ${g.name}`,
          description: `Great job! Your current monthly savings rate easily covers the ${formatINR(
            requiredMonthly
          )}/mo needed for ${g.name}.`,
          calculationDetail: `Required: ${formatINR(
            requiredMonthly
          )}/mo for ${monthsRemaining} month(s). Current monthly net cashflow is ${formatINR(
            netMonthlyCashflow
          )}.`,
          actionableTip: `Consider allocating any surplus toward an Emergency Fund or High-Yield savings.`,
          metricValue: `${Math.round((g.currentAmount / g.targetAmount) * 100)}%`,
          urgency: 'low',
        });
      }
    }
  });

  return insights;
}
