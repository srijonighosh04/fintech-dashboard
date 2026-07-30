export interface BaseTransaction {
  id: string;
  name: string;
  amount: number;
  date: Date;
  category: string;
}

export interface FraudFeature {
  name: string;
  triggered: boolean;
  value: number; // Raw metric value
  weight: number; // Weighted impact (0 to 1)
  description: string;
}

/**
 * Checks if a transaction amount is significantly larger than the historical average.
 */
export function analyzeLargePurchase(tx: BaseTransaction, avgAmount: number): FraudFeature {
  const threshold = Math.max(1000, avgAmount * 3.5); // Greater than $1k or 3.5x average
  const triggered = tx.amount >= threshold;

  return {
    name: 'LARGE_PURCHASE',
    triggered,
    value: tx.amount,
    weight: 0.35,
    description: triggered
      ? `The transaction amount of $${tx.amount.toFixed(2)} exceeds the security threshold ($${threshold.toFixed(2)}) assessed from average spending.`
      : `Transaction amount is within normal variance margins.`,
  };
}

/**
 * Checks if a transaction occurs during odd hours (e.g. between 1:00 AM and 5:00 AM).
 */
export function analyzeUnusualTime(tx: BaseTransaction): FraudFeature {
  const date = new Date(tx.date);
  const hours = date.getHours();
  const triggered = hours >= 1 && hours <= 5;

  return {
    name: 'UNUSUAL_TIME',
    triggered,
    value: hours,
    weight: 0.15,
    description: triggered
      ? `Transaction occurred at ${hours}:00 AM, which is within the high-risk window (1:00 AM - 5:00 AM).`
      : `Transaction timestamp is in standard daytime windows.`,
  };
}

/**
 * Checks if the transaction merchant is new to the user's transaction history.
 */
export function analyzeNewMerchant(tx: BaseTransaction, isNew: boolean): FraudFeature {
  return {
    name: 'NEW_MERCHANT',
    triggered: isNew,
    value: isNew ? 1 : 0,
    weight: 0.1,
    description: isNew
      ? `No historical interactions found for merchant "${tx.name}".`
      : `Merchant matches recognized historical partners list.`,
  };
}

/**
 * Checks for physically impossible travel coordinates/velocities.
 */
export function analyzeImpossibleTravel(
  currentTx: BaseTransaction,
  lastTx: BaseTransaction | null
): FraudFeature {
  if (!lastTx) {
    return {
      name: 'IMPOSSIBLE_TRAVEL',
      triggered: false,
      value: 0,
      weight: 0.4,
      description: 'No prior transaction logs found to evaluate travel velocity.',
    };
  }

  // Simulate location details based on category or random name hash
  const getSimulatedCity = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cities = ['New York', 'Los Angeles', 'London', 'Tokyo', 'San Francisco', 'Miami'];
    return cities[hash % cities.length];
  };

  const currentCity = getSimulatedCity(currentTx.name);
  const lastCity = getSimulatedCity(lastTx.name);

  if (currentCity === lastCity) {
    return {
      name: 'IMPOSSIBLE_TRAVEL',
      triggered: false,
      value: 0,
      weight: 0.4,
      description: `Both transactions registered in the same location area (${currentCity}).`,
    };
  }

  // Calculate time gap in hours
  const timeDiff = Math.abs(currentTx.date.getTime() - lastTx.date.getTime()) / (1000 * 60 * 60);
  const triggered = timeDiff < 4; // Different cities within 4 hours is impossible/very high-risk

  return {
    name: 'IMPOSSIBLE_TRAVEL',
    triggered,
    value: timeDiff,
    weight: 0.4,
    description: triggered
      ? `Velocity alert: Transactions registered in ${lastCity} and ${currentCity} within a ${timeDiff.toFixed(1)} hour window, violating travel logic constraints.`
      : `Time gap between ${lastCity} and ${currentCity} allows for standard transit options.`,
  };
}

/**
 * Checks for rapid consecutive transaction loops (e.g. multiple charges in short successions).
 */
export function analyzeRapidConsecutive(
  currentTx: BaseTransaction,
  recentTxs: BaseTransaction[]
): FraudFeature {
  const windowMinutes = 5;
  const cutoffTime = currentTx.date.getTime() - windowMinutes * 60 * 1000;
  
  const rapidCharges = recentTxs.filter(
    (tx) => tx.date.getTime() >= cutoffTime && tx.id !== currentTx.id
  );
  
  const triggered = rapidCharges.length >= 2; // 3 or more charges total in 5 mins

  return {
    name: 'RAPID_CONSECUTIVE',
    triggered,
    value: rapidCharges.length + 1,
    weight: 0.3,
    description: triggered
      ? `Velocity alert: ${rapidCharges.length + 1} transactions recorded in a ${windowMinutes}-minute window.`
      : `Transaction velocity remains within standard frequency bounds.`,
  };
}
