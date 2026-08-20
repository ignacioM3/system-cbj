export function generateRandomDate(daysAgo: number): Date {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const randomMs = Math.random() * daysAgo * msPerDay;
    return new Date(now.getTime() - randomMs);
}


export function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Cannot pick from an empty array");
  }
  return array[Math.floor(Math.random() * array.length)]!;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(
  min: number,
  max: number,
  decimals: number = 2
): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}
