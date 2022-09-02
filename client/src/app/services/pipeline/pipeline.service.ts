import {Injectable} from '@angular/core';
import {DestinationNodeModel} from '../../models/destination-node.model';
import {SourceNodeModel} from '../../models/source-node.model';
import {ColumnSelectorNodeModel} from '../../models/column-selector-node.model';
import {NodeType} from '../../enums/node-type';
import {ApiService} from '../api/api.service';
import {API_EXECUTE, API_GET_COLUMNS_HEADING, API_PREVIEW} from '../../utils/api.utils';
import {CustomNodeModel} from '../../models/custom-node.model';
import {StringNodeModel} from '../../models/string-node.model';
import {SplitNodeModel} from '../../models/split-node.model';
import {MathNodeModel} from '../../models/math-node.model';
import {AggregateNodeModel} from '../../models/aggregate-node.model';
import {FilterNodeModel} from '../../models/filter-node.model';
import {JoinNodeModel} from '../../models/join-node.model';
import {NzMessageService} from 'ng-zorro-antd/message';

type PipelineNodeModel =
    | DestinationNodeModel
    | SourceNodeModel
    | ColumnSelectorNodeModel
    | CustomNodeModel
    | AggregateNodeModel
    | SplitNodeModel
    | MathNodeModel
    | FilterNodeModel
    | JoinNodeModel;

@Injectable({
    providedIn: 'root',
})
export class PipelineService {
    public nodes: PipelineNodeModel[] = [];

    public lastExecuteResult: any | null = null;
    public previewContent: any | null = null;
    public previewLoading: boolean = false;

    public selectedPreviousNode: string = '';
    public selectedNextNode: string = '';
    public selectedIdNode: string = '';
    public selectedTypeNode: NodeType = -1;

    public constructor(private apiService: ApiService, public messageService: NzMessageService) {}

    private creatNode(nodeType: NodeType): PipelineNodeModel | void {
        if (nodeType === NodeType.SourceNode) {
            return {
                _NodeType: nodeType,
                _previousNode: '',
                _tableId: '',
                id: Math.random().toString(),
            };
        } else if (nodeType === NodeType.Selector) {
            return {
                _NodeType: nodeType,
                _previousNode: this.selectedPreviousNode,
                _columns: [],
                id: Math.random().toString(),
            };
        } else if (nodeType === NodeType.DestinationNode) {
            return {
                _NodeType: nodeType,
                _previousNode: this.selectedPreviousNode,
                _tableId: '',
                id: Math.random().toString(),
            };
        } else if (nodeType === NodeType.Custom) {
            return {
                _NodeType: nodeType,
                _previousNode: this.selectedPreviousNode,
                _first: '',
                _second: '',
                id: Math.random().toString(),
            };
        } else if (nodeType === NodeType.Split) {
            return {
                _NodeType: nodeType,
                _previousNode: this.selectedPreviousNode,
                _columnName: '',
                _delimeter: '',
                _numberOfParts: 0,
                replace: false,
                id: Math.random().toString(),
            };
        } else if (nodeType === NodeType.Math) {
            return {
                _NodeType: nodeType,
                _previousNode: this.selectedPreviousNode,
                firstColumnName: '',
                secondColumnName: '',
                function: -1,
                newColumn: false,
                id: Math.random().toString(),
            };
        } else if (nodeType === NodeType.Aggregate) {
            return {
                _NodeType: nodeType,
                _previousNode: this.selectedPreviousNode,
                _functions: [],
                _groupingColumns: [],
                id: Math.random().toString(),
            };
        } else if (nodeType === NodeType.Filter) {
            return {
                _NodeType: nodeType,
                _previousNode: this.selectedPreviousNode,
                value: '',
                _columnName: '',
                _operator: -1,
                id: Math.random().toString(),
            };
        } else if (nodeType === NodeType.Join) {
            return {
                _NodeType: nodeType,
                _previousNode: this.selectedPreviousNode,
                _secondaryColumn: '',
                _primaryColumn: '',
                _secondPreviousNode: '',
                _joinMode: -1,
                id: Math.random().toString(),
            };
        }
    }

    public addNode(nodeType: NodeType): void {
        const node = this.creatNode(nodeType);
        if (!node) return;
        this.nodes.forEach((n) => {
            if (n.id === this.selectedNextNode) n._previousNode = node.id;
        });
        this.selectedIdNode = node.id;
        this.selectedTypeNode = node._NodeType;
        this.nodes.unshift(node);
    }

    public removeNode(id: string): void {
        this.nodes = this.nodes.filter((node) => node.id !== id);
    }

    public editNode(data: PipelineNodeModel): void {
        this.nodes.forEach((node, index) => {
            if (node.id === data.id) {
                this.nodes[index] = {...data};
                return;
            }
        });
    }

    public getSelectedNode(): PipelineNodeModel | undefined {
        return this.nodes.find((node) => node.id === this.selectedIdNode);
    }

    public getSourceNode(): SourceNodeModel {
        return this.nodes.find((n) => n._NodeType === NodeType.SourceNode) as SourceNodeModel;
    }

    public async getColumnsHeader(): Promise<string[]> {
        const requestUrl = `${API_GET_COLUMNS_HEADING}?pipelineJson=${this.convertToDictionary()}&id=${
            this.selectedIdNode
        }`;
        const response = await this.apiService.getRequest<string[]>({url: requestUrl});

        if (response) return JSON.parse(response);
        else return [];
    }
    public async getSecondaryNodeColumnHeader(nodeId: string): Promise<string[]> {
        const requestUrl = `${API_GET_COLUMNS_HEADING}?pipelineJson=${this.convertToDictionary()}&id=${nodeId}`;
        const response = await this.apiService.getRequest<string[]>({url: requestUrl});

        if (response) return JSON.parse(response);
        else return [];
    }

    public async execute(): Promise<void> {
        const response = await this.apiService.postRequest({
            url: API_EXECUTE,
            body: JSON.stringify(this.convertToDictionary()),
            init: {
                headers: {
                    'Content-Type': 'text/json',
                },
            },
        });

        if (response) {
            this.lastExecuteResult = JSON.parse(response);
            this.messageService.success('success');
        } else {
            this.lastExecuteResult = null;
            this.messageService.error('Error');
        }
    }

    public async preview(): Promise<void> {
        const requestUrl = `${API_PREVIEW}?pipelineJson=${this.convertToDictionary()}&id=${this.selectedIdNode}`;
        this.previewLoading = true;

        const response = await this.apiService.getRequest<string>({url: requestUrl});

        if (response) this.previewContent = JSON.parse(response);
        else this.previewContent = null;

        this.previewLoading = false;
    }

    private convertToDictionary(): string {
        const dictionary: any = {};

        for (const node of this.nodes) {
            dictionary[node.id] = node;
        }

        return JSON.stringify({Nodes: dictionary});
    }
}
