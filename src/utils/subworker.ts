import { GridItem } from "../utils/setup";
import { swapRandom } from "./optimizer";

export interface OptimizerMessage {
  task: 'optimize' | 'work';
  items: GridItem[];
  swapProducer: boolean;
  steps: number;
};

const optimizeStep = (items: GridItem[], swapProducer: boolean, steps: number) => {
  const score = items.reduce((acc, cur) => acc + cur.score, 0);
  let newScore = score

  // let temperature = (1 - steps / 100) / 1000;

  // for (let i = 0; i < 5; i++) {
  //   newScore = swapRandom(items, newScore, 10, 1)
  // }

  for (let i = 0; i < 10000; i++) {
    newScore = swapRandom(items, newScore, 0.1 / (i + 1));
  }

  postMessage({ grid: items, score: newScore });
};

onmessage = (e: MessageEvent<OptimizerMessage>) => {
  optimizeStep(e.data.items, e.data.swapProducer, e.data.steps);
}

export { };

