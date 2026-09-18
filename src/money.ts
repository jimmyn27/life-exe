const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const money = (value: number): string => usd.format(value);
