import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";
import { NodeRenderer, NullRenderer } from "./renderer";

export class FMNode implements AudioNode {
	context: AudioContext;
	numberOfInputs = 2;
	numberOfOutputs = 1;
	inputs: AudioConnection[] = [];

	modulationIndex = 1;
	buffer: Float32Array;

	constructor(context: AudioContext) {
		this.context = context;
		this.buffer = new Float32Array(context.bufferLength);
	}

	updateSamples(outputIndex: number) {
		const input1 = this.inputs[0].source.updateSamples(
			this.inputs[0].outputIndex
		);
		const input2 = this.inputs[1].source.updateSamples(
			this.inputs[0].outputIndex
		);

		for (let i = 0; i < this.context.bufferLength; i++) {
			this.buffer[i] = input1[i] + input2[i];
		}

		return this.buffer;
	}

	createRenderer(): NodeRenderer {
		return new NullRenderer(this);
	}
}
