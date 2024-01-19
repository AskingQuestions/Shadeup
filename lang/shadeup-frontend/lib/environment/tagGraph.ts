import ts from 'typescript';

class TagNode {
	name: string;
	tsNode?: ts.Node;
	tags: string[];
	edges: TagNode[];
	edgesOther: TagNode[];

	constructor(name: string, tsNode?: ts.Node) {
		this.tsNode = tsNode;
		this.name = name;
		this.tags = [];
		this.edges = [];
		this.edgesOther = [];
	}
}

export class TagGraph {
	nodes: TagNode[];
	constructor() {
		this.nodes = [];
	}

	addNode(name: string, tsNode?: ts.Node) {
		let node = this.nodes.find((node) => node.name === name);
		if (!node) {
			node = new TagNode(name, tsNode);
			this.nodes.push(node);
		}
	}

	addEdge(from: string, to: string) {
		let fromNode = this.nodes.find((node) => node.name === from);
		if (!fromNode) {
			fromNode = new TagNode(from);
			this.nodes.push(fromNode);
		}

		let toNode = this.nodes.find((node) => node.name === to);
		if (!toNode) {
			toNode = new TagNode(to);
			this.nodes.push(toNode);
		}

		fromNode.edges.push(toNode);
		toNode.edgesOther.push(fromNode);
	}

	addTag(name: string, tag: string) {
		let node = this.nodes.find((node) => node.name === name);
		if (!node) {
			node = new TagNode(name);
			this.nodes.push(node);
		}

		node.tags.push(tag);
	}

	getNode(name: string) {
		return this.nodes.find((node) => node.name === name);
	}

	resolveTagSourceChain(name: string, tag: string): string[] {
		const node = this.getNode(name);
		if (!node) return [];

		const chain = [name];
		const visited = new Set<string>();
		const queue = [node];

		while (queue.length > 0) {
			const node = queue.shift()!;
			if (visited.has(node.name)) continue;
			visited.add(node.name);

			let nodeWithTag = null;
			for (const edge of node.edgesOther) {
				if (edge.tags.includes(tag)) {
					nodeWithTag = edge;
					break;
				}
			}

			if (nodeWithTag) {
				chain.push(nodeWithTag.name);
				queue.push(nodeWithTag);
			} else {
				return chain;
			}
		}

		return [];
	}

	propagateTags() {
		let changed = true;
		while (changed) {
			changed = false;
			for (const node of this.nodes) {
				for (const edge of node.edges) {
					for (const tag of node.tags) {
						if (!edge.tags.includes(tag)) {
							edge.tags.push(tag);
							changed = true;
						}
					}
				}
			}
		}
	}
}
