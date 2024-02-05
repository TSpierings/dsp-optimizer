import { intersection } from 'ramda';
import { useMemo } from 'react';
import { Recipe } from '../../utils/dsp-data';
import './machine.scss';

export interface MachineProps {
  index: number;
  recipe: Recipe;
  x: number;
  y: number;
  score: number;
  highlighted: string[];
  onClick: () => void;
}

function Machine(props: MachineProps) {
  const hasIntersect = useMemo(() => {
    return intersection(props.recipe.inputs, props.highlighted).length > 0
  }, [props.highlighted, props.recipe.inputs]);

  const isProducer = intersection(props.recipe.outputs, props.highlighted).length > 0;
  const isDummy = props.recipe.name === 'dummy';
  const isLogistic = props.recipe.inputs.length === 0 && !isDummy;

  return (
    <div className={'machine ' + (isDummy ? 'dummy ' : '') + (isLogistic ? 'logistic ' : '') + (isProducer ? 'producer ' : hasIntersect ? 'highlighted ' : '')}
      onClick={props.onClick}
      style={{ gridColumn: props.x + 1, gridRow: props.y + 2 }}>
      <span>{props.recipe.id} - {props.index}</span>
      <span title={props.recipe.name} >{props.recipe.name}</span>
      <span>({props.x},{props.y})</span>
      <span>{props.score}</span>
    </div>
  );
}

export default Machine;
