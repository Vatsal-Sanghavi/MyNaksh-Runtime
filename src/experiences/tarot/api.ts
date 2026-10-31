const cards = [
  'The Star',
  'The Hermit',
  'Strength',
  'The Sun',
  'The Moon',
];

export async function drawCards(count: number): Promise<string[]> {
  await Promise.resolve();
  return cards.slice(0, count);
}

export async function drawSpread(count: number): Promise<string[]> {
  await Promise.resolve();
  return cards.slice(0, count).reverse();
}