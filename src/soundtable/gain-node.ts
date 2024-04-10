import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";
import { NodeRenderer, NullRenderer } from "./renderer";

export class GainNode implements AudioNode {
	context: AudioContext;
	numberOfInputs = 1;
	numberOfOutputs = 1;
	inputs: AudioConnection[] = [];

	modulationIndex = 1;
	buffer: Float32Array;

	constructor(context: AudioContext, modulationIndex: number) {
		this.context = context;
		this.buffer = new Float32Array(context.bufferLength);
		this.modulationIndex = modulationIndex;
	}

	updateSamples(outputIndex: number) {
		const input1 = this.inputs[0].source.updateSamples(
			this.inputs[0].outputIndex
		);

		for (let i = 0; i < this.context.bufferLength; i++) {
			this.buffer[i] = Math.max(
				-1,
				Math.min(1, input1[i] * this.modulationIndex)
			);
		}

		return this.buffer;
	}

	createRenderer(): NodeRenderer {
		return new NullRenderer(this);
	}
}
