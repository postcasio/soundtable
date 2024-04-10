import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";
import { NodeRenderer, NullRenderer } from "./renderer";

export class EchoNode implements AudioNode {
	context: AudioContext;
	numberOfInputs = 1;
	numberOfOutputs = 1;
	inputs: AudioConnection[] = [];

	delay = 0.2;
	feedback = 0.8;
	buffer: Float32Array;
	bufferOffset = 0;

	constructor(context: AudioContext) {
		this.context = context;
		this.buffer = new Float32Array(
			Math.ceil((4 * context.sampleRate) / context.bufferLength) *
				context.bufferLength
		);
	}

	updateSamples(outputIndex: number): Float32Array {
		const input = this.inputs[0];
		const samples = input.source.updateSamples(input.outputIndex);

		for (let i = 0; i < this.context.bufferLength; i++) {
			let delayIndex =
				this.bufferOffset + i - this.delay * this.context.sampleRate;

			if (delayIndex < 0) {
				delayIndex = this.buffer.length + delayIndex;
			}

			this.buffer[this.bufferOffset + i] =
				samples[i] + this.buffer[delayIndex] * this.feedback;
		}

		const offset = this.bufferOffset;

		this.bufferOffset += this.context.bufferLength;

		if (this.bufferOffset >= this.buffer.length) {
			this.bufferOffset = 0;
		}

		return this.buffer.slice(offset, offset + this.context.bufferLength);
	}

	createRenderer(): NodeRenderer {
		return new NullRenderer(this);
	}
}
