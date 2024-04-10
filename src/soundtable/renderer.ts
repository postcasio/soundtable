import Prim from "prim";
import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";

export interface NodeRenderer {
	render(surface: Surface): void;
}

export type Vector2D = [number, number];

export class NullRenderer implements NodeRenderer {
	node: AudioNode;

	position: Vector2D = [0, 0];
	size: Vector2D = [400, 600];

	style = {
		backgroundColor: Color.DarkCyan,
		textColor: Color.White,
	};

	constructor(node: AudioNode) {
		this.node = node;
	}

	render(surface: Surface) {}
}

export class Renderer {
	context: AudioContext;
	nodeRenderers: Map<AudioNode, NodeRenderer> = new Map();

	constructor(context: AudioContext) {
		this.context = context;
	}

	setupRenderers() {
		this.nodeRenderers.set(
			this.context.output,
			this.context.output.createRenderer()
		);

		this.traverse(this.context.output.inputs[0], (node) => {
			this.nodeRenderers.set(node, node.createRenderer());
		});
	}

	traverse(node: AudioConnection, callback: (node: AudioNode) => void) {
		callback(node.source);

		node.source.inputs.forEach((input) => {
			this.traverse(input, callback);
		});
	}

	render() {
		this.nodeRenderers.forEach((renderer, node) => {
			renderer.render(Surface.Screen);
		});
	}
}
