import {MathFunction} from '../enums/math-function';
import {NodeModel} from './node.model';

export interface MathNodeModel extends NodeModel {
    function: MathFunction;
    newColumn: boolean;
    columnName: string;
    second: string;
}
