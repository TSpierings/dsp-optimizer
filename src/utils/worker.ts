import { GridItem } from "../utils/setup";

export interface OptimizerMessage {
  task: 'optimize' | 'work';
  items: GridItem[];
  swapProducer: boolean;
  steps: number;
};

interface WorkResponse {
  grid: GridItem[];
  score: number;
};

const createWorkers = () => {
  const workers: Array<Worker> = [];

  for (let i = 0; i < 12; i++) {
    workers.push(new Worker(new URL('./subworker.ts', import.meta.url)));
  }

  return workers;
}

const doWork = (worker: Worker, data: OptimizerMessage): Promise<MessageEvent<WorkResponse>> =>
  new Promise((resolve) => {
    worker.onmessage = resolve;
    worker.postMessage(data);
  });

const doDistributedWork = async (workers: Worker[], items: GridItem[], steps: number) => {
  const result = await Promise.all(workers.map((worker, index) => doWork(worker, {
    task: 'work',
    items,
    swapProducer: index === 0,
    steps
  })));
  const oldScore = items.reduce((acc, cur) => acc + cur.score, 0);
  const best = result.reduce((prev: any, cur: any) => prev.data.score < cur.data.score ? prev : cur);

  postMessage(best.data.score < oldScore ? best.data : { grid: items, score: oldScore });
}

const workers = createWorkers();

onmessage = (e: MessageEvent<OptimizerMessage>) => {
  doDistributedWork(workers, e.data.items, e.data.steps);
}

export { };

