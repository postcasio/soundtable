import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";
import { NodeRenderer, NullRenderer } from "./renderer";

export class MixerNode implements AudioNode {
	context: AudioContext;
	numberOfInputs = 0;
	numberOfOutputs = 1;
	inputs: AudioConnection[] = [];
	buffer: Float32Array;

	constructor(context: AudioContext) {
		this.context = context;
		this.buffer = new Float32Array(context.bufferLength);
	}

	updateSamples(outputIndex: number): Float32Array {
		const samples = [];

		for (let i = 0; i < this.inputs.length; i++) {
			const input = this.inputs[i];

			samples.push(input.source.updateSamples(input.outputIndex));
		}

		for (let i = 0; i < this.context.bufferLength; i++) {
			let sample = 0;

			for (const input of this.inputs) {
				sample += samples[input.inputIndex][i];
			}

			this.buffer[i] = sample / this.inputs.length;
		}

		return this.buffer;
	}

	createRenderer(): NodeRenderer {
		return new NullRenderer(this);
	}
}
