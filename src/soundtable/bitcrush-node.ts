import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";
import { NodeRenderer, NullRenderer } from "./renderer";

export class BitcrushNode implements AudioNode {
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
			const quant = Math.pow(2, this.modulationIndex) * 0.5;
			const out = (1.0 / quant) * Math.floor(quant * input1[i]);

			this.buffer[i] = out;
		}

		return this.buffer;
	}

	createRenderer(): NodeRenderer {
		return new NullRenderer(this);
	}
}
