import {Injectable} from '@angular/core';
import {DestinationNodeModel} from '../../models/destination-node.model';
import {SourceNodeModel} from '../../models/source-node.model';
import {FilterNodeModel} from '../../models/filter-node.model';
import {ColumnSelectorNodeModel} from '../../models/column-selector-node.model';
import {NodeType} from '../../enums/node-type';

@Injectable({
    providedIn: 'root',
})
export class PipelineService {
    public nodes: (DestinationNodeModel | SourceNodeModel | FilterNodeModel | ColumnSelectorNodeModel)[] = [];
    public selectedPreviousNode: string = '';
    public selectedNextNode: string = '';
    public selectedIdNode: string = '';
    public selectedTypeNode: NodeType = -1;

    public creatNode(nodeType: NodeType): SourceNodeModel | ColumnSelectorNodeModel | void {
        if (nodeType === NodeType.SourceNode) {
            const node: SourceNodeModel = {
                _NodeType: NodeType.SourceNode,
                _previousNodesId: '',
                data: {tableName: ''},
                id: Math.random().toString(),
            };
            return node;
        } else if (nodeType === NodeType.Selector) {
            const node: ColumnSelectorNodeModel = {
                _NodeType: NodeType.Selector,
                _previousNodesId: this.selectedPreviousNode,
                data: {_columnNames: []},
                id: Math.random().toString(),
            };
            return node;
        }
    }

    public addNode(nodeType: NodeType): void {
        const node = this.creatNode(nodeType);
        if (!node) return;
        this.nodes.forEach((n) => {
            if (n.id === this.selectedNextNode) n._previousNodesId = node.id;
        });
        this.selectedIdNode = node.id;
        this.selectedTypeNode = node._NodeType;
        this.nodes.push(node);
    }

    public removeNode(id: string): void {
        this.nodes = this.nodes.filter((node) => node.id !== id);
    }

    public editNode(data: SourceNodeModel | DestinationNodeModel | ColumnSelectorNodeModel): void {
        this.nodes.forEach((node, index) => {
            if (node.id !== this.selectedIdNode) {
                this.nodes[index].data = {...data.data};
                return;
            }
        });
    }

    public getData(): SourceNodeModel | DestinationNodeModel | ColumnSelectorNodeModel | FilterNodeModel | undefined {
        return this.nodes.find((node) => node.id === this.selectedIdNode);
    }
}
