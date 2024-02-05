import { intersection } from 'ramda';
import { Recipe, getMissingProducers } from "./dsp-data";
import { swapRandom } from './optimizer';

export interface GridItem {
  index: number;
  recipe: Recipe;
  siblings: number[];
  x: number;
  y: number;
  score: number;
}

export const generateSingleProducerGrid = (recipes: Recipe[], width: number, height: number): GridItem[] => {
  let index = 0;
  const grid: GridItem[] = [];

  for (let i = index; i < width * 2; i++) {
    grid.push({
      index,
      recipe: {
        id: 200 + index,
        name: 'dummy',
        inputs: [],
        outputs: []
      },
      score: 0,
      x: index % width,
      y: Math.floor(index / width),
      siblings: []
    } as GridItem);

    index++;
  }

  for (let i = 0; i < recipes.length; i++) {
    grid.push({
      index,
      recipe: recipes[i],
      score: 0,
      x: index % width,
      y: Math.floor(index / width),
      siblings: []
    } as GridItem);

    index++;
  }

  const missingProducers = getMissingProducers(recipes);

  for (let i = 0; i < missingProducers.length; i++) {
    grid.push({
      index,
      recipe: {
        id: index,
        inputs: [],
        name: missingProducers[i],
        outputs: [missingProducers[i]]
      },
      score: 0,
      x: index % width,
      y: Math.floor(index / width),
      siblings: []
    } as GridItem);

    index++;
  }

  for (let i = index; i < width * height; i++) {
    grid.push({
      index,
      recipe: {
        id: 200 + index,
        name: 'dummy',
        inputs: [],
        outputs: []
      },
      score: 0,
      x: index % width,
      y: Math.floor(index / width),
      siblings: []
    } as GridItem);

    index++;
  }

  grid.forEach((item) => {
    if (item.recipe.inputs.length === 0) {
      item.siblings = grid.filter((other) => intersection(other.recipe.inputs, item.recipe.outputs).length > 0).map((other) => other.index);
    } else {
      item.siblings = grid.filter((other) => intersection(other.recipe.outputs, item.recipe.inputs).length > 0).map((other) => other.index);
    }
  });

  for (let i = 0; i < 1000; i ++) {
    swapRandom(grid, 99999, 1);
  }

  return grid;
};
