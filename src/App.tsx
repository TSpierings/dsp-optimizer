import { useEffect, useMemo, useRef, useState } from 'react';
import './App.scss';
import Machine from './components/machine/machine';
import { getMissingProducers, parseData } from './utils/dsp-data';
import { GridItem, generateSingleProducerGrid } from './utils/setup';
import { calculateGridItemScore } from './utils/optimizer';

const width = 18;
const height = 8;
const recipes = parseData();
const grid = generateSingleProducerGrid(recipes, width, height);
const missing = getMissingProducers(recipes);

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [highlighted, setHighlighted] = useState<string[]>(['iron-ingot']);
  const [resultGrid, setResultGrid] = useState<GridItem[]>(grid);
  const [resultScore, setResultScore] = useState(grid.reduce((acc, _, index) => acc + calculateGridItemScore(grid, index), 0));
  const [selectedCell, setSelectedCell] = useState(-1);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [steps, setSteps] = useState(0);

  const worker = useMemo(() => new Worker(new URL('./utils/worker.ts', import.meta.url)), []);

  worker.onmessage = (message: MessageEvent<{ grid: GridItem[], score: number }>) => {
    if (!message.data) {
      setIsOptimizing(false);
      return;
    }

    setResultGrid(message.data.grid);
    setResultScore(message.data.score);

    setSteps(steps + 1);
  }

  useEffect(() => {
    if (isOptimizing) {
      worker.postMessage({ task: 'optimize', items: resultGrid, steps });
    }
  }, [isOptimizing, resultGrid, steps, worker]);

  useEffect(() => {
    if (!canvasRef?.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const cellWidth = window.innerWidth / width;
    const cellHeight = window.innerHeight / (height + 1);

    canvas.width = window.innerWidth;
    canvas.height = cellHeight * height;

    const gridItem = resultGrid.find((item) => item.recipe.id === selectedCell);

    if (!gridItem) return;

    context.fillStyle = '#00000022';
    context.fillRect(gridItem.x * cellWidth, gridItem.y * cellHeight, cellWidth, cellHeight);

    context.strokeStyle = '#f00';

    let markers = gridItem.recipe.inputs;
    if (gridItem.recipe.inputs.length === 0) {
      gridItem.recipe.outputs
        .forEach((output, index, array) => {
          const indexX = (index % width);
          const indexY = Math.floor(index / width);

          const offsetX = (cellWidth * 0.6) * (indexX / width) + (cellWidth * 0.3);
          const offsetY = (cellHeight * 0.6) * (indexY / height) + (cellHeight * 0.3);

          context.strokeStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
          context.lineWidth = 2;

          resultGrid.filter((item) => item.recipe.inputs.includes(output)).forEach((item) => {
            context.beginPath();
            context.moveTo(gridItem.x * cellWidth + offsetX, gridItem.y * cellHeight + offsetY);
            context.lineTo((item.x) * cellWidth + offsetX, (item.y) * cellHeight + offsetY);
            context.stroke();
          });
        });
    }

    markers.forEach((input) => {
      const targetItem = resultGrid.find((item) => item.recipe.outputs.includes(input));

      if (!targetItem) return;

      context.beginPath();
      context.moveTo(gridItem.x * cellWidth + cellWidth / 2, gridItem.y * cellHeight + cellHeight / 2);
      context.lineTo((targetItem.x) * cellWidth + cellWidth / 2, (targetItem.y) * cellHeight + cellHeight / 2);
      context.stroke();
    });

    context.strokeStyle = '#00f';

    // gridItem.siblings.map((id) => resultGrid[id]).forEach((target) => {
    //   context.beginPath();
    //   context.moveTo(gridItem.x * cellWidth + cellWidth / 2, gridItem.y * cellHeight + cellHeight / 2);
    //   context.lineTo((target.x) * cellWidth + cellWidth / 2, (target.y) * cellHeight + cellHeight / 2);
    //   context.stroke();
    // });

  }, [canvasRef, selectedCell, resultScore, resultGrid]);

  return (
    <div className="grid">
      <div className='header'>
        <span>Score: {resultScore} <button onClick={() => setIsOptimizing(!isOptimizing)}>Calculate</button> Steps: {steps}</span><br />
        <div className='inputs'>
          {missing.map((input) => <span key={input} onClick={() => highlighted.includes(input) ? setHighlighted([]) : setHighlighted([input])}>{input}</span>)}
        </div>
      </div>
      {resultGrid.map(({ recipe, x, y, score, index }) =>
        <Machine
          key={recipe.id}
          index={index}
          recipe={recipe}
          x={x}
          y={y}
          score={score}
          highlighted={highlighted}
          onClick={() => {
            selectedCell === recipe.id ? setSelectedCell(-1) : setSelectedCell(recipe.id);
            selectedCell === recipe.id ? setHighlighted([]) : setHighlighted(recipe.inputs.length > 0 ? recipe.inputs : recipe.outputs);
          }}
        />
      )}

      <canvas ref={canvasRef} />
    </div>
  );
}

export default App;
