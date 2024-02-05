import { GridItem } from './setup';

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export const calculateGridItemScore = (items: GridItem[], index: number): number => {
  const item = items[index];

  const score = item.siblings.reduce((acc, cur) => {
    const other = items[cur];

    const manhattan = Math.abs(item.x - other.x) + Math.abs(item.y - other.y);
    const dotProduct = Math.min(Math.abs((item.x < other.x ? item.x + 1 : item.x) - other.x), Math.abs((item.y < other.y ? item.y + 1 : item.y) - other.y));

    const distance = manhattan + dotProduct * 25;

    return acc + distance;
  }, 0);

  item.score = score;
  return score;
};

export const swapByIndex = (items: GridItem[], itemAIndex: number, itemBIndex: number) => {
  const x = items[itemAIndex].x;
  const y = items[itemAIndex].y;

  items[itemAIndex] = { ...items[itemAIndex], x: items[itemBIndex].x, y: items[itemBIndex].y };
  items[itemBIndex] = { ...items[itemBIndex], x, y };
}

export const swapRandom = (items: GridItem[], currentScore: number, temperature: number): number => {
  const indexA = getRandomInt(items.length);
  const indexB = getRandomInt(items.length);

  if (indexA === indexB) return currentScore;

  swapByIndex(items, indexA, indexB);

  const newScore = items.reduce((acc, _, index) => acc + calculateGridItemScore(items, index), 0);

  if (newScore <= currentScore || (Math.random() < temperature)) {
    return newScore;
  } else {
    swapByIndex(items, indexA, indexB);
    return items.reduce((acc, _, index) => acc + calculateGridItemScore(items, index), 0);;
  }
};
