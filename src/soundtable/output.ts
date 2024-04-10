import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";
import { NodeRenderer, NullRenderer } from "./renderer";

export class Output implements AudioNode {
	context: AudioContext;

	numberOfInputs = 1;
	numberOfOutputs = 0;

	inputs: AudioConnection[] = [];

	constructor(context: AudioContext) {
		this.context = context;
	}

	updateSamples(): Float32Array {
		throw new Error("Cannot get samples from an output node");
	}

	connect(destination: AudioNode, outputIndex = 0, inputIndex = 0) {
		throw new Error("Cannot connect to an output node");
	}

	createRenderer(): NodeRenderer {
		return new NullRenderer(this);
	}
}
