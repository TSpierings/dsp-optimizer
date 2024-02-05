import { difference, uniq } from 'ramda';
import dspdata from '../data/dsp-data.json';

export interface Recipe {
  id: number;
  name: string;
  inputs: string[];
  outputs: string[];
}

export const parseData = () => {
  return dspdata.recipes.filter((recipe) => recipe.category === 'buildings').map((recipe, index) => ({
    id: index,
    name: recipe.id,
    inputs: Object.keys(recipe.in),
    outputs: Object.keys(recipe.out)
  } as Recipe));
};

export const getInputs = (recipes: Recipe[]) => {
  return uniq(recipes.flatMap((recipe) => recipe.inputs));
};

export const getMissingProducers = (recipes: Recipe[]) => {
  const inputs = uniq(recipes.flatMap((recipe) => recipe.inputs));
  const outputs = uniq(recipes.flatMap((recipe) => recipe.outputs));

  return difference(inputs, outputs);
};
